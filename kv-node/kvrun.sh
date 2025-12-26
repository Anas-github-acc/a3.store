#!/usr/bin/env bash
set -e

# Print usage/help
print_help() {
    cat <<'EOF'
Usage: kvrun.sh [COMMAND]

Commands:
  help                Show this help message
  check config        Print configuration variables, defaults and purpose

If no command is provided the script runs in interactive mode to start a node.
EOF
}

# Print configuration table for 'check config'
print_check_config() {
    cat <<'EOF'
| Variable             | Default                                              | Purpose                                      |
|----------------------|-----------------------------------------------------|----------------------------------------------|
| NODE_NUM             | `1`                                                 | Node id (unique per process)                 |
| GRPC_PORT            | `50051`                                             | gRPC server port                             |
| GOSSIP_PORT          | `8001`                                              | Gossip HTTP port                             |
| PEERS                | `localhost:50051,localhost:50052,localhost:50053`   | Comma-separated peer gRPC addresses          |
| GOSSIP_PEERS         | `localhost:8001,localhost:8002,localhost:8003`      | Comma-separated peer gossip HTTP addresses   |
| REPLICATION_FACTOR   | `2`                                                 | Number of replicas                           |
| DATA_DIR             | `data/node{N}`                                      | SQLite DB dir                                |
| ANTI_ENTROPY_INTERVAL| `30`                                               | Anti-entropy interval (seconds)              |
| DEBUG_LOG            | `false`                                             | Enable verbose logging                       |
EOF
}

# Handle simple commands
if [ "$#" -gt 0 ]; then
    case "$1" in
        help|-h|--help)
            print_help
            exit 0
            ;;
        check)
            if [ "$2" = "config" ]; then
                print_check_config
                exit 0
            fi
            ;;
    esac
fi

# ============================================
# Distributed KV Node Launcher
# ============================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}       ________                        .___.__${NC}"        
echo -e "${BLUE}_____  \_____  \    _______   ____   __| _/|__| ______${NC}"
echo -e "${BLUE}\__  \   _(__  <    \_  __ \_/ __ \ / __ | |  |/  ___/${NC}"
echo -e "${BLUE} / __ \_/       \    |  | \/\  ___// /_/ | |  |\___ ${NC}"
echo -e "${BLUE}(____  /______  / /\ |__|    \___  >____ | |__/____  >${NC}"
echo -e "${BLUE}     \/       \/  \/             \/     \/         \/ ${NC}"
echo ""
echo -e "${BLUE}  Distributed KV Node Launcher${NC}"
echo ""

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$SCRIPT_DIR/app"

# Activate virtual environment
if [ -f "$SCRIPT_DIR/.venv/bin/activate" ]; then
    source "$SCRIPT_DIR/.venv/bin/activate"
    echo -e "${GREEN}✓ Virtual environment activated${NC}"
else
    echo -e "${YELLOW}⚠ No .venv found, using system Python${NC}"
fi

# Ask for node number
echo ""
read -p "Enter node number (1, 2, 3, ...): " NODE_NUM

if ! [[ "$NODE_NUM" =~ ^[0-9]+$ ]]; then
    echo -e "${RED}Error: Node number must be a positive integer${NC}"
    exit 1
fi

# Calculate ports based on node number
# Node 1: gRPC=50051, Gossip=8001
# Node 2: gRPC=50052, Gossip=8002
# Node 3: gRPC=50053, Gossip=8003
GRPC_PORT=$((50050 + NODE_NUM))
GOSSIP_PORT=$((8000 + NODE_NUM))

echo ""
echo -e "${YELLOW}Node Configuration:${NC}"
echo -e "  Node Number:  ${GREEN}$NODE_NUM${NC}"
echo -e "  gRPC Port:    ${GREEN}$GRPC_PORT${NC}"
echo -e "  Gossip Port:  ${GREEN}$GOSSIP_PORT${NC}"
echo ""

# Ask for total number of nodes in cluster
read -p "Enter total number of nodes in cluster (default: 3): " TOTAL_NODES
TOTAL_NODES=${TOTAL_NODES:-3}

if ! [[ "$TOTAL_NODES" =~ ^[0-9]+$ ]] || [ "$TOTAL_NODES" -lt 1 ]; then
    echo -e "${RED}Error: Total nodes must be a positive integer${NC}"
    exit 1
fi

# Build peer list (all nodes except current)
PEERS=""
for i in $(seq 1 $TOTAL_NODES); do
    if [ "$i" -ne "$NODE_NUM" ]; then
        PEER_GRPC_PORT=$((50050 + i))
        if [ -z "$PEERS" ]; then
            PEERS="127.0.0.1:$PEER_GRPC_PORT"
        else
            PEERS="$PEERS,127.0.0.1:$PEER_GRPC_PORT"
        fi
    fi
done

echo -e "  Peers:        ${GREEN}$PEERS${NC}"
echo ""

# Ask for replication factor
read -p "Enter replication factor (default: 2): " REPLICATION_FACTOR
REPLICATION_FACTOR=${REPLICATION_FACTOR:-2}

# Ask for data directory
DATA_DIR="$SCRIPT_DIR/data/node$NODE_NUM"
read -p "Enter data directory (default: $DATA_DIR): " CUSTOM_DATA_DIR
DATA_DIR=${CUSTOM_DATA_DIR:-$DATA_DIR}

# Create data directory if it doesn't exist
mkdir -p "$DATA_DIR"
echo -e "${GREEN}✓ Data directory: $DATA_DIR${NC}"

echo ""
echo -e "${BLUE}----------------------------------------${NC}"
echo -e "${GREEN}Starting Node $NODE_NUM...${NC}"
echo -e "${BLUE}----------------------------------------${NC}"
echo ""

# Export environment variables
export GRPC_PORT=$GRPC_PORT
export GOSSIP_PORT=$GOSSIP_PORT
export NODE_NUM=$NODE_NUM
export PEERS=$PEERS
export REPLICATION_FACTOR=$REPLICATION_FACTOR
export DATA_DIR=$DATA_DIR

# Run the node
cd "$APP_DIR"
python node.py
