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

# usage helper
usage() {
  cat <<EOF
Usage: ./docker.sh [command]

Commands:
  help        Show this help message
  clean       Remove containers and volumes
  logs        Tail container logs: `logs [all|node1|node2|node3|1|2|3]`
  stop        Stop running containers (keep volumes)
  nobuild     Start containers without rebuilding the image

Examples:
  ./docker.sh           # build and start (default)
  ./docker.sh nobuild   # start without building
  ./docker.sh stop      # stop containers
  ./docker.sh logs all   # tail logs for all nodes
  ./docker.sh logs 2     # tail logs for node2 (numeric shorthand)
  ./docker.sh clean     # remove containers and volumes
EOF
}

# show help
if [ "$1" = "help" ] || [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
  usage
  exit 0
fi

# stop containers (but keep volumes)
if [ "$1" = "stop" ]; then
  echo "[*] Stopping KV Node containers"
  docker stop node1 node2 node3 2>/dev/null || true
  echo "[*] Containers stopped"
  exit 0
fi

# tail container logs
if [ "$1" = "logs" ]; then
  TARGET="$2"
  # map numeric shorthand to container name
  case "$TARGET" in
    1|2|3)
      TARGET="node$TARGET"
      ;;
  esac

  if [ -z "$TARGET" ] || [ "$TARGET" = "all" ]; then
    echo "[*] Tailing logs for node1, node2, node3 (press Ctrl+C to exit)"
    docker logs -f node1 2>/dev/null & pid1=$!
    docker logs -f node2 2>/dev/null & pid2=$!
    docker logs -f node3 2>/dev/null & pid3=$!
    wait $pid1 $pid2 $pid3
    exit 0
  else
    # check container exists
    if ! docker ps -a --format '{{.Names}}' | grep -qw "$TARGET"; then
      echo "[!] Container '$TARGET' not found"
      exit 1
    fi
    echo "[*] Tailing logs for $TARGET (press Ctrl+C to exit)"
    docker logs -f "$TARGET"
    exit 0
  fi
fi


if [ "$1" != "clean" ]; then
  if [ "$1" != "nobuild" ]; then
    echo "[*] Cleaning up existing containers"
    docker rm -f node1 node2 node3 2>/dev/null || true

    docker build -t a3store-kv-node:latest .
  fi
docker network create kvnet || true # create virtual private network for containers to communicate

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
