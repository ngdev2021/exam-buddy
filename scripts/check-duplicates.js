const fs = require('fs');
const path = require('path');

// Path to the file to check
const filePath = path.join(__dirname, '../client/src/services/aiService.js');

// Read the file
const fileContent = fs.readFileSync(filePath, 'utf8');

// Regular expression to find function declarations
const functionRegex = /const\s+(\w+)\s*=/g;

// Find all function declarations
let match;
const functions = [];
while ((match = functionRegex.exec(fileContent)) !== null) {
  functions.push({
    name: match[1],
    position: match.index
  });
}

// Check for duplicates
const functionNames = {};
const duplicates = [];

functions.forEach(func => {
  if (functionNames[func.name]) {
    duplicates.push({
      name: func.name,
      positions: [functionNames[func.name].position, func.position]
    });
  } else {
    functionNames[func.name] = func;
  }
});

// Output results
if (duplicates.length > 0) {
  console.log('Duplicate function declarations found:');
  duplicates.forEach(dup => {
    console.log(`Function "${dup.name}" is declared at positions ${dup.positions.join(' and ')}`);
  });
} else {
  console.log('No duplicate function declarations found.');
}
