#!/bin/bash

# Get the root directory of the project (where .git is located)
ROOT_DIR="$(git rev-parse --show-toplevel)"

echo "Root directory: $ROOT_DIR"

# ============================================
# (for nodejs) Generate stubs for nodejs-client
# Run from root directory
# ============================================
echo "Generating gRPC-Web stubs for nodejs-client..."
cd "$ROOT_DIR/nodejs-client" || exit 1

# Install project deps first
npm install

# Ensure grpc-web client package exists
if [ ! -d "node_modules/grpc-web" ]; then
  echo "grpc-web package not found. Installing..."
  npm install --save grpc-web
fi

# Ensure protoc-gen-grpc-web plugin exists (either in PATH or in node_modules/.bin)
if ! command -v protoc-gen-grpc-web >/dev/null 2>&1 && [ ! -x "node_modules/.bin/protoc-gen-grpc-web" ]; then
  echo "protoc-gen-grpc-web plugin not found. Installing as devDependency..."
  npm install --save-dev protoc-gen-grpc-web
fi

npm run gen:proto

# ============================================
# (for python) Generate stubs for dist-server
# Activate .venv and sync dependencies first
# ============================================
echo "Generating gRPC stubs for python dist-server..."
cd "$ROOT_DIR/dist-server"
source .venv/bin/activate
uv sync
python -m grpc_tools.protoc -I=../proto \
  --python_out=app/ --grpc_python_out=app/ \
  ../proto/kv.proto

echo "Done!"
