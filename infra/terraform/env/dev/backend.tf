# terraform {
#   backend "s3" {
#     bucket = "dist-kv-terraform-state"
#     key    = "dev/terraform.tfstate"
#     region = "ap-south-1"
#     encrypt = true
#   }
# }