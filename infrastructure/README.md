# DevOps E2E Infrastructure as Code

This directory contains Bicep templates and deployment scripts for provisioning Azure infrastructure following Cloud Adoption Framework (CAF) and Well-Architected Framework best practices.

## Architecture

The infrastructure includes:

- **Azure Kubernetes Service (AKS)** - Container orchestration platform
- **Azure Container Registry (ACR)** - Private container registry
- **Azure Key Vault** - Secrets and certificate management
- **Virtual Network** - Network isolation and security
- **Application Insights** - Application monitoring and telemetry
- **Log Analytics Workspace** - Centralized logging

## Prerequisites

- Azure CLI (2.50+)
- PowerShell 7+ or Bash
- kubectl
- jq (for Bash script)
- Azure subscription with Owner/Contributor role
- Managed Identity with Contributor role (already created: `iac`)

## Configuration

All configuration is managed in `bicep/main.parameters.json`:

```json
{
  "environment": "dev",
  "location": "eastus2",
  "workloadName": "devopse2e",
  "managedIdentityClientId": "7534bc0a-7e2f-4ec9-9216-aaa159cf187c",
  "managedIdentityPrincipalId": "b4600ff9-e02b-41b3-b8b8-bb0e4ada9f8a"
}
```

### Subscription Details

- **Subscription ID**: `fc8d795a-57cf-4416-acb5-c4de5461a4bc`
- **Tenant ID**: `f74b1450-e46a-41df-abee-ebf3621bfd85`
- **Resource Group**: `authortalk-rg` (East US 2)
- **Managed Identity**: `iac` (Contributor role)

## Deployment Methods

### Option 1: PowerShell Script (Windows/Cross-platform)

```powershell
cd infrastructure
./deploy.ps1
```

### Option 2: Bash Script (Linux/macOS/WSL)

```bash
cd infrastructure
chmod +x deploy.sh
./deploy.sh
```

### Option 3: Manual Deployment

```bash
# Set subscription
az account set --subscription fc8d795a-57cf-4416-acb5-c4de5461a4bc

# Validate template
az deployment group validate \
  --resource-group authortalk-rg \
  --template-file bicep/main.bicep \
  --parameters bicep/main.parameters.json

# What-If analysis
az deployment group what-if \
  --resource-group authortalk-rg \
  --template-file bicep/main.bicep \
  --parameters bicep/main.parameters.json

# Deploy
az deployment group create \
  --name devops-e2e-deployment \
  --resource-group authortalk-rg \
  --template-file bicep/main.bicep \
  --parameters bicep/main.parameters.json
```

### Option 4: GitHub Actions

Trigger the `Deploy Azure Infrastructure` workflow from GitHub Actions.

## Resource Naming Convention

Following CAF naming conventions:

- **ACR**: `acrdevopse2edev` (lowercase, no hyphens)
- **AKS**: `aks-devopse2e-dev`
- **Key Vault**: `kv-devopse2e-dev`
- **VNet**: `vnet-devopse2e-dev`
- **Log Analytics**: `law-devopse2e-dev`
- **App Insights**: `appi-devopse2e-dev`

## GitHub Secrets Configuration

After deployment, configure these secrets in your GitHub repository:

### Required Secrets

1. **AZURE_SUBSCRIPTION_ID** - Your Azure subscription ID
2. **AZURE_TENANT_ID** - Your Azure AD tenant ID
3. **AZURE_RESOURCE_GROUP** - Resource group name (`authortalk-rg`)
4. **AZURE_ACR_NAME** - ACR name from deployment output
5. **AZURE_ACR_LOGIN_SERVER** - ACR login server from deployment output
6. **AZURE_ACR_USERNAME** - ACR username (from Key Vault or deployment script)
7. **AZURE_ACR_PASSWORD** - ACR password (from Key Vault or deployment script)
8. **AZURE_AKS_CLUSTER_NAME** - AKS cluster name from deployment output
9. **AZURE_KEY_VAULT_NAME** - Key Vault name from deployment output
10. **AZURE_APP_INSIGHTS_KEY** - Application Insights instrumentation key

### Setting Secrets via CLI

```bash
# Using GitHub CLI
gh secret set AZURE_SUBSCRIPTION_ID --body "fc8d795a-57cf-4416-acb5-c4de5461a4bc"
gh secret set AZURE_TENANT_ID --body "f74b1450-e46a-41df-abee-ebf3621bfd85"
gh secret set AZURE_RESOURCE_GROUP --body "authortalk-rg"

# Get deployment outputs and set remaining secrets
ACR_NAME=$(az deployment group show --name <deployment-name> --resource-group authortalk-rg --query properties.outputs.acrName.value -o tsv)
gh secret set AZURE_ACR_NAME --body "$ACR_NAME"

# Repeat for other secrets
```

## Federated Identity Configuration

The infrastructure uses Workload Identity Federation for GitHub Actions authentication.

### Setup Federated Credentials

```bash
# Create federated credential for main branch
az identity federated-credential create \
  --name "github-main-federated" \
  --identity-name "iac" \
  --resource-group "authortalk-rg" \
  --issuer "https://token.actions.githubusercontent.com" \
  --subject "repo:timothywarner-org/devops-e2e:ref:refs/heads/main" \
  --audiences "api://AzureADTokenExchange"

# Create federated credential for pull requests
az identity federated-credential create \
  --name "github-pr-federated" \
  --identity-name "iac" \
  --resource-group "authortalk-rg" \
  --issuer "https://token.actions.githubusercontent.com" \
  --subject "repo:timothywarner-org/devops-e2e:pull_request" \
  --audiences "api://AzureADTokenExchange"
```

## Infrastructure Modules

### 1. Networking (`modules/networking.bicep`)
- Virtual Network with subnets
- Network Security Groups
- Service endpoints for ACR, Key Vault, Storage

### 2. Azure Container Registry (`modules/acr.bicep`)
- Standard SKU with admin user enabled
- RBAC assignments for managed identity
- Vulnerability scanning (when Premium)

### 3. Azure Kubernetes Service (`modules/aks.bicep`)
- System-assigned managed identity
- Auto-scaling enabled (1-5 nodes)
- Azure CNI networking
- Azure Policy and monitoring add-ons
- RBAC integration

### 4. Key Vault (`modules/keyVault.bicep`)
- RBAC authorization enabled
- Soft delete and purge protection
- Diagnostic logging
- Managed identity access

### 5. Application Insights (`modules/appInsights.bicep`)
- Connected to Log Analytics workspace
- 90-day retention
- Daily cap at 1GB

## Post-Deployment Steps

1. **Verify Resources**
   ```bash
   az resource list --resource-group authortalk-rg --output table
   ```

2. **Configure kubectl**
   ```bash
   az aks get-credentials --resource-group authortalk-rg --name <aks-name>
   kubectl get nodes
   ```

3. **Test ACR Access**
   ```bash
   az acr login --name <acr-name>
   docker pull mcr.microsoft.com/hello-world
   docker tag mcr.microsoft.com/hello-world <acr-name>.azurecr.io/hello-world
   docker push <acr-name>.azurecr.io/hello-world
   ```

4. **Verify Key Vault Access**
   ```bash
   az keyvault secret list --vault-name <kv-name>
   ```

## Cost Management

Estimated monthly costs (East US 2):

- AKS (2 D2s_v3 nodes): ~$140
- ACR Standard: ~$5
- Key Vault: ~$1
- Virtual Network: Free
- Application Insights: ~$2 (1GB/day)
- Log Analytics: ~$2 (1GB/day)

**Total**: ~$150/month

### Cost Optimization

- Use auto-scaling to reduce AKS costs during low usage
- Enable AKS start/stop for dev environments
- Use ACR Basic tier for development
- Set retention policies on logs

## Troubleshooting

### Deployment Fails

```bash
# Check deployment status
az deployment group show --name <deployment-name> --resource-group authortalk-rg

# View deployment logs
az deployment operation group list --name <deployment-name> --resource-group authortalk-rg
```

### RBAC Issues

```bash
# Verify managed identity has Contributor role
az role assignment list --assignee b4600ff9-e02b-41b3-b8b8-bb0e4ada9f8a --all

# Add role if missing
az role assignment create \
  --assignee b4600ff9-e02b-41b3-b8b8-bb0e4ada9f8a \
  --role Contributor \
  --scope /subscriptions/fc8d795a-57cf-4416-acb5-c4de5461a4bc
```

### AKS Connection Issues

```bash
# Re-fetch credentials
az aks get-credentials --resource-group authortalk-rg --name <aks-name> --overwrite-existing

# Verify connection
kubectl cluster-info
kubectl get namespaces
```

## Clean Up

To delete all infrastructure:

```bash
# WARNING: This will delete all resources!
az deployment group delete --name <deployment-name> --resource-group authortalk-rg

# Or delete individual resources
az aks delete --name <aks-name> --resource-group authortalk-rg --yes
az acr delete --name <acr-name> --yes
az keyvault delete --name <kv-name> --yes
```

## Security Best Practices

✅ Managed identity for authentication (no passwords)
✅ RBAC enabled on all resources
✅ Network security groups configured
✅ Soft delete and purge protection on Key Vault
✅ Diagnostic logging enabled
✅ Private endpoints capability (configure as needed)
✅ Azure Policy compliance monitoring
✅ Vulnerability scanning on ACR

## Additional Resources

- [Azure Bicep Documentation](https://docs.microsoft.com/azure/azure-resource-manager/bicep/)
- [AKS Best Practices](https://docs.microsoft.com/azure/aks/best-practices)
- [Azure Well-Architected Framework](https://docs.microsoft.com/azure/architecture/framework/)
- [Cloud Adoption Framework](https://docs.microsoft.com/azure/cloud-adoption-framework/)