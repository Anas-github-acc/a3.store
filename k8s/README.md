## Applying manifest
## Terraform
cd infra/terraform
terraform init
terraform apply


After apply, update kubeconfig:
aws eks update-kubeconfig --region <region> --name $(terraform output -raw cluster_name)


## Deploy ingress
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
--namespace ingress-nginx --create-namespace \
--values k8s/charts-values/ingress-values.yaml


## Deploy KV + API
kubectl apply -f k8s/manifests/namespace.yaml
kubectl apply -f k8s/manifests/kv/headless-svc.yaml
kubectl apply -f k8s/manifests/kv/statefulset-kv.yaml
kubectl apply -f k8s/manifests/api/deployment-api.yaml
kubectl apply -f k8s/manifests/api/service-api.yaml


Check ingress service and external IP (NLB) created by the ingress controller:
kubectl -n ingress-nginx get svc


## Notes
- The manifests use environment placeholders: ${KV_NODE_IMAGE}, ${API_IMAGE}. Replace using envsubst or CI pipeline.



## GRAFANA - Dashboards

Grafana is installed with kube-prometheus-stack.
Checking Grafana working

Access:
```bash
kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring
```

### Login:
user: admin
password: prom-operator
```bash
kubectl get secret prometheus-grafana \
-n monitoring -o jsonpath="{.data.admin-password}" | base64 -d
```

### Add Loki as Data Source

Grafana UI:

Settings → Data Sources → Add
Loki URL:
```bash
http://loki:3100
```

