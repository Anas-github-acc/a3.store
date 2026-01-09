terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.95.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# -------------------------
# VPC with 2 private + 2 public subnets, single NAT
# -------------------------
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${var.project_name}-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["${var.region}a"] # ["${var.region}a", "${var.region}b"] # using only one AZ in dev to save cost
  private_subnets = ["10.0.0.0/24"]    # ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.201.0/24"]  # ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true # cost saving

  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Project = var.project_name
    Env     = "prod"
  }
}

# -------------------------
# EKS Cluster (control plane)
# -------------------------
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "${var.project_name}-eks"
  cluster_version = "1.30"

  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnets
  control_plane_subnet_ids = module.vpc.private_subnets

  cluster_endpoint_public_access  = true
  cluster_endpoint_private_access = true

  enable_irsa = true

  eks_managed_node_groups = {
    default = {
      instance_types = [var.worker_instance_type]
      min_size       = 1
      max_size       = 3
      desired_size   = var.worker_desired

      # Cost savings - use spot where possible
      capacity_type = "SPOT"

      subnet_ids = module.vpc.private_subnets

      tags = {
        Project = var.project_name
        Env     = "prod"
      }
    }
  }

  tags = {
    Project = var.project_name
    Env     = "prod"
  }
}

# -------------------------
# node-sg - allow all outbound, allow inbound from anywhere (for nginx NodePort)
# -------------------------
resource "aws_security_group" "node_sg" {
  name        = "${var.project_name}-node-sg"
  description = "Security group for EKS worker nodes"
  vpc_id      = module.vpc.vpc_id

  # allow node-to-node (all) inside the private subnets
  ingress {
    description = "node to node"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = module.vpc.private_subnets_cidr_blocks
  }

  # allow kubelet / nodeport health from the NLB (NLB uses peer ephemeral IPs)
  # NOTE: NLB doesn't have SG, so this allows any public -> nodePort on 0.0.0.0/0 for nodePort (30080/30443)
  # For tighter security, restrict to known client IP ranges or use WAF/ALB
  ingress {
    description = "allow nginx nodeport HTTP"
    from_port   = var.nginx_node_port
    to_port     = var.nginx_node_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "allow nginx nodeport HTTPS"
    from_port   = var.nginx_node_port_https
    to_port     = var.nginx_node_port_https
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # allow egress anywhere
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "${var.project_name}-node-sg",
    Project = var.project_name
    Env     = "prod"
  }
}



# -------------------------
# rds-sg - only allow from EKS nodes with specified SG
# -------------------------
# resource "aws_security_group" "rds_sg" {
#   name        = "${var.project_name}-rds-sg"
#   description = "Allow Postgres from EKS nodes SG"
#   vpc_id      = module.vpc.vpc_id

#   ingress {
#     from_port   = 5432
#     to_port     = 5432
#     protocol    = "tcp"
#     security_groups = [aws_security_group.node_sg.id] # node_sg to rds_sg (sg to sg) -- !initially this was cidr_blocks = module.vpc.private_subnets_cidr_blocks allowing all the ec2 instances to access rds
#   }

#   egress {
#     from_port   = 0
#     to_port     = 0
#     protocol    = "-1"
#     cidr_blocks = ["0.0.0.0/0"]
#   }

#   tags = {
#     Name = "${var.project_name}-rds-sg",
#     Project = var.project_name
#     Env = "prod"
#   }
# }

# -------------------------
# RDS - cheap PostgreSQL for metadata
# -------------------------
# module "rds" {
#   source  = "terraform-aws-modules/rds/aws"
#   version = "~> 6.0"

#   identifier = "${var.project_name}-rds"

#   engine            = "postgres"
#   engine_version    = "16.3"
#   family            = "postgres16"
#   instance_class    = "db.t3.micro"
#   allocated_storage = 20

#   db_name  = var.rds_db_name
#   username = var.rds_username
#   password = var.rds_password
#   port     = 5432

#   multi_az               = false
#   publicly_accessible    = false
#   storage_encrypted      = true
#   deletion_protection    = false
#   skip_final_snapshot    = true

#   vpc_security_group_ids = [aws_security_group.rds_sg.id]
#   subnet_ids             = module.vpc.private_subnets

#   tags = {
#     Project = var.project_name
#     Env = "prod"
#   }
# }