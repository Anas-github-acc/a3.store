import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatusBadgeProps {
  status: "online" | "offline" | "syncing" | "error" | "warning";
  label?: string;
  className?: string;
}

const statusConfig = {
  online: {
    color: "bg-success",
    textColor: "text-success",
    label: "Online",
  },
  offline: {
    color: "bg-muted-foreground",
    textColor: "text-muted-foreground",
    label: "Offline",
  },
  syncing: {
    color: "bg-warning",
    textColor: "text-warning",
    label: "Syncing",
  },
  error: {
    color: "bg-destructive",
    textColor: "text-destructive",
    label: "Error",
  },
  warning: {
    color: "bg-warning",
    textColor: "text-warning",
    label: "Warning",
  },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="relative flex h-2.5 w-2.5">
        {status === "online" && (
          <motion.span
            className={cn("absolute inline-flex h-full w-full rounded-full opacity-75", config.color)}
            animate={{ scale: [1, 1.5, 1], opacity: [0.75, 0, 0.75] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", config.color)} />
      </span>
      <span className={cn("text-sm font-medium", config.textColor)}>
        {label || config.label}
      </span>
    </div>
  );
}
