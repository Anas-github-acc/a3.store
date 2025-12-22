import { motion } from "framer-motion";

const technologies = [
  { name: "Python 3.10", category: "Runtime", color: "hsl(var(--primary))" },
  { name: "gRPC / Protobuf", category: "RPC", color: "hsl(var(--glow-secondary))" },
  { name: "FastAPI", category: "HTTP", color: "hsl(var(--success))" },
  { name: "SQLite WAL", category: "Storage", color: "hsl(var(--warning))" },
  { name: "Kubernetes", category: "Orchestration", color: "hsl(var(--primary))" },
  { name: "Amazon EKS", category: "Cloud", color: "hsl(var(--warning))" },
  { name: "Prometheus", category: "Metrics", color: "hsl(var(--destructive))" },
  { name: "Grafana", category: "Visualization", color: "hsl(var(--success))" },
];

export function TechStack() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {technologies.map((tech, index) => (
        <motion.div
          key={tech.name}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.05 }}
          className="group relative"
        >
          <div className="relative p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all text-center">
            <div 
              className="w-3 h-3 rounded-full mx-auto mb-3"
              style={{ backgroundColor: tech.color }}
            />
            <h3 className="font-semibold text-sm mb-1">{tech.name}</h3>
            <p className="text-xs text-muted-foreground">{tech.category}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
