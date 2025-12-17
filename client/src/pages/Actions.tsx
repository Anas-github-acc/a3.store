import { useState } from "react";
import { putKey, getKey } from "../api/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Key, Database, CheckCircle2, XCircle } from "lucide-react";

interface OperationResult {
  success: boolean;
  operation: "PUT" | "GET";
  data?: any;
  error?: string;
  timestamp: string;
}

export default function Actions() {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [result, setResult] = useState<OperationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePut = async () => {
    if (!key.trim()) {
      setResult({
        success: false,
        operation: "PUT",
        error: "Key cannot be empty",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    try {
      setLoading(true);
      await putKey(key, value);
      setResult({
        success: true,
        operation: "PUT",
        data: { key, value },
        timestamp: new Date().toISOString(),
      });
      setValue(""); // Clear value after successful PUT
    } catch (err: any) {
      setResult({
        success: false,
        operation: "PUT",
        error: err.message || "Failed to store key-value pair",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGet = async () => {
    if (!key.trim()) {
      setResult({
        success: false,
        operation: "GET",
        error: "Key cannot be empty",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    try {
      setLoading(true);
      const res = await getKey(key);
      setResult({
        success: true,
        operation: "GET",
        data: res,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      setResult({
        success: false,
        operation: "GET",
        error: err.message || "Failed to retrieve value",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">KV Operations</h1>
        <p className="text-muted-foreground mt-1">
          Perform PUT and GET operations on the distributed key-value store
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Operations
            </CardTitle>
            <CardDescription>
              Store and retrieve data from the cluster
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="put" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="put">PUT</TabsTrigger>
                <TabsTrigger value="get">GET</TabsTrigger>
              </TabsList>
              
              <TabsContent value="put" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="put-key" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Key
                  </Label>
                  <Input
                    id="put-key"
                    placeholder="Enter key name"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.ctrlKey) {
                        handlePut();
                      }
                    }}
                    className="font-mono"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="put-value">Value</Label>
                  <Input
                    id="put-value"
                    placeholder="Enter value to store"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.ctrlKey) {
                        handlePut();
                      }
                    }}
                    className="font-mono"
                  />
                </div>

                <Button
                  onClick={handlePut}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? "Storing..." : "Store Key-Value Pair"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Press Ctrl+Enter to submit
                </p>
              </TabsContent>

              <TabsContent value="get" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="get-key" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Key
                  </Label>
                  <Input
                    id="get-key"
                    placeholder="Enter key to retrieve"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleGet();
                      }
                    }}
                    className="font-mono"
                  />
                </div>

                <Button
                  onClick={handleGet}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                  variant="secondary"
                >
                  {loading ? "Retrieving..." : "Retrieve Value"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Press Enter to submit
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Result</CardTitle>
            <CardDescription>
              Response from the cluster
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-semibold">
                      {result.operation} Operation
                    </span>
                  </div>
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? "Success" : "Failed"}
                  </Badge>
                </div>

                <Separator />

                {result.success ? (
                  <div className="space-y-3">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <pre className="text-sm overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Completed at {new Date(result.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{result.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No operations performed yet</p>
                <p className="text-sm mt-1">
                  Execute a PUT or GET operation to see results
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Operation History</CardTitle>
            <CardDescription>
              Latest operation details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Operation:</span>
                <span className="font-mono">{result.operation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className={result.success ? "text-green-500" : "text-red-500"}>
                  {result.success ? "Success" : "Failed"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Timestamp:</span>
                <span className="font-mono text-xs">
                  {new Date(result.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
