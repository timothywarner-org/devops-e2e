# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a comprehensive DevOps teaching repository demonstrating end-to-end CI/CD practices with Node.js/Express, containerization, and cloud deployment to Azure AKS.

## Essential Commands

### Development
- `npm install` - Install all dependencies
- `npm start` - Start the Express server (port 3000)
- `npm run dev` - Start development server with nodemon
- `npm test` - Run Jest unit tests
- `npm test -- --watch` - Run tests in watch mode
- `npm test -- path/to/test.js` - Run a specific test file
- `npm run lint` - Run ESLint for code quality checks
- `npm run lint:fix` - Auto-fix ESLint issues

### Docker
- `docker build -t devops-e2e .` - Build Docker image
- `docker run -p 3000:3000 devops-e2e` - Run container locally
- `docker-compose up` - Start with docker-compose (if configured)

### Infrastructure (Bicep/Azure)
- `cd infrastructure && ./deploy.ps1` - Deploy Azure infrastructure (PowerShell)
- `cd infrastructure && ./deploy.sh` - Deploy Azure infrastructure (Bash)
- `./setup-federated-identity.sh` - Configure federated identity for GitHub Actions
- `./configure-github-secrets.sh` - Auto-configure all GitHub secrets
- `az aks get-credentials --resource-group authortalk-rg --name <aks-name>` - Get AKS credentials
- `kubectl apply -f k8s/` - Deploy to Kubernetes

### CI/CD
- GitHub Actions workflows are in `.github/workflows/`
- Main CI/CD pipeline: `.github/workflows/ci-cd.yml`
- Infrastructure deployment: `.github/workflows/deploy-infrastructure.yml`
- Dependabot config: `.github/dependabot.yml`
- CodeQL security scanning: `.github/workflows/codeql.yml`

## Architecture

### Application Structure
- **Express App**: Three routes (/, /about, /contact) demonstrating MVC pattern
- **Views**: EJS templates in `views/` directory
- **Static Assets**: Public files in `public/` directory
- **Configuration**: Environment variables via `.env` (local) and Azure Key Vault (production)

### Testing Strategy
- Unit tests: `tests/unit/` - Jest tests for individual functions
- Integration tests: `tests/integration/` - API endpoint testing with supertest
- Test coverage reports: Generated in `coverage/` directory

### Deployment Architecture
- **Development**: Local Node.js with nodemon
- **Staging**: Docker containers in Azure Container Registry
- **Production**: Azure Kubernetes Service (AKS) with Kubernetes manifests
- Infrastructure definitions in `infrastructure/bicep/` directory
- Kubernetes manifests in `k8s/` directory

### Azure Infrastructure Details
- **Subscription ID**: `fc8d795a-57cf-4416-acb5-c4de5461a4bc`
- **Tenant ID**: `f74b1450-e46a-41df-abee-ebf3621bfd85`
- **Resource Group**: `authortalk-rg` (East US 2)
- **Managed Identity**: `iac` (Contributor role, Client ID: `7534bc0a-7e2f-4ec9-9216-aaa159cf187c`)
- Infrastructure deployed via Bicep templates following CAF naming conventions

## Key Integration Points

### GitHub Actions Workflow
The CI/CD pipeline performs:
1. Code checkout and dependency installation
2. Linting and code quality checks
3. Unit and integration test execution
4. Docker image build and push to ACR
5. Deployment to AKS using Helm

### Security Scanning
- CodeQL analysis for JavaScript vulnerabilities
- Dependabot for dependency updates
- Container image scanning in ACR

### Environment Configuration
- Development: `.env` file (not committed)
- CI/CD: GitHub Secrets for sensitive values
- Production: Azure Key Vault integration

## Working with This Codebase

When implementing features:
1. Always create tests alongside new functionality
2. Ensure Docker build succeeds before committing
3. Update Helm values for configuration changes
4. Verify GitHub Actions workflows pass locally using `act` if available

When debugging CI/CD issues:
- Check `.github/workflows/` for pipeline definitions
- Review Azure resources in `.azure/` directory
- Validate Kubernetes manifests before deployment