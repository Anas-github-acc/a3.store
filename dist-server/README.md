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

### 1. Setup Virtual Environment

```bash
cd dist-server
# (recommended)
uv venv .venv
source .venv/bin/activate
uv sync
# or
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Start Nodes

Open **separate terminal windows** for each node:

```bash
# Terminal 1
./run-server.sh
# Enter: Node number: 1, Total nodes: 3, Replication factor: 2

# Terminal 2
./run-server.sh
# Enter: Node number: 2, Total nodes: 3, Replication factor: 2

# Terminal 3
./run-server.sh
# Enter: Node number: 3, Total nodes: 3, Replication factor: 2
```

---

## ⚠️ Important Warnings & Configuration

### Replication Factor Rules

| Replication Factor | Minimum Nodes Required | Fault Tolerance |
|--------------------|------------------------|-----------------|
| 1                  | 1                      | 0 node failures |
| 2                  | 2                      | 1 node failure  |
| 3                  | 3                      | 2 node failures |
| N                  | N                      | N-1 failures    |

> **⚠️ WARNING:** Replication factor **MUST NOT exceed** the total number of nodes in the cluster!

```
❌ INVALID: 2 nodes with replication factor 3
✅ VALID:   3 nodes with replication factor 2
✅ VALID:   3 nodes with replication factor 3
```

### Cluster Sizing Recommendations

| Use Case | Nodes | Replication Factor | Notes |
|----------|-------|-------------------|-------|
| Development | 1 | 1 | No fault tolerance |
| Testing | 3 | 2 | Can survive 1 node failure |
| Production (minimal) | 3 | 3 | Can survive 2 node failures |
| Production (recommended) | 5 | 3 | Better load distribution |

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

## Configuration Examples

### Example 1: Minimal Development Setup (1 Node)

```bash
./run-server.sh
# Node number: 1
# Total nodes: 1
# Replication factor: 1
```

> ⚠️ **No fault tolerance** - data loss if node crashes!

### Example 2: Standard 3-Node Cluster

**Terminal 1:**
```bash
./run-server.sh
# Node number: 1
# Total nodes: 3
# Replication factor: 2
```

**Terminal 2:**
```bash
./run-server.sh
# Node number: 2
# Total nodes: 3
# Replication factor: 2
```

**Terminal 3:**
```bash
./run-server.sh
# Node number: 3
# Total nodes: 3
# Replication factor: 2
```

### Example 3: High Availability 5-Node Cluster

Start 5 terminals with node numbers 1-5:
```bash
# Each terminal:
./run-server.sh
# Node number: [1-5]
# Total nodes: 5
# Replication factor: 3
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

### "Address already in use"

```bash
# Find and kill process using the port
lsof -i :50051
kill -9 <PID>
```

### Nodes not discovering each other

1. Ensure all nodes use the same `TOTAL_NODES` value
2. Check firewall settings
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

---

## Summary Table

| Parameter | Default | Valid Range | Notes |
|-----------|---------|-------------|-------|
| Node Number | - | 1+ | Must be unique per node |
| Total Nodes | 3 | 1+ | Same across cluster |
| Replication Factor | 2 | 1 to Total Nodes | Same across cluster |
| gRPC Port | 50050+N | 1024-65535 | Auto-calculated |
| Gossip Port | 8000+N | 1024-65535 | Auto-calculated |
| Anti-Entropy Interval | 30s | - | Configurable in code |
