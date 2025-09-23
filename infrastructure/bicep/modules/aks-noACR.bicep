// AKS Cluster Module (without ACR dependency)

@description('The name of the AKS cluster')
param clusterName string

@description('The location for the AKS cluster')
param location string

@description('Tags to apply to the AKS cluster')
param tags object

@description('The number of nodes for the AKS cluster')
@minValue(1)
@maxValue(10)
param nodeCount int = 2

@description('The VM size for the AKS nodes')
param nodeVmSize string = 'Standard_D2s_v3'

@description('Enable auto-scaling')
param enableAutoScaling bool = true

@description('Minimum node count for auto-scaling')
param minCount int = 1

@description('Maximum node count for auto-scaling')
param maxCount int = 5

@description('The subnet ID for AKS')
param subnetId string

@description('Log Analytics workspace ID')
param logAnalyticsWorkspaceId string = ''

@description('Managed Identity Principal ID')
param managedIdentityPrincipalId string

@description('Kubernetes version')
param kubernetesVersion string = '1.28'

@description('Enable Azure Policy for AKS')
param enableAzurePolicy bool = true

@description('Network plugin (azure or kubenet)')
@allowed([
  'azure'
  'kubenet'
])
param networkPlugin string = 'azure'

@description('Network policy (azure, calico, or cilium)')
@allowed([
  'azure'
  'calico'
  'cilium'
])
param networkPolicy string = 'azure'

@description('Enable HTTP application routing')
param enableHttpApplicationRouting bool = false

@description('Enable Azure RBAC for Kubernetes authorization')
param enableAzureRbac bool = true

resource aksCluster 'Microsoft.ContainerService/managedClusters@2024-02-01' = {
  name: clusterName
  location: location
  tags: tags
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    kubernetesVersion: kubernetesVersion
    dnsPrefix: clusterName
    enableRBAC: true

    agentPoolProfiles: [
      {
        name: 'agentpool'
        count: nodeCount
        vmSize: nodeVmSize
        osType: 'Linux'
        mode: 'System'
        enableAutoScaling: enableAutoScaling
        minCount: enableAutoScaling ? minCount : null
        maxCount: enableAutoScaling ? maxCount : null
        vnetSubnetID: subnetId
        maxPods: 30
        availabilityZones: [
          '1'
          '2'
          '3'
        ]
        upgradeSettings: {
          maxSurge: '33%'
        }
      }
    ]

    networkProfile: {
      networkPlugin: networkPlugin
      networkPolicy: networkPolicy
      loadBalancerSku: 'standard'
      serviceCidr: '10.2.0.0/16'
      dnsServiceIP: '10.2.0.10'
    }

    aadProfile: {
      managed: true
      enableAzureRBAC: enableAzureRbac
      adminGroupObjectIDs: []
    }

    addonProfiles: {
      httpApplicationRouting: {
        enabled: enableHttpApplicationRouting
      }
      omsagent: {
        enabled: !empty(logAnalyticsWorkspaceId)
        config: !empty(logAnalyticsWorkspaceId) ? {
          logAnalyticsWorkspaceResourceID: logAnalyticsWorkspaceId
        } : {}
      }
      azurepolicy: {
        enabled: enableAzurePolicy
        config: {
          version: 'v2'
        }
      }
      azureKeyvaultSecretsProvider: {
        enabled: true
        config: {
          enableSecretRotation: 'true'
          rotationPollInterval: '2m'
        }
      }
    }

    apiServerAccessProfile: {
      enablePrivateCluster: false
    }

    securityProfile: {
      defender: {
        securityMonitoring: {
          enabled: true
        }
      }
    }

    autoUpgradeProfile: {
      upgradeChannel: 'stable'
    }

    oidcIssuerProfile: {
      enabled: true
    }
  }
}

resource diagnosticSettings 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = if (!empty(logAnalyticsWorkspaceId)) {
  name: '${clusterName}-diagnostics'
  scope: aksCluster
  properties: {
    workspaceId: logAnalyticsWorkspaceId
    logs: [
      {
        category: 'kube-apiserver'
        enabled: true
      }
      {
        category: 'kube-controller-manager'
        enabled: true
      }
      {
        category: 'kube-scheduler'
        enabled: true
      }
      {
        category: 'kube-audit'
        enabled: true
      }
      {
        category: 'cluster-autoscaler'
        enabled: true
      }
    ]
    metrics: [
      {
        category: 'AllMetrics'
        enabled: true
      }
    ]
  }
}

output clusterName string = aksCluster.name
output clusterId string = aksCluster.id
output fqdn string = aksCluster.properties.fqdn
output kubeletIdentityObjectId string = aksCluster.properties.identityProfile.kubeletidentity.objectId
output oidcIssuerUrl string = aksCluster.properties.oidcIssuerProfile.issuerURL