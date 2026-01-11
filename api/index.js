import express from "express";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import axios from "axios";

const app = express();
app.use(express.json());

// CORS middleware: allow Vite dev origin or configurable origin via env
app.use((req, res, next) => {
  const allowed = process.env.CORS_ALLOWED_ORIGIN || '*';
  res.header('Access-Control-Allow-Origin', allowed);
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const KV_TARGET =
  process.env.KV_GRPC_TARGET ||
  "kv-headless.kv.svc.cluster.local:50051";

const GOSSIP_HTTP =
  process.env.GOSSIP_HTTP ||
  "http://kv-headless.kv.svc.cluster.local:8001";

const PROMETHEUS_URL =
  process.env.PROMETHEUS_URL ||
  "http://monitoring-kube-prometheus-prometheus.monitoring.svc.cluster.local:9090";

const LOKI_URL = process.env.LOKI_URL ||
  "http://loki.monitoring.svc.cluster.local:3100";

// ----- GRPC Client Setup -----
const packageDef = protoLoader.loadSync("./proto/kv.proto", {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const kvProto = grpc.loadPackageDefinition(packageDef).kv;

const kvClient = new kvProto.KeyValue(
  KV_TARGET,
  grpc.credentials.createInsecure(),
  {
    "grpc.lb_policy_name": "round_robin"
  }
);


/* ------------------- KV Routes ------------------- */
// KV store: support PUT (idempotent) and keep POST as alias for compatibility
function handlePutKey(req, res) {
  const { key } = req.params;
  const { value } = req.body;

  if (typeof value !== "string") {
    return res.status(400).json({ error: "value must be string" });
  }

  kvClient.Put(
    { key, value, modified_at: Date.now() },
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ status: "ok" });
    }
  );
}

app.put("/api/kv/:key", handlePutKey);
app.post("/api/kv/:key", handlePutKey); // keep POST working for older callers

// GET
app.get("/api/kv/:key", (req, res) => {
  const { key } = req.params;

  kvClient.Get({ key }, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(response);
  });
});

/* ------------------ CLUSTER ROUTES ------------------ */
// Nodes (from gossip)
app.get("/api/cluster/nodes", async (_, res) => {
  try {
    const r = await axios.get(`${GOSSIP_HTTP}/membership`);
    const nodes = Object.entries(r.data).map(([nodeId, info]) => ({
      node_id: nodeId,
      addr: info.addr,
      heartbeat: info.hb,
      status: "UP"
    }));
    res.json(nodes);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch cluster nodes" });
  }
});

// Cluster health (aggregated)
app.get("/api/cluster/health", async (_, res) => {
  try {
    const r = await axios.get(`${GOSSIP_HTTP}/membership`);
    const nodeCount = Object.keys(r.data).length;

    res.json({
      status: nodeCount > 0 ? "HEALTHY" : "DEGRADED",
      nodes: nodeCount,
      replication_factor: Number(process.env.REPLICATION_FACTOR || 2),
      timestamp: Date.now()
    });
  } catch {
    res.status(500).json({ status: "UNKNOWN" });
  }
});

app.get("/api/cluster/pod-lifecycle", async (_, res) => {
  try {
    const queries = {
      restarts: `kube_pod_container_status_restarts_total{namespace="kv"}`,
      running: `kube_pod_container_status_running{namespace="kv"}`,
      phases: `kube_pod_status_phase{namespace="kv"}`
    };

    // helper function
    const execQuery = async (query) => {
      const r = await axios.get(`${PROMETHEUS_URL}/api/v1/query`, {
        params: { query }
      });
      return r.data.data.result;
    };

    const restarts = await execQuery(queries.restarts);
    const running = await execQuery(queries.running);
    const phases = await execQuery(queries.phases);

    const pods = {};

    // parse restart count
    restarts.forEach(({ metric, value }) => {
      const pod = metric.pod;
      pods[pod] = pods[pod] || {};
      pods[pod].restarts = Number(value[1]);
    });

    // parse running state
    running.forEach(({ metric, value }) => {
      const pod = metric.pod;
      pods[pod] = pods[pod] || {};
      pods[pod].running = value[1] === "1";
    });

    // parse pod phases
    phases.forEach(({ metric, value }) => {
      if (value[1] === "1") {
        const pod = metric.pod;
        pods[pod] = pods[pod] || {};
        pods[pod].phase = metric.phase;   // "Running", "Pending", etc
      }
    });

    // build output array
    const result = Object.entries(pods).map(([pod, state]) => ({
      pod,
      running: state.running || false,
      restarts: state.restarts || 0,
      phase: state.phase || "Unknown"
    }));

    res.json(result);

  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch pod lifecycle data",
      details: err.message
    });
  }
});



/* ------------------ METRICS ------------------ */
// Prometheus summary
app.get("/api/metrics/summary", async (_, res) => {
  try {
    const queries = {
      // Node health
      nodes_up: 'sum(kv_node_up)',
      nodes_total: 'count by () (kv_node_up)',
      // HTTP metrics
      http_requests_total: 'sum(kv_http_requests_total)',
      http_get_requests: 'sum(kv_http_requests_total{method="GET"})',
      http_put_requests: 'sum(kv_http_requests_total{method="PUT"})',
      // gRPC metrics
      grpc_requests_total: 'sum(kv_grpc_requests_total)',
      grpc_requests_by_method: 'sum by (method) (kv_grpc_requests_total)',

      grpc_errors_total: 'sum(kv_grpc_errors_total)',
      grpc_errors_by_method: 'sum by (method) (kv_grpc_errors_total)',
      // Correct latency
      grpc_latency_avg:
        'sum(rate(kv_grpc_latency_seconds_sum[15m])) / sum(rate(kv_grpc_latency_seconds_count[15m]))',
      // Replication metrics
      replication_attempts_total: 'sum(kv_replication_attempts_total)',
      replication_failures_total: 'sum(kv_replication_failures_total)',
      // Anti-entropy metrics
      anti_entropy_runs_total: 'sum(kv_anti_entropy_runs_total)',
      anti_entropy_repaired_total: 'sum(kv_anti_entropy_keys_repaired_total)',
    };

    const results = {};

    const entries = await Promise.all(
      Object.entries(queries).map(async ([key, query]) => {
        const r = await axios.get(`${PROMETHEUS_URL}/api/v1/query`, {
          params: { query }
        });
        return [key, r.data.data.result];
      })
    );

    for (const [key, result] of entries) {
      if (result.length === 0) {
        results[key] = key.includes('_by_method') ? {} : 0;
      } else if (key.includes('_by_method')) {
        results[key] = Object.fromEntries(
          result.map(r => [r.metric.method, Number(r.value[1])])
        );
      } else {
        const v = Number(result[0].value[1]);
        results[key] = Number.isFinite(v) ? v : 0;
      }
    }

    res.json(results);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch metrics", details: e.message });
  }
});

/* ------------------ resources usage ------------------ */
app.get("/api/nodes/resources", async (_, res) => {
  const queries = {
    cpu: `
      sum by (pod) (
        rate(container_cpu_usage_seconds_total{
          namespace="kv",
          container!="POD"
        }[2m])
      )
    `,
    memory: `
      sum by (pod) (
        container_memory_usage_bytes{
          namespace="kv",
          container!="POD"
        }
      )
    `
  };

  try {
    const results = {};

    for (const [name, query] of Object.entries(queries)) {
      const r = await axios.get(`${PROMETHEUS_URL}/api/v1/query`, {
        params: { query }
      });

      results[name] = r.data.data.result.map(item => ({
        pod: item.metric.pod,
        value: Number(item.value[1])
      }));
    }

    res.json(results);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ------------------ ANTI-ENTROPY ------------------ */

// app.get("/api/anti-entropy/events", (_, res) => {
//   res.json([
//     {
//       event: "ANTI_ENTROPY_REPAIR",
//       node: "node-1",
//       chunk: 4,
//       keys: 8,
//       timestamp: Date.now() - 60000
//     }
//   ]);
// });

app.get("/api/anti-entropy/events", async (_, res) => {
  try {
    const now = Date.now() * 1e6;
    const fifteenMinAgo = now - 15 * 60 * 1e9;

    const query = '{app="kv-node"} |= "anti-entropy" | json';

    const r = await axios.get(
      `${LOKI_URL}/loki/api/v1/query_range`,
      {
        params: {
          query,
          start: fifteenMinAgo,
          end: now,
          limit: 50,
          direction: "BACKWARD"
        }
      }
    );

    const events = r.data.data.result.flatMap(stream =>
      stream.values.map(([ts, line]) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
    ).filter(Boolean)

    // const events = r.data.data.result.flatMap(stream =>
    //   stream.values.map(([ts, line]) => line)
    // );

    res.json(events);
  } catch (e) {
    res.status(500).json({
      error: "Failed to fetch anti-entropy events",
      details: e.message
    });
  }
});


/* ------------------ HEALTHCHECK ------------------ */

app.get("/healthz", (_, res) => {
  res.json({
      status: "ok",
      a3store_version: "v1.0.0",
      timestamp: Date.now()
  });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`API listening on ${PORT}`);
});
