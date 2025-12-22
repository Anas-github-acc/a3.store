import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const glowButtonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:brightness-110",
        outline: "bg-transparent text-foreground hover:bg-secondary/50",
        ghost: "bg-transparent text-foreground hover:bg-secondary/50",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface GlowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glowButtonVariants> {
  asChild?: boolean;
  glowColor?: string;
}

const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ className, variant, size, asChild = false, glowColor, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const isOutline = variant === "outline" || variant === "ghost";

    return (
      <div className="relative group">
        {/* Animated border glow */}
        <div className="absolute -inset-[1px] rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-0"
            style={{
              background: isOutline
                ? `conic-gradient(from 0deg, transparent, hsl(var(--primary)), hsl(var(--glow-secondary)), transparent)`
                : "transparent",
            }}
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          {/* Static border fallback */}
          <div 
            className={cn(
              "absolute inset-0 rounded-full",
              isOutline ? "border border-border/50" : ""
            )} 
          />
        </div>

        {/* Inner background to mask the rotating gradient */}
        <div className={cn(
          "absolute inset-[1px] rounded-full",
          isOutline ? "bg-background" : "bg-transparent"
        )} />

        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: "linear-gradient(90deg, transparent, hsl(var(--foreground) / 0.1), transparent)",
            }}
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        {/* Outer glow on hover */}
        <div className={cn(
          "absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md",
          variant === "default" ? "bg-primary/30" : "bg-primary/20"
        )} />

        <Comp
          className={cn(glowButtonVariants({ variant, size, className }), "relative z-10")}
          ref={ref}
          {...props}
        >
          {children}
        </Comp>
      </div>
    );
  }
);
GlowButton.displayName = "GlowButton";

export { GlowButton, glowButtonVariants };
