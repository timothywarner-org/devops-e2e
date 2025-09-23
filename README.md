# DevOps E2E - Complete CI/CD Teaching Application

[![CI/CD Pipeline](https://github.com/your-org/devops-e2e/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/your-org/devops-e2e/actions/workflows/ci-cd.yml)
[![CodeQL](https://github.com/your-org/devops-e2e/actions/workflows/codeql.yml/badge.svg)](https://github.com/your-org/devops-e2e/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive end-to-end DevOps teaching application demonstrating modern CI/CD practices, containerization, and cloud deployment strategies using Node.js, Docker, GitHub Actions, and Azure Kubernetes Service.

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Development](#development)
- [Testing](#testing)
- [Docker](#docker)
- [CI/CD Pipeline](#cicd-pipeline)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Monitoring](#monitoring)
- [Contributing](#contributing)

## Features

### Application Features
- **Express.js Web Application** with MVC architecture
- **RESTful API** with health checks and metrics endpoints
- **EJS Templates** for server-side rendering
- **Security Headers** via Helmet.js
- **Rate Limiting** for API protection
- **Compression** for optimized performance

### DevOps Features
- **Automated CI/CD** with GitHub Actions
- **Docker Containerization** with multi-stage builds
- **Kubernetes Deployment** to Azure AKS
- **Automated Testing** with Jest (unit & integration)
- **Code Quality** with ESLint
- **Security Scanning** with CodeQL
- **Dependency Management** with Dependabot
- **Infrastructure as Code** with Kubernetes manifests

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│   GitHub Repo   │────▶│GitHub Actions│────▶│  Container  │
│                 │     │   CI/CD      │     │  Registry   │
└─────────────────┘     └──────────────┘     └─────────────┘
                               │                     │
                               ▼                     ▼
                        ┌──────────────┐     ┌─────────────┐
                        │   CodeQL     │     │  Azure AKS  │
                        │   Scanning   │     │  Production │
                        └──────────────┘     └─────────────┘
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- Docker Desktop
- Git
- Azure CLI (for deployment)
- kubectl (for Kubernetes management)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/devops-e2e.git
cd devops-e2e
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the application:
```bash
npm start
# or for development with hot-reload
npm run dev
```

5. Open browser to http://localhost:3000

## Development

### Project Structure
```
devops-e2e/
├── src/
│   ├── app.js              # Main application entry
│   └── controllers/        # Route controllers
├── views/                  # EJS templates
├── public/                 # Static assets
│   ├── css/
│   └── js/
├── tests/
│   ├── unit/              # Unit tests
│   └── integration/       # Integration tests
├── .github/
│   └── workflows/         # GitHub Actions workflows
├── k8s/                   # Kubernetes manifests
├── docker-compose.yml     # Docker compose config
└── package.json           # Node.js dependencies
```

### Available Scripts

```bash
npm start           # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run all tests with coverage
npm run test:watch # Run tests in watch mode
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
```

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run with watch mode
npm run test:watch
```

### Test Coverage
Tests aim for 80%+ coverage across:
- Lines
- Statements
- Functions
- Branches

Coverage reports are generated in `coverage/` directory.

## Docker

### Building the Image
```bash
# Build locally
docker build -t devops-e2e .

# Run container
docker run -p 3000:3000 devops-e2e
```

### Docker Compose
```bash
# Start all services
docker-compose up

# Start with development configuration
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Stop all services
docker-compose down
```

## CI/CD Pipeline

### GitHub Actions Workflows

1. **CI/CD Pipeline** (`ci-cd.yml`)
   - Triggered on push to main/develop
   - Runs tests and linting
   - Builds and pushes Docker image
   - Deploys to staging/production

2. **Security Scanning** (`codeql.yml`)
   - Runs CodeQL analysis
   - Scans for vulnerabilities
   - Reports security alerts

3. **Dependency Updates** (`dependabot.yml`)
   - Weekly dependency checks
   - Automated pull requests
   - Grouped updates

### Pipeline Stages

1. **Test & Lint**
   - Install dependencies
   - Run ESLint
   - Execute Jest tests
   - Generate coverage reports

2. **Build**
   - Multi-stage Docker build
   - Push to GitHub Container Registry
   - Tag with branch/version

3. **Deploy**
   - Staging deployment (develop branch)
   - Production deployment (main branch)
   - Smoke tests

## Deployment

### Azure Kubernetes Service (AKS)

#### Prerequisites
```bash
# Login to Azure
az login

# Set subscription
az account set --subscription <subscription-id>

# Get AKS credentials
az aks get-credentials --resource-group <rg-name> --name <cluster-name>
```

#### Deploy to AKS
```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Verify deployment
kubectl get pods -n devops-e2e
kubectl get services -n devops-e2e
```

#### Scaling
```bash
# Scale deployment
kubectl scale deployment devops-e2e --replicas=3 -n devops-e2e

# Enable autoscaling
kubectl autoscale deployment devops-e2e --min=2 --max=10 --cpu-percent=80 -n devops-e2e
```

## API Documentation

### Endpoints

#### Application Routes
- `GET /` - Home page
- `GET /about` - About page
- `GET /contact` - Contact page

#### API Routes
- `GET /api/status` - Application status
- `GET /api/metrics` - System metrics
- `POST /api/feedback` - Submit feedback

#### Health Checks
- `GET /health` - Overall health status
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

### Example API Calls

```bash
# Check status
curl http://localhost:3000/api/status

# Get metrics
curl http://localhost:3000/api/metrics

# Submit feedback
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"message":"Great app!","rating":5}'
```

## Security

### Security Features
- Helmet.js for security headers
- Rate limiting on API endpoints
- Input validation and sanitization
- CodeQL security scanning
- Dependabot for dependency updates
- Non-root Docker user
- Secret management via environment variables

### Security Best Practices
1. Never commit secrets to repository
2. Use Azure Key Vault for production secrets
3. Enable RBAC in Kubernetes
4. Regular security audits
5. Keep dependencies updated

## Monitoring

### Application Metrics
- Request count and response times
- Memory usage and heap statistics
- CPU utilization
- Error rates

### Monitoring Stack (Optional)
- **Prometheus** - Metrics collection
- **Grafana** - Visualization
- **Azure Monitor** - Cloud monitoring
- **Application Insights** - APM

### Setting Up Monitoring
```bash
# Start monitoring stack
docker-compose up prometheus grafana

# Access dashboards
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001 (admin/admin)
```

## Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards
- Follow ESLint configuration
- Write tests for new features
- Maintain 80%+ test coverage
- Update documentation
- Follow conventional commits

### Testing Checklist
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] ESLint passes
- [ ] Docker build succeeds
- [ ] Documentation updated

## Learning Resources

### Tutorials
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Azure AKS Documentation](https://docs.microsoft.com/azure/aks/)

### Key Concepts Demonstrated
- Twelve-Factor App methodology
- Container orchestration
- GitOps principles
- Infrastructure as Code
- Continuous Integration/Deployment
- Security scanning and compliance
- Monitoring and observability

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions and support:
- Open an issue on GitHub
- Check existing documentation
- Review closed issues for solutions

---

**Built with teaching DevOps best practices in mind** 🚀
# Trigger CI/CD
