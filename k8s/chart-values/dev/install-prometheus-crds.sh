#!/bin/bash
set -e

echo "[...] Installing minimal Prometheus CRDs"

BASE=https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/example/prometheus-operator-crd

kubectl apply -f $BASE/monitoring.coreos.com_prometheuses.yaml
kubectl apply -f $BASE/monitoring.coreos.com_servicemonitors.yaml
kubectl apply -f $BASE/monitoring.coreos.com_podmonitors.yaml

echo "[-] Minimal Prometheus CRDs installed"