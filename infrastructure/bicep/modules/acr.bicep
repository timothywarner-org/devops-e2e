// Azure Container Registry Module

@description('The name of the container registry')
param acrName string

@description('The location for the container registry')
param location string

@description('Tags to apply to the container registry')
param tags object

@description('The SKU of the container registry')
@allowed([
  'Basic'
  'Standard'
  'Premium'
])
param sku string = 'Standard'

@description('Enable admin user')
param adminUserEnabled bool = true

@description('Managed Identity Principal ID for RBAC')
param managedIdentityPrincipalId string

@description('Enable zone redundancy (Premium SKU only)')
param enableZoneRedundancy bool = false

@description('Enable public network access')
param publicNetworkAccess bool = true

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  tags: tags
  sku: {
    name: sku
  }
  properties: {
    adminUserEnabled: adminUserEnabled
    publicNetworkAccess: publicNetworkAccess ? 'Enabled' : 'Disabled'

    // Policies
    policies: {
      quarantinePolicy: {
        status: 'enabled'
      }
      trustPolicy: {
        type: 'Notary'
        status: sku == 'Premium' ? 'enabled' : 'disabled'
      }
      retentionPolicy: {
        days: 30
        status: sku == 'Premium' ? 'enabled' : 'disabled'
      }
      exportPolicy: {
        status: 'enabled'
      }
    }

    // Encryption (Premium only)
    encryption: sku == 'Premium' ? {
      status: 'disabled'
    } : null

    // Data endpoint
    dataEndpointEnabled: false

    // Zone redundancy (Premium only)
    zoneRedundancy: (sku == 'Premium' && enableZoneRedundancy) ? 'Enabled' : 'Disabled'
  }
}

// Assign AcrPush role to managed identity for GitHub Actions
resource acrPushRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(containerRegistry.id, managedIdentityPrincipalId, 'AcrPush')
  scope: containerRegistry
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '8311e02e-361b-4f54-9a9d-38e2dc170ba7') // AcrPush role
    principalId: managedIdentityPrincipalId
    principalType: 'ServicePrincipal'
  }
}

// Assign AcrPull role to managed identity
resource acrPullRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(containerRegistry.id, managedIdentityPrincipalId, 'AcrPull')
  scope: containerRegistry
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d') // AcrPull role
    principalId: managedIdentityPrincipalId
    principalType: 'ServicePrincipal'
  }
}

// Enable vulnerability scanning (Defender for Containers)
resource defenderForContainers 'Microsoft.Security/pricings@2024-01-01' = if (sku == 'Premium') {
  name: 'ContainerRegistry'
  properties: {
    pricingTier: 'Standard'
  }
}

output acrId string = containerRegistry.id
output acrName string = containerRegistry.name
output acrLoginServer string = containerRegistry.properties.loginServer