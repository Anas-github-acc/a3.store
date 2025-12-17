## Docker Build
```bash
docker build -t kv-node:latest .
```


## Create the Docker network once
```bash
docker network create knvet
```
This allows node1, node2... to talk to each other using DNS.

## Run Nodes
run nodes like Node 1, Node 2... with their coresponsing peers

```bash
docker run -d --name node2 --network kvnet \
  -p 50052:50051 \
  -p 8002:8001 \
  -e NODE_NUM=2 \
  -e GRPC_PORT=50051 \
  -e GOSSIP_PORT=8002 \
  -e PEERS="node1:50051,node3:50051" \
  -e GOSSIP_PEERS="node1:8001,node3:8003" \
  -e REPLICATION_FACTOR=2 \
  -e DATA_DIR=/app/data/node2 \
  -v kv2:/app/data \
  kv-node
```

## View Logs

```bash
docker logs -f node1
```

## How to remove all nodes and their volumne

```bash
docker rm -f node1 node2 node3
docker volume rm kv1 kv2 kv3
```