const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Initialize admin SDK with service account
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function initializeFirestore() {
  try {
    // Create test user
    const testUser = {
      id: 'test-user',
      uid: 'test-user',
      email: 'test@example.com',
      username: 'testuser',
      displayName: 'Test User',
      role: 'user',
      joinedCommunities: [],
      followers: [],
      following: [],
      isOnline: true,
      lastSeen: admin.firestore.Timestamp.now(),
      notifications: {
        email: true,
        push: true
      },
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    };

    // Create collections and test documents
    await db.collection('users').doc('test-user').set(testUser);
    console.log('Created test user');

    // Create empty collections
    const collections = ['communities', 'posts', 'comments', 'notifications'];
    for (const collectionName of collections) {
      // Create a temporary document and then delete it to ensure collection exists
      const tempDoc = await db.collection(collectionName).add({
        _temp: true,
        createdAt: admin.firestore.Timestamp.now()
      });
      await tempDoc.delete();
      console.log(`Initialized ${collectionName} collection`);
    }

    console.log('Successfully initialized Firestore collections');
  } catch (error) {
    console.error('Error initializing Firestore:', error);
  }
}

initializeFirestore(); 