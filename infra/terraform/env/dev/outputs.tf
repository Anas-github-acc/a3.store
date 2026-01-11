output "EC2_PUBLIC_IP" {
  value = aws_instance.k3s_dev.public_ip
}

output "EC2_PUBLIC_DNS" {
  value = aws_instance.k3s_dev.public_dns
}