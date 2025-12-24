import { PodLifecycle as PodLifecycleType } from "@/api";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  Box, 
  Activity, 
  Cpu 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PodLifecycleProps {
  pods: PodLifecycleType[];
  isLoading?: boolean;
}

export function PodLifecycle({ pods, isLoading }: PodLifecycleProps) {
  // Map logic to your Design System variables
  const getStatusConfig = (phase: string, running: boolean) => {
    if (running && phase === "Running") {
      return {
        icon: <CheckCircle2 className="h-4 w-4" />,
        colorClass: "text-success", // Uses your --success variable (Green)
        bgClass: "bg-success/10",
        borderClass: "group-hover:border-success/50",
      };
    }
    switch (phase) {
      case "Pending":
        return {
          icon: <Clock className="h-4 w-4" />,
          colorClass: "text-warning", // Uses your --warning variable (Yellow/Orange)
          bgClass: "bg-warning/10",
          borderClass: "group-hover:border-warning/50",
        };
      case "Succeeded":
        return {
          icon: <CheckCircle2 className="h-4 w-4" />,
          colorClass: "text-primary", // Uses your --primary variable (Orange)
          bgClass: "bg-primary/10",
          borderClass: "group-hover:border-primary/50",
        };
      case "Failed":
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          colorClass: "text-destructive", // Uses your --destructive variable (Red)
          bgClass: "bg-destructive/10",
          borderClass: "group-hover:border-destructive/50",
        };
      default:
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          colorClass: "text-muted-foreground",
          bgClass: "bg-secondary",
          borderClass: "group-hover:border-foreground/20",
        };
    }
  };

  if (isLoading) {
    return (
      <div className="card-glass relative overflow-hidden rounded-[var(--radius)] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 rounded bg-secondary/50 animate-pulse" />
          <div className="h-6 w-32 rounded bg-secondary/50 animate-pulse" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
           {[1, 2, 3, 4].map((i) => (
             <div key={i} className="h-24 rounded-[var(--radius)] bg-secondary/30 border border-border/50 animate-pulse" />
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card-glass relative rounded-[var(--radius)] p-6 overflow-hidden group/container">
      {/* Background Grid Pattern from your CSS */}
      <div className="absolute inset-0 grid-pattern opacity-[0.15] pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <h3 className="flex items-center gap-3 text-lg font-semibold tracking-tight text-foreground">
          <div className="flex items-center justify-center h-8 w-8 rounded bg-primary/10 text-primary ring-1 ring-primary/20 shadow-[0_0_15px_-3px_hsl(var(--primary)/0.3)]">
            <Box className="h-4 w-4" />
          </div>
          Pod Lifecycle
        </h3>
        
        {/* Live Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border/50 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Live
          </span>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="relative z-10 grid gap-3 sm:grid-cols-2">
        {pods.map((pod, idx) => {
          const config = getStatusConfig(pod.phase, pod.running);
          
          return (
            <motion.div
              key={pod.pod}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                // Base Layout
                "group relative flex flex-col p-4",
                // Appearance
                "bg-secondary/20 hover:bg-secondary/40",
                "border border-border/50 hover:border-border",
                "rounded-[var(--radius)] transition-all duration-300",
                // Hover Glow Effect
                config.borderClass
              )}
            >
               {/* Hover Spotlight Effect (Simulated) */}
               <div className="absolute inset-0 rounded-[var(--radius)] bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              {/* Row 1: Status Label & Icon */}
              <div className="flex items-center justify-between mb-3">
                <div className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider",
                  config.bgClass,
                  config.colorClass
                )}>
                   {pod.phase}
                </div>
                <div className={cn("transition-transform duration-300 group-hover:scale-110", config.colorClass)}>
                  {config.icon}
                </div>
              </div>

              {/* Row 2: Pod ID */}
              <div className="flex flex-col gap-1 mb-4">
                 <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                   Instance ID
                 </span>
                 <span 
                   className="font-mono text-sm text-foreground/90 truncate w-full select-all" 
                   title={pod.pod}
                 >
                   {pod.pod}
                 </span>
              </div>

              {/* Row 3: Footer Metrics */}
              <div className="mt-auto pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                  <Cpu className="h-3 w-3" />
                  <span>Node-01</span>
                </div>
                
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="text-muted-foreground">Restarts:</span>
                  <span className={cn(
                    "flex items-center gap-1", 
                    pod.restarts > 0 ? "text-warning" : "text-foreground"
                  )}>
                    {pod.restarts > 0 && <RefreshCw className="h-3 w-3 animate-spin-slow" />}
                    {pod.restarts}
                  </span>
                </div>
              </div>

            </motion.div>
          );
        })}
      </div>

      {pods.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed border-border/50 rounded-[var(--radius)] bg-secondary/10">
          <Activity className="h-8 w-8 mb-3 opacity-20" />
          <p className="text-sm font-mono">NO_ACTIVE_PODS_DETECTED</p>
        </div>
      )}
    </div>
  );
}
