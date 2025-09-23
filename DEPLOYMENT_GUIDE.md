# DevOps E2E Deployment Guide

Complete step-by-step guide to deploy the DevOps E2E teaching application to Azure.

## Overview

This guide covers:
1. Infrastructure provisioning with Bicep
2. GitHub Actions configuration
3. Application deployment to AKS
4. Verification and testing

## Prerequisites

✅ Azure CLI installed and configured
✅ GitHub CLI (gh) installed and authenticated
✅ kubectl installed
✅ Docker Desktop (for local testing)
✅ PowerShell 7+ or Bash
✅ Access to Azure subscription (Owner/Contributor role)

## Azure Environment

- **Subscription ID**: `fc8d795a-57cf-4416-acb5-c4de5461a4bc`
- **Tenant ID**: `f74b1450-e46a-41df-abee-ebf3621bfd85`
- **Resource Group**: `authortalk-rg` (East US 2)
- **Managed Identity**: `iac` (already created with Contributor role)

## Step 1: Deploy Azure Infrastructure

### Option A: PowerShell (Recommended for Windows)

```powershell
cd infrastructure
./deploy.ps1
```

### Option B: Bash (Linux/macOS/WSL)

```bash
cd infrastructure
chmod +x deploy.sh
./deploy.sh
```

### What Gets Deployed

The Bicep templates will create:

- ✅ **Virtual Network** (`vnet-devopse2e-dev`)
  - AKS subnet (10.0.1.0/24)
  - App Gateway subnet (10.0.2.0/24)
  - Network Security Groups

- ✅ **Azure Container Registry** (`acrdevopse2edev`)
  - Standard SKU
  - Admin user enabled
  - RBAC configured for managed identity

- ✅ **Azure Kubernetes Service** (`aks-devopse2e-dev`)
  - 2 nodes (Standard_D2s_v3)
  - Auto-scaling (1-3 nodes)
  - Azure CNI networking
  - Integrated with ACR
  - Monitoring enabled

- ✅ **Key Vault** (`kv-devopse2e-dev`)
  - RBAC authorization
  - Soft delete enabled
  - Managed identity access

- ✅ **Log Analytics Workspace** (`law-devopse2e-dev`)
  - 30-day retention
  - Connected to AKS and App Insights

- ✅ **Application Insights** (`appi-devopse2e-dev`)
  - Connected to Log Analytics
  - 90-day retention

### Deployment Outputs

After deployment completes, save these values:

```
ACR Name:                acrdevopse2edev
ACR Login Server:        acrdevopse2edev.azurecr.io
AKS Cluster Name:        aks-devopse2e-dev
Key Vault Name:          kv-devopse2e-dev
App Insights Key:        <instrumentation-key>
```

## Step 2: Configure Federated Identity

Enable passwordless authentication for GitHub Actions:

```bash
cd infrastructure
chmod +x setup-federated-identity.sh
./setup-federated-identity.sh
```

This creates federated credentials for:
- `main` branch
- `develop` branch
- Pull requests

## Step 3: Configure GitHub Secrets

### Automated Method (Recommended)

```bash
cd infrastructure
chmod +x configure-github-secrets.sh
./configure-github-secrets.sh
```

### Manual Method

Using GitHub CLI:

```bash
# Static secrets
gh secret set AZURE_CLIENT_ID --body "7534bc0a-7e2f-4ec9-9216-aaa159cf187c"
gh secret set AZURE_TENANT_ID --body "f74b1450-e46a-41df-abee-ebf3621bfd85"
gh secret set AZURE_SUBSCRIPTION_ID --body "fc8d795a-57cf-4416-acb5-c4de5461a4bc"
gh secret set AZURE_RESOURCE_GROUP --body "authortalk-rg"

# Get deployment outputs (replace <deployment-name> with actual name)
ACR_NAME=$(az deployment group show --name <deployment-name> \
  --resource-group authortalk-rg \
  --query properties.outputs.acrName.value -o tsv)

# Set ACR secrets
gh secret set AZURE_ACR_NAME --body "$ACR_NAME"
# ... continue for other secrets
```

### Required Secrets

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| AZURE_CLIENT_ID | Managed identity client ID | `7534bc0a-7e2f-4ec9-9216-aaa159cf187c` |
| AZURE_TENANT_ID | Azure AD tenant ID | `f74b1450-e46a-41df-abee-ebf3621bfd85` |
| AZURE_SUBSCRIPTION_ID | Azure subscription ID | `fc8d795a-57cf-4416-acb5-c4de5461a4bc` |
| AZURE_RESOURCE_GROUP | Resource group name | `authortalk-rg` |
| AZURE_ACR_NAME | ACR name | From deployment output |
| AZURE_ACR_LOGIN_SERVER | ACR login server | From deployment output |
| AZURE_ACR_USERNAME | ACR username | `az acr credential show` |
| AZURE_ACR_PASSWORD | ACR password | `az acr credential show` |
| AZURE_AKS_CLUSTER_NAME | AKS cluster name | From deployment output |
| AZURE_KEY_VAULT_NAME | Key Vault name | From deployment output |
| AZURE_APP_INSIGHTS_KEY | App Insights key | From deployment output |

## Step 4: Verify Infrastructure

### Check Azure Resources

```bash
# List all resources
az resource list --resource-group authortalk-rg --output table

# Check AKS
az aks show --resource-group authortalk-rg --name aks-devopse2e-dev

# Check ACR
az acr show --name acrdevopse2edev

# Check Key Vault
az keyvault show --name kv-devopse2e-dev
```

### Configure kubectl

```bash
# Get AKS credentials
az aks get-credentials \
  --resource-group authortalk-rg \
  --name aks-devopse2e-dev \
  --overwrite-existing

# Verify connection
kubectl cluster-info
kubectl get nodes
kubectl get namespaces
```

## Step 5: Test CI/CD Pipeline

### Method 1: Manual Trigger

1. Go to GitHub Actions: https://github.com/timothywarner-org/devops-e2e/actions
2. Select "CI/CD Pipeline" workflow
3. Click "Run workflow"
4. Select branch: `main`
5. Click "Run workflow"

### Method 2: Push to Main

```bash
# Make a small change
echo "# Test" >> README.md

# Commit and push
git add README.md
git commit -m "Test CI/CD pipeline"
git push origin main
```

### Expected Pipeline Flow

1. ✅ **Test & Lint** - Runs ESLint and Jest tests
2. ✅ **Build** - Builds Docker image and pushes to ACR
3. ✅ **Deploy to Staging** - Deploys to staging environment (if develop branch)
4. ✅ **Deploy to Production** - Deploys to production (if main branch)

## Step 6: Deploy Application to AKS

### Apply Kubernetes Manifests

```bash
# Create namespace
kubectl create namespace devops-e2e

# Apply all manifests
kubectl apply -f k8s/

# Verify deployment
kubectl get all -n devops-e2e
```

### Check Deployment Status

```bash
# Watch pods
kubectl get pods -n devops-e2e --watch

# Check deployment
kubectl get deployment devops-e2e -n devops-e2e

# Check service
kubectl get service devops-e2e -n devops-e2e

# Get external IP
kubectl get service devops-e2e -n devops-e2e -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

## Step 7: Verify Application

### Access Application

```bash
# Get service external IP
EXTERNAL_IP=$(kubectl get service devops-e2e -n devops-e2e \
  -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

echo "Application URL: http://$EXTERNAL_IP"

# Test health endpoint
curl http://$EXTERNAL_IP/health

# Test API status
curl http://$EXTERNAL_IP/api/status
```

### Check Logs

```bash
# View application logs
kubectl logs -n devops-e2e -l app=devops-e2e --tail=100

# Stream logs
kubectl logs -n devops-e2e -l app=devops-e2e -f
```

### Monitor with Azure

```bash
# View AKS insights
az aks show \
  --resource-group authortalk-rg \
  --name aks-devopse2e-dev \
  --query "addonProfiles.omsagent.enabled"

# Get Application Insights key
az deployment group show \
  --name <deployment-name> \
  --resource-group authortalk-rg \
  --query properties.outputs.appInsightsInstrumentationKey.value -o tsv
```

## Step 8: Scale Application

### Manual Scaling

```bash
# Scale to 3 replicas
kubectl scale deployment devops-e2e --replicas=3 -n devops-e2e

# Verify
kubectl get pods -n devops-e2e
```

### Auto-scaling (HPA)

```bash
# Apply HPA manifest
kubectl apply -f k8s/hpa.yaml

# Check HPA status
kubectl get hpa -n devops-e2e

# Describe HPA
kubectl describe hpa devops-e2e -n devops-e2e
```

## Troubleshooting

### Deployment Fails

```bash
# Check deployment events
kubectl describe deployment devops-e2e -n devops-e2e

# Check pod status
kubectl describe pod <pod-name> -n devops-e2e

# View events
kubectl get events -n devops-e2e --sort-by='.lastTimestamp'
```

### Image Pull Errors

```bash
# Verify ACR integration
az aks check-acr \
  --name aks-devopse2e-dev \
  --resource-group authortalk-rg \
  --acr acrdevopse2edev.azurecr.io

# Check service principal permissions
kubectl get secret -n devops-e2e
```

### GitHub Actions Failures

1. Check workflow logs in GitHub Actions UI
2. Verify all secrets are configured: `gh secret list`
3. Check federated credentials: `az identity federated-credential list --identity-name iac --resource-group authortalk-rg`
4. Validate Bicep templates: `az deployment group validate ...`

### Connection Issues

```bash
# Reset kubectl context
az aks get-credentials \
  --resource-group authortalk-rg \
  --name aks-devopse2e-dev \
  --overwrite-existing

# Test connectivity
kubectl cluster-info
kubectl api-resources
```

## Clean Up

### Delete Application

```bash
kubectl delete namespace devops-e2e
```

### Delete Infrastructure

⚠️ **WARNING**: This will delete all Azure resources!

```bash
# Delete specific deployment
az deployment group delete \
  --name <deployment-name> \
  --resource-group authortalk-rg

# Or delete individual resources
az aks delete --name aks-devopse2e-dev --resource-group authortalk-rg --yes
az acr delete --name acrdevopse2edev --yes
az keyvault delete --name kv-devopse2e-dev --yes
az network vnet delete --name vnet-devopse2e-dev --resource-group authortalk-rg
```

## Cost Estimation

Monthly costs (East US 2):

- AKS (2 D2s_v3 nodes): ~$140
- ACR Standard: ~$5
- Key Vault: ~$1
- Application Insights: ~$2
- Log Analytics: ~$2
- **Total**: ~$150/month

### Cost Optimization Tips

1. Use AKS auto-shutdown for dev environments
2. Scale down when not in use: `kubectl scale deployment devops-e2e --replicas=0`
3. Use spot instances for dev/test
4. Enable auto-scaling with lower min replicas

## Next Steps

✅ Set up custom domain and SSL certificate
✅ Configure Application Insights dashboards
✅ Set up alerting rules
✅ Implement blue/green deployments
✅ Add Prometheus/Grafana monitoring
✅ Configure backup and disaster recovery

## Support Resources

- [Infrastructure README](infrastructure/README.md)
- [GitHub Secrets Guide](infrastructure/GITHUB_SECRETS.md)
- [Azure Bicep Docs](https://docs.microsoft.com/azure/azure-resource-manager/bicep/)
- [AKS Best Practices](https://docs.microsoft.com/azure/aks/best-practices)
- [GitHub Issues](https://github.com/timothywarner-org/devops-e2e/issues)