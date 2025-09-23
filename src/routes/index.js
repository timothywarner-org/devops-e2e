/**
 * DevOps E2E - Route Definitions
 * Teaching example of Express.js routing patterns
 */

const express = require('express');
const router = express.Router();

// Route controllers
const homeController = require('../controllers/homeController');
const aboutController = require('../controllers/aboutController');
const contactController = require('../controllers/contactController');

/**
 * Home page route
 * GET /
 */
router.get('/', homeController.getHomePage);

/**
 * About page route
 * GET /about
 */
router.get('/about', aboutController.getAboutPage);

/**
 * Contact page route
 * GET /contact
 */
router.get('/contact', contactController.getContactPage);

/**
 * Contact form submission
 * POST /contact
 */
router.post('/contact', contactController.submitContactForm);

/**
 * Get all contacts (admin endpoint for demo)
 * GET /api/contacts
 */
router.get('/api/contacts', contactController.getAllContacts);

/**
 * API routes for demonstrating REST principles
 */

// API status endpoint
router.get('/api/status', (req, res) => {
  res.json({
    api: 'DevOps E2E API',
    version: '1.0.0',
    status: 'active',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /',
      'GET /about',
      'GET /contact',
      'POST /contact',
      'GET /api/status',
      'GET /health'
    ]
  });
});

// Demo API endpoint for teaching purposes
router.get('/api/demo', (req, res) => {
  res.json({
    message: 'This is a demo API endpoint for teaching REST principles',
    method: 'GET',
    headers: req.headers,
    query: req.query,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;