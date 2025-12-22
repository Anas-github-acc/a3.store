// API functions for a3.store distributed KV store
// Configure your API base URL here
const API_BASE = import.meta.env.VITE_API_BASE || "";

// Helper function for API calls
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// Types based on your API responses
export interface ClusterHealth {
  status: "HEALTHY" | "UNKNOWN" | "DEGRADED";
  nodes?: number;
  replication_factor?: number;
  timestamp?: number;
}

export interface NodeData {
  node_id: string;
  addr: string;
  heartbeat: number;
  status: "UP" | "DOWN";
}

export interface MetricsSummary {
  nodes_up: number;
  nodes_total: number;
  grpc_requests_total: number;
  grpc_requests_by_method: Record<string, number>;
  grpc_errors_total: number;
  grpc_errors_by_method: Record<string, number>;
  grpc_latency_avg: number;
  replication_attempts_total: number;
  replication_failures_total: number;
  anti_entropy_runs_total: number;
  anti_entropy_repaired_total: number;
  error?: string;
  details?: string;
}

export interface AntiEntropyEvent {
  event: string;
  node: string;
  chunk: number;
  keys: number;
  timestamp: number;
}

export interface KeyValueResult {
  key: string;
  value: string | null;
  found: boolean;
  timestamp?: string;
}

export interface NodeResourceUsage {
  pod: string;
  value: number;
}

export interface NodeResources {
  cpu: NodeResourceUsage[];
  memory: NodeResourceUsage[];
}

export interface PodLifecycle {
  pod: string;
  running: boolean;
  restarts: number;
  phase: "Running" | "Pending" | "Succeeded" | "Failed" | "Unknown";
}

export interface HealthzResponse {
  status: string;
}

// GET /api/cluster/health - Get cluster health summary
export async function getClusterHealth(): Promise<ClusterHealth> {
  return fetchApi<ClusterHealth>("/api/cluster/health");
}

// GET /api/cluster/nodes - Get cluster membership via gossip
export async function getNodes(): Promise<NodeData[]> {
  return fetchApi<NodeData[]>("/api/cluster/nodes");
}

// GET /api/metrics/summary - Get Prometheus summary metrics
export async function getMetricsSummary(): Promise<MetricsSummary> {
  return fetchApi<MetricsSummary>("/api/metrics/summary");
}

// GET /api/anti-entropy/events - Get anti-entropy events
export async function getAntiEntropyEvents(): Promise<AntiEntropyEvent[]> {
  return fetchApi<AntiEntropyEvent[]>("/api/anti-entropy/events");
}

// GET /healthz - Health check endpoint
export async function getHealthz(): Promise<HealthzResponse> {
  return fetchApi<HealthzResponse>("/healthz");
}

// GET /api/nodes/resources - Get node resource usage (CPU/Memory)
export async function getNodeResources(): Promise<NodeResources> {
  return fetchApi<NodeResources>("/api/nodes/resources");
}

// GET /api/cluster/pod-lifecycle - Get pod lifecycle status
export async function getPodLifecycle(): Promise<PodLifecycle[]> {
  return fetchApi<PodLifecycle[]>("/api/cluster/pod-lifecycle");
}

// PUT /api/kv/:key - Store a key-value pair
export async function putKey(
  key: string,
  value: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/api/kv/${encodeURIComponent(key)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });

  if (!response.ok) {
    throw new Error(`Failed to store key: ${response.status}`);
  }

  return { success: true, message: `Key "${key}" stored successfully` };
}

// GET /api/kv/:key - Retrieve a key-value pair
export async function getKey(key: string): Promise<KeyValueResult> {
  try {
    const response = await fetch(`${API_BASE}/api/kv/${encodeURIComponent(key)}`);

    if (response.status === 404) {
      return { key, value: null, found: false };
    }

    if (!response.ok) {
      throw new Error(`Failed to get key: ${response.status}`);
    }

    const data = await response.json();
    return {
      key,
      value: typeof data.value === "string" ? data.value : JSON.stringify(data.value),
      found: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return { key, value: null, found: false };
  }
}

// Legacy exports for compatibility (maps to new API)
export interface HealthData {
  cluster_status: "healthy" | "degraded" | "unhealthy";
  total_nodes: number;
  active_nodes: number;
  total_keys: number;
  replication_factor: number;
  uptime: string;
  version: string;
  memory_usage: number;
  cpu_usage: number;
}

export async function getHealth(): Promise<HealthData> {
  const [health, metrics] = await Promise.all([
    getClusterHealth().catch(() => ({ status: "UNKNOWN" as const }) as ClusterHealth),
    getMetricsSummary().catch(() => null),
  ]);

  return {
    cluster_status: health.status === "HEALTHY" ? "healthy" : health.status === "UNKNOWN" ? "unhealthy" : "degraded",
    total_nodes: metrics?.nodes_total ?? health.nodes ?? 0,
    active_nodes: metrics?.nodes_up ?? health.nodes ?? 0,
    total_keys: 0, // Not available in current API
    replication_factor: health.replication_factor ?? 0,
    uptime: health.timestamp ? formatUptime(health.timestamp) : "N/A",
    version: "a3.store",
    memory_usage: 0,
    cpu_usage: 0,
  };
}

function formatUptime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return days > 0 ? `${days}d ${remainingHours}h` : `${hours}h`;
}
