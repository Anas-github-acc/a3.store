variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Project name prefix"
  type        = string
  default     = "dist-kv"
}

variable "rds_db_name" {
  description = "Initial RDS database name"
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
