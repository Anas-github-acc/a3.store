#!/usr/bin/env bash

set -euo pipefail


kubectl apply -f - <<'YAML'

apiVersion: apps/v1

kind: Deployment

metadata:
  name: autoscaler-demo
  namespace: kv

spec:

  replicas: 3

  selector:
    matchLabels:
      app: autoscaler-demo

  template:

    metadata:
      labels:
        app: autoscaler-demo

    spec:

      containers:
        - name: pause

          image: registry.k8s.io/pause:3.10

          resources:

            requests:
              cpu: "1500m"
              memory: "128Mi"

            limits:
              cpu: "1500m"
              memory: "128Mi"

YAML


echo

echo "Watch autoscaling in separate terminals:"

echo "  kubectl get pods -n kv -w"

echo "  kubectl get nodes -w"


echo

echo "After AKS has scaled out, redistribute the KV pods:"

echo "  kubectl rollout restart statefulset/kv -n kv"

echo "  kubectl rollout status statefulset/kv -n kv --timeout=10m"


echo

echo "Then inspect placement:"

echo "  kubectl get pods -n kv -o custom-columns=NAME:.metadata.name,NODE:.spec.nodeName"


echo

echo "Cleanup:"

echo "  kubectl delete deployment autoscaler-demo -n kv"
