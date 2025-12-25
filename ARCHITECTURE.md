
# <div style="{display: 'flex', alignItems: 'center'}"><img src="a3store-icon.svg" alt="a3store icon" width="32" height="32" style="vertical-align: middle; margin-right: 8px;" /> a3.store - Distributed Key-Value Store</div>

## What is this?
a3.store is a distributed key-value database you can run locally. It is inspired by DynamoDB and Cassandra, but is simple to set up and use for learning or prototyping distributed systems.

## Quick Start (Local)

1. Clone the repository:
   ```sh
   git clone https://github.com/anasrar/dist-redis.git
   cd dist-redis/kv-node
   ```
2. (Recommended) Create and activate a Python virtual environment:
   ```sh
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt

   
   ```
3. Start a 3-node cluster with replication factor 2:
   ```sh
   cd .. && ./scripts/docker.sh
   ```
   Or, to run nodes manually:
   ```sh
   ./kvrun.sh
   # Follow prompts for node number, total nodes (3), replication factor (2)
   ```
4. Interact with the API:
   - Use the provided Node.js client, gRPC, or HTTP endpoints to PUT/GET keys.
   - Example: `python3 app/http-server/client.py` (see client/ for more)

## How it Works

- 3 nodes, each with its own SQLite database (WAL mode)
- Data is synchronously written to 2 replicas
- GET requests are coordinated for consistency
- Nodes discover each other using a gossip protocol
- Keyspace is split into 16 chunks for efficient anti-entropy repair (runs every 30s)

## Useful Tools & Technologies

- Python 3.10+
- gRPC (for inter-node and client communication)
- SQLite (WAL mode)
- Gossip protocol, Consistent hashing

## Troubleshooting

- Make sure required ports (50051-50053, 8001-8003) are free
- Each node must have a unique data directory
- Logs and errors are printed to the console for each node

For more details, see the kv-node/README.md and scripts/docker.sh.

---

### 5️⃣ Thread Architecture & Queue-Based Coordination

Each node runs multiple concurrent subsystems:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Node Process                                │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
│  │   Main Thread   │  │  gRPC Thread    │  │  Gossip HTTP Thread │  │
│  │                 │  │     Pool        │  │    (Uvicorn)        │  │
│  │  Orchestrates   │  │                 │  │                     │  │
│  │  startup &      │  │  Handles:       │  │  Handles:           │  │
│  │  shutdown       │  │  - Put/Get      │  │  - POST /gossip     │  │
│  │                 │  │  - Replicate    │  │                     │  │
│  └─────────────────┘  │  - GetChunkHash │  └─────────────────────┘  │
│                       │  - FetchRange   │                           │
│  ┌─────────────────┐  └─────────────────┘  ┌─────────────────────┐  │
│  │  Gossip Loop    │                       │  Anti-Entropy Loop  │  │
│  │    Thread       │                       │      Thread         │  │
│  │                 │                       │                     │  │
│  │  Every 1s:      │                       │  Every 30s:         │  │
│  │  Send heartbeat │                       │  Compare & repair   │  │
│  │  to all peers   │                       │  data with peers    │  │
│  └─────────────────┘                       └─────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                  SQLite Storage (Thread-Local Connections)  │    │
│  │                       WAL Mode for Concurrent Access        │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

**⚠️ Critical Sections & Future Queue Integration:**

For high-throughput production use, the following areas would benefit from task queues:

| Area | Current | Future Enhancement |
|------|---------|-------------------|
| Replication | Fire-and-forget threads | Redis/RabbitMQ queue with retry |
| Anti-entropy repairs | Direct writes | Batched write queue |
| Failed replications | Logged & dropped | Hinted handoff queue |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+ (for client)
- [uv](https://github.com/astral-sh/uv) (recommended) or pip

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/dist-redis.git
cd dist-redis
```

### 2. Setup Python Server

```bash
cd dist-server

# Using uv (recommended)
uv venv .venv
source .venv/bin/activate
uv sync

# Or using pip
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Start a 3-Node Cluster

Open **3 separate terminals**:

**Terminal 1:**
```bash
cd dist-server
source .venv/bin/activate
./run-server.sh
# Enter: Node number: 1, Total nodes: 3, Replication factor: 2
```

**Terminal 2:**
```bash
cd dist-server
source .venv/bin/activate
./run-server.sh
# Enter: Node number: 2, Total nodes: 3, Replication factor: 2
```

**Terminal 3:**
```bash
cd dist-server
source .venv/bin/activate
./run-server.sh
# Enter: Node number: 3, Total nodes: 3, Replication factor: 2
```

### 4. Setup Node.js Client

```bash
cd nodejs-client
npm install
```

### 5. Test the Cluster

```bash
# Run the distributed test
node app/test-distributed.js
```

**Expected Output:**
```
========================================
   Distributed Database Test Suite
========================================

TEST 1: Write to Node 1
  ✅ PUT response: {"ok":true,"message":"stored"}

TEST 2: Read from ALL nodes (verify replication)
  ✅ Node 1: Found correct value
  ✅ Node 2: Found correct value
  ✅ Node 3: Found correct value

========================================
✅ Distributed database is working correctly!
```

---

## 🔌 API Reference

### gRPC Service Definition

```protobuf
service KeyValue {
  // Client-facing RPCs
  rpc Put(PutRequest) returns (PutResponse);
  rpc Get(GetRequest) returns (GetResponse);
  
  // Internal node-to-node RPCs
  rpc Replicate(PutRequest) returns (PutResponse);
  rpc GetChunkHash(ChunkRequest) returns (ChunkHashResponse);
  rpc FetchRange(RangeRequest) returns (stream KeyValuePair);
}
```

### Node.js Client Usage

```javascript
const client = require('./grpc_client.js');

// Write a key
client.put('127.0.0.1:50051', 'user:123', 'John Doe', (err, res) => {
  console.log('PUT:', res);  // { ok: true, message: 'stored' }
});

// Read a key
client.get('127.0.0.1:50051', 'user:123', (err, res) => {
  console.log('GET:', res);  // { value: 'John Doe', found: true }
});
```

---

## 🐛 Debug Logging

Enable detailed logging to see replication, gossip, and anti-entropy in action:

```bash
DEBUG_LOG=true ./run-server.sh
```

**Log Output Example:**
```
[WRITE] Node=127.0.0.1:50051 | Key=name | Value=anas | Timestamp=1733356800
[REPLICAS] Key=name will replicate to: ['127.0.0.1:50052', '127.0.0.1:50053']
[REPLICATE→] 127.0.0.1:50051 → 127.0.0.1:50052 | Key=name
[REPLICATE✓] Successfully replicated key=name to 127.0.0.1:50052
[GOSSIP] New node discovered: node-2 @ 127.0.0.1:50052
[ANTI-ENTROPY] Starting sync round with peers: ['127.0.0.1:50052']
```

---

## 📁 Project Structure

```
dist-redis/
├── README.md                 # This file
├── image.png                 # Architecture diagram
├── proto/
│   └── kv.proto              # gRPC service definition
├── scripts/
│   └── generate-stubs.sh     # Regenerate gRPC stubs
├── dist-server/              # Python server
│   ├── app/
│   │   ├── node.py           # Main entry point
│   │   ├── grpc_server.py    # gRPC service implementation
│   │   ├── grpc_client.py    # Internal gRPC client
│   │   ├── gossip.py         # Gossip membership protocol
│   │   ├── anti_entropy.py   # Background repair loop
│   │   ├── storage.py        # SQLite storage engine
│   │   ├── kv_pb2.py         # Generated protobuf
│   │   └── kv_pb2_grpc.py    # Generated gRPC stubs
│   ├── run-server.sh         # Node launcher script
│   ├── pyproject.toml        # Python dependencies
│   └── data/                 # SQLite databases per node
└── nodejs-client/            # Node.js client
    ├── grpc_client.js        # gRPC client library
    ├── app/
    │   ├── app.js            # Simple test
    │   └── test-distributed.js # Full cluster test
    └── package.json
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_NUM` | `1` | Node identifier (1, 2, 3, ...) |
| `GRPC_PORT` | `50051` | gRPC server port |
| `GOSSIP_PORT` | `8001` | Gossip HTTP port |
| `REPLICATION_FACTOR` | `2` | Number of replicas per key |
| `DEBUG_LOG` | `false` | Enable verbose logging |
| `DATA_DIR` | `data/node{N}` | SQLite database directory |

### Cluster Sizing Guide

| Nodes | Replication Factor | Fault Tolerance | Use Case |
|-------|-------------------|-----------------|----------|
| 1 | 1 | 0 failures | Development |
| 3 | 2 | 1 failure | Testing |
| 3 | 3 | 2 failures | Production (minimal) |
| 5 | 3 | 2 failures | Production (recommended) |

---

## 🎓 Distributed Systems Concepts Implemented

| Concept | Implementation |
|---------|----------------|
| **Gossip Protocol** | Decentralized membership via heartbeats |
| **Eventual Consistency** | sync replication to guarantee store |
| **Anti-Entropy** | chunk hash key method for anti-entropy |
| **Self-Healing** | Automatic data repair after failures |
