import os
import time
import threading
import grpc
from concurrent import futures
import kv_pb2, kv_pb2_grpc

from gossip import membership
from anti_entropy import CHUNK_COUNT, compute_chunk_hash

# Logging switch - set DEBUG_LOG=true to enable detailed logging
DEBUG_LOG = os.environ.get("DEBUG_LOG", "false").lower() == "true"

# ANSI colors for logging
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    RED = '\033[91m'
    RESET = '\033[0m'

def log_write(node_addr, key, value, modified_at):
    if DEBUG_LOG:
        print(f"{Colors.GREEN}[WRITE]{Colors.RESET} Node={node_addr} | Key={key} | Value={value} | Timestamp={modified_at}")

def log_replicate_send(from_addr, to_addr, key):
    if DEBUG_LOG:
        print(f"{Colors.YELLOW}[REPLICATE→]{Colors.RESET} {from_addr} → {to_addr} | Key={key}")

def log_replicate_recv(node_addr, key, value):
    if DEBUG_LOG:
        print(f"{Colors.CYAN}[REPLICATE←]{Colors.RESET} Node={node_addr} received | Key={key} | Value={value}")

def log_read(node_addr, key, found, value=None):
    if DEBUG_LOG:
        if found:
            print(f"{Colors.BLUE}[READ]{Colors.RESET} Node={node_addr} | Key={key} | Value={value}")
        else:
            print(f"{Colors.BLUE}[READ]{Colors.RESET} Node={node_addr} | Key={key} | NOT FOUND")


# helper to pick replicas from membership and consistent ring
# for demo: membership keys are addresses like "127.0.0.1:50051"
def sorted_peers():
    # simple stable order
    return sorted([node["addr"] for node in membership.values() if "addr" in node])

def pick_replicas_for_key(key, replication_factor):
    peers = sorted_peers()
    if not peers:
        return []
    # simple hash-based selection: rotate through peers
    idx = abs(hash(key)) % len(peers)
    selected = []
    for i in range(replication_factor):
        selected.append(peers[(idx + i) % len(peers)])
    return selected

# ---------- helper for replication ----------
def replicate_to_peer(peer_addr, key, value, modified_at, own_addr):
    log_replicate_send(own_addr, peer_addr, key)
    try:
        channel = grpc.insecure_channel(peer_addr)
        stub = kv_pb2_grpc.KeyValueStub(channel)
        req = kv_pb2.PutRequest(key=key, value=value, modified_at=modified_at)
        stub.Replicate(req, timeout=2)
        if DEBUG_LOG:
            print(f"{Colors.GREEN}[REPLICATE✓]{Colors.RESET} Successfully replicated key={key} to {peer_addr}")
    except Exception as e:
        # you may log or perform hinted-handoff here
        if DEBUG_LOG:
            print(f"{Colors.RED}[REPLICATE✗]{Colors.RESET} Failed to replicate key={key} to {peer_addr}: {e}")

# ---------- gRPC Service Implementation ----------
class KeyValueServicer(kv_pb2_grpc.KeyValueServicer):
    def __init__(self, storage, own_addr, replication_factor=2):
        self.storage = storage
        self.own_addr = own_addr
        self.replication_factor = replication_factor

    def Put(self, request, context):
        key = request.key
        value = request.value
        modified_at = request.modified_at or int(time.time())
        
        # Log the write
        log_write(self.own_addr, key, value, modified_at)
        
        # local write
        self.storage.put(key, value, modified_at)

        # replicate to other nodes (fire-and-forget threads)
        replicas = pick_replicas_for_key(key, self.replication_factor)
        if DEBUG_LOG:
            print(f"{Colors.MAGENTA}[REPLICAS]{Colors.RESET} Key={key} will replicate to: {replicas}")
        
        # first replica is primary (could be this node). replicate to others
        for p in replicas:
            if p == self.own_addr:
                continue
            threading.Thread(target=replicate_to_peer, args=(p, key, value, modified_at, self.own_addr), daemon=True).start()

        return kv_pb2.PutResponse(ok=True, message="stored")

    def Replicate(self, request, context):
        # inter-node replication RPC
        log_replicate_recv(self.own_addr, request.key, request.value)
        self.storage.put(request.key, request.value, request.modified_at or int(time.time()))
        return kv_pb2.PutResponse(ok=True, message="replicated")

    def Get(self, request, context):
        val = self.storage.get(request.key)
        log_read(self.own_addr, request.key, val is not None, val)
        if val is None:
            return kv_pb2.GetResponse(value="", found=False)
        return kv_pb2.GetResponse(value=val, found=True)

    def GetChunkHash(self, request, context):
        chunk_id = request.chunk_id
        h = compute_chunk_hash(self.storage, chunk_id)
        return kv_pb2.ChunkHashResponse(hash=h)

    def FetchRange(self, request, context):
        chunk_id = request.chunk_id
        for k, v, modified_at in self.storage.scan_chunk_with_ts(chunk_id, CHUNK_COUNT):
            yield kv_pb2.KeyValuePair(key=k, value=v, modified_at=modified_at)


# ---------- server bootstrap ----------
def serve_grpc(port, storage, own_addr, replication_factor=2):
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=20))
    servicer = KeyValueServicer(storage, own_addr, replication_factor)
    kv_pb2_grpc.add_KeyValueServicer_to_server(servicer, server)
    server.add_insecure_port(f"[::]:{port}")
    server.start()
    print(f"[grpc] Server started on port {port}")
    server.wait_for_termination()
