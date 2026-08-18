// Provider - AzureRM

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 5.1"
    }
  }
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }

  subscription_id = var.subscription_id
}

resource "azurerm_resource_group" "a3" {
  name     = var.resource_group_name
  location = var.location

  tags = {
    project     = "a3.store"
    environment = "portfolio"
    cloud       = "azure"
  }
}


// Azure Container Registry (ACR)
resource "azurerm_container_registry" "a3" {
  name                = var.acr_name
  resource_group_name = azurerm_resource_group.a3.name
  location            = azurerm_resource_group.a3.location

  sku           = "Basic"
  admin_enabled = false

  // legacy mode is useful here because we're deliberately using the classic AcrPull/AcrPush roles
  role_assignment_mode = "LegacyRegistryPermissions" // other only available option - AbacRepositoryPermissions

  tags = {
    project     = "a3.store"
    environment = "portfolio"
  }
}

// Azure Kubernetes Service (AKS)
resource "azurerm_kubernetes_cluster" "a3" {
  name                = var.aks_name
  location            = azurerm_resource_group.a3.location
  resource_group_name = azurerm_resource_group.a3.name
  dns_prefix          = var.aks_name

  sku_tier = "Free"

  node_provisioning_profile {
    mode = "Manual"
  }

  default_node_pool {
    name       = "system"
    vm_size    = var.node_vm_size
    node_count = var.min_nodes

    auto_scaling_enabled = true
    min_count            = var.min_nodes
    max_count            = var.max_nodes

    os_disk_size_gb = 30
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin    = "azure"
    load_balancer_sku = "standard"
  }

  tags = {
    project     = "a3.store"
    environment = "portfolio"
    cloud       = "azure"
  }
}

resource "azurerm_role_assignment" "aks_acr_pull" {
  scope                = azurerm_container_registry.a3.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_kubernetes_cluster.a3.kubelet_identity[0].object_id
}


// Monitoring 

resource "azurerm_monitor_workspace" "a3" {
  name                = var.monitor_workspace_name
  location            = azurerm_resource_group.a3.location
  resource_group_name = azurerm_resource_group.a3.name

  tags = {
    project     = "a3.store"
    environment = "portfolio"
  }
}

resource "azurerm_dashboard_grafana" "a3" {
  name                = var.grafana_name
  location            = azurerm_resource_group.a3.location
  resource_group_name = azurerm_resource_group.a3.name

  grafana_major_version = 13

  api_key_enabled                   = false
  public_network_access_enabled     = true
  deterministic_outbound_ip_enabled = false

  azure_monitor_workspace_integrations {
    resource_id = azurerm_monitor_workspace.a3.id
  }

  identity {
    type = "SystemAssigned"
  }

  tags = {
    project     = "a3.store"
    environment = "portfolio"
  }
}

resource "azurerm_role_assignment" "grafana_monitoring_reader" {
  scope                = azurerm_monitor_workspace.a3.id
  role_definition_name = "Monitoring Reader"

  principal_id = azurerm_dashboard_grafana.a3.identity[0].principal_id

  skip_service_principal_aad_check = true
}
