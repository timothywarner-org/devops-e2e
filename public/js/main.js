/**
 * DevOps E2E - Main JavaScript
 * Handles common functionality across all pages
 */

(function() {
  'use strict';

  // DOM Content Loaded
  document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeAnimations();
    initializeServiceWorker();
    logPageLoad();
  });

  /**
   * Initialize navigation functionality
   */
  function initializeNavigation() {
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenu && navMenu) {
      mobileMenu.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        
        // Animate hamburger menu
        const bars = mobileMenu.querySelectorAll('.bar');
        bars.forEach(bar => bar.classList.toggle('active'));
      });

      // Close mobile menu when clicking on a link
      const navLinks = document.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        link.addEventListener('click', function() {
          navMenu.classList.remove('active');
          const bars = mobileMenu.querySelectorAll('.bar');
          bars.forEach(bar => bar.classList.remove('active'));
        });
      });

      // Close mobile menu when clicking outside
      document.addEventListener('click', function(event) {
        if (!mobileMenu.contains(event.target) && !navMenu.contains(event.target)) {
          navMenu.classList.remove('active');
          const bars = mobileMenu.querySelectorAll('.bar');
          bars.forEach(bar => bar.classList.remove('active'));
        }
      });
    }
  }

  /**
   * Initialize scroll animations and effects
   */
  function initializeAnimations() {
    // Add fade-in animation to elements as they come into view
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .tech-item, .objective-card, .faq-item');
    animateElements.forEach(el => observer.observe(el));

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  /**
   * Initialize service worker for offline functionality
   */
  function initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
          .then(function(registration) {
            console.log('ServiceWorker registered successfully:', registration.scope);
          })
          .catch(function(error) {
            console.log('ServiceWorker registration failed:', error);
          });
      });
    }
  }

  /**
   * Log page load for analytics (demo purposes)
   */
  function logPageLoad() {
    const pageData = {
      url: window.location.href,
      title: document.title,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer
    };

    // In a real application, you would send this to your analytics service
    console.log('Page load analytics:', pageData);
  }

  /**
   * Utility function to make API calls
   */
  window.apiCall = function(endpoint, options = {}) {
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const config = { ...defaultOptions, ...options };

    return fetch(endpoint, config)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .catch(error => {
        console.error('API call failed:', error);
        throw error;
      });
  };

  /**
   * Utility function to show notifications
   */
  window.showNotification = function(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      color: white;
      font-weight: 500;
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;

    // Set background color based on type
    switch (type) {
      case 'success':
        notification.style.backgroundColor = '#10b981';
        break;
      case 'error':
        notification.style.backgroundColor = '#ef4444';
        break;
      case 'warning':
        notification.style.backgroundColor = '#f59e0b';
        break;
      default:
        notification.style.backgroundColor = '#2563eb';
    }

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 5 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 5000);
  };

  /**
   * Utility function to format dates
   */
  window.formatDate = function(dateString) {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  /**
   * Utility function to validate email
   */
  window.isValidEmail = function(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Global error handler
   */
  window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    // In a real application, you would send this to your error tracking service
  });

  /**
   * Handle unhandled promise rejections
   */
  window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    // In a real application, you would send this to your error tracking service
  });

})();