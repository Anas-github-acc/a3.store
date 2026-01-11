# delete existing ingressclass
kubectl delete ingressclass traefik

# if Traefik was installed by k3s
kubectl -n kube-system delete helmcharts.helm.cattle.io traefik
kubectl -n kube-system delete helmcharts.helm.cattle.io traefik-crd