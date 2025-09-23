# DevOps E2E Architecture Documentation

## System Overview

This teaching repository demonstrates a complete DevOps pipeline from development to production deployment.

## Architecture Diagram

```mermaid
graph TB
    subgraph "Development"
        DEV[Developer] --> GIT[Git Repository]
        GIT --> PR[Pull Request]
    end

    subgraph "CI/CD Pipeline"
        PR --> GHA[GitHub Actions]
        GHA --> TEST[Test Suite]
        TEST --> LINT[Code Quality]
        LINT --> SEC[Security Scan]
        SEC --> BUILD[Docker Build]
        BUILD --> GHCR[GitHub Container Registry]
    end

    subgraph "Azure Cloud"
        GHCR --> AKS[Azure Kubernetes Service]
        AKS --> POD1[Pod 1]
        AKS --> POD2[Pod 2]
        AKS --> POD3[Pod 3]

        subgraph "Supporting Services"
            KV[Key Vault]
            AI[App Insights]
            LA[Log Analytics]
        end

        POD1 --> KV
        POD2 --> KV
        POD3 --> KV
        POD1 --> AI
        POD2 --> AI
        POD3 --> AI
        AI --> LA
    end

    subgraph "Monitoring"
        LA --> DASH[Azure Dashboard]
        GHCR --> VULN[Vulnerability Scanning]
        AKS --> HPA[Auto-scaling]
    end
```

## CI/CD Flow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub
    participant GHA as GitHub Actions
    participant GHCR as Container Registry
    participant AKS as Azure AKS
    participant APP as Application

    Dev->>GH: Push Code
    GH->>GHA: Trigger Workflow
    GHA->>GHA: Run Tests
    GHA->>GHA: Lint Code
    GHA->>GHA: Security Scan
    alt Tests Pass
        GHA->>GHCR: Build & Push Image
        GHCR->>GHA: Image Published
        GHA->>AKS: Deploy to Kubernetes
        AKS->>APP: Start Containers
        APP->>GHA: Health Check OK
        GHA->>Dev: Deployment Success
    else Tests Fail
        GHA->>Dev: Pipeline Failed
    end
```

## Deployment Strategy

```mermaid
graph LR
    subgraph "Rolling Deployment"
        OLD1[Old Version] --> NEW1[New Version]
        OLD2[Old Version] --> NEW2[New Version]
        OLD3[Old Version] --> NEW3[New Version]
    end

    LB[Load Balancer] --> OLD1
    LB --> OLD2
    LB --> OLD3
    LB -.-> NEW1
    LB -.-> NEW2
    LB -.-> NEW3
```

## Infrastructure as Code

```mermaid
graph TD
    subgraph "Bicep Templates"
        MAIN[main.bicep] --> NET[networking.bicep]
        MAIN --> AKS_MOD[aks.bicep]
        MAIN --> KV_MOD[keyVault.bicep]
        MAIN --> AI_MOD[appInsights.bicep]
    end

    subgraph "Azure Resources"
        NET --> VNET[Virtual Network]
        NET --> NSG[Network Security Groups]
        AKS_MOD --> CLUSTER[AKS Cluster]
        KV_MOD --> VAULT[Key Vault]
        AI_MOD --> INSIGHTS[Application Insights]
    end
```

## Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        CODE[Code Security] --> SCAN[CodeQL Scanning]
        DEPS[Dependencies] --> DBOT[Dependabot]
        CONT[Container] --> GHCR_SCAN[Image Scanning]
        INFRA[Infrastructure] --> RBAC[Azure RBAC]
        RBAC --> MSI[Managed Identity]
        RUNTIME[Runtime] --> POL[Pod Security Policies]
        POL --> NETPOL[Network Policies]
    end
```

## Data Flow

```mermaid
flowchart LR
    USER[User Request] --> INGRESS[Ingress]
    INGRESS --> SVC[Service]
    SVC --> POD[Pod]
    POD --> APP[Application]
    APP --> DB[(Database)]
    APP --> CACHE[(Redis Cache)]
    APP --> KV[Key Vault]
    APP --> LOGS[Logs]
    LOGS --> AI[App Insights]
    AI --> LA[Log Analytics]
```

## Monitoring and Observability

```mermaid
graph TD
    subgraph "Metrics Collection"
        APP[Application] --> METRICS[Prometheus Metrics]
        APP --> LOGS[Application Logs]
        APP --> TRACE[Distributed Tracing]
    end

    subgraph "Analysis"
        METRICS --> GRAFANA[Grafana]
        LOGS --> LA[Log Analytics]
        TRACE --> AI[Application Insights]
    end

    subgraph "Alerting"
        GRAFANA --> ALERT[Alert Manager]
        LA --> ALERT
        AI --> ALERT
        ALERT --> TEAMS[MS Teams]
        ALERT --> EMAIL[Email]
    end
```

## Cost Optimization

```mermaid
pie title Azure Resource Costs (Monthly Estimate)
    "AKS Cluster" : 60
    "Container Registry" : 5
    "Key Vault" : 5
    "Application Insights" : 10
    "Log Analytics" : 15
    "Network" : 5
```

## Learning Path

```mermaid
journey
    title DevOps Learning Journey
    section Foundation
      Git Basics: 5: Dev
      Docker Fundamentals: 4: Dev
      Kubernetes Concepts: 3: Dev
    section CI/CD
      GitHub Actions: 4: Dev
      Testing Strategies: 4: Dev
      Security Scanning: 3: Dev
    section Cloud
      Azure Basics: 3: Dev
      IaC with Bicep: 3: Dev
      AKS Deployment: 2: Dev
    section Advanced
      Monitoring: 3: Dev
      Scaling: 2: Dev
      GitOps: 2: Dev
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Application | Node.js/Express | Web Framework |
| Testing | Jest | Unit/Integration Tests |
| Containerization | Docker | Application Packaging |
| Registry | GitHub Packages | Container Storage |
| Orchestration | Kubernetes | Container Management |
| Cloud | Azure AKS | Managed Kubernetes |
| IaC | Bicep | Infrastructure Templates |
| CI/CD | GitHub Actions | Automation Pipeline |
| Security | CodeQL, Dependabot | Vulnerability Scanning |
| Monitoring | Application Insights | Observability |

## Key Decisions

1. **GitHub Packages over ACR**: Simpler authentication, free tier, integrated with GitHub
2. **Bicep over ARM/Terraform**: Native Azure tooling, better IntelliSense
3. **Managed Identity**: Passwordless authentication for Azure resources
4. **Multi-stage Docker builds**: Smaller production images
5. **GitHub Actions**: Native CI/CD, no additional tools needed

## Next Steps

- [ ] Implement Istio service mesh
- [ ] Add Prometheus/Grafana stack
- [ ] Implement GitOps with Flux/ArgoCD
- [ ] Add chaos engineering tests
- [ ] Implement blue-green deployments