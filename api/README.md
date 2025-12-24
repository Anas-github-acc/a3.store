# API Gateway

REST API gateway for the distributed key-value store cluster.

## Endpoints

### KV Operations

#### PUT - Store Key-Value Pair
```http
POST /api/kv/:key
Content-Type: application/json

{
  "value": "string"
}
```

**Response:**
```json
{
  "status": "ok"
}
```

#### GET - Retrieve Value by Key
```http
GET /api/kv/:key
```

**Response:**
```json
{
  "value": "string",
  "found": true,
  "modified_at": 1234567890
}
```

---

### Cluster Management

#### Get Cluster Nodes
```http
GET /api/cluster/nodes
```

**Response:**
```json
[
  {
    "node_id": "node-kv-0",
    "addr": "kv-0.kv-headless.kv.svc.cluster.local:50051",
    "heartbeat": 1234567890,
    "status": "UP"
  }
]
```

#### Get Cluster Health
```http
GET /api/cluster/health
```

**Response:**
```json
{
  "status": "HEALTHY",
  "nodes": 3,
  "replication_factor": 2,
  "timestamp": 1234567890
}
```

#### Get Pod Lifecycle Information
```http
GET /api/cluster/pod-lifecycle
```

**Response:**
```json
[
  {
    "pod": "kv-0",
    "running": true,
    "restarts": 0,
    "phase": "Running"
  }
]
```

---

### Metrics

#### Get Metrics Summary
```http
GET /api/metrics/summary
```

**Response:**
```json
{
  "nodes_up": 3,
  "nodes_total": 3,
  "grpc_requests_total": 150,
  "grpc_requests_by_method": {
    "Put": 50,
    "Get": 100
  },
  "grpc_errors_total": 2,
  "grpc_errors_by_method": {
    "Put": 1,
    "Get": 1
  },
  "grpc_latency_avg": 0.015,
  "replication_attempts_total": 100,
  "replication_failures_total": 5,
  "anti_entropy_runs_total": 20,
  "anti_entropy_repaired_total": 8
}
```

#### Get Node Resource Usage
```http
GET /api/nodes/resources
```

**Response:**
```json
{
  "cpu": [
    {
      "pod": "kv-0",
      "value": 0.025
    }
  ],
  "memory": [
    {
      "pod": "kv-0",
      "value": 52428800
    }
  ]
}
```

---

### Anti-Entropy

#### Get Anti-Entropy Events
```http
GET /api/anti-entropy/events
```

**Response:**
```json
[
  {
    "event": "ANTI_ENTROPY_REPAIR",
    "node": "node-1",
    "chunk": 4,
    "keys": 8,
    "timestamp": 1234567890
  }
]
```

---

### Health Check

#### Health Check
```http
GET /healthz
```

**Response:**
```json
{
  "status": "ok"
}
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `KV_GRPC_TARGET` | gRPC target for KV nodes | `kv-headless.kv.svc.cluster.local:50051` |
| `GOSSIP_HTTP` | HTTP endpoint for gossip service | `http://kv-headless.kv.svc.cluster.local:8001` |
| `PROMETHEUS_URL` | Prometheus server URL | `http://prometheus-kube-prometheus-prometheus.monitoring.svc.cluster.local:9090` |

---

## Running Locally

```bash
npm install
npm start
```

The API will be available at `http://localhost:8080`

---

## Docker

```bash
# Build
docker build -t a3store-api:latest .

# Run
docker run -p 8080:8080 \
  -e KV_GRPC_TARGET=localhost:50051 \
  -e GOSSIP_HTTP=http://localhost:8001 \
  a3store-api:latest
```
