import { motion } from "framer-motion";
import { Github, ArrowRight, Database, Server, Shield, Zap, RefreshCw, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { GlowButton } from "@/components/ui/GlowButton";
import { ArchitectureDiagram } from "@/components/landing/ArchitectureDiagram";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { TechStack } from "@/components/landing/TechStack";
import { HeroGradient } from "@/components/landing/HeroGradient";
import { InfoTabs } from "@/components/landing/InfoTabs";
import { A3Button } from "@/components/ui/a3.button";
// import Image from "next/image";

const features = [
  {
    icon: Database,
    title: "Consistent Hashing",
    description: "Keys are mapped to a logical ring for optimal distribution. Only minimal data migration when nodes join or leave."
  },
  {
    icon: RefreshCw,
    title: "Gossip Protocol",
    description: "Decentralized peer discovery through incremental heartbeats. No central registry or single point of failure."
  },
  {
    icon: Shield,
    title: "Anti-Entropy Repair",
    description: "Automatic divergence detection and reconciliation using Last-Write-Wins strategy for eventual consistency."
  },
  {
    icon: Zap,
    title: "Async Replication",
    description: "Fast local writes with background replication to R-1 successor nodes. Low latency, high availability."
  },
  {
    icon: Server,
    title: "Leaderless Architecture",
    description: "Every node is a fully autonomous participant. No master election, no coordination bottlenecks."
  },
  {
    icon: Globe,
    title: "Kubernetes Native",
    description: "Deployed on EKS with StatefulSets, PVCs, and Prometheus metrics. Built for cloud-native scale."
  }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 backdrop-blur-xl bg-background/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            {/* <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-glow-secondary flex items-center justify-center">
              <Database className="w-4 h-4 text-primary-foreground" />
            </div> */}
            <img src="/a3store-icon.svg" alt="a3.redis Logo" className="w-[1.8rem] h-auto" height={70} width={70} />
            <span className="font-normal text-lg tracking-tight">a3.redis</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <a 
              href="https://github.com/Anas-github-acc/a3.store.git" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <Link to="/dashboard">
              <GlowButton variant="outline" size="sm">
                Dashboard
              </GlowButton>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <HeroGradient />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-[7rem] items-center">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Dynamo-Inspired Architecture
                </span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl lg:text-7xl font-medium tracking-tight leading-[1.1]"
              >
                Decentralized
                <br />
                <span className="gradient-text">Key-Value Store</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-muted-foreground max-w-lg leading-relaxed"
              >
                A distributed database built for fault tolerance, high availability, and horizontal scalability. 
                No single point of failure. Built on proven principles from DynamoDB, Cassandra, and Riak.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-4"
              >
                <Link to="/dashboard">
                  <GlowButton size="lg" className="gap-2 group">
                    Open Dashboard
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </GlowButton>
                </Link>
                <A3Button>Open Dashboard</A3Button>
                <a href="https://github.com/Anas-github-acc/a3.store.git" target="_blank" rel="noopener noreferrer">
                  <GlowButton size="lg" variant="outline" className="gap-2">
                    <Github className="w-4 h-4" />
                    View on GitHub
                  </GlowButton>
                </a>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-8 pt-4 text-sm text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  Eventual Consistency
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  R-Factor Replication
                </div>
              </motion.div>
            </div>
            
            {/* Terminal Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-glow-secondary/20 rounded-2xl blur-2xl" />
                <div className="relative rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl overflow-hidden shadow-2xl">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-secondary/30">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-destructive/70" />
                      <div className="w-3 h-3 rounded-full bg-warning/70" />
                      <div className="w-3 h-3 rounded-full bg-success/70" />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono ml-2">a3.redis cluster</span>
                  </div>
                  <div className="p-6 font-mono text-sm space-y-3">
                    <div className="flex gap-2">
                      <span className="text-success">$</span>
                      <span className="text-foreground">PUT user:1001 {"{"}"name": "Alice"{"}"}</span>
                    </div>
                    <div className="text-muted-foreground pl-4">
                      → Replicated to nodes: kv-0, kv-1, kv-2
                    </div>
                    <div className="flex gap-2 pt-2">
                      <span className="text-success">$</span>
                      <span className="text-foreground">GET user:1001</span>
                    </div>
                    <div className="text-primary pl-4">
                      {"{"}"name": "Alice", "timestamp": 1734626000{"}"}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <span className="text-success">$</span>
                      <span className="text-foreground">CLUSTER HEALTH</span>
                    </div>
                    <div className="text-success pl-4">
                      ✓ 3 nodes healthy | RF: 3 | Gossip: converged
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary font-medium text-sm tracking-wider uppercase">Core Mechanics</span>
            <h2 className="text-4xl lg:text-5xl font-bold mt-4 mb-6">
              Built on Proven <span className="gradient-text">Distributed Algorithms</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every component designed to withstand partial failures, network partitions, and high write throughput.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="relative py-32 border-t border-border/30 bg-gradient-to-b from-transparent to-secondary/20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary font-medium text-sm tracking-wider uppercase">System Design</span>
            <h2 className="text-4xl lg:text-5xl font-bold mt-4 mb-6">
              Cloud-Native <span className="gradient-text">Architecture</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Deployed on Amazon EKS with private subnets, NLB ingress, and comprehensive observability.
            </p>
          </motion.div>
          
          <ArchitectureDiagram />
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="relative py-32 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary font-medium text-sm tracking-wider uppercase">Technology Foundation</span>
            <h2 className="text-4xl lg:text-5xl font-bold mt-4 mb-6">
              Powered by <span className="gradient-text">Modern Stack</span>
            </h2>
          </motion.div>
          
          <TechStack />
        </div>
      </section>

      {/* Info Tabs Section */}
      <section className="relative py-32 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary font-medium text-sm tracking-wider uppercase">Learn More</span>
            <h2 className="text-4xl lg:text-5xl font-bold mt-4 mb-6">
              Explore the <span className="gradient-text">Project & Developer</span>
            </h2>
          </motion.div>
          
          <InfoTabs />
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 border-t border-border/30">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl lg:text-5xl font-semibold">
              Ready to explore the <span className="gradient-text">distributed system</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Check out the live dashboard to monitor cluster health, node status, and perform key-value operations.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link to="/dashboard">
                <GlowButton size="xl" className="gap-2 group">
                  Open Dashboard
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </GlowButton>
              </Link>
              <a href="https://github.com/Anas-github-acc/a3.store.git" target="_blank" rel="noopener noreferrer">
                <GlowButton size="xl" variant="outline" className="gap-2">
                  <Github className="w-5 h-5" />
                  Star on GitHub
                </GlowButton>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              {/* <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-glow-secondary flex items-center justify-center">
              </div> */}
              <img src="/a3store-text-icon.svg" alt="a3.redis Logo" className="absolute w-[7rem] h-auto" height={70} width={70} />
              {/* <span className="font-semibold">a3.redis</span> */}
            </div>
            <p className="text-sm text-muted-foreground">
            &nbsp; Crafted by <span className="font-semibold text-foreground">Anas</span>, and open for contributor.
            </p>
            <a 
              href="https://github.com/Anas-github-acc/a3.store.git" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
