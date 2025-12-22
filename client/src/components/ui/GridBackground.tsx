import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GridBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function GridBackground({ children, className }: GridBackgroundProps) {
  return (
    <div className={cn("relative min-h-screen w-full overflow-hidden bg-background", className)}>
      {/* Animated gradient streak 1 - Orange */}
      <motion.div
        className="absolute inset-0 opacity-40 pointer-events-none"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
        }}
        style={{
          background: `linear-gradient(135deg, transparent 0%, transparent 35%, hsl(25 95% 55% / 0.12) 40%, hsl(25 95% 55% / 0.25) 50%, hsl(25 95% 55% / 0.12) 60%, transparent 65%, transparent 100%)`,
          backgroundSize: "200% 200%",
        }}
      />
      
      {/* Animated gradient streak 2 - Blue accent */}
      <motion.div
        className="absolute inset-0 opacity-30 pointer-events-none"
        animate={{
          backgroundPosition: ["100% 0%", "0% 100%"],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
        }}
        style={{
          background: `linear-gradient(125deg, transparent 0%, transparent 45%, hsl(210 80% 50% / 0.08) 50%, hsl(210 80% 50% / 0.15) 55%, hsl(210 80% 50% / 0.08) 60%, transparent 65%, transparent 100%)`,
          backgroundSize: "200% 200%",
        }}
      />
      
      {/* Animated gradient streak 3 - Deep orange */}
      <motion.div
        className="absolute inset-0 opacity-35 pointer-events-none"
        animate={{
          backgroundPosition: ["50% 0%", "50% 100%"],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
        }}
        style={{
          background: `linear-gradient(145deg, transparent 0%, transparent 55%, hsl(25 95% 45% / 0.1) 60%, hsl(25 95% 45% / 0.2) 65%, hsl(25 95% 45% / 0.1) 70%, transparent 75%, transparent 100%)`,
          backgroundSize: "200% 200%",
        }}
      />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-10" />
      
      {/* Top radial glow */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background: `radial-gradient(ellipse 60% 40% at 70% -10%, hsl(25 95% 55% / 0.15), transparent 70%)`
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}