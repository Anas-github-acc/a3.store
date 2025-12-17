import { useEffect, useState } from "react";
import { getHealth } from "../api/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Spinner } from "../components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Activity, Server, Users, Database } from "lucide-react";

interface HealthData {
  status?: string;
  nodes?: number;
  active_nodes?: number;
  total_keys?: number;
  cluster_id?: string;
  [key: string]: any;
}

export default function Dashboard() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setLoading(true);
        const data = await getHealth();
        setHealth(data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch cluster health");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isHealthy = health?.status === "healthy" || health?.status === "ok";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cluster Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time monitoring of your distributed KV cluster
          </p>
        </div>
        <Badge
          variant={isHealthy ? "default" : "destructive"}
          className="text-sm px-3 py-1"
        >
          {health?.status?.toUpperCase() || "UNKNOWN"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cluster Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isHealthy ? "Healthy" : "Degraded"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              System operational status
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nodes</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health?.nodes || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered in cluster
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Nodes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {health?.active_nodes || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently responding
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {health?.total_keys || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Stored across cluster
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Cluster Details</CardTitle>
          <CardDescription>
            Raw health data from the cluster API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted/50 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(health, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
