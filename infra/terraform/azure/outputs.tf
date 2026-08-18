output "resource_group_name" {
  value = azurerm_resource_group.a3.name
}

output "resource_group_id" {
  value = azurerm_resource_group.a3.id
}

output "aks_name" {
  value = azurerm_kubernetes_cluster.a3.name
}

output "aks_id" {
  value = azurerm_kubernetes_cluster.a3.id
}

output "acr_name" {
  value = azurerm_container_registry.a3.name
}

output "acr_id" {
  value = azurerm_container_registry.a3.id
}

output "acr_login_server" {
  value = azurerm_container_registry.a3.login_server
}

output "monitor_workspace_id" {
  value = azurerm_monitor_workspace.a3.id
}

output "grafana_id" {
  value = azurerm_dashboard_grafana.a3.id
}

output "grafana_endpoint" {
  value = azurerm_dashboard_grafana.a3.endpoint
}
