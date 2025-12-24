import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  ExternalLink,
  User,
  Info,
  MessageSquare
} from "lucide-react";
import { GlowButton } from "@/components/ui/GlowButton";

const socialLinks = [
  {
    icon: Github,
    label: "GitHub",
    href: "https://github.com/Anas-github-acc",
    username: "@Anas-github-acc"
  },
  {
    icon: Twitter,
    label: "X (Twitter)",
    href: "https://x.com/anas_stz",
    username: "@anas_stz"
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/anas-um/",
    username: "anas-um"
  },
  {
    icon: Globe,
    label: "Portfolio",
    href: "https://theanas.vercel.app/",
    username: "theanas.vercel.app"
  }
];

export function InfoTabs() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="w-full"
    >
      <Tabs defaultValue="about" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="bg-secondary/50 border border-border/50 backdrop-blur-xl p-1.5 rounded-xl">
            <TabsTrigger 
              value="about"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-6 py-2.5 text-sm font-medium transition-all gap-2"
            >
              <Info className="w-4 h-4" />
              About Project
            </TabsTrigger>
            <TabsTrigger 
              value="developer"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-6 py-2.5 text-sm font-medium transition-all gap-2"
            >
              <User className="w-4 h-4" />
              Developer
            </TabsTrigger>
            <TabsTrigger 
              value="contact"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-6 py-2.5 text-sm font-medium transition-all gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Contact
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="about" className="mt-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-8"
          >
            <div className="space-y-6 p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl">
              <h3 className="text-2xl font-bold">What is a3.redis?</h3>
              <p className="text-muted-foreground leading-relaxed">
                a3.redis is a distributed, Dynamo-inspired key-value database designed around real-world 
                fault tolerance and availability guarantees. The system eliminates centralized coordination 
                and distributes responsibility across equal peer nodes.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Every component is built to withstand partial failures, network partitions, and high write 
                throughput, using principles proven in large-scale systems such as DynamoDB, Cassandra, and Riak.
              </p>
            </div>
            
            <div className="space-y-6 p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl">
              <h3 className="text-2xl font-bold">System Goals</h3>
              <ul className="space-y-4">
                {[
                  "High availability by eliminating single failure points",
                  "Horizontal scalability through node addition and removal",
                  "Eventual consistency and durability",
                  "Lightweight deployment and local persistence",
                  "Fast client writes with asynchronous replication"
                ].map((goal, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{goal}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2 p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl">
              <h3 className="text-2xl font-bold mb-6">Core Architecture</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: "RPC Server Pool", desc: "Handles Get/Put operations and replication" },
                  { title: "Gossip Membership", desc: "Decentralized peer discovery protocol" },
                  { title: "Anti-Entropy Daemon", desc: "Identifies and repairs divergent state" },
                  { title: "Consistent Hashing", desc: "Key ownership and load distribution" },
                  { title: "Persistent Storage", desc: "Thread-local SQLite WAL backend" },
                  { title: "Kubernetes Native", desc: "EKS deployment with StatefulSets" }
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-secondary/30 border border-border/30">
                    <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="developer" className="mt-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl">
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-glow-secondary rounded-full blur opacity-50" />
                  <img 
                    src="https://avatars.githubusercontent.com/u/144697531?v=4" 
                    alt="Anas"
                    className="relative w-32 h-32 rounded-full border-2 border-border object-cover"
                  />
                </div>
                
                <div className="flex-1 text-center md:text-left space-y-4">
                  <div>
                    <h3 className="text-3xl font-bold">Anas</h3>
                    <p className="text-primary font-medium">Full Stack Developer</p>
                    <p className="text-muted-foreground mt-2">21 year old developer passionate about distributed systems, cloud architecture, and building scalable applications.</p>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {["Python", "TypeScript", "Kubernetes", "gRPC", "React", "AWS"].map((skill) => (
                      <span 
                        key={skill}
                        className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-border/50">
                <h4 className="text-lg font-semibold mb-4">Connect with me</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/30 hover:border-primary/50 hover:bg-secondary/50 transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <link.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{link.label}</p>
                        <p className="text-xs text-muted-foreground">{link.username}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="contact" className="mt-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Get in Touch</h3>
                <p className="text-muted-foreground">Have questions about a3.redis or want to collaborate? Reach out!</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <a 
                  href="mailto:anas.contact@example.com" 
                  className="group flex items-center gap-4 p-6 rounded-xl bg-secondary/30 border border-border/30 hover:border-primary/50 hover:bg-secondary/50 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-glow-secondary flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">Send a message</p>
                  </div>
                </a>

                <a 
                  href="https://x.com/anas_stz" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 p-6 rounded-xl bg-secondary/30 border border-border/30 hover:border-primary/50 hover:bg-secondary/50 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-glow-secondary flex items-center justify-center">
                    <Twitter className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">Twitter / X</p>
                    <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">@anas_stz</p>
                  </div>
                </a>

                <a 
                  href="https://www.linkedin.com/in/anas-um/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 p-6 rounded-xl bg-secondary/30 border border-border/30 hover:border-primary/50 hover:bg-secondary/50 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-glow-secondary flex items-center justify-center">
                    <Linkedin className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">LinkedIn</p>
                    <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">Connect professionally</p>
                  </div>
                </a>

                <a 
                  href="https://github.com/Anas-github-acc" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 p-6 rounded-xl bg-secondary/30 border border-border/30 hover:border-primary/50 hover:bg-secondary/50 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-glow-secondary flex items-center justify-center">
                    <Github className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">GitHub</p>
                    <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">Check out my projects</p>
                  </div>
                </a>
              </div>

              <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 text-center">
                <MapPin className="w-6 h-6 text-primary mx-auto mb-3" />
                <p className="font-medium mb-1">Open to Opportunities</p>
                <p className="text-sm text-muted-foreground">Interested in distributed systems, cloud infrastructure, and backend development roles.</p>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <a href="https://github.com/Anas-github-acc" target="_blank" rel="noopener noreferrer">
                  <GlowButton size="lg" className="gap-2">
                    <Github className="w-4 h-4" />
                    View GitHub Profile
                  </GlowButton>
                </a>
                <a href="https://www.linkedin.com/in/anas-um/" target="_blank" rel="noopener noreferrer">
                  <GlowButton size="lg" variant="outline" className="gap-2">
                    <Linkedin className="w-4 h-4" />
                    Connect on LinkedIn
                  </GlowButton>
                </a>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}