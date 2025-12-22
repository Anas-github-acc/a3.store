import { ModernButton } from "@/components/ui/ModernButton";
import { motion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
        >
          <span className="text-4xl font-bold text-muted-foreground">404</span>
        </motion.div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">Page Not Found</h1>
        <p className="mb-6 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex justify-center gap-3">
          <ModernButton
            variant="outline"
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </ModernButton>
          <ModernButton
            variant="primary"
            icon={<Home className="h-4 w-4" />}
            onClick={() => navigate("/")}
          >
            Dashboard
          </ModernButton>
        </div>
      </motion.div>
    </div>
  );
}
