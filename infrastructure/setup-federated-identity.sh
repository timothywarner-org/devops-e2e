#!/bin/bash

# Setup Federated Identity for GitHub Actions
# This enables passwordless authentication using Workload Identity Federation

set -e

# Configuration
SUBSCRIPTION_ID="fc8d795a-57cf-4416-acb5-c4de5461a4bc"
TENANT_ID="f74b1450-e46a-41df-abee-ebf3621bfd85"
RESOURCE_GROUP="authortalk-rg"
IDENTITY_NAME="iac"
GITHUB_REPO="timothywarner-org/devops-e2e"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Setting up Federated Identity for GitHub Actions ===${NC}"
echo ""

# Set subscription
echo -e "${YELLOW}Setting Azure subscription...${NC}"
az account set --subscription "$SUBSCRIPTION_ID"

# Create federated credential for main branch
echo -e "${YELLOW}Creating federated credential for main branch...${NC}"
az identity federated-credential create \
  --name "github-main-federated" \
  --identity-name "$IDENTITY_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --issuer "https://token.actions.githubusercontent.com" \
  --subject "repo:${GITHUB_REPO}:ref:refs/heads/main" \
  --audiences "api://AzureADTokenExchange" 2>/dev/null || echo "Credential already exists"

echo -e "${GREEN}✓ Main branch credential created${NC}"

# Create federated credential for pull requests
echo -e "${YELLOW}Creating federated credential for pull requests...${NC}"
az identity federated-credential create \
  --name "github-pr-federated" \
  --identity-name "$IDENTITY_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --issuer "https://token.actions.githubusercontent.com" \
  --subject "repo:${GITHUB_REPO}:pull_request" \
  --audiences "api://AzureADTokenExchange" 2>/dev/null || echo "Credential already exists"

echo -e "${GREEN}✓ Pull request credential created${NC}"

# Create federated credential for develop branch
echo -e "${YELLOW}Creating federated credential for develop branch...${NC}"
az identity federated-credential create \
  --name "github-develop-federated" \
  --identity-name "$IDENTITY_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --issuer "https://token.actions.githubusercontent.com" \
  --subject "repo:${GITHUB_REPO}:ref:refs/heads/develop" \
  --audiences "api://AzureADTokenExchange" 2>/dev/null || echo "Credential already exists"

echo -e "${GREEN}✓ Develop branch credential created${NC}"
echo ""

# List all federated credentials
echo -e "${YELLOW}Federated credentials configured:${NC}"
az identity federated-credential list \
  --identity-name "$IDENTITY_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query "[].{Name:name, Subject:subject}" \
  --output table

echo ""
echo -e "${GREEN}=== Federated Identity Setup Complete ===${NC}"
echo ""
echo "GitHub Actions can now authenticate to Azure without secrets!"
echo ""
echo "Required GitHub Secrets (non-sensitive):"
echo "  - AZURE_CLIENT_ID: 7534bc0a-7e2f-4ec9-9216-aaa159cf187c"
echo "  - AZURE_TENANT_ID: $TENANT_ID"
echo "  - AZURE_SUBSCRIPTION_ID: $SUBSCRIPTION_ID"
echo ""