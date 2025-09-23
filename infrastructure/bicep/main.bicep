// Main Bicep template for DevOps E2E Teaching Infrastructure
// Following Azure Well-Architected Framework and Cloud Adoption Framework (CAF) naming conventions

targetScope = 'resourceGroup'

@description('The environment name (dev, staging, prod)')
@allowed([
  'dev'
  'staging'
  'prod'
])
param environment string = 'dev'

@description('The location for all resources')
param location string = resourceGroup().location

@description('The workload name used for resource naming')
param workloadName string = 'devopse2e'

@description('Tags to apply to all resources')
param tags object = {
  Environment: environment
  Workload: 'DevOps-E2E-Teaching'
  ManagedBy: 'Bicep-IaC'
  CostCenter: 'Education'
  Owner: 'tim@techtrainertim.com'
}

@description('Managed Identity Client ID for GitHub Actions')
param managedIdentityClientId string

@description('Managed Identity Principal ID for RBAC assignments')
param managedIdentityPrincipalId string

@description('Enable Azure Monitor and Application Insights')
param enableMonitoring bool = true

@description('Enable diagnostic logging')
param enableDiagnostics bool = true

@description('AKS node count')
@minValue(1)
@maxValue(10)
param aksNodeCount int = 2

@description('AKS node VM size')
param aksNodeVmSize string = 'Standard_D2s_v3'

@description('Enable AKS auto-scaling')
param enableAksAutoScaling bool = true

@description('AKS minimum node count for auto-scaling')
param aksMinNodeCount int = 1

@description('AKS maximum node count for auto-scaling')
param aksMaxNodeCount int = 5

// Variables for CAF-compliant naming
var namingPrefix = 'devops-${workloadName}-${environment}'
var acrName = toLower(replace('acr${workloadName}${environment}', '-', ''))
var aksName = 'aks-${workloadName}-${environment}'
var kvName = 'kv-${workloadName}-${environment}'
var lawName = 'law-${workloadName}-${environment}'
var appInsightsName = 'appi-${workloadName}-${environment}'
var vnetName = 'vnet-${workloadName}-${environment}'

// Networking Module
module networking './modules/networking.bicep' = {
  name: 'networking-deployment'
  params: {
    vnetName: vnetName
    location: location
    tags: tags
    addressPrefix: '10.0.0.0/16'
    aksSubnetPrefix: '10.0.1.0/24'
    appGatewaySubnetPrefix: '10.0.2.0/24'
  }
}

// Container Registry Module
module acr './modules/acr.bicep' = {
  name: 'acr-deployment'
  params: {
    acrName: acrName
    location: location
    tags: tags
    sku: 'Basic'
    adminUserEnabled: true
    managedIdentityPrincipalId: managedIdentityPrincipalId
  }
}

// Log Analytics Workspace for monitoring
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = if (enableMonitoring) {
  name: lawName
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
    workspaceCapping: {
      dailyQuotaGb: 1
    }
  }
}

// Application Insights Module
module appInsights './modules/appInsights.bicep' = if (enableMonitoring) {
  name: 'appinsights-deployment'
  params: {
    appInsightsName: appInsightsName
    location: location
    tags: tags
    workspaceResourceId: enableMonitoring ? logAnalyticsWorkspace.id : ''
  }
}

// Key Vault Module
module keyVault './modules/keyVault.bicep' = {
  name: 'keyvault-deployment'
  params: {
    keyVaultName: kvName
    location: location
    tags: tags
    tenantId: subscription().tenantId
    managedIdentityPrincipalId: managedIdentityPrincipalId
    enableDiagnostics: enableDiagnostics
    logAnalyticsWorkspaceId: enableMonitoring ? logAnalyticsWorkspace.id : ''
  }
}

// AKS Cluster Module
module aks './modules/aks.bicep' = {
  name: 'aks-deployment'
  params: {
    clusterName: aksName
    location: location
    tags: tags
    nodeCount: aksNodeCount
    nodeVmSize: aksNodeVmSize
    enableAutoScaling: enableAksAutoScaling
    minCount: aksMinNodeCount
    maxCount: aksMaxNodeCount
    subnetId: networking.outputs.aksSubnetId
    logAnalyticsWorkspaceId: enableMonitoring ? logAnalyticsWorkspace.id : ''
    acrId: acr.outputs.acrId
    managedIdentityPrincipalId: managedIdentityPrincipalId
  }
}

// Assign AcrPull role to AKS kubelet identity for ACR access
resource aksAcrPullRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, acrName, aksName, 'AcrPull')
  scope: resourceGroup()
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d')
    principalId: aks.outputs.kubeletIdentityObjectId
    principalType: 'ServicePrincipal'
  }
  dependsOn: [
    aks
    acr
  ]
}

// Outputs for GitHub Actions and deployment
output acrName string = acr.outputs.acrName
output acrLoginServer string = acr.outputs.acrLoginServer
output aksClusterName string = aks.outputs.clusterName
output aksFqdn string = aks.outputs.fqdn
output keyVaultName string = keyVault.outputs.keyVaultName
output keyVaultUri string = keyVault.outputs.vaultUri
output appInsightsInstrumentationKey string = enableMonitoring ? appInsights.outputs.instrumentationKey : ''
output appInsightsConnectionString string = enableMonitoring ? appInsights.outputs.connectionString : ''
output vnetId string = networking.outputs.vnetId
output aksSubnetId string = networking.outputs.aksSubnetId
output resourceGroupName string = resourceGroup().name
output location string = location