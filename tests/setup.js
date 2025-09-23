/**
 * Jest Test Setup
 * Global configuration and utilities for testing
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce test output noise
const originalConsole = global.console;

beforeAll(() => {
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
});

afterAll(() => {
  global.console = originalConsole;
});

// Global test utilities
global.testUtils = {
  /**
   * Create a mock request object
   */
  mockRequest: (overrides = {}) => ({
    headers: { accept: 'application/json' },
    body: {},
    query: {},
    params: {},
    path: '/',
    method: 'GET',
    ...overrides
  }),

  /**
   * Create a mock response object
   */
  mockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.sendFile = jest.fn().mockReturnValue(res);
    res.redirect = jest.fn().mockReturnValue(res);
    res.set = jest.fn().mockReturnValue(res);
    return res;
  },

  /**
   * Create a mock next function
   */
  mockNext: () => jest.fn()
};