#!/bin/bash

ROOT_DIR="$(git rev-parse --show-toplevel)"

echo "Root directory: $ROOT_DIR"

if [ -d "$ROOT_DIR/api/proto" ]; then
  rm -rf "$ROOT_DIR/api/proto"
fi
cp -r "$ROOT_DIR/proto" "$ROOT_DIR/api/"

if [ -d "$ROOT_DIR/kv-node/proto" ]; then
  rm -rf "$ROOT_DIR/kv-node/proto"
fi
cp -r "$ROOT_DIR/proto" "$ROOT_DIR/kv-node/"

if [ -d "$ROOT_DIR/node-client/proto" ]; then
  echo "Replacing existing proto in node-client..."
  rm -rf "$ROOT_DIR/node-client/proto"
fi
cp -r "$ROOT_DIR/proto" "$ROOT_DIR/node-client/"

echo "[-] Copied proto folder to api, kv-node, and node-client..."



cd "$ROOT_DIR/node-client" || exit 1

npm install

if [ ! -d "node_modules/grpc-web" ]; then
  echo "grpc-web package not found. Installing"
  npm install --save grpc-web
fi

if ! command -v protoc-gen-grpc-web >/dev/null 2>&1 && [ ! -x "node_modules/.bin/protoc-gen-grpc-web" ]; then
  echo "protoc-gen-grpc-web plugin not found. Installing as devDependency..."
  npm install --save-dev protoc-gen-grpc-web
fi

npm run gen:proto
echo "[-]Generated gRPC-Web stubs for node-client"


cd "$ROOT_DIR/"
source .venv/bin/activate
uv sync
python -m grpc_tools.protoc -I=./proto \
  --python_out=app/ --grpc_python_out=app/ \
  ./proto/kv.proto

echo "[-] Generated gRPC stubs for python dist-server"
