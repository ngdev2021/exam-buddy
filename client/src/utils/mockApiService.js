// mockApiService.js
// This file provides mock implementations for API endpoints when using mock authentication

// Mock user stats data
const MOCK_USER_STATS = {
  totalQuestions: 120,
  correctAnswers: 92,
  incorrectAnswers: 28,
  averageScore: 76.7,
  timeSpent: 420, // minutes
  lastActive: new Date().toISOString(),
  topicPerformance: {
    'Life Insurance': { correct: 18, total: 25, percentage: 72 },
    'Property Insurance': { correct: 22, total: 30, percentage: 73.3 },
    'Health Insurance': { correct: 17, total: 20, percentage: 85 },
    'Casualty Insurance': { correct: 15, total: 20, percentage: 75 },
    'Insurance Regulations': { correct: 20, total: 25, percentage: 80 }
  },
  recentActivity: [
    { date: new Date(Date.now() - 86400000).toISOString(), score: 85, type: 'practice' },
    { date: new Date(Date.now() - 172800000).toISOString(), score: 70, type: 'test' },
    { date: new Date(Date.now() - 259200000).toISOString(), score: 90, type: 'practice' },
    { date: new Date(Date.now() - 345600000).toISOString(), score: 75, type: 'test' },
    { date: new Date(Date.now() - 432000000).toISOString(), score: 80, type: 'practice' }
  ],
  streakData: {
    currentStreak: 3,
    longestStreak: 7,
    lastStudyDate: new Date().toISOString().split('T')[0]
  }
};

// Mock user preferences
const MOCK_USER_PREFERENCES = {
  darkMode: true,
  highContrast: false,
  largeText: false,
  reduceMotion: false,
  currentSubject: 'Insurance',
  notificationsEnabled: true,
  studyReminders: true,
  reminderTime: '18:00'
};

// Initialize mock interceptors
export function setupMockApiInterceptors() {
  if (import.meta.env.VITE_USE_MOCK_AUTH !== 'true') {
    return; // Only setup interceptors if mock auth is enabled
  }

  console.log('Setting up mock API interceptors');
  
  // Intercept fetch requests
  const originalFetch = window.fetch;
  window.fetch = async function(url, options) {
    // Check if this is a request to our mock API endpoints
    if (typeof url === 'string') {
      // User stats endpoint
      if (url.includes('/api/user-stats')) {
        console.log('Intercepting user-stats request');
        
        // Handle reset endpoint specifically
        if (url.includes('/api/user-stats/reset') && options && options.method === 'POST') {
          console.log('Intercepting stats reset request');
          return mockSuccessResponse({ success: true, message: 'Stats reset successfully' });
        }
        
        // Handle other user-stats endpoints
        if (!options || options.method === 'GET' || !options.method) {
          return mockSuccessResponse(MOCK_USER_STATS);
        } else if (options.method === 'POST') {
          // Update stats (would parse body here in a real implementation)
          return mockSuccessResponse({ success: true, message: 'Stats updated successfully' });
        }
      }
      
      // User preferences endpoint
      if (url.includes('/api/user-preference')) {
        console.log('Intercepting user-preference request');
        
        if (!options || options.method === 'GET' || !options.method) {
          return mockSuccessResponse(MOCK_USER_PREFERENCES);
        } else if (options.method === 'POST') {
          // Update preferences (would parse body here in a real implementation)
          return mockSuccessResponse({ success: true, message: 'Preferences updated successfully' });
        }
      }
    }
    
    // Pass through to original fetch for non-intercepted requests
    return originalFetch(url, options);
  };
  
  // Intercept axios requests if axios is used
  if (window.axios) {
    const axios = window.axios;
    
    // Add a response interceptor
    axios.interceptors.request.use(
      function(config) {
        if (config.url.includes('/api/user-stats')) {
          // Cancel the real request and return mock data
          config.adapter = function() {
            return new Promise((resolve) => {
              resolve({
                data: MOCK_USER_STATS,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: config,
                request: {}
              });
            });
          };
        }
        
        if (config.url.includes('/api/user-preference')) {
          // Cancel the real request and return mock data
          config.adapter = function() {
            return new Promise((resolve) => {
              resolve({
                data: MOCK_USER_PREFERENCES,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: config,
                request: {}
              });
            });
          };
        }
        
        return config;
      },
      function(error) {
        return Promise.reject(error);
      }
    );
  }
}

// Helper function to create a mock successful response
function mockSuccessResponse(data) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data))
  });
}
