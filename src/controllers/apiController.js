const os = require('os');
const packageInfo = require('../../package.json');

let requestCount = 0;
let feedbackStore = [];

exports.getStatus = (req, res) => {
  requestCount++;
  res.json({
    status: 'healthy',
    application: packageInfo.name,
    version: packageInfo.version,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    hostname: os.hostname(),
    uptime: process.uptime()
  });
};

exports.getMetrics = (req, res) => {
  const memoryUsage = process.memoryUsage();
  res.json({
    application: {
      name: packageInfo.name,
      version: packageInfo.version,
      requestCount
    },
    system: {
      platform: os.platform(),
      release: os.release(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpus: os.cpus().length,
      loadAverage: os.loadavg(),
      uptime: os.uptime()
    },
    process: {
      pid: process.pid,
      uptime: process.uptime(),
      memoryUsage: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external
      }
    },
    timestamp: new Date().toISOString()
  });
};

exports.submitFeedback = (req, res) => {
  const {
    name, email, message, rating
  } = req.body;

  if (!message) {
    return res.status(400).json({
      error: 'Message is required'
    });
  }

  const feedback = {
    id: Date.now().toString(),
    name: name || 'Anonymous',
    email: email || 'not-provided',
    message,
    rating: rating || 0,
    timestamp: new Date().toISOString()
  };

  feedbackStore.push(feedback);

  if (feedbackStore.length > 100) {
    feedbackStore = feedbackStore.slice(-100);
  }

  res.status(201).json({
    message: 'Feedback received successfully',
    feedback
  });
};

exports.getFeedback = () => feedbackStore;
