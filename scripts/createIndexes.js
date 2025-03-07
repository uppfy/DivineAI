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

async function createIndexes() {
  try {
    // Create the composite index for comments
    await db.collection('comments').doc('_indexes').set({
      postId_createdAt: {
        fields: ['postId', 'createdAt'],
        order: ['ASC', 'DESC']
      }
    });

    console.log('Successfully created indexes configuration');
    console.log('\nIMPORTANT: You need to create the following index in Firebase Console:');
    console.log('Collection: comments');
    console.log('Fields:');
    console.log('  - postId: Ascending');
    console.log('  - createdAt: Descending');
    console.log('\nCreate the index here:');
    console.log('https://console.firebase.google.com/project/_/firestore/indexes');

  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}

createIndexes(); 