/**
 * About Controller
 * Handles about page logic and data
 */

const path = require('path');

/**
 * Render the about page
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAboutPage = (req, res) => {
  try {
    const pageData = {
      title: 'DevOps E2E - About',
      description: 'Learn about our comprehensive DevOps teaching platform',
      mission: 'To provide hands-on learning experiences with modern DevOps practices and cloud technologies',
      technologies: {
        frontend: ['HTML5', 'CSS3', 'JavaScript'],
        backend: ['Node.js', 'Express.js'],
        testing: ['Jest', 'Supertest'],
        devops: ['Docker', 'GitHub Actions', 'Dependabot'],
        cloud: ['Azure', 'AKS (Azure Kubernetes Service)', 'Container Registry'],
        monitoring: ['Health checks', 'Logging', 'Error tracking']
      },
      learningObjectives: [
        'Understand CI/CD pipeline automation',
        'Master container orchestration',
        'Implement security best practices',
        'Deploy to cloud platforms',
        'Monitor application health',
        'Manage dependencies effectively'
      ],
      timestamp: new Date().toISOString()
    };

    // Send JSON response for API clients, HTML for browsers
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      res.json(pageData);
    } else {
      res.sendFile(path.join(__dirname, '../../public/about.html'));
    }
  } catch (error) {
    console.error('Error in about controller:', error);
    res.status(500).json({ error: 'Failed to load about page' });
  }
};

module.exports = {
  getAboutPage
};