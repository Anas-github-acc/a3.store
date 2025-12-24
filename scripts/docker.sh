#!/bin/bash
# 
# this is a script to build and run the kv-node docker containers for a 3-node cluster
# 

cd "$(dirname "$0")/../kv-node"

set -e

if [ "$1" = "clean" ]; then
  echo "[*] Cleaning up containers and volumes"
  docker rm -f node1 node2 node3 2>/dev/null || true
  docker volume rm kv1 kv2 kv3 2>/dev/null || true
  echo "[*] Cleanup complete"
  exit 0
fi


if [ "$1" != "clean" ]; then
  if [ "$1" != "nobuild" ]; then
    echo "[*] Cleaning up existing containers"
    docker rm -f node1 node2 node3 2>/dev/null || true

    docker build -t a3store-kv-node:latest .
  fi
docker network create kvnet || true

docker run -d --name node1 --network kvnet \
  -p 50051:50051 \
  -p 8001:8001 \
  -e DEBUG_LOG=true \
  -e NODE_NUM=1 \
  -e GRPC_PORT=50051 \
  -e GOSSIP_PORT=8001 \
  -e PEERS="node2:50051,node3:50051" \
  -e GOSSIP_PEERS="node2:8002,node3:8003" \
  -e REPLICATION_FACTOR=2 \
  -e DATA_DIR=/app/data/node1 \
  -v kv1:/app/data \
  a3store-kv-node
echo "[*] KV Node container 'node1' is running"

docker run -d --name node2 --network kvnet \
  -p 50052:50051 \
  -p 8002:8001 \
  -e DEBUG_LOG=true \
  -e NODE_NUM=2 \
  -e GRPC_PORT=50051 \
  -e GOSSIP_PORT=8002 \
  -e PEERS="node1:50051,node3:50051" \
  -e GOSSIP_PEERS="node1:8001,node3:8003" \
  -e REPLICATION_FACTOR=2 \
  -e DATA_DIR=/app/data/node2 \
  -v kv2:/app/data \
  a3store-kv-node
echo "[*] KV Node container 'node2' is running"

docker run -d --name node3 --network kvnet \
  -p 50053:50051 \
  -p 8003:8001 \
  -e DEBUG_LOG=true \
  -e NODE_NUM=3 \
  -e GRPC_PORT=50051 \
  -e GOSSIP_PORT=8003 \
  -e PEERS="node1:50051,node2:50051" \
  -e GOSSIP_PEERS="node1:8001,node2:8002" \
  -e REPLICATION_FACTOR=2 \
  -e DATA_DIR=/app/data/node3 \
  -v kv3:/app/data \
  a3store-kv-node
echo "[*] KV Node container 'node3' is running"
fi
