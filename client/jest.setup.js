// Add Jest extended matchers
require('@testing-library/jest-dom');

// Mock the environment variables
window.ENV = {
  VITE_API_URL: 'http://localhost:3000',
};

// Mock the import.meta.env
global.import = {
  meta: {
    env: {
      VITE_API_URL: 'http://localhost:3000',
    },
  },
};

// Make import.meta.env available globally
global.process.env.VITE_API_URL = 'http://localhost:3000';
