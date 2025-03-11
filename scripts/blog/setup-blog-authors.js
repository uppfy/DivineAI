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

// Sample blog authors
const blogAuthors = [
  {
    id: 'admin',
    name: 'Divine Comfort Team',
    email: 'admin@divinecomfort.org',
    bio: 'The Divine Comfort Team is a group of passionate believers dedicated to sharing God\'s love, wisdom, and comfort through biblical teachings and spiritual guidance.',
    avatarUrl: 'https://fcuiwgbwavqwunqerchc.supabase.co/storage/v1/object/public/assets/blog/authors/divine-comfort-team.jpg',
    role: 'admin',
    socialLinks: {
      facebook: 'https://facebook.com/divinecomfort',
      twitter: 'https://twitter.com/divinecomfort',
      instagram: 'https://instagram.com/divinecomfort',
    },
    postCount: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pastor-john',
    name: 'Pastor John Davis',
    email: 'john.davis@divinecomfort.org',
    bio: 'Pastor John Davis has been serving in ministry for over 20 years. He is passionate about helping people discover God\'s purpose for their lives and finding comfort in His promises.',
    avatarUrl: 'https://fcuiwgbwavqwunqerchc.supabase.co/storage/v1/object/public/assets/blog/authors/pastor-john.jpg',
    role: 'author',
    socialLinks: {
      facebook: 'https://facebook.com/pastorjohndavis',
      twitter: 'https://twitter.com/pastorjohndavis',
    },
    postCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sarah-thompson',
    name: 'Sarah Thompson',
    email: 'sarah.thompson@divinecomfort.org',
    bio: 'Sarah Thompson is a Christian counselor and author with a heart for helping people find healing and hope through God\'s Word. She specializes in topics related to emotional well-being and spiritual growth.',
    avatarUrl: 'https://fcuiwgbwavqwunqerchc.supabase.co/storage/v1/object/public/assets/blog/authors/sarah-thompson.jpg',
    role: 'author',
    socialLinks: {
      instagram: 'https://instagram.com/sarahthompson',
      twitter: 'https://twitter.com/sarahthompson',
    },
    postCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Function to set up blog authors
async function setupBlogAuthors() {
  try {
    console.log('Setting up blog authors...');
    
    // Create a batch write
    const batch = db.batch();
    
    // Add blog authors
    for (const author of blogAuthors) {
      const docRef = db.collection('blogAuthors').doc(author.id);
      batch.set(docRef, author);
    }
    
    // Commit the batch
    await batch.commit();
    
    console.log('Blog authors set up successfully!');
    console.log(`Created ${blogAuthors.length} blog authors.`);
    
  } catch (error) {
    console.error('Error setting up blog authors:', error);
  } finally {
    // Exit the process
    process.exit(0);
  }
}

// Run the setup function
setupBlogAuthors();