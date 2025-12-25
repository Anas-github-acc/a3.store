

# <div style="{display: 'flex', alignItems: 'center'}"><img src="a3store-icon.svg" alt="a3store icon" width="32" height="32" style="vertical-align: middle; margin-right: 8px;" /> a3.store - Distributed Key-Value Store</div>

a3.store is a distributed key-value database you can run locally. It is inspired by DynamoDB and Cassandra, but is simple to set up and 3 min to get started.

---

## Quick Start (3 minutes)

1. Clone and enter the node folder:

```bash
git clone https://github.com/anasrar/dist-redis.git
cd dist-redis/kv-node
```

2. Create and activate a Python venv, then install dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

3. Start a 3-node dev cluster (RF=2):

```bash
cd .. && ./scripts/docker.sh
# or run interactive nodes:
./kvrun.sh   # answer prompts: node, total nodes (3), replication factor (2)
```

4. Test with the provided HTTP client:

```bash
python3 app/http-server/client.py
```

---

## What this project implements (short)

- Simple distributed KV store inspired by Dynamo/Riak/Cassandra
- gRPC for client & inter-node RPCs
- Gossip for peer discovery
- Anti-entropy using keyspace chunk hashing (16 chunks)
- SQLite backend (WAL) per node, configurable replication factor

---

## Architecture & Design (visual)


High-level diagrams live in `images/` (referenced below):

- `images/distributed_database_architecure.png` — overall topology
- `images/how_gossip_works.png` — gossip membership flow
- `images/anti-entropy_chunking_works.png` — chunk hashing and repair
- `images/deployment-architecture.png` — deployment architecture (EKS)

### Thread model (concise)

- Main thread: process lifecycle
- gRPC thread pool: handles `Put`, `Get`, `Replicate`, `FetchRange`
- Gossip thread: lightweight HTTP endpoint for heartbeat/post
- Background loops: gossip (1s) and anti-entropy (30s)

---

## Diagrams & explanations

### Distributed Database Architecture

![Distributed Database Architecture](images/distributed_database_architecure.png)

This diagram shows the cluster topology and request flow: clients send `Put`/`Get` to any node; writes are synchronously forwarded to the configured number of replicas (replication factor). Each node runs a local SQLite store (WAL) and exposes gRPC for client and inter-node RPCs. The architecture highlights separation of client-facing traffic, replication paths, and background subsystems (gossip + anti-entropy).

### How Gossip Works

![How Gossip Works](images/how_gossip_works.png)

Gossip is the decentralized membership protocol: each node periodically selects peers and sends lightweight heartbeats. Membership updates spread probabilistically (epidemic style); failed nodes are detected via missed heartbeats and membership state converges without a central coordinator.

### Anti-Entropy Chunking

![Anti-Entropy Chunking](images/anti-entropy_chunking_works.png)

To efficiently repair divergence, the keyspace is split into 16 chunks. Nodes compute a compact hash per chunk and exchange hashes with peers. Only chunks with mismatched hashes are scanned and synchronized by fetching the key ranges, dramatically reducing bandwidth and repair time compared to full key comparisons.

### Deployment Architecture (AWS EKS)

![Deployment Architecture (EKS)](images/deployment-architecture.png)

This diagram illustrates a recommended deployment pattern for running `a3.store` on AWS EKS:

- Each KV node runs in its own Kubernetes Pod, with a dedicated PersistentVolumeClaim for SQLite data to ensure durability.
- gRPC ports are exposed via an internal Service (ClusterIP); a LoadBalancer (or ingress) may be used for external client traffic.
- A sidecar or init container can be used to provision node-level configuration (NODE_NUM, DATA_DIR) from ConfigMaps and Secrets.
- Anti-entropy and gossip traffic are internal, kept on the cluster network; cross-AZ affinity or pod anti-affinity should be configured for resilience.
- For production, pair EKS with managed backing services (EFS/FSx for shared storage if needed, or object storage for backups; and SQS/Redis for queued replication/repair if implementing the future roadmap).

Security & resilience notes:

- Use NetworkPolicies to limit traffic to gRPC and gossip ports between pods.
- Configure PodDisruptionBudgets and readiness/liveness probes so replicas remain available during rolling updates.
- Consider running Prometheus metrics scraping and a Grafana dashboard for observability.


## Quick API Reference

Core gRPC service (see `proto/kv.proto`):

```protobuf
service KeyValue {
  // client
  rpc Put(PutRequest) returns (PutResponse);
  rpc Get(GetRequest) returns (GetResponse);

  // internal
  rpc Replicate(PutRequest) returns (PutResponse);
  rpc GetChunkHash(ChunkRequest) returns (ChunkHashResponse);
  rpc FetchRange(RangeRequest) returns (stream KeyValuePair);
}
```

Node.js client usage (examples in `nodejs-client/`):

```js
const client = require('./grpc_client.js');
client.put('127.0.0.1:50051', 'user:101', 'Alice', (err,res)=>console.log(res));
client.get('127.0.0.1:50051', 'user:101', (err,res)=>console.log(res));
```

---

## Configuration (env vars)

| Variable | Default | Purpose |
|---|---:|---|
| NODE_NUM | `1` | Node id (unique per process) |
| GRPC_PORT | `50051` | gRPC server port |
| GOSSIP_PORT | `8001` | Gossip HTTP port |
| REPLICATION_FACTOR | `2` | Number of replicas |
| DATA_DIR | `data/node{N}` | SQLite DB dir |

---

## Debugging & Observability

- Run with verbose logs:

```bash
DEBUG_LOG=true ./kvrun.sh
```

- Key log tags to scan:
  - `[REPLICATE]` — replication attempts/results
  - `[GOSSIP]` — membership events
  - `[ANTI-ENTROPY]` — repair rounds and chunk mismatches

---

## Troubleshooting checklist

- Ensure ports `50051-50053` and `8001-8003` are free
- Each node must have its own `DATA_DIR`
- If diagrams don’t render, place the PNG files under `images/`

---

## Project layout (short)

- `kv-node/` — Python node code (server, gossip, anti-entropy, storage)
- `proto/` — `kv.proto` definition
- `nodejs-client/` — JS client + tests
- `scripts/` — helpers (docker.sh, kvrun.sh)
- `infra/`, `k8s/`, `terraform/` — deployment manifests
