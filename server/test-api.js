import https from 'https';

// Disable SSL certificate verification for testing
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

console.log('🔍 Testing Production API at: https://reginaldbrowninc.com/api/tutor-response');
console.log('-------------------------------');
console.log('Starting API test...');

// Test data
const testData = {
  subject: 'Insurance Exam',
  topic: 'Risk Management',
  question: 'What are the key principles of risk management?',
  history: []
};

// Prepare the request data
const data = JSON.stringify(testData);

// Request options
const options = {
  hostname: 'reginaldbrowninc.com',
  port: 443,
  path: '/api/tutor-response',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Sending test request to tutor response API...');
console.log('Note: SSL certificate verification is disabled for testing purposes.');

// Make the request
const req = https.request(options, (res) => {
  let responseData = '';

  // Collect response data
  res.on('data', (chunk) => {
    responseData += chunk;
  });

  // Process the complete response
  res.on('end', () => {
    try {
      const response = JSON.parse(responseData);
      
      console.log('✅ API call successful!');
      console.log('-------------------------------');
      console.log('Response received:');
      console.log(`Answer length: ${response.answer.length} characters`);
      console.log(`Key points: ${response.keyPoints.length} items`);
      console.log('\nFirst 150 characters of answer:');
      console.log(response.answer.substring(0, 150) + '...');
      console.log('\n✅ Production API test completed successfully!');
      console.log('Your tutor response API is working correctly in production.');
    } catch (error) {
      console.error('❌ Error parsing API response:', error);
      console.error('Response data:', responseData);
    }
  });
});

// Handle request errors
req.on('error', (error) => {
  console.error('❌ API request failed:', error.message);
});

// Send the request data
req.write(data);
req.end();
