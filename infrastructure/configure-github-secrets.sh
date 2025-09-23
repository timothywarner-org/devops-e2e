#!/bin/bash

# Automated GitHub Secrets Configuration Script
# Run this after infrastructure deployment to configure all GitHub secrets

set -e

# Configuration
REPO="timothywarner-org/devops-e2e"
SUBSCRIPTION_ID="fc8d795a-57cf-4416-acb5-c4de5461a4bc"
TENANT_ID="f74b1450-e46a-41df-abee-ebf3621bfd85"
RESOURCE_GROUP="authortalk-rg"
MANAGED_IDENTITY_CLIENT_ID="7534bc0a-7e2f-4ec9-9216-aaa159cf187c"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Configuring GitHub Secrets ===${NC}"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}Error: Not authenticated with GitHub CLI${NC}"
    echo "Run: gh auth login"
    exit 1
fi

# Check if Azure CLI is installed and authenticated
if ! command -v az &> /dev/null; then
    echo -e "${RED}Error: Azure CLI is not installed${NC}"
    exit 1
fi

# Get latest deployment name
echo -e "${YELLOW}Finding latest deployment...${NC}"
DEPLOYMENT_NAME=$(az deployment group list \
    --resource-group $RESOURCE_GROUP \
    --query "[?contains(name, 'devops-e2e')].name | sort(@) | [-1]" \
    -o tsv)

if [ -z "$DEPLOYMENT_NAME" ]; then
    echo -e "${RED}Error: No deployment found. Please deploy infrastructure first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Using deployment: $DEPLOYMENT_NAME${NC}"
echo ""

# Set static secrets
echo -e "${YELLOW}Setting static secrets...${NC}"

gh secret set AZURE_CLIENT_ID --body "$MANAGED_IDENTITY_CLIENT_ID" --repo $REPO
gh secret set AZURE_TENANT_ID --body "$TENANT_ID" --repo $REPO
gh secret set AZURE_SUBSCRIPTION_ID --body "$SUBSCRIPTION_ID" --repo $REPO
gh secret set AZURE_RESOURCE_GROUP --body "$RESOURCE_GROUP" --repo $REPO

echo -e "${GREEN}✓ Static secrets configured${NC}"
echo ""

# Get deployment outputs
echo -e "${YELLOW}Retrieving deployment outputs...${NC}"

ACR_NAME=$(az deployment group show \
    --name $DEPLOYMENT_NAME \
    --resource-group $RESOURCE_GROUP \
    --query properties.outputs.acrName.value -o tsv)

ACR_LOGIN_SERVER=$(az deployment group show \
    --name $DEPLOYMENT_NAME \
    --resource-group $RESOURCE_GROUP \
    --query properties.outputs.acrLoginServer.value -o tsv)

AKS_CLUSTER_NAME=$(az deployment group show \
    --name $DEPLOYMENT_NAME \
    --resource-group $RESOURCE_GROUP \
    --query properties.outputs.aksClusterName.value -o tsv)

KEY_VAULT_NAME=$(az deployment group show \
    --name $DEPLOYMENT_NAME \
    --resource-group $RESOURCE_GROUP \
    --query properties.outputs.keyVaultName.value -o tsv)

APP_INSIGHTS_KEY=$(az deployment group show \
    --name $DEPLOYMENT_NAME \
    --resource-group $RESOURCE_GROUP \
    --query properties.outputs.appInsightsInstrumentationKey.value -o tsv)

APP_INSIGHTS_CONN=$(az deployment group show \
    --name $DEPLOYMENT_NAME \
    --resource-group $RESOURCE_GROUP \
    --query properties.outputs.appInsightsConnectionString.value -o tsv)

echo -e "${GREEN}✓ Deployment outputs retrieved${NC}"
echo ""

# Get ACR credentials
echo -e "${YELLOW}Retrieving ACR credentials...${NC}"

ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value -o tsv)

echo -e "${GREEN}✓ ACR credentials retrieved${NC}"
echo ""

# Set all deployment secrets
echo -e "${YELLOW}Configuring deployment secrets...${NC}"

gh secret set AZURE_ACR_NAME --body "$ACR_NAME" --repo $REPO
gh secret set AZURE_ACR_LOGIN_SERVER --body "$ACR_LOGIN_SERVER" --repo $REPO
gh secret set AZURE_ACR_USERNAME --body "$ACR_USERNAME" --repo $REPO
gh secret set AZURE_ACR_PASSWORD --body "$ACR_PASSWORD" --repo $REPO
gh secret set AZURE_AKS_CLUSTER_NAME --body "$AKS_CLUSTER_NAME" --repo $REPO
gh secret set AZURE_KEY_VAULT_NAME --body "$KEY_VAULT_NAME" --repo $REPO
gh secret set AZURE_APP_INSIGHTS_KEY --body "$APP_INSIGHTS_KEY" --repo $REPO
gh secret set AZURE_APP_INSIGHTS_CONNECTION_STRING --body "$APP_INSIGHTS_CONN" --repo $REPO

echo -e "${GREEN}✓ Deployment secrets configured${NC}"
echo ""

# Display summary
echo -e "${GREEN}=== Configuration Summary ===${NC}"
echo ""
echo "Configured secrets for repository: $REPO"
echo ""
echo "Static Secrets:"
echo "  - AZURE_CLIENT_ID: $MANAGED_IDENTITY_CLIENT_ID"
echo "  - AZURE_TENANT_ID: $TENANT_ID"
echo "  - AZURE_SUBSCRIPTION_ID: $SUBSCRIPTION_ID"
echo "  - AZURE_RESOURCE_GROUP: $RESOURCE_GROUP"
echo ""
echo "Deployment Secrets:"
echo "  - AZURE_ACR_NAME: $ACR_NAME"
echo "  - AZURE_ACR_LOGIN_SERVER: $ACR_LOGIN_SERVER"
echo "  - AZURE_ACR_USERNAME: $ACR_USERNAME"
echo "  - AZURE_ACR_PASSWORD: ****"
echo "  - AZURE_AKS_CLUSTER_NAME: $AKS_CLUSTER_NAME"
echo "  - AZURE_KEY_VAULT_NAME: $KEY_VAULT_NAME"
echo "  - AZURE_APP_INSIGHTS_KEY: ****"
echo ""

# List all secrets
echo -e "${YELLOW}Verifying configured secrets...${NC}"
gh secret list --repo $REPO

echo ""
echo -e "${GREEN}=== GitHub Secrets Configuration Complete ===${NC}"
echo ""
echo "Next steps:"
echo "1. Setup federated identity: ./setup-federated-identity.sh"
echo "2. Test CI/CD pipeline by pushing to main branch"
echo "3. Monitor workflow at: https://github.com/$REPO/actions"
echo ""