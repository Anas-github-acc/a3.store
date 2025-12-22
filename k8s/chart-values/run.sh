#!/bin/bash
set -e
# ---------- Traefik ----------
# echo "[...] Adding Traefik Helm repository"
# helm repo add traefik https://traefik.github.io/charts
# helm repo update
# echo ""

# echo "[...] Installing Traefik ingress controller in traefik namespace"
# helm upgrade --install traefik traefik/traefik \
#   --namespace traefik \
#   -f traefik-values.yaml

# ---------- ingress controller ----------
# echo "[...] Adding ingress-nginx Helm repository"
# helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
# helm repo update
# echo ""

# echo "[...] Creating namespace if name space do not'ingress-nginx' and installing ingress-nginx controller"
# helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
#   --namespace ingress-nginx --create-namespace \
#   --values ingress-values.yaml

# ---------- monitoring stack ----------
# echo "[...] Adding prometheus-community Helm repository"
# helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
# helm repo update
# echo ""

# echo "[...] Installing prometheus + grafana stack in monitoring namespace"
# helm install monitoring prometheus-community/kube-prometheus-stack \
#   -f values-prometheus.yaml \
#   --namespace monitoring --create-namespace
# echo ""

# echo "[...] Exposing Grafana via port-forwarding on http://localhost:3000 (temporary for testing)"
# kubectl --namespace monitoring port-forward svc/monitoring-grafana 3000:80
# echo "[...] open http://localhost:3000 in your browser and login with admin/prom-operator"
# echo ""

# echo "[...] Loki and Promtail setup"
# helm repo add grafana https://grafana.github.io/helm-charts
# helm repo update
# echo ""

# echo "[...] Installing Loki stack with Promtail (without Grafana) in monitoring namespace"
# helm install loki grafana/loki-stack \
#   --set promtail.enabled=true \
#   --set grafana.enabled=false \
#   -n monitoring --create-namespace