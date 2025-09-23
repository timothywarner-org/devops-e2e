// Simplified Bicep template - AKS only (no ACR, using GitHub Container Registry)
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

@description('Managed Identity Principal ID for RBAC assignments')
param managedIdentityPrincipalId string

@description('Enable Azure Monitor and Application Insights')
param enableMonitoring bool = true

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
var aksName = 'aks-${workloadName}-${environment}'
var lawName = 'law-${workloadName}-${environment}'
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

// AKS Cluster Module (without ACR dependency)
module aks './modules/aks-noACR.bicep' = {
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
    managedIdentityPrincipalId: managedIdentityPrincipalId
  }
}

// Outputs for GitHub Actions and deployment
output aksClusterName string = aks.outputs.clusterName
output aksFqdn string = aks.outputs.fqdn
output vnetId string = networking.outputs.vnetId
output aksSubnetId string = networking.outputs.aksSubnetId
output resourceGroupName string = resourceGroup().name
output location string = location