variable "subscription_id" {
  description = "Azure subscription ID used by the AzureRM provider."
  type        = string
}

variable "location" {
  description = "Azure region for the portfolio deployment."
  type        = string
  default     = "centralindia"
}

variable "resource_group_name" {
  description = "Resource group containing all a3.store Azure resources."
  type        = string
  default     = "a3store-rg"
}

variable "aks_name" {
  description = "AKS cluster name."
  type        = string
  default     = "a3store-aks"
}

variable "acr_name" {
  description = "Globally unique ACR name. Must be 5-50 alphanumeric characters."
  type        = string

  validation {
    condition     = can(regex("^[A-Za-z0-9]{5,50}$", var.acr_name))
    error_message = "acr_name must contain only 5-50 alphanumeric characters and no hyphens."
  }
}

variable "node_vm_size" {
  description = "VM size for the AKS system node pool."
  type        = string
  default     = "Standard_DS2_v2"
}

variable "min_nodes" {
  description = "Minimum AKS node count."
  type        = number
  default     = 1

  validation {
    condition     = var.min_nodes >= 1
    error_message = "min_nodes must be at least 1."
  }
}

variable "max_nodes" {
  description = "Maximum AKS node count."
  type        = number
  default     = 3

  validation {
    condition     = var.max_nodes >= var.min_nodes
    error_message = "max_nodes must be greater than or equal to min_nodes."
  }
}

variable "monitor_workspace_name" {
  description = "Azure Monitor workspace used by Managed Prometheus."
  type        = string
  default     = "a3store-prometheus"
}

variable "grafana_name" {
  description = "Azure Managed Grafana workspace name."
  type        = string
  default     = "a3store-grafana"
}
