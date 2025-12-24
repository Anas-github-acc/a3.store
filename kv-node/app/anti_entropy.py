import logging
import os
import hashlib
import time
import threading
import json
import sys
from grpc_client import get_chunk_hash, fetch_range

from metrics import anti_entropy_runs, anti_entropy_repairs


CHUNK_COUNT = 16         # number of partitions (should match storage & hashing)
SYNC_INTERVAL = 30       # seconds between full anti-entropy passes
CHUNK_TIMEOUT = 5        # timeout for chunk hash RPC
RANGE_TIMEOUT = 10       # timeout for FetchRange RPC

# Logging switch - set DEBUG_LOG=true to enable detailed logging
DEBUG_LOG = os.environ.get("DEBUG_LOG", "false").lower() == "true"

class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    RED = '\033[91m'
    RESET = '\033[0m'


logging.getLogger().handlers.clear()
logging.basicConfig(
    level=logging.INFO,
    format='%(message)s',
    handlers=[logging.StreamHandler(sys.stdout)],
    force=True
)


def log_ae_event(event_type, node, chunk, keys=0, extra=None):
    payload = {
        "component": "anti-entropy",
        "event": event_type,
        "node": node,
        "chunk": chunk,
        "keys": keys,
        "timestamp": int(time.time() * 1000)
    }
    if extra and isinstance(extra, dict):
        payload.update(extra)

    logging.info(json.dumps(payload))

def log_ae(msg, color=Colors.MAGENTA):
    if DEBUG_LOG:
        print(f"{color}[ANTI-ENTROPY]{Colors.RESET} {msg}")


def sorted_chunk_items(storage, chunk_id, chunk_count):
    """
    Generator yielding sorted (key, value, modified_at) for deterministic hashing.
    """
    items = list(storage.scan_chunk_with_ts(chunk_id, chunk_count))
    items.sort(key=lambda kv: kv[0])  # sort by key
    for item in items:
        yield item


def compute_chunk_hash(storage, chunk_id):
    """
    Compute deterministic hash of all key-value pairs in this chunk.
    """
    h = hashlib.sha256()
    for key, value, modified_at in sorted_chunk_items(storage, chunk_id, CHUNK_COUNT):
        h.update(key.encode("utf-8"))
        h.update(b"\x00")
        h.update(value.encode("utf-8"))
        h.update(b"\x00")
        h.update(str(modified_at).encode("utf-8"))
        h.update(b"\x00")
    return h.digest()


def repair_chunk_from_peer(storage, peer_addr, chunk_id):
    """
    Pull differing keys from peer node and merge into local storage.
    Used when chunk hashes mismatch.
    """
    try:
        log_ae(f"Fetching chunk {chunk_id} data from {peer_addr}...", Colors.CYAN)
        log_ae_event("repair_start", peer_addr, chunk_id, keys=0)
        stream = fetch_range(peer_addr, chunk_id, timeout=RANGE_TIMEOUT)
        repaired_count = 0
        for kv in stream:
            key = kv.key
            value = kv.value
            modified_at = kv.modified_at

            # compare with local
            local_val, local_ts = storage.get(key)

            # last-write-wins policy (can replace with vector clocks)
            if (local_ts is None) or (modified_at > local_ts):
                log_ae(f"Repairing key={key} from {peer_addr} (remote_ts={modified_at}, local_ts={local_ts})", Colors.YELLOW)
                storage.async_put(key, value, modified_at)
                repaired_count += 1
        
        if repaired_count > 0:
            log_ae(f"Repaired {repaired_count} keys from chunk {chunk_id} via {peer_addr}", Colors.GREEN)
            log_ae_event("repair_complete", peer_addr, chunk_id, keys=repaired_count)
        anti_entropy_repairs.inc() # -- prometheus metric

    except Exception as e:
        log_ae(f"Repair chunk {chunk_id} from {peer_addr} failed: {e}", Colors.RED)


def process_single_peer(storage, peer_addr):
    """
    Compare and repair all chunks with a single peer.
    """
    for chunk_id in range(CHUNK_COUNT):
        try:
            # local hash
            local_hash = compute_chunk_hash(storage, chunk_id)

            # peer hash
            resp = get_chunk_hash(peer_addr, chunk_id, timeout=CHUNK_TIMEOUT)
            peer_hash = resp.hash

            # mismatch => repair this chunk
            if peer_hash != local_hash:
                log_ae(f"MISMATCH @ chunk {chunk_id} vs {peer_addr} (local={local_hash[:8].hex()}... peer={peer_hash[:8].hex()}...) → repairing...", Colors.YELLOW)
                log_ae_event(
                    "chunk_mismatch",
                    peer_addr,
                    chunk_id,
                    keys=0,
                    extra={
                        "local_hash": local_hash.hex(),
                        "peer_hash": peer_hash.hex(),
                        "local_hash_short": local_hash[:8].hex(),
                        "peer_hash_short": peer_hash[:8].hex(),
                        "peer": peer_addr,
                    },
                )
                repair_chunk_from_peer(storage, peer_addr, chunk_id)

        except Exception as e:
            log_ae(f"Error comparing chunk {chunk_id} with {peer_addr}: {e}", Colors.RED)
            log_ae_event("compare_error", peer_addr, chunk_id, keys=0)


def anti_entropy_loop(storage, get_peer_list, own_id=None, own_addr=None, interval=SYNC_INTERVAL):
    """
    Background loop:
    - get_peer_list(): must return list of peer addresses like "127.0.0.1:50051"
    - compares chunk hashes
    - repairs mismatched chunks using FetchRange()
    Runs forever in a thread.
    """
    while True:
        anti_entropy_runs.inc() # -- prometheus metric
        peers = get_peer_list()
        if not peers:
            log_ae("No peers available, skipping sync round", Colors.YELLOW)
            if own_addr:
                log_ae_event("no_peers", own_addr, -1, keys=0)
            time.sleep(interval)
            continue

        log_ae(f"Starting sync round with peers: {peers}", Colors.BLUE)
        if own_addr:
            log_ae_event("sync_start", own_addr, -1, keys=len(peers))

        for peer in peers:
            process_single_peer(storage, peer)

        log_ae(f"Sync round complete. Next sync in {interval}s", Colors.BLUE)
        if own_addr:
            log_ae_event("sync_complete", own_addr, -1, keys=0)
        time.sleep(interval)


def start_anti_entropy(storage, get_peer_list, own_id=None, own_addr=None):
    """
    Spawns the background thread.
    Use in main node startup.
    """
    t = threading.Thread(
        target=anti_entropy_loop,
        args=(storage, get_peer_list, own_id, own_addr),
        daemon=True
    )
    t.start()
    print("[anti-entropy] Background repair thread started")