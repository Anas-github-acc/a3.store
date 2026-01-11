#!/bin/bash

set -e

# O=0: only kv-node, O=1: only api, O=2: both (default)
# F = 0 -> only build and push kv-node
# F = 1 -> only build and push api
F="${F:-2}"

# Multi-arch platforms (default: linux/amd64,linux/arm64)
PLATFORMS="${PLATFORMS:-linux/amd64,linux/arm64}"

docker_images=()

# Setup buildx builder for multi-arch support
setup_buildx() {
  echo "Setting up Docker buildx for multi-architecture builds..."
  
  # Check if builder exists
  if ! docker buildx inspect multiarch-builder >/dev/null 2>&1; then
    echo "Creating new buildx builder: multiarch-builder"
    docker buildx create --name multiarch-builder --driver docker-container --use
  else
    echo "Using existing buildx builder: multiarch-builder"
    docker buildx use multiarch-builder
  fi
  
  # Bootstrap the builder
  docker buildx inspect --bootstrap
  echo "Buildx setup complete. Target platforms: ${PLATFORMS}"
  echo ""
}

# Setup buildx before building
setup_buildx

VERSION="${VERSION:-v1}" # VERSION="v2" ./dockerupload.sh

# Function to get Docker username using multiple methods
get_docker_username() {
  local username=""
  
  # Method 1: Try docker info with format (works with newer Docker versions)
  username=$(docker info --format '{{.Username}}' 2>/dev/null || echo "")
  if [ -n "$username" ] && [ "$username" != "<no value>" ]; then
    echo "$username"
    return 0
  fi
  
  # Method 2: Parse from docker info output
  username=$(docker info 2>/dev/null | grep "Username:" | awk '{print $2}' || echo "")
  if [ -n "$username" ]; then
    echo "$username"
    return 0
  fi
  
  # Method 3: Check Docker config file for authenticated registries
  if [ -f "$HOME/.docker/config.json" ]; then
    # Try to extract username from auths section
    username=$(jq -r '.auths["https://index.docker.io/v1/"] // .auths["index.docker.io"] // .auths["docker.io"] | .username // empty' "$HOME/.docker/config.json" 2>/dev/null || echo "")
    if [ -n "$username" ]; then
      echo "$username"
      return 0
    fi
    
    # Try to get from credHelpers/credsStore (for OAuth login)
    # Extract from the auth token if available
    auth_encoded=$(jq -r '.auths["https://index.docker.io/v1/"] // .auths["index.docker.io"] // .auths["docker.io"] | .auth // empty' "$HOME/.docker/config.json" 2>/dev/null || echo "")
    if [ -n "$auth_encoded" ]; then
      username=$(echo "$auth_encoded" | base64 -d 2>/dev/null | cut -d':' -f1 || echo "")
      if [ -n "$username" ]; then
        echo "$username"
        return 0
      fi
    fi
  fi
  
  return 1
}

check_docker_login() {
  # Check if docker is authenticated
  if docker info >/dev/null 2>&1; then
    username=$(get_docker_username)
    if [ -n "$username" ]; then
      DOCKER_USER="$username"
      return 0
    fi
  fi
  return 1
}

do_docker_login() {
  echo "Docker login required..."
  if ! docker login; then
    echo "Docker login failed"
    exit 1
  fi
  
  username=$(get_docker_username)
  if [ -n "$username" ]; then
    DOCKER_USER="$username"
    echo "Successfully logged in as: ${DOCKER_USER}"
  else
    echo "Could not automatically detect Docker username."
    read -p "Enter your Docker Hub username: " DOCKER_USER
    if [ -z "$DOCKER_USER" ]; then
      echo "Username is required"
      exit 1
    fi
  fi
}

if [ -n "$DOCKER_USERNAME" ]; then
  DOCKER_USER="$DOCKER_USERNAME"
  echo -e "Using DOCKER_USERNAME from environment: ${DOCKER_USER}"
  
  if ! docker info >/dev/null 2>&1; then
    echo "Not logged in. Attempting login..."
    do_docker_login
  fi
else
  if ! check_docker_login; then
    do_docker_login
  fi
fi

echo ""
echo "Using ${DOCKER_USER}"
echo "Version Tag: ${VERSION}"
echo "Platforms: ${PLATFORMS}"
echo ""

# Build and push multi-arch images using buildx
for component in kv-node api; do
  # Check which images to build based on F flag
  if [ "$F" == "0" ] && [ "$component" == "api" ]; then
    continue
  fi
  if [ "$F" == "1" ] && [ "$component" == "kv-node" ]; then
    continue
  fi
  
  image_name="a3store-${component}"
  docker_images+=("${image_name}")
  
  echo "Building and pushing multi-arch image: ${image_name}"
  
  # Build and push with both version tag and latest tag
  cd "../${component}"
  
  docker buildx build \
    --platform "${PLATFORMS}" \
    --tag "${DOCKER_USER}/${image_name}:${VERSION}" \
    --tag "${DOCKER_USER}/${image_name}:latest" \
    --push \
    .
  
  cd - > /dev/null
  
  echo "  ✓ Pushed: ${DOCKER_USER}/${image_name}:${VERSION}"
  echo "  ✓ Pushed: ${DOCKER_USER}/${image_name}:latest"
  echo ""
done

echo "=== Upload Complete ==="
echo ""
echo "Pushed multi-arch images for platforms: ${PLATFORMS}"
for image in "${docker_images[@]}"; do
  echo "  - ${DOCKER_USER}/${image}:${VERSION}"
  echo "  - ${DOCKER_USER}/${image}:latest"
done
echo ""
echo "Note: Multi-arch images are pushed directly. No local cleanup needed."