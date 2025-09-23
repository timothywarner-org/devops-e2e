const os = require('os');
const apiController = require('../../../src/controllers/apiController');

jest.mock('os');

describe('ApiController', () => {
  let req; let
    res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    os.hostname.mockReturnValue('test-host');
    os.platform.mockReturnValue('linux');
    os.release.mockReturnValue('5.0.0');
    os.totalmem.mockReturnValue(8589934592);
    os.freemem.mockReturnValue(4294967296);
    os.cpus.mockReturnValue([{}, {}, {}, {}]);
    os.loadavg.mockReturnValue([1.2, 1.5, 1.8]);
    os.uptime.mockReturnValue(3600);
  });

  describe('getStatus', () => {
    it('should return application status', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';

      apiController.getStatus(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'healthy',
        application: 'devops-e2e',
        version: expect.any(String),
        timestamp: expect.any(String),
        environment: 'test',
        hostname: 'test-host',
        uptime: expect.any(Number)
      }));

      process.env.NODE_ENV = originalEnv;
    });

    it('should increment request count on each call', () => {
      apiController.getStatus(req, res);
      apiController.getStatus(req, res);
      apiController.getStatus(req, res);

      apiController.getMetrics(req, res);
      const metricsCall = res.json.mock.calls[3][0];
      expect(metricsCall.application.requestCount).toBeGreaterThanOrEqual(3);
    });
  });

  describe('getMetrics', () => {
    it('should return comprehensive system metrics', () => {
      apiController.getMetrics(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        application: expect.objectContaining({
          name: 'devops-e2e',
          version: expect.any(String),
          requestCount: expect.any(Number)
        }),
        system: expect.objectContaining({
          platform: 'linux',
          release: '5.0.0',
          totalMemory: 8589934592,
          freeMemory: 4294967296,
          cpus: 4,
          loadAverage: [1.2, 1.5, 1.8],
          uptime: 3600
        }),
        process: expect.objectContaining({
          pid: expect.any(Number),
          uptime: expect.any(Number),
          memoryUsage: expect.objectContaining({
            rss: expect.any(Number),
            heapTotal: expect.any(Number),
            heapUsed: expect.any(Number),
            external: expect.any(Number)
          })
        }),
        timestamp: expect.any(String)
      }));
    });
  });

  describe('submitFeedback', () => {
    it('should accept valid feedback', () => {
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Great application!',
        rating: 5
      };

      apiController.submitFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Feedback received successfully',
        feedback: expect.objectContaining({
          id: expect.any(String),
          name: 'John Doe',
          email: 'john@example.com',
          message: 'Great application!',
          rating: 5,
          timestamp: expect.any(String)
        })
      }));
    });

    it('should handle anonymous feedback', () => {
      req.body = {
        message: 'Anonymous feedback'
      };

      apiController.submitFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        feedback: expect.objectContaining({
          name: 'Anonymous',
          email: 'not-provided',
          message: 'Anonymous feedback',
          rating: 0
        })
      }));
    });

    it('should reject feedback without message', () => {
      req.body = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      apiController.submitFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Message is required'
      });
    });

    it('should limit feedback storage to 100 entries', () => {
      for (let i = 0; i < 105; i++) {
        req.body = { message: `Feedback ${i}` };
        apiController.submitFeedback(req, res);
      }

      const feedbackStore = apiController.getFeedback();
      expect(feedbackStore.length).toBeLessThanOrEqual(100);
    });
  });
});
