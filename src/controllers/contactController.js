/**
 * Contact Controller
 * Handles contact page logic and form submissions
 */

const path = require('path');

// In-memory storage for demo purposes (use a database in production)
const contacts = [];

/**
 * Render the contact page
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getContactPage = (req, res) => {
  try {
    const pageData = {
      title: 'DevOps E2E - Contact',
      description: 'Get in touch with our DevOps learning community',
      contactInfo: {
        email: 'devops-e2e@example.com',
        github: 'https://github.com/timothywarner-org/devops-e2e',
        documentation: '/docs',
        support: 'Create an issue on GitHub for technical support'
      },
      formFields: [
        { name: 'name', type: 'text', required: true, label: 'Your Name' },
        { name: 'email', type: 'email', required: true, label: 'Email Address' },
        { name: 'subject', type: 'text', required: true, label: 'Subject' },
        { name: 'message', type: 'textarea', required: true, label: 'Message' },
        { name: 'interest', type: 'select', required: false, label: 'Area of Interest',
          options: ['DevOps', 'CI/CD', 'Docker', 'Kubernetes', 'Azure', 'Security', 'Other'] }
      ],
      timestamp: new Date().toISOString()
    };

    // Send JSON response for API clients, HTML for browsers
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      res.json(pageData);
    } else {
      res.sendFile(path.join(__dirname, '../../public/contact.html'));
    }
  } catch (error) {
    console.error('Error in contact controller:', error);
    res.status(500).json({ error: 'Failed to load contact page' });
  }
};

/**
 * Handle contact form submission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const submitContactForm = (req, res) => {
  try {
    const { name, email, subject, message, interest } = req.body;

    // Trim all string fields
    const trimmedName = name?.trim();
    const trimmedEmail = email?.trim().toLowerCase();
    const trimmedSubject = subject?.trim();
    const trimmedMessage = message?.trim();

    // Basic validation
    if (!trimmedName || !trimmedEmail || !trimmedSubject || !trimmedMessage) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'All required fields must be filled',
        required: ['name', 'email', 'subject', 'message']
      });
    }

    // Email validation (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      });
    }

    // Create contact entry
    const contactEntry = {
      id: contacts.length + 1,
      name: trimmedName,
      email: trimmedEmail,
      subject: trimmedSubject,
      message: trimmedMessage,
      interest: interest || 'Not specified',
      timestamp: new Date().toISOString(),
      status: 'received'
    };

    // Store contact (in production, save to database)
    contacts.push(contactEntry);

    console.log('New contact submission:', contactEntry);

    // Success response
    res.status(201).json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
      submissionId: contactEntry.id,
      timestamp: contactEntry.timestamp
    });

  } catch (error) {
    console.error('Error in contact form submission:', error);
    res.status(500).json({
      error: 'Submission failed',
      message: 'An error occurred while processing your message. Please try again.'
    });
  }
};

/**
 * Get all contacts (admin endpoint for demo)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllContacts = (req, res) => {
  try {
    res.json({
      total: contacts.length,
      contacts: contacts.map(contact => ({
        id: contact.id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        interest: contact.interest,
        timestamp: contact.timestamp,
        status: contact.status
      }))
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
};

module.exports = {
  getContactPage,
  submitContactForm,
  getAllContacts
};