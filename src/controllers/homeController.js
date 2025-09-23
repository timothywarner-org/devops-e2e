/**
 * Home Controller
 * Handles home page logic and data
 */

const path = require('path');

/**
 * Render the home page
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getHomePage = (req, res) => {
  try {
    // In a real application, you might fetch data from a database here
    const pageData = {
      title: 'DevOps E2E - Home',
      message: 'Welcome to our DevOps teaching platform!',
      features: [
        'Node.js & Express.js',
        'Jest Unit Testing',
        'Docker Containerization',
        'GitHub Actions CI/CD',
        'Azure AKS Deployment',
        'Security Scanning',
        'Dependency Management'
      ],
      timestamp: new Date().toISOString()
    };

    // Send JSON response for API clients, HTML for browsers
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      if (typeof res.json !== 'function') {
        throw new Error('Response object is invalid');
      }
      res.json(pageData);
    } else {
      if (typeof res.sendFile !== 'function') {
        throw new Error('Response object is invalid');
      }
      res.sendFile(path.join(__dirname, '../../public/index.html'));
    }
  } catch (error) {
    console.error('Error in home controller:', error);
    if (res && typeof res.status === 'function' && typeof res.json === 'function') {
      res.status(500).json({ error: 'Failed to load home page' });
    }
  }
};

module.exports = {
  getHomePage
};