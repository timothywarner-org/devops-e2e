/**
 * Routes Unit Tests
 * Tests route definitions and middleware
 */

const request = require('supertest');
const express = require('express');
const routes = require('../src/routes');

// Create a test app with just the routes
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/', routes);
  return app;
};

describe('Routes Unit Tests', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('Route Definitions', () => {
    test('should have home route defined', async() => {
      const response = await request(app)
        .get('/')
        .set('Accept', 'application/json');
      
      expect(response.status).not.toBe(404);
    });

    test('should have about route defined', async() => {
      const response = await request(app)
        .get('/about')
        .set('Accept', 'application/json');
      
      expect(response.status).not.toBe(404);
    });

    test('should have contact routes defined', async() => {
      const getResponse = await request(app)
        .get('/contact')
        .set('Accept', 'application/json');
      
      const postResponse = await request(app)
        .post('/contact')
        .send({
          name: 'Test',
          email: 'test@example.com',
          subject: 'Test',
          message: 'Test message'
        });
      
      expect(getResponse.status).not.toBe(404);
      expect(postResponse.status).not.toBe(404);
    });

    test('should have API routes defined', async() => {
      const statusResponse = await request(app).get('/api/status');
      const demoResponse = await request(app).get('/api/demo');
      const contactsResponse = await request(app).get('/api/contacts');
      
      expect(statusResponse.status).not.toBe(404);
      expect(demoResponse.status).not.toBe(404);
      expect(contactsResponse.status).not.toBe(404);
    });
  });

  describe('API Status Route', () => {
    test('should return correct API information', async() => {
      const response = await request(app)
        .get('/api/status')
        .expect(200);
      
      expect(response.body).toEqual(
        expect.objectContaining({
          api: 'DevOps E2E API',
          version: '1.0.0',
          status: 'active',
          timestamp: expect.any(String),
          endpoints: expect.arrayContaining([
            'GET /',
            'GET /about',
            'GET /contact',
            'POST /contact',
            'GET /api/status',
            'GET /health'
          ])
        })
      );
    });
  });

  describe('API Demo Route', () => {
    test('should return request information', async() => {
      const response = await request(app)
        .get('/api/demo?param1=value1&param2=value2')
        .set('X-Custom-Header', 'test-value')
        .expect(200);
      
      expect(response.body).toEqual(
        expect.objectContaining({
          message: expect.stringContaining('demo API endpoint'),
          method: 'GET',
          headers: expect.objectContaining({
            'x-custom-header': 'test-value'
          }),
          query: expect.objectContaining({
            param1: 'value1',
            param2: 'value2'
          }),
          timestamp: expect.any(String)
        })
      );
    });

    test('should handle requests without query parameters', async() => {
      const response = await request(app)
        .get('/api/demo')
        .expect(200);
      
      expect(response.body.query).toEqual({});
    });
  });

  describe('Route Method Validation', () => {
    test('should only accept GET for home route', async() => {
      await request(app).get('/').expect(200);
      await request(app).post('/').expect(404);
      await request(app).put('/').expect(404);
      await request(app).delete('/').expect(404);
    });

    test('should only accept GET for about route', async() => {
      await request(app).get('/about').set('Accept', 'application/json').expect(200);
      await request(app).post('/about').expect(404);
      await request(app).put('/about').expect(404);
      await request(app).delete('/about').expect(404);
    });

    test('should accept both GET and POST for contact route', async() => {
      await request(app).get('/contact').set('Accept', 'application/json').expect(200);
      await request(app)
        .post('/contact')
        .send({
          name: 'Test',
          email: 'test@example.com',
          subject: 'Test',
          message: 'Test message'
        })
        .expect(201);
      
      await request(app).put('/contact').expect(404);
      await request(app).delete('/contact').expect(404);
    });

    test('should only accept GET for API routes', async() => {
      await request(app).get('/api/status').expect(200);
      await request(app).get('/api/demo').expect(200);
      await request(app).get('/api/contacts').expect(200);
      
      await request(app).post('/api/status').expect(404);
      await request(app).post('/api/demo').expect(404);
      await request(app).put('/api/contacts').expect(404);
    });
  });

  describe('Content Type Handling', () => {
    test('should handle JSON requests properly', async() => {
      const response = await request(app)
        .post('/contact')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          subject: 'Test Subject',
          message: 'Test message content'
        }))
        .expect(201);
      
      expect(response.body.success).toBe(true);
    });

    test('should handle form-encoded requests', async() => {
      const response = await request(app)
        .post('/contact')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send('name=Test User&email=test@example.com&subject=Test Subject&message=Test message content')
        .expect(201);
      
      expect(response.body.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed JSON gracefully', async() => {
      await request(app)
        .post('/contact')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });
  });

  describe('Route Parameter Validation', () => {
    test('should validate required contact form fields', async() => {
      const response = await request(app)
        .post('/contact')
        .send({
          name: '',
          email: '',
          subject: '',
          message: ''
        })
        .expect(400);
      
      expect(response.body.error).toBe('Validation failed');
    });

    test('should validate email format in contact form', async() => {
      const response = await request(app)
        .post('/contact')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          subject: 'Test Subject',
          message: 'Test message'
        })
        .expect(400);
      
      expect(response.body.error).toBe('Invalid email format');
    });
  });

  describe('Response Headers', () => {
    test('should return JSON content type for API endpoints', async() => {
      const response = await request(app)
        .get('/api/status')
        .expect(200);
      
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    test('should include timestamp in API responses', async() => {
      const statusResponse = await request(app).get('/api/status');
      const demoResponse = await request(app).get('/api/demo');
      
      expect(statusResponse.body.timestamp).toBeDefined();
      expect(demoResponse.body.timestamp).toBeDefined();
      
      // Validate timestamp format (ISO 8601)
      expect(new Date(statusResponse.body.timestamp).toISOString()).toBe(statusResponse.body.timestamp);
      expect(new Date(demoResponse.body.timestamp).toISOString()).toBe(demoResponse.body.timestamp);
    });
  });

  describe('Query Parameter Handling', () => {
    test('should properly parse and return query parameters', async() => {
      const queryParams = {
        filter: 'active',
        sort: 'date',
        limit: '10',
        page: '1'
      };
      
      const queryString = new URLSearchParams(queryParams).toString();
      
      const response = await request(app)
        .get(`/api/demo?${queryString}`)
        .expect(200);
      
      expect(response.body.query).toEqual(queryParams);
    });

    test('should handle special characters in query parameters', async() => {
      const response = await request(app)
        .get('/api/demo?search=test%20query&special=%26%3D%25')
        .expect(200);
      
      expect(response.body.query.search).toBe('test query');
      expect(response.body.query.special).toBe('&=%');
    });
  });
});