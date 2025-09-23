// Application Insights Module

@description('The name of the Application Insights resource')
param appInsightsName string

@description('The location for Application Insights')
param location string

@description('Tags to apply to Application Insights')
param tags object

@description('Log Analytics workspace resource ID')
param workspaceResourceId string

@description('Application type')
@allowed([
  'web'
  'other'
])
param applicationType string = 'web'

@description('Retention period in days')
@minValue(30)
@maxValue(730)
param retentionInDays int = 90

@description('Daily data cap in GB')
param dailyDataCapInGB int = 1

@description('Disable IP masking')
param disableIpMasking bool = false

resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: applicationType
    WorkspaceResourceId: workspaceResourceId
    RetentionInDays: retentionInDays
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
    DisableIpMasking: disableIpMasking

    // Sampling configuration
    SamplingPercentage: 100

    // Data cap
    IngestionMode: 'LogAnalytics'
  }
}

// Daily cap
resource dailyCap 'Microsoft.Insights/components/currentbillingfeatures@2015-05-01' = {
  parent: applicationInsights
  name: 'basic'
  properties: {
    CurrentBillingFeatures: [
      'Basic'
    ]
    DataVolumeCap: {
      Cap: dailyDataCapInGB
    }
  }
}

// Continuous export (optional, for advanced scenarios)
// Uncomment if needed
// resource continuousExport 'Microsoft.Insights/components/exportConfiguration@2015-05-01' = {
//   parent: applicationInsights
//   name: 'export-to-storage'
//   properties: {
//     DestinationStorageSubscriptionId: subscription().subscriptionId
//     DestinationStorageLocationId: 'centralus'
//     DestinationAccountId: '/subscriptions/${subscription().subscriptionId}/resourceGroups/${resourceGroup().name}/providers/Microsoft.Storage/storageAccounts/yourstorageaccount'
//     IsEnabled: 'true'
//   }
// }

output instrumentationKey string = applicationInsights.properties.InstrumentationKey
output connectionString string = applicationInsights.properties.ConnectionString
output appInsightsId string = applicationInsights.id
output appInsightsName string = applicationInsights.name