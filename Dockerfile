# DevOps E2E - Multi-stage Docker Build
# This demonstrates modern Docker best practices for Node.js applications

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci --only=production && npm cache clean --force

# Development stage (for local development)
FROM node:18-alpine AS development

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Development command with nodemon for hot reloading
CMD ["npm", "run", "dev"]

# Production stage
FROM node:18-alpine AS production

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/
COPY public/ ./public/

# Copy any other necessary files
COPY .eslintrc.js ./
COPY jest.config.js ./

# Create a minimal health check script
RUN echo '#!/bin/sh\ncurl -f http://localhost:3000/health || exit 1' > /app/healthcheck.sh && \
    chmod +x /app/healthcheck.sh

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Add labels for better Docker image management
LABEL \
    maintainer="Timothy Warner Organization" \
    description="DevOps E2E - Teaching platform for modern DevOps practices" \
    version="1.0.0" \
    org.opencontainers.image.title="DevOps E2E" \
    org.opencontainers.image.description="Node.js/Express teaching application" \
    org.opencontainers.image.version="1.0.0" \
    org.opencontainers.image.authors="Timothy Warner Organization" \
    org.opencontainers.image.source="https://github.com/timothywarner-org/devops-e2e" \
    org.opencontainers.image.documentation="https://github.com/timothywarner-org/devops-e2e/blob/main/README.md"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ./healthcheck.sh

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000

# Start the application
CMD ["npm", "start"]