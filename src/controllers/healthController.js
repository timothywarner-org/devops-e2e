const packageInfo = require('../../package.json');

let isReady = true;
let isLive = true;

exports.health = (req, res) => {
  const health = {
    status: isLive && isReady ? 'healthy' : 'unhealthy',
    version: packageInfo.version,
    timestamp: new Date().toISOString(),
    checks: {
      readiness: isReady,
      liveness: isLive,
      memory: checkMemory(),
      uptime: process.uptime()
    }
  };

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
};

exports.readiness = (req, res) => {
  if (isReady) {
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString()
    });
  }
};

exports.liveness = (req, res) => {
  if (isLive) {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      status: 'not alive',
      timestamp: new Date().toISOString()
    });
  }
};

function checkMemory() {
  const memoryUsage = process.memoryUsage();
  const heapUsedPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
  return {
    heapUsedPercentage: heapUsedPercentage.toFixed(2),
    status: heapUsedPercentage < 90 ? 'healthy' : 'warning'
  };
}

exports.setReadiness = (ready) => {
  isReady = ready;
};

exports.setLiveness = (live) => {
  isLive = live;
};
