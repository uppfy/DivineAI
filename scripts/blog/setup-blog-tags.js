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

// Sample blog tags
const blogTags = [
  {
    id: 'prayer',
    name: 'Prayer',
    slug: 'prayer',
    description: 'Articles about developing a meaningful prayer life and communicating with God.',
    count: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'scripture',
    name: 'Scripture',
    slug: 'scripture',
    description: 'Insights and teachings from the Bible and its application to daily life.',
    count: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'peace',
    name: 'Peace',
    slug: 'peace',
    description: 'Finding and maintaining inner peace through faith and spiritual practices.',
    count: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'anxiety',
    name: 'Anxiety',
    slug: 'anxiety',
    description: 'Biblical perspectives and practical advice for managing anxiety and worry.',
    count: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gratitude',
    name: 'Gratitude',
    slug: 'gratitude',
    description: 'Cultivating a thankful heart and recognizing God\'s blessings in everyday life.',
    count: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'spiritual-disciplines',
    name: 'Spiritual Disciplines',
    slug: 'spiritual-disciplines',
    description: 'Practices that promote spiritual growth and a deeper relationship with God.',
    count: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'devotional',
    name: 'Devotional',
    slug: 'devotional',
    description: 'Short, inspirational readings for daily spiritual nourishment.',
    count: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'relationship-with-god',
    name: 'Relationship with God',
    slug: 'relationship-with-god',
    description: 'Developing and deepening your personal connection with God.',
    count: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Function to set up blog tags
async function setupBlogTags() {
  try {
    console.log('Setting up blog tags...');
    
    // Create a batch write
    const batch = db.batch();
    
    // Add blog tags
    for (const tag of blogTags) {
      const docRef = db.collection('blogTags').doc(tag.id);
      batch.set(docRef, tag);
    }
    
    // Commit the batch
    await batch.commit();
    
    console.log('Blog tags set up successfully!');
    console.log(`Created ${blogTags.length} blog tags.`);
    
  } catch (error) {
    console.error('Error setting up blog tags:', error);
  } finally {
    // Exit the process
    process.exit(0);
  }
}

// Run the setup function
setupBlogTags(); 