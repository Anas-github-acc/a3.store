import { ModernButton } from "@/components/ui/ModernButton";
import { ModernInput } from "@/components/ui/ModernInput";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { getKey, KeyValueResult, putKey } from "@/api";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowUp, CheckCircle2, Key, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Actions() {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [result, setResult] = useState<KeyValueResult | null>(null);
  const [searchedKey, setSearchedKey] = useState<string>("");
  const [isPutLoading, setIsPutLoading] = useState(false);
  const [isGetLoading, setIsGetLoading] = useState(false);

  const handlePut = async () => {
    if (!key.trim()) {
      toast.error("Please enter a key");
      return;
    }
    if (!value.trim()) {
      toast.error("Please enter a value");
      return;
    }

    setIsPutLoading(true);
    try {
      await putKey(key, value);
      toast.success(`Key "${key}" stored successfully`);
      setResult(null);
    } catch (error) {
      toast.error("Failed to store key");
    } finally {
      setIsPutLoading(false);
    }
  };

  const handleGet = async () => {
    if (!key.trim()) {
      toast.error("Please enter a key to retrieve");
      return;
    }

    setIsGetLoading(true);
    try {
      const res = await getKey(key);
      setResult(res);
      setSearchedKey(key);
      if (!res.found) {
        toast.error(`Key "${key}" not found`);
      }
    } catch (error) {
      toast.error("Failed to retrieve key");
    } finally {
      setIsGetLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-foreground">KV Actions</h1>
        <p className="mt-1 text-muted-foreground">Store and retrieve key-value pairs</p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <SpotlightCard>
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Key className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Key-Value Operations</h2>
              </div>

              <div className="space-y-4">
                <ModernInput
                  label="Key"
                  placeholder="e.g., user:1001"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                />
                <ModernInput
                  label="Value"
                  placeholder="e.g., { 'name': 'Alice' }"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <ModernButton
                  variant="primary"
                  className="flex-1"
                  icon={<ArrowUp className="h-4 w-4" />}
                  onClick={handlePut}
                  isLoading={isPutLoading}
                >
                  PUT
                </ModernButton>
                <ModernButton
                  variant="outline"
                  className="flex-1"
                  icon={<ArrowDown className="h-4 w-4" />}
                  onClick={handleGet}
                  isLoading={isGetLoading}
                >
                  GET
                </ModernButton>
              </div>

              {/* API endpoint hint */}
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  API Endpoints:
                </p>
                <div className="mt-2 space-y-1 font-mono text-xs text-foreground">
                  <p><span className="text-primary">PUT</span> /api/kv/:key</p>
                  <p><span className="text-primary">GET</span> /api/kv/:key</p>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </motion.div>

        {/* Result Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <SpotlightCard className="h-full">
            <div className="flex h-full flex-col">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Result</h2>

              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex-1"
                  >
                    {/* Status */}
                    <div className="mb-4 flex items-center gap-2">
                      {result.found ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-success" />
                          <span className="text-sm font-medium text-success">Key Found</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-destructive" />
                          <span className="text-sm font-medium text-destructive">Key Not Found</span>
                        </>
                      )}
                    </div>

                    {/* Key */}
                    <div className="mb-3">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Key
                      </p>
                      <p className="mt-1 font-mono text-sm text-foreground">{searchedKey}</p>
                    </div>

                    {/* Value */}
                    {result.found && result.value && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Value
                        </p>
                        <pre className="mt-1 max-h-60 overflow-auto rounded-lg bg-muted/50 p-3 font-mono text-xs text-foreground scrollbar-thin">
                          {formatValue(result.value)}
                        </pre>
                      </div>
                    )}

                    {/* Modified At & Owner */}
                    {result.modified_at && (
                      <p className="mt-4 text-xs text-muted-foreground">
                        Modified at: {new Date(Number(result.modified_at)).toLocaleString()}
                      </p>
                    )}
                    {result.own_id && (
                      <p className="mt-1 text-xs text-muted-foreground font-mono">
                        Owner: {result.own_id}
                      </p>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-1 items-center justify-center"
                  >
                    <div className="text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <ArrowDown className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Execute a GET operation to see results here
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    </div>
  );
}

function formatValue(value: string): string {
  try {
    const parsed = JSON.parse(value);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return value;
  }
}
