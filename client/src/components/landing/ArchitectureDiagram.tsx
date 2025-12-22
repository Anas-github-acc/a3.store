import { motion } from "framer-motion";

export function ArchitectureDiagram() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative"
    >
      <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-glow-secondary/10 to-primary/10 rounded-2xl blur-2xl opacity-50" />
      <div className="relative rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl overflow-hidden p-8 lg:p-12">
        {/* Architecture SVG Placeholder */}
        <svg viewBox="0 0 1000 500" className="w-full h-auto">
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />
            </pattern>
            <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
              <stop offset="100%" stopColor="hsl(var(--glow-secondary))" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="1000" height="500" fill="url(#grid)" />

          {/* Internet Cloud */}
          <g transform="translate(80, 60)">
            <ellipse cx="60" cy="30" rx="50" ry="25" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeDasharray="4 2" />
            <text x="60" y="35" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12" fontFamily="Inter">Internet</text>
          </g>

          {/* NLB */}
          <g transform="translate(220, 45)">
            <rect x="0" y="0" width="120" height="60" rx="8" fill="hsl(var(--card))" stroke="url(#primaryGrad)" strokeWidth="2" filter="url(#glow)" />
            <text x="60" y="25" textAnchor="middle" fill="hsl(var(--primary))" fontSize="11" fontWeight="600">Network</text>
            <text x="60" y="42" textAnchor="middle" fill="hsl(var(--primary))" fontSize="11" fontWeight="600">Load Balancer</text>
          </g>

          {/* Arrow from Internet to NLB */}
          <path d="M 190 75 L 220 75" stroke="url(#lineGrad)" strokeWidth="2" markerEnd="url(#arrow)" />

          {/* EKS Cluster Box */}
          <g transform="translate(380, 20)">
            <rect x="0" y="0" width="580" height="460" rx="12" fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" strokeDasharray="8 4" />
            <text x="20" y="30" fill="hsl(var(--muted-foreground))" fontSize="14" fontWeight="500">Amazon EKS Cluster</text>
          </g>

          {/* Ingress Controller */}
          <g transform="translate(420, 55)">
            <rect x="0" y="0" width="140" height="50" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1.5" />
            <text x="70" y="30" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="11">Nginx Ingress</text>
          </g>

          {/* Arrow from NLB to Ingress */}
          <path d="M 340 75 L 420 80" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.6" />

          {/* API Pods */}
          <g transform="translate(420, 140)">
            <rect x="0" y="0" width="200" height="80" rx="8" fill="hsl(var(--secondary))" stroke="hsl(var(--border))" strokeWidth="1.5" />
            <text x="100" y="25" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="12" fontWeight="500">API Pods (FastAPI)</text>
            <g transform="translate(20, 40)">
              <rect x="0" y="0" width="45" height="30" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.8" />
              <text x="22" y="20" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="9">Pod</text>
            </g>
            <g transform="translate(75, 40)">
              <rect x="0" y="0" width="45" height="30" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.8" />
              <text x="22" y="20" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="9">Pod</text>
            </g>
            <g transform="translate(130, 40)">
              <rect x="0" y="0" width="45" height="30" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.8" />
              <text x="22" y="20" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="9">Pod</text>
            </g>
          </g>

          {/* Arrow from Ingress to API */}
          <path d="M 490 105 L 520 140" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" opacity="0.5" />

          {/* KV StatefulSet */}
          <g transform="translate(660, 120)">
            <rect x="0" y="0" width="260" height="180" rx="8" fill="hsl(var(--card))" stroke="url(#primaryGrad)" strokeWidth="2" />
            <text x="130" y="25" textAnchor="middle" fill="hsl(var(--primary))" fontSize="12" fontWeight="600">KV StatefulSet (gRPC)</text>
            
            {/* KV Nodes */}
            <g transform="translate(20, 45)">
              <rect x="0" y="0" width="65" height="55" rx="6" fill="hsl(var(--secondary))" stroke="hsl(var(--success))" strokeWidth="1.5" />
              <text x="32" y="20" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10" fontWeight="500">kv-0</text>
              <circle cx="32" cy="38" r="8" fill="hsl(var(--success))" opacity="0.3" />
              <circle cx="32" cy="38" r="4" fill="hsl(var(--success))" />
            </g>
            <g transform="translate(95, 45)">
              <rect x="0" y="0" width="65" height="55" rx="6" fill="hsl(var(--secondary))" stroke="hsl(var(--success))" strokeWidth="1.5" />
              <text x="32" y="20" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10" fontWeight="500">kv-1</text>
              <circle cx="32" cy="38" r="8" fill="hsl(var(--success))" opacity="0.3" />
              <circle cx="32" cy="38" r="4" fill="hsl(var(--success))" />
            </g>
            <g transform="translate(170, 45)">
              <rect x="0" y="0" width="65" height="55" rx="6" fill="hsl(var(--secondary))" stroke="hsl(var(--success))" strokeWidth="1.5" />
              <text x="32" y="20" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10" fontWeight="500">kv-2</text>
              <circle cx="32" cy="38" r="8" fill="hsl(var(--success))" opacity="0.3" />
              <circle cx="32" cy="38" r="4" fill="hsl(var(--success))" />
            </g>

            {/* Gossip lines */}
            <path d="M 52 75 Q 95 60 127 75" stroke="hsl(var(--primary))" strokeWidth="1" strokeDasharray="3 2" fill="none" opacity="0.5" />
            <path d="M 127 75 Q 170 60 202 75" stroke="hsl(var(--primary))" strokeWidth="1" strokeDasharray="3 2" fill="none" opacity="0.5" />
            <path d="M 52 75 Q 127 100 202 75" stroke="hsl(var(--primary))" strokeWidth="1" strokeDasharray="3 2" fill="none" opacity="0.5" />

            {/* PVCs */}
            <g transform="translate(20, 115)">
              <rect x="0" y="0" width="65" height="30" rx="4" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="1" />
              <text x="32" y="19" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="8">PVC</text>
            </g>
            <g transform="translate(95, 115)">
              <rect x="0" y="0" width="65" height="30" rx="4" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="1" />
              <text x="32" y="19" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="8">PVC</text>
            </g>
            <g transform="translate(170, 115)">
              <rect x="0" y="0" width="65" height="30" rx="4" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="1" />
              <text x="32" y="19" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="8">PVC</text>
            </g>

            <text x="130" y="165" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="9">SQLite WAL + Gossip</text>
          </g>

          {/* Arrow from API to KV */}
          <path d="M 620 180 L 660 200" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.6" />
          <text x="635" y="175" fill="hsl(var(--muted-foreground))" fontSize="9">gRPC</text>

          {/* Monitoring Stack */}
          <g transform="translate(420, 340)">
            <rect x="0" y="0" width="260" height="110" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1.5" />
            <text x="130" y="25" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="11" fontWeight="500">Monitoring Stack</text>
            
            <g transform="translate(15, 40)">
              <rect x="0" y="0" width="70" height="35" rx="4" fill="hsl(var(--secondary))" stroke="hsl(var(--warning))" strokeWidth="1" />
              <text x="35" y="22" textAnchor="middle" fill="hsl(var(--warning))" fontSize="9">Prometheus</text>
            </g>
            <g transform="translate(95, 40)">
              <rect x="0" y="0" width="70" height="35" rx="4" fill="hsl(var(--secondary))" stroke="hsl(var(--success))" strokeWidth="1" />
              <text x="35" y="22" textAnchor="middle" fill="hsl(var(--success))" fontSize="9">Grafana</text>
            </g>
            <g transform="translate(175, 40)">
              <rect x="0" y="0" width="70" height="35" rx="4" fill="hsl(var(--secondary))" stroke="hsl(var(--glow-secondary))" strokeWidth="1" />
              <text x="35" y="22" textAnchor="middle" fill="hsl(var(--glow-secondary))" fontSize="9">Loki</text>
            </g>

            <text x="130" y="95" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="9">Metrics • Logs • Traces</text>
          </g>

          {/* Arrow from KV to Monitoring */}
          <path d="M 790 300 L 680 350" stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeDasharray="4 2" opacity="0.5" />

          {/* Legend */}
          <g transform="translate(50, 380)">
            <text x="0" y="0" fill="hsl(var(--muted-foreground))" fontSize="10" fontWeight="500">Legend:</text>
            <circle cx="10" cy="20" r="4" fill="hsl(var(--success))" />
            <text x="20" y="24" fill="hsl(var(--muted-foreground))" fontSize="9">Healthy Node</text>
            <line x1="80" y1="20" x2="100" y2="20" stroke="hsl(var(--primary))" strokeWidth="1" strokeDasharray="3 2" />
            <text x="106" y="24" fill="hsl(var(--muted-foreground))" fontSize="9">Gossip</text>
            <rect x="150" y="12" width="16" height="16" rx="2" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="1" />
            <text x="172" y="24" fill="hsl(var(--muted-foreground))" fontSize="9">PVC Storage</text>
          </g>
        </svg>

        <p className="text-center text-muted-foreground text-sm mt-6">
          Replace this placeholder with your own architecture diagram
        </p>
      </div>
    </motion.div>
  );
}
