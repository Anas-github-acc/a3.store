from prometheus_client import Counter, Histogram, Gauge, REGISTRY


def get_counter(name, documentation, labelnames=()):
    if name in REGISTRY._names_to_collectors:
        return REGISTRY._names_to_collectors[name]
    try:
        return Counter(name, documentation, labelnames)
    except Exception:
        return REGISTRY._names_to_collectors.get(name)


def get_gauge(name, documentation, labelnames=()):
    if name in REGISTRY._names_to_collectors:
        return REGISTRY._names_to_collectors[name]
    try:
        return Gauge(name, documentation, labelnames)
    except Exception:
        return REGISTRY._names_to_collectors.get(name)


def get_histogram(name, documentation, labelnames=()):
    if name in REGISTRY._names_to_collectors:
        return REGISTRY._names_to_collectors[name]
    try:
        return Histogram(name, documentation, labelnames)
    except Exception:
        return REGISTRY._names_to_collectors.get(name)


http_requests_total = get_counter(
    "kv_http_requests_total",
    "Total HTTP requests",
    ["method", "path"]
)

# ---- Node ----
node_up = get_gauge(
    "kv_node_up",
    "Node health",
    ["node_id"]
)

# ---- gRPC ----
grpc_requests = get_counter(
    "kv_grpc_requests_total",
    "Total gRPC requests",
    ["method"]
)

grpc_latency = get_histogram(
    "kv_grpc_latency_seconds",
    "gRPC latency",
    ["method"]
)

grpc_errors = get_counter(
    "kv_grpc_errors_total",
    "gRPC errors",
    ["method"]
)

# ---- Replication ----
replication_attempts = get_counter(
    "kv_replication_attempts_total",
    "Replication attempts"
)

replication_failures = get_counter(
    "kv_replication_failures_total",
    "Replication failures"
)

# ---- Anti-Entropy ----
anti_entropy_runs = get_counter(
    "kv_anti_entropy_runs_total",
    "Anti-entropy runs"
)

anti_entropy_repairs = get_counter(
    "kv_anti_entropy_keys_repaired_total",
    "Keys repaired"
)

# ----- Gossip -----
gossip_messages = get_counter(
    "kv_gossip_messages_total",
    "Total gossip messages received"
)
