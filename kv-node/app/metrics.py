from prometheus_client import Counter, Histogram, Gauge

# ---- Node ----
node_up = Gauge(
    "kv_node_up",
    "Node health",
    ["node_id"]
)

# ---- gRPC ----
grpc_requests = Counter(
    "kv_grpc_requests_total",
    "Total gRPC requests",
    ["method"]
)

grpc_latency = Histogram(
    "kv_grpc_latency_seconds",
    "gRPC latency",
    ["method"]
)

grpc_errors = Counter(
    "kv_grpc_errors_total",
    "gRPC errors",
    ["method"]
)

# ---- Replication ----
replication_attempts = Counter(
    "kv_replication_attempts_total",
    "Replication attempts"
)

replication_failures = Counter(
    "kv_replication_failures_total",
    "Replication failures"
)

# ---- Anti-Entropy ----
anti_entropy_runs = Counter(
    "kv_anti_entropy_runs_total",
    "Anti-entropy runs"
)

anti_entropy_repairs = Counter(
    "kv_anti_entropy_keys_repaired_total",
    "Keys repaired"
)

# ----- Gossip -----
gossip_messages = Counter(
    "kv_gossip_messages_total",
    "Total gossip messages received"
)

