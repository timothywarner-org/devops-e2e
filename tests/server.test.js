/**
 * Server Integration Tests
 * Tests the main Express application
 */

const request = require('supertest');
const app = require('../src/server');

describe('Server Integration Tests', () => {
  
  describe('GET /', () => {
    test('should return 200 and serve home page', async() => {
      const response = await request(app)
        .get('/')
        .expect(200);
      
      expect(response.text).toContain('<!DOCTYPE html>');
      expect(response.headers['content-type']).toMatch(/text\/html/);
    });

    test('should return JSON when Accept header is application/json', async() => {
      const response = await request(app)
        .get('/')
        .set('Accept', 'application/json')
        .expect(200);
      
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('features');
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('GET /about', () => {
    test('should return 200 and serve about page', async() => {
      const response = await request(app)
        .get('/about')
        .expect(200);
      
      expect(response.text).toContain('<!DOCTYPE html>');
    });

    test('should return JSON data when requested', async() => {
      const response = await request(app)
        .get('/about')
        .set('Accept', 'application/json')
        .expect(200);
      
      expect(response.body).toHaveProperty('title', 'DevOps E2E - About');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('technologies');
      expect(response.body).toHaveProperty('learningObjectives');
    });
  });

  describe('GET /contact', () => {
    test('should return 200 and serve contact page', async() => {
      const response = await request(app)
        .get('/contact')
        .expect(200);
      
      expect(response.text).toContain('<!DOCTYPE html>');
    });

    test('should return JSON data when requested', async() => {
      const response = await request(app)
        .get('/contact')
        .set('Accept', 'application/json')
        .expect(200);
      
      expect(response.body).toHaveProperty('title', 'DevOps E2E - Contact');
      expect(response.body).toHaveProperty('contactInfo');
      expect(response.body).toHaveProperty('formFields');
    });
  });

  describe('POST /contact', () => {
    const validContactData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      subject: 'Test Subject',
      message: 'This is a test message',
      interest: 'DevOps'
    };

    test('should successfully submit valid contact form', async() => {
      const response = await request(app)
        .post('/contact')
        .send(validContactData)
        .expect(201);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('submissionId');
      expect(response.body).toHaveProperty('timestamp');
    });

    test('should reject incomplete contact form', async() => {
      const incompleteData = {
        name: 'John Doe',
        email: 'john.doe@example.com'
        // missing subject and message
      };

      const response = await request(app)
        .post('/contact')
        .send(incompleteData)
        .expect(400);
      
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body).toHaveProperty('required');
    });

    test('should reject invalid email format', async() => {
      const invalidEmailData = {
        ...validContactData,
        email: 'invalid-email'
      };

      const response = await request(app)
        .post('/contact')
        .send(invalidEmailData)
        .expect(400);
      
      expect(response.body).toHaveProperty('error', 'Invalid email format');
    });

    test('should handle empty fields correctly', async() => {
      const emptyFieldsData = {
        name: '',
        email: '',
        subject: '',
        message: ''
      };

      const response = await request(app)
        .post('/contact')
        .send(emptyFieldsData)
        .expect(400);
      
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('GET /health', () => {
    test('should return health check information', async() => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('GET /api/status', () => {
    test('should return API status information', async() => {
      const response = await request(app)
        .get('/api/status')
        .expect(200);
      
      expect(response.body).toHaveProperty('api', 'DevOps E2E API');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('status', 'active');
      expect(response.body).toHaveProperty('endpoints');
      expect(Array.isArray(response.body.endpoints)).toBe(true);
    });
  });

  describe('GET /api/demo', () => {
    test('should return demo API response', async() => {
      const response = await request(app)
        .get('/api/demo?test=value')
        .expect(200);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('method', 'GET');
      expect(response.body).toHaveProperty('headers');
      expect(response.body).toHaveProperty('query');
      expect(response.body.query).toHaveProperty('test', 'value');
    });
  });

  describe('GET /api/contacts', () => {
    test('should return contacts list', async() => {
      const response = await request(app)
        .get('/api/contacts')
        .expect(200);
      
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('contacts');
      expect(Array.isArray(response.body.contacts)).toBe(true);
    });
  });

  describe('404 Error Handling', () => {
    test('should return 404 for non-existent routes', async() => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);
      
      expect(response.body).toHaveProperty('error', 'Page not found');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Security Headers', () => {
    test('should include security headers', async() => {
      const response = await request(app)
        .get('/')
        .expect(200);
      
      // Helmet security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });
  });

  describe('CORS', () => {
    test('should handle CORS properly', async() => {
      const response = await request(app)
        .options('/api/status')
        .set('Origin', 'http://localhost:3000')
        .expect(204);
      
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });
});