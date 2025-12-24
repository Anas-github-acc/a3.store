import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Activity, Database, Home, Key, Menu, Server, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const navItems = [
  { path: "/dashboard", icon: Activity, label: "Dashboard" },
  { path: "/nodes", icon: Server, label: "Nodes" },
  { path: "/actions", icon: Key, label: "KV Actions" },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      <motion.div
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden",
          !isCollapsed ? "hidden" : "block"
        )}
        initial={false}
        animate={{ opacity: isCollapsed ? 1 : 0 }}
        onClick={() => setIsCollapsed(false)}
      />

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border/50 bg-card/50 backdrop-blur-xl",
          "lg:relative lg:translate-x-0",
          isCollapsed ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        initial={false}
        animate={{ width: 256 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/a3store-icon.svg" alt="a3.redis Logo" className="w-[2.2rem] h-auto" height={70} width={70} />
            <div>
              <h1 className="text-base font-semibold text-foreground">a3.redis</h1>
              <p className="text-xs text-muted-foreground">Distributed KV</p>
            </div>
          </Link>
          <button
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            onClick={() => setIsCollapsed(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    className="absolute left-0 inset-y-0 my-auto h-8 w-1 rounded-r-full bg-primary"
                    layoutId="activeIndicator"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border/50 p-3">
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span className="text-xs font-medium text-muted-foreground">System Healthy</span>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Mobile menu button */}
      <button
        className="fixed left-4 top-4 z-30 rounded-lg border border-border/50 bg-card/90 p-2 text-foreground backdrop-blur-sm lg:hidden"
        onClick={() => setIsCollapsed(true)}
      >
        <Menu className="h-5 w-5" />
      </button>
    </>
  );
}
