# API Documentation

## DevOps E2E REST API Reference

This document describes the REST API endpoints available in the DevOps E2E application.

### Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://devops-e2e.example.com`

### Authentication

Currently, the API does not require authentication. This is a teaching application for demonstration purposes.

## Endpoints

### Health Check

#### GET /health

Returns the health status of the application.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "uptime": 3600.123,
  "environment": "development",
  "version": "1.0.0"
}
```

### API Status

#### GET /api/status

Returns API information and available endpoints.

**Response:**
```json
{
  "api": "DevOps E2E API",
  "version": "1.0.0",
  "status": "active",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "endpoints": [
    "GET /",
    "GET /about",
    "GET /contact",
    "POST /contact",
    "GET /api/status",
    "GET /health"
  ]
}
```

### Demo API

#### GET /api/demo

Demonstrates API request handling and returns request information.

**Query Parameters:**
- Any query parameters will be returned in the response

**Response:**
```json
{
  "message": "This is a demo API endpoint for teaching REST principles",
  "method": "GET",
  "headers": {
    "accept": "application/json",
    "user-agent": "curl/7.68.0"
  },
  "query": {
    "param1": "value1",
    "param2": "value2"
  },
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

### Page Endpoints

#### GET /

Home page endpoint. Returns HTML by default, JSON when Accept header is set to application/json.

**JSON Response:**
```json
{
  "title": "DevOps E2E - Home",
  "message": "Welcome to our DevOps teaching platform!",
  "features": [
    "Node.js & Express.js",
    "Jest Unit Testing",
    "Docker Containerization",
    "GitHub Actions CI/CD",
    "Azure AKS Deployment",
    "Security Scanning",
    "Dependency Management"
  ],
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

#### GET /about

About page endpoint. Returns HTML by default, JSON when Accept header is set to application/json.

**JSON Response:**
```json
{
  "title": "DevOps E2E - About",
  "description": "Learn about our comprehensive DevOps teaching platform",
  "mission": "To provide hands-on learning experiences with modern DevOps practices and cloud technologies",
  "technologies": {
    "frontend": ["HTML5", "CSS3", "JavaScript"],
    "backend": ["Node.js", "Express.js"],
    "testing": ["Jest", "Supertest"],
    "devops": ["Docker", "GitHub Actions", "Dependabot"],
    "cloud": ["Azure", "AKS (Azure Kubernetes Service)", "Container Registry"],
    "monitoring": ["Health checks", "Logging", "Error tracking"]
  },
  "learningObjectives": [
    "Understand CI/CD pipeline automation",
    "Master container orchestration",
    "Implement security best practices",
    "Deploy to cloud platforms",
    "Monitor application health",
    "Manage dependencies effectively"
  ],
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

#### GET /contact

Contact page endpoint. Returns HTML by default, JSON when Accept header is set to application/json.

**JSON Response:**
```json
{
  "title": "DevOps E2E - Contact",
  "description": "Get in touch with our DevOps learning community",
  "contactInfo": {
    "email": "devops-e2e@example.com",
    "github": "https://github.com/timothywarner-org/devops-e2e",
    "documentation": "/docs",
    "support": "Create an issue on GitHub for technical support"
  },
  "formFields": [
    {
      "name": "name",
      "type": "text",
      "required": true,
      "label": "Your Name"
    },
    {
      "name": "email",
      "type": "email",
      "required": true,
      "label": "Email Address"
    },
    {
      "name": "subject",
      "type": "text",
      "required": true,
      "label": "Subject"
    },
    {
      "name": "message",
      "type": "textarea",
      "required": true,
      "label": "Message"
    },
    {
      "name": "interest",
      "type": "select",
      "required": false,
      "label": "Area of Interest",
      "options": [
        "DevOps",
        "CI/CD",
        "Docker",
        "Kubernetes",
        "Azure",
        "Security",
        "Other"
      ]
    }
  ],
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

### Contact Form Submission

#### POST /contact

Submit a contact form message.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "subject": "Question about DevOps practices",
  "message": "I'm interested in learning more about CI/CD implementation.",
  "interest": "CI/CD"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Thank you for your message! We will get back to you soon.",
  "submissionId": 123,
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

**Validation Error (400):**
```json
{
  "error": "Validation failed",
  "message": "All required fields must be filled",
  "required": ["name", "email", "subject", "message"]
}
```

**Email Format Error (400):**
```json
{
  "error": "Invalid email format",
  "message": "Please provide a valid email address"
}
```

### Contact Management

#### GET /api/contacts

Retrieve all contact submissions (admin endpoint).

**Response:**
```json
{
  "total": 2,
  "contacts": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "subject": "Question about DevOps practices",
      "interest": "CI/CD",
      "timestamp": "2025-01-01T12:00:00.000Z",
      "status": "received"
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "subject": "Docker containerization help",
      "interest": "Docker",
      "timestamp": "2025-01-01T11:30:00.000Z",
      "status": "received"
    }
  ]
}
```

## Error Responses

### 404 Not Found

When accessing a non-existent endpoint:

```json
{
  "error": "Page not found",
  "message": "The requested path /invalid-path does not exist.",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

### 500 Internal Server Error

When an unexpected error occurs:

```json
{
  "error": "Something went wrong!",
  "message": "Internal Server Error",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

In development mode, the error response includes a stack trace:

```json
{
  "error": "Something went wrong!",
  "message": "Detailed error message",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "stack": "Error: Detailed error message\n    at ..."
}
```

## Rate Limiting

The API implements rate limiting in production:

- **Development**: No rate limiting
- **Production**: 100-200 requests per minute per IP

When rate limit is exceeded:

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 60
}
```

## CORS Policy

The API supports Cross-Origin Resource Sharing (CORS) with the following policy:

- **Allowed Origins**: Configurable via `ALLOWED_ORIGINS` environment variable
- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Allowed Headers**: Content-Type, Authorization, Accept
- **Credentials**: Supported when origin is allowed

## Content Types

The API supports the following content types:

### Request Content Types
- `application/json`
- `application/x-www-form-urlencoded`

### Response Content Types
- `application/json` (API endpoints)
- `text/html` (page endpoints when accessed via browser)

## Example Usage

### Using curl

```bash
# Health check
curl -X GET http://localhost:3000/health

# Get API status
curl -X GET http://localhost:3000/api/status

# Submit contact form
curl -X POST http://localhost:3000/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Test",
    "message": "Hello from API"
  }'

# Get page data as JSON
curl -X GET http://localhost:3000/ \
  -H "Accept: application/json"
```

### Using JavaScript fetch

```javascript
// Submit contact form
const submitContact = async (formData) => {
  try {
    const response = await fetch('/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error submitting form:', error);
    throw error;
  }
};

// Get health status
const checkHealth = async () => {
  const response = await fetch('/health');
  return response.json();
};
```