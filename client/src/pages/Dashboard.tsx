import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getClusterHealth, getMetricsSummary, ClusterHealth, MetricsSummary } from "@/api";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, ArrowDownUp, Database, GitBranch, RefreshCw, Server, Zap } from "lucide-react";
import { useEffect, useState } from "react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const [health, setHealth] = useState<ClusterHealth | null>(null);
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [healthData, metricsData] = await Promise.all([
        getClusterHealth(),
        getMetricsSummary(),
      ]);
      setHealth(healthData);
      setMetrics(metricsData);
    } catch (err) {
      setError("Failed to fetch cluster data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading && !health) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  const statusMap: Record<string, "online" | "warning" | "error"> = {
    HEALTHY: "online",
    DEGRADED: "warning",
    UNKNOWN: "error",
  };

  const stats = [
    {
      label: "Cluster Status",
      value: health?.status || "UNKNOWN",
      icon: Activity,
      status: statusMap[health?.status || "UNKNOWN"],
    },
    {
      label: "Active Nodes",
      value: metrics ? `${metrics.nodes_up}/${metrics.nodes_total}` : "N/A",
      icon: Server,
    },
    {
      label: "Replication Factor",
      value: health?.replication_factor ? `${health.replication_factor}x` : "N/A",
      icon: GitBranch,
    },
    {
      label: "Total Requests",
      value: metrics?.grpc_requests_total?.toLocaleString() || "0",
      icon: ArrowDownUp,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">a3.store cluster overview</p>
        </motion.div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive"
        >
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <SpotlightCard className="h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  {stat.status ? (
                    <div className="mt-2">
                      <StatusBadge status={stat.status} label={stat.value} />
                    </div>
                  ) : (
                    <p className="mt-1 text-2xl font-bold text-primary">{stat.value}</p>
                  )}
                </div>
                <div className="rounded-lg bg-primary/10 p-2">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </SpotlightCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Metrics Grid */}
      <motion.div
        className="grid gap-6 lg:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        {/* gRPC Metrics */}
        <SpotlightCard>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Zap className="h-5 w-5 text-primary" />
            gRPC Metrics
          </h3>
          <div className="space-y-3">
            <InfoRow label="Total Requests" value={metrics?.grpc_requests_total?.toLocaleString() || "0"} />
            <InfoRow label="PUT Requests" value={metrics?.grpc_requests_by_method?.Put?.toLocaleString() || "0"} />
            <InfoRow label="GET Requests" value={metrics?.grpc_requests_by_method?.Get?.toLocaleString() || "0"} />
            <InfoRow label="Total Errors" value={metrics?.grpc_errors_total?.toLocaleString() || "0"} highlight={metrics?.grpc_errors_total ? "error" : undefined} />
            <InfoRow label="Avg Latency" value={metrics?.grpc_latency_avg ? `${(metrics.grpc_latency_avg * 1000).toFixed(2)}ms` : "N/A"} />
          </div>
        </SpotlightCard>

        {/* Replication & Anti-Entropy */}
        <SpotlightCard>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Database className="h-5 w-5 text-primary" />
            Replication & Repair
          </h3>
          <div className="space-y-3">
            <InfoRow label="Replication Attempts" value={metrics?.replication_attempts_total?.toLocaleString() || "0"} />
            <InfoRow label="Replication Failures" value={metrics?.replication_failures_total?.toLocaleString() || "0"} highlight={metrics?.replication_failures_total ? "warning" : undefined} />
            <InfoRow label="Anti-Entropy Runs" value={metrics?.anti_entropy_runs_total?.toLocaleString() || "0"} />
            <InfoRow label="Keys Repaired" value={metrics?.anti_entropy_repaired_total?.toLocaleString() || "0"} />
          </div>
        </SpotlightCard>
      </motion.div>

      {/* Timestamp */}
      {health?.timestamp && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-muted-foreground"
        >
          Last updated: {new Date(health.timestamp).toLocaleString()}
        </motion.p>
      )}
    </div>
  );
}

function InfoRow({ 
  label, 
  value, 
  highlight 
}: { 
  label: string; 
  value: string; 
  highlight?: "error" | "warning";
}) {
  const highlightClass = highlight === "error" 
    ? "text-destructive" 
    : highlight === "warning" 
    ? "text-warning" 
    : "text-foreground";
    
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`font-mono text-sm font-medium ${highlightClass}`}>{value}</span>
    </div>
  );
}
