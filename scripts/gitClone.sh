sudo git clone --filter=blob:none --sparse https://github.com/Anas-github-acc/a3.store k8s-deploy
cd k8s-deploy
sudo git sparse-checkout set k8s
sudo chown -R ec2-user:ec2-user /opt/k8s-deploy
