import { NodeResources as NodeResourcesType } from "@/api";
import { motion } from "framer-motion";
import { Cpu, HardDrive } from "lucide-react";

interface NodeResourcesProps {
  resources: NodeResourcesType | null;
  isLoading?: boolean;
}

export function NodeResources({ resources, isLoading }: NodeResourcesProps) {
  const formatMemory = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatCpu = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const getCpuColor = (value: number) => {
    const percent = value * 100;
    if (percent > 80) return "bg-red-500";
    if (percent > 50) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getMemoryColor = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb > 200) return "bg-red-500";
    if (mb > 100) return "bg-amber-500";
    return "bg-emerald-500";
  };

  if (isLoading || !resources) {
    return (
      <div className="rounded-xl border border-border/50 bg-background/80 backdrop-blur-sm p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <HardDrive className="h-5 w-5 text-primary" />
          Node Resources
        </h3>
        <div className="flex items-center justify-center h-32">
          <motion.div
            className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  const allPods = [...new Set([
    ...resources.cpu.map(c => c.pod),
    ...resources.memory.map(m => m.pod)
  ])];

  return (
    <div className="rounded-xl border border-border/50 bg-background/80 backdrop-blur-sm p-6">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
        <HardDrive className="h-5 w-5 text-primary" />
        Node Resources
      </h3>

      <div className="space-y-4">
        {allPods.map((pod, idx) => {
          const cpuData = resources.cpu.find(c => c.pod === pod);
          const memData = resources.memory.find(m => m.pod === pod);

          return (
            <motion.div
              key={pod}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-lg bg-muted/30 p-3 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-medium text-foreground">{pod}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${pod.startsWith('kv-') ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {pod.startsWith('kv-') ? 'KV Store' : 'API'}
                </span>
              </div>

              {/* CPU */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Cpu className="h-3 w-3" /> CPU
                  </span>
                  <span className="font-mono text-foreground">{cpuData ? formatCpu(cpuData.value) : 'N/A'}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: cpuData ? `${Math.min(cpuData.value * 100, 100)}%` : '0%' }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className={`h-full rounded-full ${cpuData ? getCpuColor(cpuData.value) : 'bg-muted'}`}
                  />
                </div>
              </div>

              {/* Memory */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <HardDrive className="h-3 w-3" /> Memory
                  </span>
                  <span className="font-mono text-foreground">{memData ? formatMemory(memData.value) : 'N/A'}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: memData ? `${Math.min((memData.value / (256 * 1024 * 1024)) * 100, 100)}%` : '0%' }}
                    transition={{ duration: 0.5, delay: idx * 0.1 + 0.1 }}
                    className={`h-full rounded-full ${memData ? getMemoryColor(memData.value) : 'bg-muted'}`}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
