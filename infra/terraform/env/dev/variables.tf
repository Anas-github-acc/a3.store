variable "project_name" {
  description = "Project name prefix"
  type        = string
  default     = "dist-kv"
}

variable "region" {
  description = "AWS region to deploy"
  type        = string
  default     = "ap-south-1"
}