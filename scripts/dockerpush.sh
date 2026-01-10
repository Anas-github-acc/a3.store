#!/bin/bash

set -e

# O=0: only kv-node, O=1: only api, O=2: both (default)
F="${F:-2}"

docker_images=()

if [ "$F" == "0" ]; then
  (cd ../kv-node && docker build -t a3store-kv-node:latest .)
  docker_images+=("a3store-kv-node:latest")
  echo "[-] Docker Build complete: a3store-kv-node"
elif [ "$F" == "1" ]; then
  (cd ../api && docker build -t a3store-api:latest .)
  docker_images+=("a3store-api:latest")
  echo "[-] Docker Build complete: a3store-api"
else
  (cd ../kv-node && docker build -t a3store-kv-node:latest .)
  (cd ../api && docker build -t a3store-api:latest .)
  docker_images+=("a3store-kv-node:latest" "a3store-api:latest")
  echo "[-] Docker Build complete: both images"
fi

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
echo ""

for image in "${docker_images[@]}"; do
  
  image_name="${image%%:*}"
  
  if ! docker image inspect "$image" >/dev/null 2>&1; then
    echo "Image ${image} not found locally. Skipping..."
    continue
  fi
  
  # remote tag
  remote_tag="${DOCKER_USER}/${image_name}:${VERSION}"
  docker tag "$image" "$remote_tag"
  docker push "$remote_tag"
  
  # 'latest' tag
  latest_tag="${DOCKER_USER}/${image_name}:latest"
  docker tag "$image" "$latest_tag"
  
  echo "  Pushing: ${latest_tag}"
  docker push "$latest_tag"
  
  echo ""
done

echo "=== Upload Complete ==="
echo ""
echo "Pushed images:"
for image in "${docker_images[@]}"; do
  image_name="${image%%:*}"
  echo "  - ${DOCKER_USER}/${image_name}:${VERSION}"
  echo "  - ${DOCKER_USER}/${image_name}:latest"
done

# Cleanup: remove local images matching the major-version prefix (e.g. v1*),
# but keep the current ${VERSION} and keep any :latest tags.
# Example: VERSION="v1.0.3" -> major_prefix="v1"
major_prefix="${VERSION%%.*}"
echo ""
echo "Cleaning up local images with prefix ${major_prefix} (excluding ${VERSION} and latest)..."

for image in "${docker_images[@]}"; do
  image_name="${image%%:*}"

  # list repository:tag entries for this repo under DOCKER_USER
  docker images --format '{{.Repository}}:{{.Tag}}' | grep -E "^${DOCKER_USER}/${image_name}:" | while read -r repo_tag; do
    tag=${repo_tag#${DOCKER_USER}/${image_name}:}
    # skip latest and the just-pushed version
    if [ "${tag}" = "latest" ] || [ "${tag}" = "${VERSION}" ]; then
      continue
    fi
    # if tag starts with major_prefix (e.g., v1), remove it
    if [[ "${tag}" == ${major_prefix}* ]]; then
      echo "Removing local image: ${DOCKER_USER}/${image_name}:${tag}"
      docker rmi -f "${DOCKER_USER}/${image_name}:${tag}" >/dev/null 2>&1 || true
      # also try removing unprefixed local tag if exists
      echo "Removing local image: ${image_name}:${tag} (if present)"
      docker rmi -f "${image_name}:${tag}" >/dev/null 2>&1 || true
    fi
  done
done

echo "Cleanup complete."