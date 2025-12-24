# a3.redis Distributed Server

A distributed key-value store with gossip-based membership, consistent hashing, and anti-entropy repair.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     a3.redis Cluster                            │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────┤
│   Node 1    │   Node 2    │   Node 3    │   Node N    │   ...   │
│  gRPC:50051 │  gRPC:50052 │  gRPC:50053 │  gRPC:5005N │         │
│ Gossip:8001 │ Gossip:8002 │ Gossip:8003 │ Gossip:800N │         │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────┘
```

## Quick Start

### Option 1: Docker (Recommended)

The easiest way to run a 3-node cluster with Docker:
We have provided [docker.sh](docker.sh) script in the /scripts directory at the root level

```bash
./docker.sh
```

This will automatically:
- remove all previous docker container running on node1, node2 node3
- Build the Docker image
- Create a Docker network (`kvnet`)
- Start 3 nodes (node1, node2, node3) with replication factor 2
- Enable DEBUG_LOG by default

**Docker Commands:**
```bash
# Start the cluster
./docker.sh

# Clean up containers and volumes only
./docker.sh clean

# View logs
docker logs -f node1
docker logs -f node2
docker logs -f node3

# Stop and remove containers
docker rm -f node1 node2 node3
```

> 💡 **Tip:** To customize node configurations (ports, environment variables, etc.), check the [docker.sh](docker.sh) script.

### Option 2: Interactive CLI Setup

For more control over individual node configurations, use the interactive CLI script:

#### 1. Setup Virtual Environment

```bash
cd kv-store
# (recommended)
uv venv .venv
source .venv/bin/activate
uv sync --active
# or
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

#### 2. Start Nodes

The `kvrun.sh` script provides an interactive CLI that prompts you for node configuration. Open **separate terminal windows** for each node:

```bash
# Terminal 1
./kvrun.sh
# The script will prompt:
# - Node number: 1
# - Total nodes: 3
# - Replication factor: 2

# Terminal 2
./kvrun.sh
# - Node number: 2
# - Total nodes: 3
# - Replication factor: 2

# Terminal 3
./kvrun.sh
# - Node number: 3
# - Total nodes: 3
# - Replication factor: 2
```

This interactive approach allows you to:
- Configure each node individually
- Adjust total node count dynamically
- Set custom replication factors per deployment
# Enter: Node number: 2, Total nodes: 3, Replication factor: 2

# Terminal 3
./kvrun.sh
# Enter: Node number: 3, Total nodes: 3, Replication factor: 2
```

---

### Port Allocation

Each node uses two ports calculated from its node number:

| Node # | gRPC Port | Gossip Port |
|--------|-----------|-------------|
| 1      | 50051     | 8001        |
| 2      | 50052     | 8002        |
| 3      | 50053     | 8003        |
| N      | 50050+N   | 8000+N      |

> **⚠️ WARNING:** Ensure these ports are not in use before starting nodes!

Check port availability:
```bash
# Check if port is in use
lsof -i :50051
lsof -i :8001
```

---

## ⚠️ Critical Warnings

### 1. Consistency Settings Must Match Across All Nodes

> **All nodes in a cluster MUST use the same replication factor!**

```
❌ WRONG:
   Node 1: replication_factor=2
   Node 2: replication_factor=3  ← INCONSISTENT!

✅ CORRECT:
   Node 1: replication_factor=2
   Node 2: replication_factor=2
   Node 3: replication_factor=2
```

### 2. Node Startup Order

- Nodes can start in **any order**
- Gossip protocol will discover peers automatically
- **Wait ~5 seconds** after starting all nodes before heavy writes

### 3. Data Directory Isolation

Each node stores data in a separate directory:
```
dist-server/
├── data/
│   ├── node1/    ← Node 1's data
│   ├── node2/    ← Node 2's data
│   └── node3/    ← Node 3's data
```

> **⚠️ WARNING:** Never share data directories between nodes!

### 4. Network Partitions

If nodes cannot communicate:
- **Gossip timeout:** Nodes marked as failed after ~10s of no heartbeat
- **Anti-entropy:** Runs every 30s to repair inconsistencies
- **Split-brain:** Possible with network partitions (last-write-wins resolution)

### 5. Graceful Shutdown

Use `Ctrl+C` to stop nodes gracefully. Abrupt termination may cause:
- Incomplete writes
- Temporary inconsistencies (repaired by anti-entropy)

---

## Environment Variables

You can set these instead of using interactive prompts:

```bash
export GRPC_PORT=50051
export GOSSIP_PORT=8001
export NODE_NUM=1
export PEERS="127.0.0.1:50052,127.0.0.1:50053"
export REPLICATION_FACTOR=2
export DATA_DIR="./data/node1"

cd app && python node.py
```

---

## Troubleshooting

### Rebuild & Redeploy (Kubernetes)

If you change the `Dockerfile` (for example to run the node as a single process so Prometheus metrics are exposed reliably), rebuild and push the image and then rollout the StatefulSet:

```bash
# Build and push (example using your existing script)
VERSION="v1.0.2" ./scripts/dockerupload.sh build
VERSION="v1.0.2" ./scripts/dockerupload.sh push

# Update image tag in k8s/manifests/kv/statefulset-kv.yaml and apply
kubectl -n kv apply -f k8s/manifests/kv/statefulset-kv.yaml
```

After redeploy, verify metrics are scraped by Prometheus and `/api/metrics/summary` returns non-zero values.

### "Address already in use"

```bash
# Find and kill process using the port
lsof -i :50051
kill -9 <PID>
```

### Nodes not discovering each other

1. Ensure all nodes use the same `TOTAL_NODES` value
3. Verify gossip ports are accessible

### Data inconsistency after restart

- Wait for anti-entropy cycle (~30 seconds)
- Check logs for `[anti-entropy] MISMATCH` messages

### High CPU usage

Anti-entropy computes hashes every 30s. For large datasets:
- Increase `SYNC_INTERVAL` in `anti_entropy.py`
- Consider chunked scanning

---

## Health Check

Verify cluster health:

```bash
# Check gossip endpoint
curl http://127.0.0.1:8001/membership

# Expected output (after all nodes started):
{
  "node-1": {"addr": "127.0.0.1:50051", "timestamp": 1234567890},
  "node-2": {"addr": "127.0.0.1:50052", "timestamp": 1234567891},
  "node-3": {"addr": "127.0.0.1:50053", "timestamp": 1234567892}
}
```

### Anti-entropy - How Chunking works

Setup
- Nodes: 3 ( Node A, Node B, Node C)
- CHUNK_COUNT = 4 (using 4 instead of 16 so it’s easy to see)
- All nodes store all keys
- Chunking is deterministic

Chunk Rule - chunk_id = hash(key) % 4

Key	  | Value   | modified_at |hash(key) % 4 (Chunk)
user:1  | Alice   | 100	        | 0
user:2  | Bob	   | 101	        | 1
order:9 | shipped	| 102	        | 3
cart:7  | 2-items	| 105	        | 1
stock:5 | 42	   | 110	        | 2

So the logical chunks are:

- chunk 0 → [user:1]
- chunk 1 → [user:2, cart:7]
- chunk 2 → [stock:5]
- chunk 3 → [order:9]

! note: hashing here is only to define the chunk 

Now all nodes have all chunk and every chunk is holding some number of keys, now when their is lost of some key from any node (let suppose node B)

#### Anti-entropy loop
1. It loops chunk-by-chunk.
2. compare chunks
```bash
#node A
cart:7|2-items|105
user:2|Bob|101

# node B
user:2|Bob|101
cart:7|2-items|105
```
3. both node sort the key and calculate the hash if hash code do not matches then repair start
(note: here hashing is to find if chunk is tampered or not)
4. node B ask node A for chunk 1
