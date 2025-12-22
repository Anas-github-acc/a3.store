import { motion } from "framer-motion";

export function HeroGradient() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Main gradient orb */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute top-0 right-0 w-[800px] h-[800px]"
      >
        <div className="absolute inset-0 bg-gradient-to-bl from-primary/30 via-primary/10 to-transparent blur-3xl" />
      </motion.div>
      
      {/* Secondary gradient */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="absolute top-1/4 right-1/4 w-[600px] h-[600px]"
      >
        <div className="absolute inset-0 bg-gradient-to-tl from-glow-secondary/20 via-transparent to-transparent blur-3xl" />
      </motion.div>

      {/* Animated streaks */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 0.6, x: 0 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="absolute top-[10%] right-0 w-[600px] h-[2px] bg-gradient-to-l from-primary/60 via-primary/20 to-transparent"
        style={{ transform: 'rotate(-25deg)' }}
      />
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 0.4, x: 0 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="absolute top-[20%] right-0 w-[500px] h-[1px] bg-gradient-to-l from-glow-secondary/50 via-glow-secondary/10 to-transparent"
        style={{ transform: 'rotate(-25deg)' }}
      />
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 0.3, x: 0 }}
        transition={{ duration: 1.5, delay: 0.7 }}
        className="absolute top-[35%] right-0 w-[400px] h-[1px] bg-gradient-to-l from-primary/40 via-primary/10 to-transparent"
        style={{ transform: 'rotate(-25deg)' }}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
