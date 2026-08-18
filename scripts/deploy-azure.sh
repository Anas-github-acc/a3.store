#!/usr/bin/env bash

set -euo pipefail


TAG="${1:-v1.0.0}"

TF_DIR="${TF_DIR:-infra/terraform/azure}"


command -v az >/dev/null || {
  echo "az CLI is required" >&2
  exit 1
}

command -v terraform >/dev/null || {
  echo "terraform is required" >&2
  exit 1
}

command -v kubectl >/dev/null || {
  echo "kubectl is required" >&2
  exit 1
}

command -v docker >/dev/null || {
  echo "docker is required" >&2
  exit 1
}

command -v envsubst >/dev/null || {
  echo "envsubst is required (package: gettext)" >&2
  exit 1
}


RG="$(
  terraform \
    -chdir="$TF_DIR" \
    output \
    -raw resource_group_name
)"


AKS="$(
  terraform \
    -chdir="$TF_DIR" \
    output \
    -raw aks_name
)"


ACR="$(
  terraform \
    -chdir="$TF_DIR" \
    output \
    -raw acr_name
)"


LOGIN_SERVER="$(
  terraform \
    -chdir="$TF_DIR" \
    output \
    -raw acr_login_server
)"


KV_IMAGE="$LOGIN_SERVER/a3store-kv-node:$TAG"

API_IMAGE="$LOGIN_SERVER/a3store-api:$TAG"


export KV_IMAGE
export API_IMAGE


echo "Using:"
echo "  Resource group: $RG"
echo "  AKS:            $AKS"
echo "  ACR:            $ACR"
echo "  KV image:       $KV_IMAGE"
echo "  API image:      $API_IMAGE"

echo


az aks get-credentials \
  --resource-group "$RG" \
  --name "$AKS" \
  --overwrite-existing


az acr login \
  --name "$ACR"


docker build \
  -t "$KV_IMAGE" \
  ./kv-node


docker build \
  -t "$API_IMAGE" \
  ./api


docker push "$KV_IMAGE"

docker push "$API_IMAGE"


kubectl apply \
  -f k8s/azure/namespace.yaml


kubectl apply \
  -f k8s/azure/headless-svc.yaml


kubectl apply \
  -f k8s/azure/pdb.yaml


kubectl apply \
  -f k8s/azure/service-api.yaml


envsubst '${KV_IMAGE}' \
  < k8s/azure/statefulset-kv.yaml \
  | kubectl apply -f -


envsubst '${API_IMAGE}' \
  < k8s/azure/deployment-api.yaml \
  | kubectl apply -f -


kubectl rollout status \
  statefulset/kv \
  -n kv \
  --timeout=10m


kubectl rollout status \
  deployment/api \
  -n kv \
  --timeout=5m


echo

echo "=== NODES ==="

kubectl get nodes -o wide


echo

echo "=== PODS ==="

kubectl get pods -n kv -o wide


echo

echo "=== PVCs ==="

kubectl get pvc -n kv
