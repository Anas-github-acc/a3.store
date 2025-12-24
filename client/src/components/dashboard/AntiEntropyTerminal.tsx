import { AntiEntropyEvent } from "@/api";
import { motion } from "framer-motion";
import { Terminal } from "lucide-react";

interface AntiEntropyTerminalProps {
  events: AntiEntropyEvent[];
  isLoading?: boolean;
}

export function AntiEntropyTerminal({ events, isLoading }: AntiEntropyTerminalProps) {
  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getNodeShort = (node: string) => {
    const match = node.match(/kv-(\d+)/);
    return match ? `kv-${match[1]}` : node.split(".")[0];
  };

  const getEventColor = (event: string) => {
    switch (event) {
      case "sync_start":
        return "text-cyan-400";
      case "sync_complete":
        return "text-emerald-400";
      case "repair":
        return "text-amber-400";
      case "error":
        return "text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  const sortedEvents = [...events].sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);

  return (
    <div className="rounded-xl border border-border/50 bg-background/80 backdrop-blur-sm flex flex-col justify-between">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-4 py-2">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <div className="flex items-center gap-2 ml-2">
          <Terminal className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Anti-Entropy Events</span>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="h-full overflow-y-auto p-4 font-mono text-xs scrollbar-thin">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <motion.div
              className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : events.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No anti-entropy events recorded
          </div>
        ) : (
          <div className="space-y-1">
            {sortedEvents.map((event, idx) => (
              <motion.div
                key={`${event.timestamp}-${event.node}-${event.event}-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                className="flex items-start gap-2 leading-relaxed"
              >
                <span className="text-muted-foreground/60">[{formatTimestamp(event.timestamp)}]</span>
                <span className="text-purple-400">{getNodeShort(event.node)}</span>
                <span className={getEventColor(event.event)}>{event.event}</span>
                {event.keys > 0 && (
                  <span className="text-muted-foreground">
                    keys: <span className="text-amber-300">{event.keys}</span>
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Terminal Footer */}
      <div className="border-t border-border/50 bg-muted/20 px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Showing {Math.min(sortedEvents.length, 20)} of {events.length} events
        </span>
        <span className="text-xs text-primary/80">● Live</span>
      </div>
    </div>
  );
}
