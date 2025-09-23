#!/bin/bash

# DevOps E2E Infrastructure Deployment Script
# This script deploys Azure infrastructure using Bicep templates

set -e

# Configuration
SUBSCRIPTION_ID="fc8d795a-57cf-4416-acb5-c4de5461a4bc"
TENANT_ID="f74b1450-e46a-41df-abee-ebf3621bfd85"
RESOURCE_GROUP="authortalk-rg"
LOCATION="eastus2"
DEPLOYMENT_NAME="devops-e2e-$(date +%Y%m%d-%H%M%S)"
BICEP_FILE="bicep/main.bicep"
PARAMETERS_FILE="bicep/main.parameters.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== DevOps E2E Infrastructure Deployment ===${NC}"
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}Error: Azure CLI is not installed${NC}"
    exit 1
fi

# Set subscription
echo -e "${YELLOW}Setting Azure subscription...${NC}"
az account set --subscription "$SUBSCRIPTION_ID"

# Verify subscription
CURRENT_SUB=$(az account show --query id -o tsv)
if [ "$CURRENT_SUB" != "$SUBSCRIPTION_ID" ]; then
    echo -e "${RED}Error: Failed to set subscription${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Subscription set to: $SUBSCRIPTION_ID${NC}"
echo ""

# Validate Bicep template
echo -e "${YELLOW}Validating Bicep template...${NC}"
az deployment group validate \
    --resource-group "$RESOURCE_GROUP" \
    --template-file "$BICEP_FILE" \
    --parameters "$PARAMETERS_FILE" \
    --no-prompt

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Bicep template validation successful${NC}"
else
    echo -e "${RED}✗ Bicep template validation failed${NC}"
    exit 1
fi

echo ""

# What-If analysis
echo -e "${YELLOW}Running What-If analysis...${NC}"
az deployment group what-if \
    --resource-group "$RESOURCE_GROUP" \
    --template-file "$BICEP_FILE" \
    --parameters "$PARAMETERS_FILE" \
    --no-prompt

echo ""
read -p "Do you want to proceed with deployment? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled${NC}"
    exit 0
fi

# Deploy infrastructure
echo -e "${YELLOW}Deploying infrastructure...${NC}"
az deployment group create \
    --name "$DEPLOYMENT_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --template-file "$BICEP_FILE" \
    --parameters "$PARAMETERS_FILE" \
    --verbose

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Deployment successful${NC}"
else
    echo -e "${RED}✗ Deployment failed${NC}"
    exit 1
fi

echo ""

# Get deployment outputs
echo -e "${YELLOW}Retrieving deployment outputs...${NC}"
OUTPUTS=$(az deployment group show \
    --name "$DEPLOYMENT_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --query properties.outputs -o json)

# Extract key values
ACR_NAME=$(echo $OUTPUTS | jq -r '.acrName.value')
ACR_LOGIN_SERVER=$(echo $OUTPUTS | jq -r '.acrLoginServer.value')
AKS_CLUSTER_NAME=$(echo $OUTPUTS | jq -r '.aksClusterName.value')
KEY_VAULT_NAME=$(echo $OUTPUTS | jq -r '.keyVaultName.value')
APP_INSIGHTS_KEY=$(echo $OUTPUTS | jq -r '.appInsightsInstrumentationKey.value')

echo ""
echo -e "${GREEN}=== Deployment Summary ===${NC}"
echo -e "Resource Group:          ${GREEN}$RESOURCE_GROUP${NC}"
echo -e "ACR Name:                ${GREEN}$ACR_NAME${NC}"
echo -e "ACR Login Server:        ${GREEN}$ACR_LOGIN_SERVER${NC}"
echo -e "AKS Cluster Name:        ${GREEN}$AKS_CLUSTER_NAME${NC}"
echo -e "Key Vault Name:          ${GREEN}$KEY_VAULT_NAME${NC}"
echo -e "App Insights Key:        ${GREEN}$APP_INSIGHTS_KEY${NC}"
echo ""

# Get AKS credentials
echo -e "${YELLOW}Getting AKS credentials...${NC}"
az aks get-credentials \
    --resource-group "$RESOURCE_GROUP" \
    --name "$AKS_CLUSTER_NAME" \
    --overwrite-existing

echo -e "${GREEN}✓ AKS credentials configured${NC}"
echo ""

# Get ACR credentials
echo -e "${YELLOW}Getting ACR credentials...${NC}"
ACR_USERNAME=$(az acr credential show --name "$ACR_NAME" --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name "$ACR_NAME" --query passwords[0].value -o tsv)

echo -e "${GREEN}✓ ACR credentials retrieved${NC}"
echo ""

# Store secrets in Key Vault
echo -e "${YELLOW}Storing secrets in Key Vault...${NC}"
az keyvault secret set \
    --vault-name "$KEY_VAULT_NAME" \
    --name "acr-username" \
    --value "$ACR_USERNAME" \
    --query name -o tsv

az keyvault secret set \
    --vault-name "$KEY_VAULT_NAME" \
    --name "acr-password" \
    --value "$ACR_PASSWORD" \
    --query name -o tsv

echo -e "${GREEN}✓ Secrets stored in Key Vault${NC}"
echo ""

# Create namespace in AKS
echo -e "${YELLOW}Creating Kubernetes namespace...${NC}"
kubectl create namespace devops-e2e --dry-run=client -o yaml | kubectl apply -f -

echo -e "${GREEN}✓ Namespace created${NC}"
echo ""

# Display GitHub Secrets to configure
echo -e "${GREEN}=== GitHub Secrets Configuration ===${NC}"
echo "Add the following secrets to your GitHub repository:"
echo ""
echo -e "AZURE_SUBSCRIPTION_ID:        ${YELLOW}$SUBSCRIPTION_ID${NC}"
echo -e "AZURE_TENANT_ID:              ${YELLOW}$TENANT_ID${NC}"
echo -e "AZURE_RESOURCE_GROUP:         ${YELLOW}$RESOURCE_GROUP${NC}"
echo -e "AZURE_ACR_NAME:               ${YELLOW}$ACR_NAME${NC}"
echo -e "AZURE_ACR_LOGIN_SERVER:       ${YELLOW}$ACR_LOGIN_SERVER${NC}"
echo -e "AZURE_ACR_USERNAME:           ${YELLOW}$ACR_USERNAME${NC}"
echo -e "AZURE_ACR_PASSWORD:           ${YELLOW}$ACR_PASSWORD${NC}"
echo -e "AZURE_AKS_CLUSTER_NAME:       ${YELLOW}$AKS_CLUSTER_NAME${NC}"
echo -e "AZURE_KEY_VAULT_NAME:         ${YELLOW}$KEY_VAULT_NAME${NC}"
echo -e "AZURE_APP_INSIGHTS_KEY:       ${YELLOW}$APP_INSIGHTS_KEY${NC}"
echo -e "MANAGED_IDENTITY_CLIENT_ID:   ${YELLOW}7534bc0a-7e2f-4ec9-9216-aaa159cf187c${NC}"
echo ""

echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo ""
echo "Next steps:"
echo "1. Configure GitHub secrets using the values above"
echo "2. Update GitHub Actions workflow to use federated credentials"
echo "3. Test deployment by pushing to your repository"
echo ""