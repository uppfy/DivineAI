// Import required modules
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });

// Initialize Firebase Admin with service account
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
});

const db = admin.firestore();

// Function to verify blog collections
async function verifyBlogCollections() {
  try {
    console.log('Verifying blog collections...\n');
    
    // Verify blog posts
    const blogPostsSnapshot = await db.collection('blogPosts').get();
    console.log(`Blog Posts: ${blogPostsSnapshot.size} documents found`);
    
    if (blogPostsSnapshot.size > 0) {
      console.log('Sample Blog Post Titles:');
      blogPostsSnapshot.forEach(doc => {
        console.log(`- ${doc.data().title}`);
      });
    }
    
    // Verify blog categories
    const blogCategoriesSnapshot = await db.collection('blogCategories').get();
    console.log(`\nBlog Categories: ${blogCategoriesSnapshot.size} documents found`);
    
    if (blogCategoriesSnapshot.size > 0) {
      console.log('Categories:');
      blogCategoriesSnapshot.forEach(doc => {
        console.log(`- ${doc.data().name}`);
      });
    }
    
    // Verify blog tags
    const blogTagsSnapshot = await db.collection('blogTags').get();
    console.log(`\nBlog Tags: ${blogTagsSnapshot.size} documents found`);
    
    if (blogTagsSnapshot.size > 0) {
      console.log('Sample Tags:');
      let count = 0;
      blogTagsSnapshot.forEach(doc => {
        if (count < 5) {
          console.log(`- ${doc.data().name}`);
          count++;
        }
      });
      
      if (blogTagsSnapshot.size > 5) {
        console.log(`... and ${blogTagsSnapshot.size - 5} more`);
      }
    }
    
    // Verify blog authors
    const blogAuthorsSnapshot = await db.collection('blogAuthors').get();
    console.log(`\nBlog Authors: ${blogAuthorsSnapshot.size} documents found`);
    
    if (blogAuthorsSnapshot.size > 0) {
      console.log('Authors:');
      blogAuthorsSnapshot.forEach(doc => {
        console.log(`- ${doc.data().name} (${doc.data().role})`);
      });
    }
    
    console.log('\nVerification complete!');
    
  } catch (error) {
    console.error('Error verifying blog collections:', error);
  } finally {
    // Exit the process
    process.exit(0);
  }
}

// Run the verification function
verifyBlogCollections(); 