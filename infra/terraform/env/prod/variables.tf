variable "region" {
  description = "AWS region to deploy"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Project name prefix"
  type        = string
  default     = "dist-kv"
}

variable "rds_db_name" {
  description = "Dev RDS database name"
  type        = string
  default     = "metastore"
}

variable "rds_username" {
  description = "RDS master username"
  type        = string
  default     = "adminuser"
}

variable "rds_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}

variable "nginx_node_port" {
  description = "NodePort to expose nginx ingress controller"
  type        = number
  default     = 30080 # HTTP
}

variable "nginx_node_port_https" {
  description = "NodePort to expose nginx ingress controller TLS"
  type        = number
  default     = 30443 # HTTPS
}

variable "worker_instance_type" {
  type    = string
  default = "t3.small"
}

variable "worker_desired" {
  type    = number
  default = 2
}
