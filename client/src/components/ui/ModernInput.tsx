import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { forwardRef, InputHTMLAttributes, useState } from "react";

interface ModernInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

export const ModernInput = forwardRef<HTMLInputElement, ModernInputProps>(
  ({ className, label, icon, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="relative">
        {label && (
          <label className="mb-2 block text-sm font-medium text-muted-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full rounded-lg border border-border/50 bg-input px-4 py-3 text-foreground transition-all",
              "placeholder:text-muted-foreground/50",
              "focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
              "hover:border-border",
              icon && "pl-10",
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          {/* Focus glow effect */}
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-lg"
            initial={false}
            animate={{
              boxShadow: isFocused
                ? "0 0 0 2px hsl(var(--primary) / 0.1), 0 0 20px hsl(var(--primary) / 0.1)"
                : "0 0 0 0px transparent",
            }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>
    );
  }
);

ModernInput.displayName = "ModernInput";
