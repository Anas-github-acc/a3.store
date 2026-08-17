output "cluster_name" {
  value = module.eks.cluster_name
}

output "cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "cluster_ca" {
  value = module.eks.cluster_certificate_authority_data
}

# output "rds_endpoint" {
#   value = module.rds.db_instance_endpoint
# }

output "vpc_private_subnets" {
  value = module.vpc.private_subnets
}

output "workers_sg_id" {
  value = aws_security_group.node_sg.id
}