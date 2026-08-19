import grpc
try:
    import kv_pb2, kv_pb2_grpc
except ImportError:
    from app import kv_pb2, kv_pb2_grpc

try:
    from interfaces import PeerClient
except ImportError:
    from app.interfaces import PeerClient


def get_stub(peer_addr):
    channel = grpc.insecure_channel(peer_addr)
    return kv_pb2_grpc.KeyValueStub(channel)

def put_to_peer(peer_addr, key, value, modified_at=None, timeout=2):
    stub = get_stub(peer_addr)
    req = kv_pb2.PutRequest(key=key, value=value, modified_at=modified_at or 0)
    return stub.Put(req, timeout=timeout)

def replicate_to_peer(peer_addr, key, value, modified_at=None, timeout=2):
    stub = get_stub(peer_addr)
    req = kv_pb2.PutRequest(key=key, value=value, modified_at=modified_at or 0)
    return stub.Replicate(req, timeout=timeout)

def get_from_peer(peer_addr, key, timeout=2):
    stub = get_stub(peer_addr)
    req = kv_pb2.GetRequest(key=key)
    return stub.Get(req, timeout=timeout)

def get_chunk_hash(peer_addr, chunk_id, timeout=5):
    stub = get_stub(peer_addr)
    req = kv_pb2.ChunkRequest(chunk_id=chunk_id)
    return stub.GetChunkHash(req, timeout=timeout)

def fetch_range(peer_addr, chunk_id, timeout=10):
    stub = get_stub(peer_addr)
    req = kv_pb2.RangeRequest(chunk_id=chunk_id)
    return stub.FetchRange(req, timeout=timeout)  # returns iterator


class GrpcPeerClient(PeerClient):

    def replicate(
        self,
        peer_addr,
        key,
        value,
        modified_at,
        timeout=2
    ):
        return replicate_to_peer(
            peer_addr,
            key,
            value,
            modified_at,
            timeout
        )

    def get(
        self,
        peer_addr,
        key,
        timeout=2
    ):
        return get_from_peer(
            peer_addr,
            key,
            timeout
        )

    def get_chunk_hash(
        self,
        peer_addr,
        chunk_id,
        timeout=5
    ):
        return get_chunk_hash(
            peer_addr,
            chunk_id,
            timeout
        )

    def fetch_range(
        self,
        peer_addr,
        chunk_id,
        timeout=10
    ):
        return fetch_range(
            peer_addr,
            chunk_id,
            timeout
        )
