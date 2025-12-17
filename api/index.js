import express from "express";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const app = express();
app.use(express.json());

const KV_TARGET =
  process.env.KV_GRPC_TARGET ||
  "kv-headless.kv.svc.cluster.local:50051";

const GOSSIP_HTTP =
  process.env.GOSSIP_HTTP ||
  "http://kv-headless.kv.svc.cluster.local:8001";

const PROMETHEUS_URL =
  process.env.PROMETHEUS_URL ||
  "http://prometheus-kube-prometheus-prometheus.monitoring.svc.cluster.local:9090";

// const LOKI_URL = process.env.LOKI_URL ||
//   "http://loki.monitoring.svc.cluster.local:3100";

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
// PUT
app.post("/api/kv/:key", (req, res) => {
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
});

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


/* ------------------ METRICS ------------------ */
// Prometheus summary
app.get("/api/metrics/summary", async (_, res) => {
  try {
    const q = `sum(kv_grpc_requests_total)`;
    const r = await axios.get(`${PROMETHEUS_URL}/api/v1/query`, {
      params: { query: q }
    });

    res.json({
      grpc_requests_total: r.data.data.result[0]?.value?.[1] || 0
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

/* ------------------ ANTI-ENTROPY ------------------ */

// Placeholder (log-backed later)
app.get("/api/anti-entropy/events", (_, res) => {
  res.json([
    {
      event: "ANTI_ENTROPY_REPAIR",
      node: "node-1",
      chunk: 4,
      keys: 8,
      timestamp: Date.now() - 60000
    }
  ]);
});
// app.get("/api/anti-entropy/events", async (_, res) => {
//   try {
//     const query = '{component="anti-entropy"}';
//     const r = await axios.get(`${LOKI_URL}/loki/api/v1/query_range`, {
//       params: {
//         query,
//         limit: 20,
//         direction: "BACKWARD"
//       }
//     });

//     const events = r.data.data.result.flatMap(stream =>
//       stream.values.map(([ts, line]) => JSON.parse(line))
//     );

//     res.json(events);
//   } catch (e) {
//     res.status(500).json({ error: "Failed to fetch anti-entropy events" });
//   }
// });



app.get("/healthz", (_, res) => {
  res.json({ status: "ok" });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`API listening on ${PORT}`);
});
