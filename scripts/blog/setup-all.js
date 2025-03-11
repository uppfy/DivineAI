// Import required modules
const { execSync } = require('child_process');
const path = require('path');

// Function to run all setup scripts
async function setupAll() {
  try {
    console.log('Setting up all blog collections...\n');
    
    // Run setup-blog-collections.js
    console.log('Running setup-blog-collections.js...');
    execSync('node setup-blog-collections.js', { stdio: 'inherit' });
    console.log('Blog collections setup complete.\n');
    
    // Run setup-blog-tags.js
    console.log('Running setup-blog-tags.js...');
    execSync('node setup-blog-tags.js', { stdio: 'inherit' });
    console.log('Blog tags setup complete.\n');
    
    // Run setup-blog-authors.js
    console.log('Running setup-blog-authors.js...');
    execSync('node setup-blog-authors.js', { stdio: 'inherit' });
    console.log('Blog authors setup complete.\n');
    
    // Run verify-blog-collections.js
    console.log('Verifying all blog collections...');
    execSync('node verify-blog-collections.js', { stdio: 'inherit' });
    
    console.log('\nAll blog collections have been set up successfully!');
    
  } catch (error) {
    console.error('Error setting up blog collections:', error);
    process.exit(1);
  }
}

// Run the setup function
setupAll(); 