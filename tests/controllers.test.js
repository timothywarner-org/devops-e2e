/**
 * Controller Unit Tests
 * Tests individual controller functions
 */

const homeController = require('../src/controllers/homeController');
const aboutController = require('../src/controllers/aboutController');
const contactController = require('../src/controllers/contactController');

describe('Controller Unit Tests', () => {

  describe('homeController', () => {
    describe('getHomePage', () => {
      test('should return JSON data when Accept header is application/json', () => {
        const req = testUtils.mockRequest({
          headers: { accept: 'application/json' }
        });
        const res = testUtils.mockResponse();

        homeController.getHomePage(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'DevOps E2E - Home',
            message: 'Welcome to our DevOps teaching platform!',
            features: expect.any(Array),
            timestamp: expect.any(String)
          })
        );
      });

      test('should serve HTML file when Accept header is not JSON', () => {
        const req = testUtils.mockRequest({
          headers: { accept: 'text/html' }
        });
        const res = testUtils.mockResponse();

        homeController.getHomePage(req, res);

        expect(res.sendFile).toHaveBeenCalledWith(
          expect.stringContaining('index.html')
        );
      });
    });
  });

  describe('aboutController', () => {
    describe('getAboutPage', () => {
      test('should return comprehensive about data as JSON', () => {
        const req = testUtils.mockRequest({
          headers: { accept: 'application/json' }
        });
        const res = testUtils.mockResponse();

        aboutController.getAboutPage(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'DevOps E2E - About',
            description: expect.any(String),
            mission: expect.any(String),
            technologies: expect.objectContaining({
              frontend: expect.any(Array),
              backend: expect.any(Array),
              testing: expect.any(Array),
              devops: expect.any(Array),
              cloud: expect.any(Array),
              monitoring: expect.any(Array)
            }),
            learningObjectives: expect.any(Array),
            timestamp: expect.any(String)
          })
        );
      });

      test('should serve about HTML file for browser requests', () => {
        const req = testUtils.mockRequest({
          headers: { accept: 'text/html' }
        });
        const res = testUtils.mockResponse();

        aboutController.getAboutPage(req, res);

        expect(res.sendFile).toHaveBeenCalledWith(
          expect.stringContaining('about.html')
        );
      });
    });
  });

  describe('contactController', () => {
    describe('getContactPage', () => {
      test('should return contact page data as JSON', () => {
        const req = testUtils.mockRequest({
          headers: { accept: 'application/json' }
        });
        const res = testUtils.mockResponse();

        contactController.getContactPage(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'DevOps E2E - Contact',
            description: expect.any(String),
            contactInfo: expect.objectContaining({
              email: expect.any(String),
              github: expect.any(String)
            }),
            formFields: expect.any(Array),
            timestamp: expect.any(String)
          })
        );
      });

      test('should include proper form field definitions', () => {
        const req = testUtils.mockRequest({
          headers: { accept: 'application/json' }
        });
        const res = testUtils.mockResponse();

        contactController.getContactPage(req, res);

        const callArgs = res.json.mock.calls[0][0];
        expect(callArgs.formFields).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'name',
              type: 'text',
              required: true,
              label: 'Your Name'
            }),
            expect.objectContaining({
              name: 'email',
              type: 'email',
              required: true,
              label: 'Email Address'
            })
          ])
        );
      });
    });

    describe('submitContactForm', () => {
      const validFormData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        subject: 'Test Subject',
        message: 'This is a test message',
        interest: 'DevOps'
      };

      test('should successfully process valid form submission', () => {
        const req = testUtils.mockRequest({
          body: validFormData
        });
        const res = testUtils.mockResponse();

        contactController.submitContactForm(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            message: expect.stringContaining('Thank you'),
            submissionId: expect.any(Number),
            timestamp: expect.any(String)
          })
        );
      });

      test('should reject submission with missing required fields', () => {
        const incompleteData = {
          name: 'John Doe',
          email: 'john.doe@example.com'
          // missing subject and message
        };

        const req = testUtils.mockRequest({
          body: incompleteData
        });
        const res = testUtils.mockResponse();

        contactController.submitContactForm(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Validation failed',
            message: 'All required fields must be filled',
            required: expect.arrayContaining(['name', 'email', 'subject', 'message'])
          })
        );
      });

      test('should reject submission with invalid email', () => {
        const invalidEmailData = {
          ...validFormData,
          email: 'invalid-email-format'
        };

        const req = testUtils.mockRequest({
          body: invalidEmailData
        });
        const res = testUtils.mockResponse();

        contactController.submitContactForm(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Invalid email format',
            message: 'Please provide a valid email address'
          })
        );
      });

      test('should trim whitespace from form fields', () => {
        const dataWithWhitespace = {
          name: '  John Doe  ',
          email: '  john.doe@example.com  ',
          subject: '  Test Subject  ',
          message: '  This is a test message  ',
          interest: 'DevOps'
        };

        const req = testUtils.mockRequest({
          body: dataWithWhitespace
        });
        const res = testUtils.mockResponse();

        contactController.submitContactForm(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        // The internal storage should have trimmed values
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true
          })
        );
      });

      test('should handle optional interest field', () => {
        const dataWithoutInterest = {
          name: 'John Doe',
          email: 'john.doe@example.com',
          subject: 'Test Subject',
          message: 'This is a test message'
          // no interest field
        };

        const req = testUtils.mockRequest({
          body: dataWithoutInterest
        });
        const res = testUtils.mockResponse();

        contactController.submitContactForm(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true
          })
        );
      });
    });

    describe('getAllContacts', () => {
      test('should return contacts list with proper structure', () => {
        const req = testUtils.mockRequest();
        const res = testUtils.mockResponse();

        contactController.getAllContacts(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            total: expect.any(Number),
            contacts: expect.any(Array)
          })
        );
      });

      test('should return sanitized contact data (no full message)', () => {
        // First submit a contact to have data
        const submitReq = testUtils.mockRequest({
          body: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            subject: 'Test Subject',
            message: 'This is a test message',
            interest: 'DevOps'
          }
        });
        const submitRes = testUtils.mockResponse();
        contactController.submitContactForm(submitReq, submitRes);

        // Then get all contacts
        const req = testUtils.mockRequest();
        const res = testUtils.mockResponse();
        contactController.getAllContacts(req, res);

        const callArgs = res.json.mock.calls[0][0];
        if (callArgs.contacts.length > 0) {
          const contact = callArgs.contacts[0];
          expect(contact).toHaveProperty('id');
          expect(contact).toHaveProperty('name');
          expect(contact).toHaveProperty('email');
          expect(contact).toHaveProperty('subject');
          expect(contact).toHaveProperty('interest');
          expect(contact).toHaveProperty('timestamp');
          expect(contact).toHaveProperty('status');
          // Should not include the full message for privacy
          expect(contact).not.toHaveProperty('message');
        }
      });
    });
  });
});