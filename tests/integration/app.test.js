const request = require('supertest');
const app = require('../../src/app');

describe('Application Integration Tests', () => {
  describe('Home Routes', () => {
    describe('GET /', () => {
      it('should return 200 and render home page', async () => {
        const response = await request(app)
          .get('/')
          .expect('Content-Type', /html/)
          .expect(200);

        expect(response.text).toContain('Welcome to DevOps E2E Demo');
        expect(response.text).toContain('DevOps E2E');
      });
    });

    describe('GET /about', () => {
      it('should return 200 and render about page', async () => {
        const response = await request(app)
          .get('/about')
          .expect('Content-Type', /html/)
          .expect(200);

        expect(response.text).toContain('About DevOps E2E');
        expect(response.text).toContain('Technology Stack');
      });
    });

    describe('GET /contact', () => {
      it('should return 200 and render contact page', async () => {
        const response = await request(app)
          .get('/contact')
          .expect('Content-Type', /html/)
          .expect(200);

        expect(response.text).toContain('Contact & Resources');
        expect(response.text).toContain('Submit Feedback');
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect('Content-Type', /html/)
        .expect(404);

      expect(response.text).toContain('404');
      expect(response.text).toContain('Page Not Found');
    });

    it('should handle 404 for non-existent API routes', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(response.text).toContain('404');
    });
  });

  describe('Security Headers', () => {
    it('should set security headers', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.headers).toHaveProperty('x-dns-prefetch-control');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
    });
  });

  describe('Compression', () => {
    it('should compress responses', async () => {
      const response = await request(app)
        .get('/')
        .set('Accept-Encoding', 'gzip')
        .expect(200);

      expect(response.headers).toHaveProperty('vary');
      expect(response.headers.vary).toContain('Accept-Encoding');
    });
  });

  describe('Static Files', () => {
    it('should serve CSS files', async () => {
      const response = await request(app)
        .get('/css/styles.css')
        .expect('Content-Type', /css/)
        .expect(200);

      expect(response.text).toContain(':root');
      expect(response.text).toContain('--primary-color');
    });

    it('should serve JavaScript files', async () => {
      const response = await request(app)
        .get('/js/main.js')
        .expect('Content-Type', /javascript/)
        .expect(200);

      expect(response.text).toContain('DevOps E2E Application Loaded');
    });
  });

  describe('JSON Body Parsing', () => {
    it('should parse JSON bodies', async () => {
      const testData = {
        message: 'Test message',
        rating: 5
      };

      const response = await request(app)
        .post('/api/feedback')
        .send(testData)
        .set('Content-Type', 'application/json')
        .expect(201);

      expect(response.body.feedback.message).toBe(testData.message);
      expect(response.body.feedback.rating).toBe(testData.rating);
    });

    it('should parse URL-encoded bodies', async () => {
      const response = await request(app)
        .post('/api/feedback')
        .send('message=Test%20Message&rating=4')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .expect(201);

      expect(response.body.feedback.message).toBe('Test Message');
      expect(response.body.feedback.rating).toBe('4');
    });
  });
});
