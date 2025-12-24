import os
import threading
import uvicorn

from gossip import start_gossip_loop, membership, app as gossip_app
from grpc_server import serve_grpc
from anti_entropy import start_anti_entropy
from storage import Storage

from metrics import node_up


# ------------------- CONFIGURATION -------------------

DEBUG_LOG = os.environ.get("DEBUG_LOG", "false").lower() == "true"
GRPC_PORT = int(os.environ.get("GRPC_PORT", "50051"))
GOSSIP_PORT = int(os.environ.get("GOSSIP_PORT", "8001"))
NODE_NUM = os.environ.get("NODE_NUM", "1")
OWN_ID = f"node-{NODE_NUM}"

OWN_ADDR = os.environ.get("OWN_ADDR")
if not OWN_ADDR:
    HOSTNAME = os.environ.get("HOSTNAME", f"node{NODE_NUM}")
    OWN_ADDR = f"{HOSTNAME}:{GRPC_PORT}"

HOSTNAME = OWN_ADDR.split(':')[0]
OWN_GOSSIP_ADDR = f"{HOSTNAME}:{GOSSIP_PORT}"
DATA_DIR = os.environ.get("DATA_DIR", f"data/node{NODE_NUM}")

# gRPC PEERS
PEERS_ENV = os.environ.get("PEERS", "")
if PEERS_ENV:
    PEERS = [p.strip() for p in PEERS_ENV.split(",") if p.strip()]
else:
    PEERS = []

# Remove own GRPC address if present
# PEERS = [p for p in PEERS if not p.endswith(str(GRPC_PORT))]
PEERS = [p for p in PEERS if p != OWN_ADDR]

# GOSSIP PEERS
GOSSIP_PEERS_ENV = os.environ.get("GOSSIP_PEERS", "")
if GOSSIP_PEERS_ENV:
    GOSSIP_PEERS = [p.strip() for p in GOSSIP_PEERS_ENV.split(",") if p.strip()]
else:
    GOSSIP_PEERS = []

# Remove own gossip address if present
GOSSIP_PEERS = [p for p in GOSSIP_PEERS if p != OWN_GOSSIP_ADDR]


REPLICATION_FACTOR = int(os.environ.get("REPLICATION_FACTOR", "2"))


# ---------------------
# GOSSIP HTTP SERVER
# ---------------------
def start_gossip_http_server():
    """Runs gossip FastAPI server in its own background thread."""
    def run():
        uvicorn.run(
            gossip_app,
            host="0.0.0.0",
            port=GOSSIP_PORT,
            log_level="warning",
            workers=1,
            reload=False,
        )

    t = threading.Thread(target=run, daemon=True)
    t.start()
    print(f"[gossip] HTTP server running on port {GOSSIP_PORT}")

def main():    
    print("--- Starting Distributed KV Node ---")
    print(f"Node ID: {OWN_ID}")
    print(f"gRPC port: {GRPC_PORT}")
    print(f"Gossip HTTP port: {GOSSIP_PORT}")
    print(f"Address: {OWN_ADDR}")
    print(f"Data directory: {DATA_DIR}")
    print(f"Replication factor: {REPLICATION_FACTOR}")
    print(f"Peers (gRPC): {PEERS}")
    print(f"Peers (Gossip HTTP): {GOSSIP_PEERS}")
    print(f"Debug logging: {'ENABLED' if DEBUG_LOG else 'DISABLED'}")
    print("------------------------------------")

    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)
    storage = Storage(os.path.join(DATA_DIR, "node.db"))

    start_gossip_http_server()

    start_gossip_loop(OWN_ID, OWN_ADDR, GOSSIP_PEERS, interval=1.0)
    print("[gossip] Background gossip loop started.")

    def get_peer_list():
        return [
            info["addr"]
            for nid, info in membership.items()
            if info.get("addr") != OWN_ADDR
        ]

    start_anti_entropy(storage, get_peer_list, OWN_ID, OWN_ADDR)
    print("[repair] Anti-entropy background loop started.")

    serve_grpc(GRPC_PORT, storage, OWN_ADDR, REPLICATION_FACTOR)


if __name__ == "__main__":
    node_up.labels(node_id=OWN_ID).set(1) # -- prometheus metric
    main()