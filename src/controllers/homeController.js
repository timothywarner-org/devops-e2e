const packageInfo = require('../../package.json');

exports.index = (req, res) => {
  res.render('index', {
    title: 'DevOps E2E Demo',
    version: packageInfo.version,
    features: [
      'Containerized Node.js Application',
      'CI/CD with GitHub Actions',
      'Azure Kubernetes Service Deployment',
      'Automated Testing with Jest',
      'Security Scanning with CodeQL',
      'Dependency Management with Dependabot'
    ]
  });
};

exports.about = (req, res) => {
  res.render('about', {
    title: 'About DevOps E2E',
    description: 'A comprehensive teaching application for DevOps principles',
    technologies: {
      backend: ['Node.js', 'Express.js', 'EJS Templates'],
      testing: ['Jest', 'Supertest', 'Coverage Reports'],
      containerization: ['Docker', 'Docker Compose'],
      ci_cd: ['GitHub Actions', 'Azure DevOps'],
      cloud: ['Azure Kubernetes Service', 'Azure Container Registry'],
      monitoring: ['Application Insights', 'Prometheus', 'Grafana']
    }
  });
};

exports.contact = (req, res) => {
  res.render('contact', {
    title: 'Contact & Resources',
    resources: [
      { name: 'GitHub Repository', url: 'https://github.com/your-org/devops-e2e' },
      { name: 'Documentation', url: '/docs' },
      { name: 'API Reference', url: '/api/docs' },
      { name: 'Azure Portal', url: 'https://portal.azure.com' }
    ]
  });
};
