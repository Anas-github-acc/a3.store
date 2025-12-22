import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GlowingBorderProps {
  children: React.ReactNode;
  className?: string;
  borderClassName?: string;
}

export function GlowingBorder({ children, className, borderClassName }: GlowingBorderProps) {
  return (
    <div className={cn("relative rounded-lg p-[1px]", className)}>
      {/* Animated gradient border */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-lg bg-gradient-to-r from-primary/50 via-glow-secondary/50 to-primary/50 opacity-50",
          borderClassName
        )}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          backgroundSize: "200% 100%",
        }}
      />
      
      {/* Inner content with background */}
      <div className="relative rounded-lg bg-card">
        {children}
      </div>
    </div>
  );
}
