/**
 * DevOps E2E - Contact Form JavaScript
 * Handles contact form submission and validation
 */

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    initializeContactForm();
  });

  /**
   * Initialize contact form functionality
   */
  function initializeContactForm() {
    const form = document.getElementById('contactForm');
    const messageDiv = document.getElementById('formMessage');

    if (!form || !messageDiv) {
      return;
    }

    form.addEventListener('submit', handleFormSubmission);
    
    // Add real-time validation
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('blur', validateField);
      input.addEventListener('input', clearFieldError);
    });
  }

  /**
   * Handle form submission
   */
  async function handleFormSubmission(event) {
    event.preventDefault();

    const form = event.target;
    const messageDiv = document.getElementById('formMessage');
    const submitButton = form.querySelector('button[type="submit"]');

    // Validate all fields
    if (!validateForm(form)) {
      showMessage('Please correct the errors below.', 'error');
      return;
    }

    // Show loading state
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    form.classList.add('loading');

    try {
      // Collect form data
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      // Submit form
      const response = await fetch('/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message || 'Message sent successfully!', 'success');
        form.reset();
        clearAllErrors(form);
        
        // Show notification
        if (window.showNotification) {
          window.showNotification('Thank you for your message!', 'success');
        }
      } else {
        throw new Error(result.message || 'Failed to send message');
      }

    } catch (error) {
      console.error('Form submission error:', error);
      showMessage(
        error.message || 'An error occurred while sending your message. Please try again.',
        'error'
      );
      
      if (window.showNotification) {
        window.showNotification('Failed to send message. Please try again.', 'error');
      }
    } finally {
      // Reset loading state
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
      form.classList.remove('loading');
    }
  }

  /**
   * Validate entire form
   */
  function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(field => {
      if (!validateField({ target: field })) {
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * Validate individual field
   */
  function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';

    // Clear previous errors
    clearFieldError(event);

    // Required field validation
    if (field.hasAttribute('required') && !value) {
      errorMessage = `${getFieldLabel(field)} is required.`;
      isValid = false;
    }
    // Email validation
    else if (field.type === 'email' && value && !window.isValidEmail(value)) {
      errorMessage = 'Please enter a valid email address.';
      isValid = false;
    }
    // Minimum length validation
    else if (fieldName === 'message' && value && value.length < 10) {
      errorMessage = 'Message must be at least 10 characters long.';
      isValid = false;
    }
    // Name validation (no numbers)
    else if (fieldName === 'name' && value && /\d/.test(value)) {
      errorMessage = 'Name should not contain numbers.';
      isValid = false;
    }

    if (!isValid) {
      showFieldError(field, errorMessage);
    }

    return isValid;
  }

  /**
   * Show field error
   */
  function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;

    // Remove existing error
    const existingError = formGroup.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }

    // Add error class and message
    field.classList.add('error');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
      color: var(--error-color);
      font-size: 0.875rem;
      margin-top: 0.25rem;
    `;

    formGroup.appendChild(errorElement);
  }

  /**
   * Clear field error
   */
  function clearFieldError(event) {
    const field = event.target;
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;

    field.classList.remove('error');
    const errorElement = formGroup.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  /**
   * Clear all form errors
   */
  function clearAllErrors(form) {
    const errorFields = form.querySelectorAll('.error');
    const errorMessages = form.querySelectorAll('.field-error');

    errorFields.forEach(field => field.classList.remove('error'));
    errorMessages.forEach(message => message.remove());
  }

  /**
   * Get field label for error messages
   */
  function getFieldLabel(field) {
    const label = field.closest('.form-group').querySelector('label');
    if (label) {
      return label.textContent.replace('*', '').trim();
    }
    return field.name.charAt(0).toUpperCase() + field.name.slice(1);
  }

  /**
   * Show form message
   */
  function showMessage(message, type) {
    const messageDiv = document.getElementById('formMessage');
    if (!messageDiv) return;

    messageDiv.textContent = message;
    messageDiv.className = `form-message ${type}`;
    messageDiv.style.display = 'block';

    // Scroll to message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        messageDiv.style.display = 'none';
      }, 5000);
    }
  }

  /**
   * Character counter for textarea (if needed)
   */
  function initializeCharacterCounter() {
    const messageField = document.getElementById('message');
    if (!messageField) return;

    const maxLength = 1000;
    const counter = document.createElement('div');
    counter.className = 'character-counter';
    counter.style.cssText = `
      text-align: right;
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-top: 0.25rem;
    `;

    messageField.parentNode.appendChild(counter);

    function updateCounter() {
      const remaining = maxLength - messageField.value.length;
      counter.textContent = `${remaining} characters remaining`;
      
      if (remaining < 50) {
        counter.style.color = 'var(--warning-color)';
      } else if (remaining < 0) {
        counter.style.color = 'var(--error-color)';
      } else {
        counter.style.color = 'var(--text-secondary)';
      }
    }

    messageField.addEventListener('input', updateCounter);
    updateCounter(); // Initial count
  }

  // Add CSS for error states
  const style = document.createElement('style');
  style.textContent = `
    .form-group input.error,
    .form-group textarea.error,
    .form-group select.error {
      border-color: var(--error-color);
      box-shadow: 0 0 0 3px rgb(239 68 68 / 0.1);
    }
  `;
  document.head.appendChild(style);

})();