import os
import threading
import time
import uvicorn

from gossip import start_gossip_loop, membership, app as gossip_app
from grpc_server import serve_grpc
from anti_entropy import start_anti_entropy
from storage import Storage


# ---------------------
# CONFIGURATION (from environment variables)
# ---------------------

# Debug logging switch - set DEBUG_LOG=true to enable detailed logging
DEBUG_LOG = os.environ.get("DEBUG_LOG", "false").lower() == "true"

# Ports
GRPC_PORT = int(os.environ.get("GRPC_PORT", "50051"))
GOSSIP_PORT = int(os.environ.get("GOSSIP_PORT", "8001"))

# Node identity
NODE_NUM = os.environ.get("NODE_NUM", "1")
OWN_ID = f"node-{NODE_NUM}"
OWN_ADDR = f"127.0.0.1:{GRPC_PORT}"

# Data directory
DATA_DIR = os.environ.get("DATA_DIR", "data/node1")

# Cluster peers (from comma-separated environment variable)
PEERS_ENV = os.environ.get("PEERS", "")
if PEERS_ENV:
    PEERS = [p.strip() for p in PEERS_ENV.split(",") if p.strip()]
else:
    # Default peers for a 3-node cluster (gRPC addresses)
    PEERS = [
        "127.0.0.1:50052",
        "127.0.0.1:50053",
    ]

# Remove own address if present
PEERS = [p for p in PEERS if not p.endswith(str(GRPC_PORT))]

# Gossip peers (HTTP ports for gossip protocol)
GOSSIP_PEERS_ENV = os.environ.get("GOSSIP_PEERS", "")
if GOSSIP_PEERS_ENV:
    GOSSIP_PEERS = [p.strip() for p in GOSSIP_PEERS_ENV.split(",") if p.strip()]
else:
    # Default gossip peers - map gRPC ports to gossip HTTP ports
    # gRPC 50051 -> Gossip 8001, gRPC 50052 -> Gossip 8002, etc.
    GOSSIP_PEERS = [
        "127.0.0.1:8001",
        "127.0.0.1:8002", 
        "127.0.0.1:8003",
    ]

# Remove own gossip address if present
GOSSIP_PEERS = [p for p in GOSSIP_PEERS if not p.endswith(str(GOSSIP_PORT))]

# Replication factor
REPLICATION_FACTOR = int(os.environ.get("REPLICATION_FACTOR", "2"))


# ---------------------
# START GOSSIP HTTP SERVER
# ---------------------
def start_gossip_http_server():
    """Runs the FastAPI gossip endpoint in its own thread."""
    def run():
        uvicorn.run(
            gossip_app,
            host="0.0.0.0",
            port=GOSSIP_PORT,
            log_level="warning",
        )
    t = threading.Thread(target=run, daemon=True)
    t.start()
    print(f"[gossip] HTTP server running on port {GOSSIP_PORT}")


# ---------------------
# START THE NODE
# ---------------------

def main():
    print(f"--- Starting Distributed KV Node ---")
    print(f"Node ID: {OWN_ID}")
    print(f"gRPC port: {GRPC_PORT}")
    print(f"Gossip HTTP port: {GOSSIP_PORT}")
    print(f"Data directory: {DATA_DIR}")
    print(f"Replication factor: {REPLICATION_FACTOR}")
    print(f"Peers (gRPC): {PEERS}")
    print(f"Peers (Gossip HTTP): {GOSSIP_PEERS}")
    print(f"Debug logging: {'ENABLED' if DEBUG_LOG else 'DISABLED'} (set DEBUG_LOG=true to enable)")
    print("------------------------------------")

    # Initialize storage
    os.makedirs(DATA_DIR, exist_ok=True)
    storage = Storage(os.path.join(DATA_DIR, "node.db"))

    # Start gossip REST server
    start_gossip_http_server()

    # Start gossip heartbeat loop (use GOSSIP_PEERS for HTTP gossip)
    start_gossip_loop(OWN_ID, OWN_ADDR, GOSSIP_PEERS, interval=1.0)
    print("[gossip] Background gossip loop started.")

    # Helper to get peer list from membership
    def get_peer_list():
        return [info["addr"] for nid, info in membership.items()
                if info.get("addr") != OWN_ADDR]

    # Start anti-entropy background sync
    start_anti_entropy(storage, get_peer_list)
    print("[repair] Anti-entropy background loop started.")

    # Start gRPC server (blocking call)
    serve_grpc(GRPC_PORT, storage, OWN_ADDR, REPLICATION_FACTOR)


if __name__ == "__main__":
    main()
