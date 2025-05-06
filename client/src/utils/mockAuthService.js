/**
 * Mock authentication service for local development
 * This allows testing without connecting to the production API
 */

// Mock user data
const MOCK_USERS = [
  {
    id: 'dev-user-1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123', // In a real app, passwords would be hashed
    role: 'user'
  },
  {
    id: 'dev-admin-1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  }
];

// Mock token generation - simplified for development
const generateMockToken = (user) => {
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  };
  
  // This is NOT a real JWT, just a mock for development
  return `mock_token_${btoa(JSON.stringify(payload))}`;
};

// Mock authentication functions
export const mockAuthService = {
  login: async (email, password) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user = MOCK_USERS.find(u => u.email === email);
    
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password');
    }
    
    const token = generateMockToken(user);
    
    // Return format matching the real API
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };
  },
  
  register: async (name, email, password) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    if (MOCK_USERS.some(u => u.email === email)) {
      throw new Error('User with this email already exists');
    }
    
    // Create new user
    const newUser = {
      id: `dev-user-${MOCK_USERS.length + 1}`,
      name,
      email,
      password,
      role: 'user'
    };
    
    // In a real implementation, we would save this user
    // For mock purposes, we'll just add to our array
    MOCK_USERS.push(newUser);
    
    const token = generateMockToken(newUser);
    
    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      token
    };
  },
  
  verifyToken: async (token) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!token || !token.startsWith('mock_token_')) {
      throw new Error('Invalid token');
    }
    
    try {
      const payload = JSON.parse(atob(token.replace('mock_token_', '')));
      
      // Check if token is expired
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }
      
      return {
        valid: true,
        user: {
          id: payload.sub,
          name: payload.name,
          email: payload.email,
          role: payload.role
        }
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  },
  
  // Mock user stats for dashboard
  getUserStats: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      totalAnswered: 87,
      correctAnswered: 64,
      topicStats: {
        'Property Insurance': { total: 15, correct: 12, incorrect: 3 },
        'Casualty Insurance': { total: 22, correct: 18, incorrect: 4 },
        'Life Insurance': { total: 18, correct: 10, incorrect: 8 },
        'Health Insurance': { total: 12, correct: 9, incorrect: 3 },
        'Insurance Regulations': { total: 20, correct: 15, incorrect: 5 }
      }
    };
  }
};

// Mock API response for generating questions
export const generateMockQuestions = async (topic, count = 1) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const questions = [];
  
  for (let i = 0; i < count; i++) {
    questions.push({
      id: `mock-q-${Date.now()}-${i}`,
      question: `Sample ${topic} question #${i+1}: What is the primary purpose of ${topic}?`,
      choices: [
        `Answer option A related to ${topic}`,
        `Answer option B related to ${topic}`,
        `Answer option C related to ${topic}`,
        `Answer option D related to ${topic}`
      ],
      answer: `Answer option A related to ${topic}`,
      explanation: `This is a sample explanation for the ${topic} question. In a real implementation, this would provide detailed information about why the correct answer is correct.`
    });
  }
  
  return questions;
};
