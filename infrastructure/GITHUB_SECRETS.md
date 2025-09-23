# GitHub Secrets Configuration Guide

This document lists all GitHub secrets required for the CI/CD pipeline.

## Authentication Secrets (Federated Identity)

These are used for passwordless authentication via Workload Identity Federation:

### AZURE_CLIENT_ID
- **Value**: `7534bc0a-7e2f-4ec9-9216-aaa159cf187c`
- **Description**: Managed identity client ID
- **Type**: Non-sensitive (can be public)

### AZURE_TENANT_ID
- **Value**: `f74b1450-e46a-41df-abee-ebf3621bfd85`
- **Description**: Azure AD tenant ID
- **Type**: Non-sensitive (can be public)

### AZURE_SUBSCRIPTION_ID
- **Value**: `fc8d795a-57cf-4416-acb5-c4de5461a4bc`
- **Description**: Azure subscription ID
- **Type**: Non-sensitive (can be public)

## Azure Resource Secrets

These will be populated after infrastructure deployment:

### AZURE_RESOURCE_GROUP
- **Value**: `authortalk-rg`
- **Description**: Azure resource group name
- **How to get**: Already known

### AZURE_ACR_NAME
- **Value**: Get from deployment output
- **Description**: Azure Container Registry name
- **How to get**:
  ```bash
  az deployment group show --name <deployment-name> --resource-group authortalk-rg \
    --query properties.outputs.acrName.value -o tsv
  ```

### AZURE_ACR_LOGIN_SERVER
- **Value**: Get from deployment output
- **Description**: ACR login server URL
- **How to get**:
  ```bash
  az deployment group show --name <deployment-name> --resource-group authortalk-rg \
    --query properties.outputs.acrLoginServer.value -o tsv
  ```

### AZURE_ACR_USERNAME
- **Value**: Get from ACR credentials
- **Description**: ACR admin username
- **Type**: Sensitive
- **How to get**:
  ```bash
  az acr credential show --name <acr-name> --query username -o tsv
  ```

### AZURE_ACR_PASSWORD
- **Value**: Get from ACR credentials
- **Description**: ACR admin password
- **Type**: **HIGHLY SENSITIVE**
- **How to get**:
  ```bash
  az acr credential show --name <acr-name> --query passwords[0].value -o tsv
  ```

### AZURE_AKS_CLUSTER_NAME
- **Value**: Get from deployment output
- **Description**: AKS cluster name
- **How to get**:
  ```bash
  az deployment group show --name <deployment-name> --resource-group authortalk-rg \
    --query properties.outputs.aksClusterName.value -o tsv
  ```

### AZURE_KEY_VAULT_NAME
- **Value**: Get from deployment output
- **Description**: Azure Key Vault name
- **How to get**:
  ```bash
  az deployment group show --name <deployment-name> --resource-group authortalk-rg \
    --query properties.outputs.keyVaultName.value -o tsv
  ```

### AZURE_APP_INSIGHTS_KEY
- **Value**: Get from deployment output
- **Description**: Application Insights instrumentation key
- **Type**: Sensitive
- **How to get**:
  ```bash
  az deployment group show --name <deployment-name> --resource-group authortalk-rg \
    --query properties.outputs.appInsightsInstrumentationKey.value -o tsv
  ```

## Setting Secrets via GitHub CLI

### Automated Script

```bash
#!/bin/bash

REPO="timothywarner-org/devops-e2e"
DEPLOYMENT_NAME="<your-deployment-name>"

# Set static secrets
gh secret set AZURE_CLIENT_ID --body "7534bc0a-7e2f-4ec9-9216-aaa159cf187c" --repo $REPO
gh secret set AZURE_TENANT_ID --body "f74b1450-e46a-41df-abee-ebf3621bfd85" --repo $REPO
gh secret set AZURE_SUBSCRIPTION_ID --body "fc8d795a-57cf-4416-acb5-c4de5461a4bc" --repo $REPO
gh secret set AZURE_RESOURCE_GROUP --body "authortalk-rg" --repo $REPO

# Get deployment outputs
ACR_NAME=$(az deployment group show --name $DEPLOYMENT_NAME --resource-group authortalk-rg \
  --query properties.outputs.acrName.value -o tsv)

ACR_LOGIN_SERVER=$(az deployment group show --name $DEPLOYMENT_NAME --resource-group authortalk-rg \
  --query properties.outputs.acrLoginServer.value -o tsv)

AKS_CLUSTER_NAME=$(az deployment group show --name $DEPLOYMENT_NAME --resource-group authortalk-rg \
  --query properties.outputs.aksClusterName.value -o tsv)

KEY_VAULT_NAME=$(az deployment group show --name $DEPLOYMENT_NAME --resource-group authortalk-rg \
  --query properties.outputs.keyVaultName.value -o tsv)

APP_INSIGHTS_KEY=$(az deployment group show --name $DEPLOYMENT_NAME --resource-group authortalk-rg \
  --query properties.outputs.appInsightsInstrumentationKey.value -o tsv)

# Get ACR credentials
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value -o tsv)

# Set deployment secrets
gh secret set AZURE_ACR_NAME --body "$ACR_NAME" --repo $REPO
gh secret set AZURE_ACR_LOGIN_SERVER --body "$ACR_LOGIN_SERVER" --repo $REPO
gh secret set AZURE_ACR_USERNAME --body "$ACR_USERNAME" --repo $REPO
gh secret set AZURE_ACR_PASSWORD --body "$ACR_PASSWORD" --repo $REPO
gh secret set AZURE_AKS_CLUSTER_NAME --body "$AKS_CLUSTER_NAME" --repo $REPO
gh secret set AZURE_KEY_VAULT_NAME --body "$KEY_VAULT_NAME" --repo $REPO
gh secret set AZURE_APP_INSIGHTS_KEY --body "$APP_INSIGHTS_KEY" --repo $REPO

echo "All secrets configured successfully!"
```

### Manual Secret Setting

```bash
# Example: Set each secret individually
gh secret set AZURE_CLIENT_ID --body "7534bc0a-7e2f-4ec9-9216-aaa159cf187c"
gh secret set AZURE_TENANT_ID --body "f74b1450-e46a-41df-abee-ebf3621bfd85"
# ... continue for each secret
```

## Setting Secrets via GitHub Web UI

1. Go to repository: `https://github.com/timothywarner-org/devops-e2e`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter **Name** and **Value**
5. Click **Add secret**

## Verifying Secrets

List all configured secrets:

```bash
gh secret list --repo timothywarner-org/devops-e2e
```

## Security Best Practices

✅ **Federated Identity**: Use workload identity federation instead of service principal secrets
✅ **Least Privilege**: Managed identity has only Contributor role on subscription
✅ **Key Vault**: Store sensitive values in Azure Key Vault when possible
✅ **Rotation**: Regularly rotate ACR credentials
✅ **Audit**: Monitor secret access in GitHub audit logs

## Federated Identity Setup

Before using federated identity, run:

```bash
cd infrastructure
chmod +x setup-federated-identity.sh
./setup-federated-identity.sh
```

This creates federated credentials for:
- `main` branch
- `develop` branch
- Pull requests

## Troubleshooting

### Secret not working

1. Verify secret name matches exactly (case-sensitive)
2. Check secret value has no extra whitespace
3. Ensure federated credentials are configured
4. Verify managed identity has correct permissions

### Federated identity authentication fails

```bash
# Verify federated credentials
az identity federated-credential list \
  --identity-name iac \
  --resource-group authortalk-rg \
  --output table

# Check managed identity permissions
az role assignment list \
  --assignee 7534bc0a-7e2f-4ec9-9216-aaa159cf187c \
  --all
```

## Next Steps

1. ✅ Deploy infrastructure: `./infrastructure/deploy.ps1`
2. ✅ Setup federated identity: `./infrastructure/setup-federated-identity.sh`
3. ✅ Configure GitHub secrets using script above
4. ✅ Test workflow: Push to main branch
5. ✅ Monitor pipeline in GitHub Actions