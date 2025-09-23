# DevOps E2E Infrastructure Deployment Script (PowerShell)
# This script deploys Azure infrastructure using Bicep templates

param(
    [Parameter(Mandatory=$false)]
    [string]$SubscriptionId = "fc8d795a-57cf-4416-acb5-c4de5461a4bc",

    [Parameter(Mandatory=$false)]
    [string]$TenantId = "f74b1450-e46a-41df-abee-ebf3621bfd85",

    [Parameter(Mandatory=$false)]
    [string]$ResourceGroup = "authortalk-rg",

    [Parameter(Mandatory=$false)]
    [string]$Location = "eastus2"
)

$ErrorActionPreference = "Stop"

# Configuration
$DeploymentName = "devops-e2e-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$BicepFile = "bicep/main.bicep"
$ParametersFile = "bicep/main.parameters.json"

Write-Host "=== DevOps E2E Infrastructure Deployment ===" -ForegroundColor Green
Write-Host ""

# Check if Azure CLI is installed
if (!(Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Azure CLI is not installed" -ForegroundColor Red
    exit 1
}

# Set subscription
Write-Host "Setting Azure subscription..." -ForegroundColor Yellow
az account set --subscription $SubscriptionId

# Verify subscription
$CurrentSub = az account show --query id -o tsv
if ($CurrentSub -ne $SubscriptionId) {
    Write-Host "Error: Failed to set subscription" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Subscription set to: $SubscriptionId" -ForegroundColor Green
Write-Host ""

# Validate Bicep template
Write-Host "Validating Bicep template..." -ForegroundColor Yellow
az deployment group validate `
    --resource-group $ResourceGroup `
    --template-file $BicepFile `
    --parameters $ParametersFile `
    --no-prompt

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Bicep template validation successful" -ForegroundColor Green
} else {
    Write-Host "✗ Bicep template validation failed" -ForegroundColor Red
    exit 1
}

Write-Host ""

# What-If analysis
Write-Host "Running What-If analysis..." -ForegroundColor Yellow
az deployment group what-if `
    --resource-group $ResourceGroup `
    --template-file $BicepFile `
    --parameters $ParametersFile `
    --no-prompt

Write-Host ""
$response = Read-Host "Do you want to proceed with deployment? (y/n)"

if ($response -ne 'y' -and $response -ne 'Y') {
    Write-Host "Deployment cancelled" -ForegroundColor Yellow
    exit 0
}

# Deploy infrastructure
Write-Host "Deploying infrastructure..." -ForegroundColor Yellow
az deployment group create `
    --name $DeploymentName `
    --resource-group $ResourceGroup `
    --template-file $BicepFile `
    --parameters $ParametersFile `
    --verbose

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Deployment successful" -ForegroundColor Green
} else {
    Write-Host "✗ Deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Get deployment outputs
Write-Host "Retrieving deployment outputs..." -ForegroundColor Yellow
$outputs = az deployment group show `
    --name $DeploymentName `
    --resource-group $ResourceGroup `
    --query properties.outputs -o json | ConvertFrom-Json

# Extract key values
$acrName = $outputs.acrName.value
$acrLoginServer = $outputs.acrLoginServer.value
$aksClusterName = $outputs.aksClusterName.value
$keyVaultName = $outputs.keyVaultName.value
$appInsightsKey = $outputs.appInsightsInstrumentationKey.value

Write-Host ""
Write-Host "=== Deployment Summary ===" -ForegroundColor Green
Write-Host "Resource Group:          " -NoNewline; Write-Host $ResourceGroup -ForegroundColor Green
Write-Host "ACR Name:                " -NoNewline; Write-Host $acrName -ForegroundColor Green
Write-Host "ACR Login Server:        " -NoNewline; Write-Host $acrLoginServer -ForegroundColor Green
Write-Host "AKS Cluster Name:        " -NoNewline; Write-Host $aksClusterName -ForegroundColor Green
Write-Host "Key Vault Name:          " -NoNewline; Write-Host $keyVaultName -ForegroundColor Green
Write-Host "App Insights Key:        " -NoNewline; Write-Host $appInsightsKey -ForegroundColor Green
Write-Host ""

# Get AKS credentials
Write-Host "Getting AKS credentials..." -ForegroundColor Yellow
az aks get-credentials `
    --resource-group $ResourceGroup `
    --name $aksClusterName `
    --overwrite-existing

Write-Host "✓ AKS credentials configured" -ForegroundColor Green
Write-Host ""

# Get ACR credentials
Write-Host "Getting ACR credentials..." -ForegroundColor Yellow
$acrUsername = az acr credential show --name $acrName --query username -o tsv
$acrPassword = az acr credential show --name $acrName --query passwords[0].value -o tsv

Write-Host "✓ ACR credentials retrieved" -ForegroundColor Green
Write-Host ""

# Store secrets in Key Vault
Write-Host "Storing secrets in Key Vault..." -ForegroundColor Yellow
az keyvault secret set `
    --vault-name $keyVaultName `
    --name "acr-username" `
    --value $acrUsername `
    --query name -o tsv | Out-Null

az keyvault secret set `
    --vault-name $keyVaultName `
    --name "acr-password" `
    --value $acrPassword `
    --query name -o tsv | Out-Null

Write-Host "✓ Secrets stored in Key Vault" -ForegroundColor Green
Write-Host ""

# Create namespace in AKS
Write-Host "Creating Kubernetes namespace..." -ForegroundColor Yellow
kubectl create namespace devops-e2e --dry-run=client -o yaml | kubectl apply -f -

Write-Host "✓ Namespace created" -ForegroundColor Green
Write-Host ""

# Display GitHub Secrets to configure
Write-Host "=== GitHub Secrets Configuration ===" -ForegroundColor Green
Write-Host "Add the following secrets to your GitHub repository:"
Write-Host ""
Write-Host "AZURE_SUBSCRIPTION_ID:        " -NoNewline; Write-Host $SubscriptionId -ForegroundColor Yellow
Write-Host "AZURE_TENANT_ID:              " -NoNewline; Write-Host $TenantId -ForegroundColor Yellow
Write-Host "AZURE_RESOURCE_GROUP:         " -NoNewline; Write-Host $ResourceGroup -ForegroundColor Yellow
Write-Host "AZURE_ACR_NAME:               " -NoNewline; Write-Host $acrName -ForegroundColor Yellow
Write-Host "AZURE_ACR_LOGIN_SERVER:       " -NoNewline; Write-Host $acrLoginServer -ForegroundColor Yellow
Write-Host "AZURE_ACR_USERNAME:           " -NoNewline; Write-Host $acrUsername -ForegroundColor Yellow
Write-Host "AZURE_ACR_PASSWORD:           " -NoNewline; Write-Host $acrPassword -ForegroundColor Yellow
Write-Host "AZURE_AKS_CLUSTER_NAME:       " -NoNewline; Write-Host $aksClusterName -ForegroundColor Yellow
Write-Host "AZURE_KEY_VAULT_NAME:         " -NoNewline; Write-Host $keyVaultName -ForegroundColor Yellow
Write-Host "AZURE_APP_INSIGHTS_KEY:       " -NoNewline; Write-Host $appInsightsKey -ForegroundColor Yellow
Write-Host "MANAGED_IDENTITY_CLIENT_ID:   " -NoNewline; Write-Host "7534bc0a-7e2f-4ec9-9216-aaa159cf187c" -ForegroundColor Yellow
Write-Host ""

Write-Host "=== Deployment Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Configure GitHub secrets using the values above"
Write-Host "2. Update GitHub Actions workflow to use federated credentials"
Write-Host "3. Test deployment by pushing to your repository"
Write-Host ""