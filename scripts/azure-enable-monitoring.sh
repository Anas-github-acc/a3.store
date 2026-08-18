#!/usr/bin/env bash

set -euo pipefail


TF_DIR="${TF_DIR:-infra/terraform/azure}"


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


MONITOR_ID="$(
  terraform \
    -chdir="$TF_DIR" \
    output \
    -raw monitor_workspace_id
)"


GRAFANA_ID="$(
  terraform \
    -chdir="$TF_DIR" \
    output \
    -raw grafana_id
)"


az aks update \
  --resource-group "$RG" \
  --name "$AKS" \
  --enable-azure-monitor-metrics \
  --azure-monitor-workspace-resource-id "$MONITOR_ID" \
  --grafana-resource-id "$GRAFANA_ID"


az aks get-credentials \
  --resource-group "$RG" \
  --name "$AKS" \
  --overwrite-existing


for i in {1..30}; do

  if kubectl get crd \
    servicemonitors.azmonitoring.coreos.com \
    >/dev/null 2>&1; then

    break

  fi


  if [[ "$i" -eq 30 ]]; then

    echo "Managed Prometheus ServiceMonitor CRD did not appear in time." >&2

    exit 1

  fi


  echo "Waiting for Managed Prometheus CRDs... ($i/30)"

  sleep 10

done


kubectl apply \
  -f k8s/azure/managed-prometheus-servicemonitor.yaml


echo

echo "Managed Prometheus configuration:"


kubectl get \
  servicemonitor.azmonitoring.coreos.com \
  -n kv


echo

echo "AKS Azure Monitor profile:"


az aks show \
  --resource-group "$RG" \
  --name "$AKS" \
  --query azureMonitorProfile \
  -o json
