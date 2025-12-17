terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.21"
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
  version = "~> 6.5.0"

  name = "${var.project_name}-vpc"
  cidr = "10.0.0.0/16"

  azs = ["${var.region}a", "${var.region}b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway   = true
  single_nat_gateway   = true
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Project = var.project_name
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
      instance_types = ["t3.small"]
      min_size       = 2
      max_size       = 4
      desired_size   = 2

      # Cost savings - use spot where possible
      capacity_type  = "SPOT"

      subnet_ids = module.vpc.private_subnets

      tags = {
        Project = var.project_name
      }
    }
  }

  tags = {
    Project = var.project_name
  }
}

# -------------------------
# RDS - cheap PostgreSQL for metadata
# -------------------------
module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 6.0"

  identifier = "${var.project_name}-rds"

  engine            = "postgres"
  engine_version    = "16.3"
  family            = "postgres16"
  instance_class    = "db.t3.micro"
  allocated_storage = 20

  db_name  = var.rds_db_name
  username = var.rds_username
  password = var.rds_password
  port     = 5432

  multi_az               = false
  publicly_accessible    = false
  storage_encrypted      = true
  deletion_protection    = false
  skip_final_snapshot    = true

  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  subnet_ids             = module.vpc.private_subnets

  tags = {
    Project = var.project_name
  }
}

# -------------------------
# RDS security group - only allow from EKS nodes
# -------------------------
resource "aws_security_group" "rds_sg" {
  name        = "${var.project_name}-rds-sg"
  description = "Allow Postgres from EKS nodes"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = module.vpc.private_subnets_cidr_blocks
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Project = var.project_name
  }
}

# -------------------------
# Outputs
# -------------------------
output "cluster_name" {
  value = module.eks.cluster_name
}

output "cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "cluster_ca" {
  value = module.eks.cluster_certificate_authority_data
}

output "rds_endpoint" {
  value = module.rds.db_instance_endpoint
}
