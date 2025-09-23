# DevOps E2E - End-to-End DevOps Learning Platform

🚀 **A comprehensive teaching repository demonstrating modern DevOps practices and cloud deployment strategies.**

[![CI/CD Pipeline](https://github.com/timothywarner-org/devops-e2e/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/timothywarner-org/devops-e2e/actions/workflows/ci-cd.yml)
[![CodeQL](https://github.com/timothywarner-org/devops-e2e/actions/workflows/codeql.yml/badge.svg)](https://github.com/timothywarner-org/devops-e2e/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

## 📚 Overview

DevOps E2E is a production-ready Node.js/Express web application designed as a teaching tool for modern DevOps practices, CI/CD pipelines, and cloud deployment strategies. This repository demonstrates real-world implementation patterns that you can apply in your own projects.

### 🎯 Learning Objectives

- **🔄 CI/CD Mastery**: Implement automated testing and deployment with GitHub Actions
- **📦 Container Orchestration**: Master Docker and Kubernetes deployment strategies  
- **🔒 Security Implementation**: Integrate security scanning and vulnerability management
- **☁️ Cloud Deployment**: Deploy applications to Azure Kubernetes Service (AKS)
- **📊 Monitoring & Observability**: Implement health checks and application monitoring
- **🧪 Testing Excellence**: Write comprehensive unit and integration tests

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Frontend Layer                         │
│                   (HTML5, CSS3, JavaScript)                    │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│                        Application Layer                        │
│                     (Node.js + Express.js)                     │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│                         Testing Layer                          │
│                     (Jest + Supertest)                         │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│                        Container Layer                         │
│                    (Docker Multi-stage)                        │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│                       Deployment Layer                         │
│                  (Azure AKS + GitHub Actions)                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 8.x or higher  
- **Docker** (for containerization)
- **kubectl** (for Kubernetes deployment)
- **Azure CLI** (for cloud deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/timothywarner-org/devops-e2e.git
   cd devops-e2e
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the application**
   ```bash
   npm start
   ```

4. **Development with hot reload**
   ```bash
   npm run dev
   ```

5. **Visit the application**
   - 🌐 **Web UI**: http://localhost:3000
   - 💚 **Health Check**: http://localhost:3000/health
   - 📊 **API Status**: http://localhost:3000/api/status

## 🧪 Testing

This project includes comprehensive testing strategies:

### Unit Tests
```bash
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage
```

### Linting
```bash
npm run lint               # Check code quality
npm run lint:fix           # Auto-fix linting issues
```

### Test Coverage
- **Statements**: 95%+
- **Branches**: 90%+
- **Functions**: 95%+
- **Lines**: 95%+

## 🐳 Docker

### Build and Run Locally

```bash
# Build the Docker image
npm run docker:build

# Run the container
npm run docker:run

# Or use Docker Compose (if available)
docker-compose up -d
```

### Multi-stage Build

The Dockerfile uses a multi-stage build approach:
- **Builder Stage**: Installs dependencies
- **Development Stage**: For local development with hot reload
- **Production Stage**: Optimized for production deployment

## ☁️ Azure Deployment

### Prerequisites

1. **Azure Subscription**
2. **Azure Kubernetes Service (AKS) Cluster**
3. **Container Registry** (GitHub Packages or Azure CR)

### Deployment Pipeline

The GitHub Actions workflow automatically:

1. **🧪 Tests** - Runs unit tests and linting
2. **🔒 Security** - Performs CodeQL analysis and dependency audit  
3. **🐳 Build** - Creates and pushes Docker images
4. **🚀 Deploy** - Deploys to AKS (dev/prod environments)

### Manual Deployment

```bash
# Login to Azure
az login

# Get AKS credentials
az aks get-credentials --resource-group myResourceGroup --name myAKSCluster

# Deploy to development
kubectl apply -f deployment/azure/k8s-manifests/dev/

# Deploy to production  
kubectl apply -f deployment/azure/k8s-manifests/prod/
```

## 🔒 Security Features

### Automated Security Scanning
- **🔍 CodeQL Analysis**: GitHub's semantic code analysis
- **📦 Dependency Scanning**: Automated vulnerability detection
- **🔐 Container Scanning**: Docker image security analysis

### Runtime Security
- **🛡️ Helmet.js**: Security headers
- **🔒 CORS**: Cross-origin resource sharing protection
- **👤 Non-root User**: Container runs as non-privileged user

## 📊 Monitoring & Observability

### Health Checks
- **Liveness Probe**: `/health` endpoint
- **Readiness Probe**: Application startup verification
- **Custom Metrics**: Performance and business metrics

### Logging
- **Structured Logging**: JSON format with correlation IDs
- **Request Tracing**: Morgan middleware for HTTP requests
- **Error Tracking**: Comprehensive error handling

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

1. **🚦 CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)
   - Code quality checks
   - Automated testing  
   - Security scanning
   - Docker image building
   - AKS deployment

2. **🔒 Security Scan** (`.github/workflows/codeql.yml`)
   - Weekly security analysis
   - Vulnerability detection
   - Compliance reporting

### Dependabot Configuration

Automated dependency updates with:
- **📦 npm packages** - Weekly updates
- **🔧 GitHub Actions** - Version pinning
- **🐳 Docker images** - Base image updates

## 📁 Project Structure

```
devops-e2e/
├── 📁 src/                          # Application source code
│   ├── 📁 controllers/              # Route controllers
│   ├── 📁 routes/                   # Route definitions  
│   └── 📄 server.js                 # Main application entry
├── 📁 tests/                        # Test files
│   ├── 📄 setup.js                  # Test configuration
│   ├── 📄 server.test.js            # Integration tests
│   ├── 📄 controllers.test.js       # Unit tests
│   └── 📄 routes.test.js            # Route tests
├── 📁 public/                       # Static assets
│   ├── 📁 css/                      # Stylesheets
│   ├── 📁 js/                       # Client-side JavaScript
│   └── 📁 images/                   # Static images
├── 📁 deployment/                   # Deployment configurations
│   └── 📁 azure/                    # Azure-specific configs
│       └── 📁 k8s-manifests/        # Kubernetes manifests
├── 📁 .github/                      # GitHub configurations
│   ├── 📁 workflows/                # GitHub Actions
│   └── 📄 dependabot.yml           # Dependency management
├── 📄 Dockerfile                    # Container definition
├── 📄 docker-compose.yml           # Local orchestration
├── 📄 package.json                  # Node.js configuration
├── 📄 jest.config.js               # Test configuration
└── 📄 .eslintrc.js                 # Code quality rules
```

## 🛠️ Technology Stack

### Core Technologies
- **⚡ Runtime**: Node.js 18+
- **🚀 Framework**: Express.js
- **🧪 Testing**: Jest + Supertest
- **📏 Linting**: ESLint
- **🐳 Containerization**: Docker

### DevOps Tools
- **🔄 CI/CD**: GitHub Actions
- **☁️ Cloud**: Microsoft Azure (AKS)
- **📦 Registry**: GitHub Packages
- **🔒 Security**: CodeQL, Dependabot
- **📊 Monitoring**: Azure Monitor

### Frontend
- **🎨 Styling**: Modern CSS3 with Flexbox/Grid
- **📱 Responsive**: Mobile-first design
- **♿ Accessibility**: WCAG 2.1 compliant
- **⚡ Performance**: Optimized assets

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. **🍴 Fork** the repository
2. **🌿 Create** a feature branch
3. **✅ Add** tests for new functionality
4. **🧪 Run** the test suite
5. **📝 Submit** a pull request

## 📚 Documentation

- **📖 [API Documentation](docs/api.md)** - REST API reference
- **🐳 [Docker Guide](docs/docker.md)** - Container usage guide  
- **☁️ [Deployment Guide](docs/deployment.md)** - Cloud deployment instructions
- **🔒 [Security Guide](docs/security.md)** - Security best practices
- **🧪 [Testing Guide](docs/testing.md)** - Testing strategies

## 📈 Roadmap

### Phase 1 (Current)
- ✅ Basic Node.js/Express application
- ✅ Comprehensive test suite
- ✅ Docker containerization
- ✅ GitHub Actions CI/CD
- ✅ Azure AKS deployment

### Phase 2 (Planned)
- 🔲 Database integration (PostgreSQL)
- 🔲 Redis caching layer
- 🔲 Grafana dashboards
- 🔲 Terraform infrastructure
- 🔲 Service mesh (Istio)

### Phase 3 (Future)
- 🔲 Multi-cloud deployment
- 🔲 Advanced monitoring
- 🔲 Performance optimization
- 🔲 Chaos engineering

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Timothy Warner Organization** - [GitHub Profile](https://github.com/timothywarner-org)

## 🙏 Acknowledgments

- **Node.js Community** for the excellent ecosystem
- **GitHub** for CI/CD and security features
- **Microsoft Azure** for cloud infrastructure
- **Open Source Contributors** worldwide

## 📞 Support

- **📧 Email**: devops-e2e@example.com
- **💬 Discussions**: [GitHub Discussions](https://github.com/timothywarner-org/devops-e2e/discussions)
- **🐛 Issues**: [GitHub Issues](https://github.com/timothywarner-org/devops-e2e/issues)
- **📚 Documentation**: [Project Wiki](https://github.com/timothywarner-org/devops-e2e/wiki)

---

⭐ **Star this repository if it helped you learn DevOps practices!**
