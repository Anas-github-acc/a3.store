import os
import time
import threading
import requests
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

membership = {}

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

class GossipPayload(BaseModel):
    node_id: str
    addr: str
    heartbeat: int

@app.get("/healthz")
def healthz():
    return {"status": "ok"}

@app.get("/membership")
def membership_view():
    return membership

@app.post("/gossip")
def receive_gossip(payload: GossipPayload):
    """
    Receive gossip update.
    Merge sender's heartbeat into local membership map.
    """
    existing = membership.get(payload.node_id)

    if (existing is None) or (payload.heartbeat > existing.get("hb", 0)):
        is_new = existing is None
        membership[payload.node_id] = {"addr": payload.addr, "hb": payload.heartbeat,}
        if is_new and DEBUG_LOG:
            print(f"{Colors.GREEN}[GOSSIP]{Colors.RESET} New node discovered: {payload.node_id} @ {payload.addr}")

    return {"status": "ok"}


def start_gossip_loop(own_id: str, own_addr: str, peers: list[str], interval: float = 1.0):
    """
    Starts a background thread that sends heartbeat gossip to peers.
    This should be called once when the node starts.
    """
    def loop():
        hb = 0
        while True:
            hb += 1
            payload = {"node_id": own_id, "addr": own_addr, "heartbeat": hb,}

            for peer in peers:
                try:
                    requests.post(f"http://{peer}/gossip", json=payload, timeout=0.5)
                except Exception:
                    # Node might be down, ignore
                    pass

            time.sleep(interval)

    t = threading.Thread(target=loop, daemon=True)
    t.start()
