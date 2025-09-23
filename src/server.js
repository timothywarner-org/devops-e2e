/**
 * DevOps E2E - Main Server Application
 * A teaching example of modern Node.js/Express development with DevOps practices
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
  credentials: true
}));

// Request logging
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Import routes
const routes = require('./routes/index');

// Health check endpoint for monitoring (before other routes)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Use routes (handle dynamic routes first)
app.use('/', routes);

// Serve static files (after routes to prevent conflicts)
app.use(express.static(path.join(__dirname, '../public')));

// Set view engine
app.set('view engine', 'html');
app.set('views', path.join(__dirname, '../public'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Page not found',
    message: `The requested path ${req.path} does not exist.`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Error:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
  
  res.status(statusCode).json({
    error: 'Something went wrong!',
    message,
    timestamp: new Date().toISOString(),
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 DevOps E2E Server running on port ${PORT}`);
    console.log(`📊 Environment: ${NODE_ENV}`);
    console.log(`🔗 Access: http://localhost:${PORT}`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;