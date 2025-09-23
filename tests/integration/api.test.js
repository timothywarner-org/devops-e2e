const request = require('supertest');
const app = require('../../src/app');

describe('API Integration Tests', () => {
  describe('GET /api/status', () => {
    it('should return 200 and application status', async () => {
      const response = await request(app)
        .get('/api/status')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('application', 'devops-e2e');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('hostname');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api/metrics', () => {
    it('should return 200 and system metrics', async () => {
      const response = await request(app)
        .get('/api/metrics')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('application');
      expect(response.body.application).toHaveProperty('name', 'devops-e2e');
      expect(response.body.application).toHaveProperty('version');
      expect(response.body.application).toHaveProperty('requestCount');

      expect(response.body).toHaveProperty('system');
      expect(response.body.system).toHaveProperty('platform');
      expect(response.body.system).toHaveProperty('totalMemory');
      expect(response.body.system).toHaveProperty('freeMemory');
      expect(response.body.system).toHaveProperty('cpus');

      expect(response.body).toHaveProperty('process');
      expect(response.body.process).toHaveProperty('pid');
      expect(response.body.process).toHaveProperty('uptime');
      expect(response.body.process).toHaveProperty('memoryUsage');
    });
  });

  describe('POST /api/feedback', () => {
    it('should accept valid feedback and return 201', async () => {
      const feedback = {
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test feedback',
        rating: 5
      };

      const response = await request(app)
        .post('/api/feedback')
        .send(feedback)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Feedback received successfully');
      expect(response.body).toHaveProperty('feedback');
      expect(response.body.feedback).toHaveProperty('id');
      expect(response.body.feedback).toHaveProperty('name', 'Test User');
      expect(response.body.feedback).toHaveProperty('email', 'test@example.com');
      expect(response.body.feedback).toHaveProperty('message', 'This is a test feedback');
      expect(response.body.feedback).toHaveProperty('rating', 5);
      expect(response.body.feedback).toHaveProperty('timestamp');
    });

    it('should accept anonymous feedback', async () => {
      const feedback = {
        message: 'Anonymous test feedback'
      };

      const response = await request(app)
        .post('/api/feedback')
        .send(feedback)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.feedback).toHaveProperty('name', 'Anonymous');
      expect(response.body.feedback).toHaveProperty('email', 'not-provided');
      expect(response.body.feedback).toHaveProperty('rating', 0);
    });

    it('should reject feedback without message', async () => {
      const feedback = {
        name: 'Test User',
        email: 'test@example.com',
        rating: 5
      };

      const response = await request(app)
        .post('/api/feedback')
        .send(feedback)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Message is required');
    });
  });

  describe('Health Endpoints', () => {
    describe('GET /health', () => {
      it('should return 200 and health status', async () => {
        const response = await request(app)
          .get('/health')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body).toHaveProperty('status', 'healthy');
        expect(response.body).toHaveProperty('version');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('checks');
        expect(response.body.checks).toHaveProperty('readiness', true);
        expect(response.body.checks).toHaveProperty('liveness', true);
        expect(response.body.checks).toHaveProperty('memory');
        expect(response.body.checks).toHaveProperty('uptime');
      });
    });

    describe('GET /health/ready', () => {
      it('should return 200 when application is ready', async () => {
        const response = await request(app)
          .get('/health/ready')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body).toHaveProperty('status', 'ready');
        expect(response.body).toHaveProperty('timestamp');
      });
    });

    describe('GET /health/live', () => {
      it('should return 200 when application is alive', async () => {
        const response = await request(app)
          .get('/health/live')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body).toHaveProperty('status', 'alive');
        expect(response.body).toHaveProperty('timestamp');
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to API endpoints', async () => {
      const requests = Array(101).fill(null).map(() => request(app).get('/api/status'));

      const responses = await Promise.all(requests);
      const tooManyRequests = responses.some((res) => res.status === 429);

      expect(tooManyRequests).toBe(true);
    }, 10000);
  });
});
