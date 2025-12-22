import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getNodes, NodeData } from "@/api";
import { motion } from "framer-motion";
import { Activity, Clock, Network, RefreshCw, Server } from "lucide-react";
import { useEffect, useState } from "react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Nodes() {
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getNodes();
      setNodes(data);
    } catch (err) {
      setError("Failed to fetch nodes");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading && nodes.length === 0) {
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

  const upCount = nodes.filter((n) => n.status === "UP").length;
  const downCount = nodes.filter((n) => n.status === "DOWN").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-foreground">Nodes</h1>
          <p className="mt-1 text-muted-foreground">
            Cluster membership via gossip protocol
          </p>
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
          <span>{error}</span>
        </motion.div>
      )}

      {/* Summary Cards */}
      <motion.div
        className="grid gap-4 sm:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <SummaryCard
          icon={Server}
          label="Total Nodes"
          value={nodes.length.toString()}
        />
        <SummaryCard
          icon={Network}
          label="UP"
          value={upCount.toString()}
          valueColor="text-success"
        />
        <SummaryCard
          icon={Activity}
          label="DOWN"
          value={downCount.toString()}
          valueColor={downCount > 0 ? "text-destructive" : "text-muted-foreground"}
        />
      </motion.div>

      {/* Nodes Grid */}
      {nodes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg border border-border/50 bg-muted/20 p-8 text-center"
        >
          <Server className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No nodes discovered</p>
        </motion.div>
      ) : (
        <motion.div
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {nodes.map((node) => (
            <motion.div key={node.node_id} variants={item}>
              <NodeCard node={node} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  valueColor = "text-foreground",
}: {
  icon: typeof Server;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <SpotlightCard>
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
        </div>
      </div>
    </SpotlightCard>
  );
}

function NodeCard({ node }: { node: NodeData }) {
  const statusMap: Record<string, "online" | "offline"> = {
    UP: "online",
    DOWN: "offline",
  };

  return (
    <SpotlightCard>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-mono text-base font-semibold text-foreground">
              {node.node_id}
            </h3>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">{node.addr}</p>
          </div>
          <StatusBadge status={statusMap[node.status] || "offline"} label={node.status} />
        </div>

        {/* Heartbeat */}
        <div className="flex items-center gap-1.5 border-t border-border/50 pt-3 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Heartbeat:</span>
          <span className="font-mono font-medium text-foreground">{node.heartbeat}</span>
        </div>
      </div>
    </SpotlightCard>
  );
}
