// Simple script to check environment variables

require('dotenv').config({ path: '.env.local' });

console.log('Checking environment variables:');
console.log('OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);
console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length);
console.log('OPENAI_API_KEY type:', process.env.OPENAI_API_KEY?.substring(0, 7));

// Check if the API key is properly formatted
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('ERROR: No API key found in environment variables');
} else if (apiKey.startsWith('sk-proj-')) {
  console.log('API key is a Project-scoped key (new format)');
} else if (apiKey.startsWith('sk-')) {
  console.log('API key is a standard API key (old format)');
} else {
  console.error('WARNING: API key format is not recognized');
}

// Suggest next steps
console.log('\nTo fix API key issues:');
console.log('1. Check that your .env.local file is in the project root directory');
console.log('2. Restart your development server after making changes to .env.local');
console.log('3. Consider getting a new API key from OpenAI if the current one is not working');
console.log('4. Ensure you have access to the models you\'re trying to use (gpt-3.5-turbo is safest)'); 