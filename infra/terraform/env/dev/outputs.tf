output "ec2_public_ip" {
  value = aws_instance.k3s_dev.public_ip
}

output "ec2_public_dns" {
  value = aws_instance.k3s_dev.public_dns
}