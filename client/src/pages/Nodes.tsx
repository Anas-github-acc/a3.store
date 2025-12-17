import { useEffect, useState } from "react";
import { getNodes } from "../api/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Spinner } from "../components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Server, Circle } from "lucide-react";

interface Node {
  node_id: string;
  status: string;
  addr: string;
  port?: number;
  last_seen?: string;
  [key: string]: any;
}

export default function Nodes() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        setLoading(true);
        const data = await getNodes();
        setNodes(Array.isArray(data) ? data : data.nodes || []);
        setError(null);
      } catch (err) {
        setError("Failed to fetch nodes");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNodes();
    const interval = setInterval(fetchNodes, 5000); // Refresh every 5s
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

  const getStatusVariant = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower === "active" || statusLower === "alive" || statusLower === "healthy") {
      return "default";
    }
    if (statusLower === "inactive" || statusLower === "dead" || statusLower === "down") {
      return "destructive";
    }
    return "secondary";
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower === "active" || statusLower === "alive" || statusLower === "healthy") {
      return "text-green-500";
    }
    if (statusLower === "inactive" || statusLower === "dead" || statusLower === "down") {
      return "text-red-500";
    }
    return "text-yellow-500";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cluster Nodes</h1>
          <p className="text-muted-foreground mt-1">
            View all nodes in your distributed cluster
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5 text-muted-foreground" />
          <span className="text-2xl font-bold">{nodes.length}</span>
          <span className="text-sm text-muted-foreground">nodes</span>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Node Status</CardTitle>
          <CardDescription>
            Real-time status of all nodes in the cluster
          </CardDescription>
        </CardHeader>
        <CardContent>
          {nodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No nodes found in the cluster
            </div>
          ) : (
            <div className="rounded-md border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="font-semibold">Node ID</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Address</TableHead>
                    <TableHead className="font-semibold">Port</TableHead>
                    <TableHead className="font-semibold">Last Seen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nodes.map((node, index) => (
                    <TableRow key={node.node_id || index} className="hover:bg-muted/50">
                      <TableCell>
                        <Circle
                          className={`h-3 w-3 fill-current ${getStatusColor(node.status)}`}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {node.node_id}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(node.status)}>
                          {node.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {node.addr}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {node.port || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {node.last_seen || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
