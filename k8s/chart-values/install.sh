#!/bin/bash
set -e

# Parse arguments
COMPONENT="${1:-all}"
ENV="${2:-dev}"

# Validate component
case "$COMPONENT" in
  traefik|monitor|loki|all) ;;
  *)
    echo "Usage: $0 [traefik|monitor|loki|all] [dev|prod]"
    echo "Invalid component: $COMPONENT"
    exit 1
    ;;
esac

# Validate environment
case "$ENV" in
  prod|dev) ;;
  *)
    echo "Usage: $0 [traefik|monitor|loki|all] [dev|prod]"
    echo "Invalid environment: $ENV"
    exit 1
    ;;
esac

echo "[-] Selected component: $COMPONENT"
echo "[-] Selected component: $COMPONENT"
echo "[-] Selected environment: $ENV"

# ---------- Traefik ----------
if [ "$COMPONENT" = "traefik" ] || [ "$COMPONENT" = "all" ]; then
  echo "[...] Adding Traefik Helm repository"
  helm repo add traefik https://traefik.github.io/charts
  helm repo update
  echo ""

  # echo "[...] Installing Traefik ingress controller in traefik namespace"
  helm upgrade --install traefik traefik/traefik \
    --namespace traefik \
    -f ${ENV}/traefik-values.yaml
  echo "[-] Traefik installed successfully"
  echo ""
fi

# ---------- ingress controller ----------
# echo "[...] Adding ingress-nginx Helm repository"
# helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
# helm repo update
# echo ""

# echo "[...] Creating namespace if name space do not'ingress-nginx' and installing ingress-nginx controller"
  # helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  #   --namespace ingress-nginx --create-namespace \
  #   --values ${ENV}/ingress-values.yaml

# ---------- monitoring stack ----------
if [ "$COMPONENT" = "monitor" ] || [ "$COMPONENT" = "all" ]; then
  echo "[...] Installing minimal Prometheus CRDs"

  BASE=https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/example/prometheus-operator-crd

  kubectl apply -f $BASE/monitoring.coreos.com_prometheuses.yaml
  kubectl apply -f $BASE/monitoring.coreos.com_servicemonitors.yaml
  kubectl apply -f $BASE/monitoring.coreos.com_podmonitors.yaml

  echo "[-] Minimal Prometheus CRDs installed"

  helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
  helm repo update
  echo "[-] Added prometheus-community Helm repository"
  echo ""

  helm upgrade --install monitoring prometheus-community/kube-prometheus-stack \
    --skip-crds \
    --namespace monitoring --create-namespace \
    -f ${ENV}/values-prometheus.yaml
  echo "[-] Installed prometheus + grafana stack in monitoring namespace"
  echo ""
fi

# ---------- Loki ----------
if [ "$COMPONENT" = "loki" ] || [ "$COMPONENT" = "all" ]; then
  helm repo add grafana https://grafana.github.io/helm-charts
  helm repo update
  echo "[-] Loki and Promtail setuped"
  echo ""

  # helm upgrade --install loki grafana/loki-stack \
  #   -n monitoring \
  #   --set promtail.enabled=true \
  #   --set grafana.enabled=false
  helm upgrade --install loki grafana/loki-stack \
    -n monitoring \
    -f ${ENV}/values-loki.yaml
  echo "[-] Installed Loki stack with Promtail (without Grafana) in monitoring namespace"
fi

# echo "[*] Exposing Grafana via port-forwarding on http://localhost:3000 (temporary for testing)"
# kubectl --namespace monitoring port-forward svc/monitoring-grafana 3000:80
# echo "[-] open http://localhost:3000 in your browser and login with admin/prom-operator"
# echo ""