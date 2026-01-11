FROM python:3.11-slim

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl \
 && rm -rf /var/lib/apt/lists/*

# RUN curl -LsSf https://astral.sh/uv/install.sh | sh
RUN pip install --no-cache-dir uv

# Copy project metadata for dependency resolution first
COPY pyproject.toml .
COPY uv.lock .

# Pre-install packages into a virtual env
# RUN /root/.local/bin/uv sync --frozen
RUN uv sync --frozen

# Copy proto definitions
COPY proto /app/proto

# Copy actual application code
COPY . .

ENV PYTHONUNBUFFERED=1 \
    GRPC_PORT=50051 \
    GOSSIP_PORT=8001 \
    NODE_NUM=1 \
    PEERS="" \
    REPLICATION_FACTOR=2 \
    DATA_DIR="/app/data/node1"

RUN mkdir -p /app/data

EXPOSE 50051 8001

# Run using uv's environment
# CMD ["/root/.local/bin/uv", "run", "app/node.py"]
CMD ["uv", "run", "app/node.py"]