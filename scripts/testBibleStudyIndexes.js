const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Initialize admin SDK with service account
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
};

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function testIndexes() {
  try {
    console.log('Testing Firestore indexes...\n');

    // Test 1: Query bible_studies collection with compound index
    console.log('Test 1: Querying bible_studies by userId and createdAt');
    const bibleStudiesQuery = await db.collection('bible_studies')
      .where('userId', '==', 'sample_user')
      .orderBy('createdAt', 'desc')
      .get();

    console.log('Bible studies found:', bibleStudiesQuery.size);
    bibleStudiesQuery.forEach(doc => {
      console.log('Study:', {
        id: doc.id,
        title: doc.data().title,
        createdAt: doc.data().createdAt?.toDate()
      });
    });

    // Test 2: Query notes collection group with compound index
    console.log('\nTest 2: Querying notes across all bible studies');
    const notesQuery = await db.collectionGroup('notes')
      .where('userId', '==', 'sample_user')
      .orderBy('createdAt', 'desc')
      .get();

    console.log('Notes found:', notesQuery.size);
    notesQuery.forEach(doc => {
      console.log('Note:', {
        id: doc.id,
        content: doc.data().content,
        createdAt: doc.data().createdAt?.toDate()
      });
    });

    // Test 3: Query notes for a specific study
    console.log('\nTest 3: Querying notes for a specific study');
    const studyNotesQuery = await db.collection('users')
      .doc('sample_user')
      .collection('bible_studies')
      .doc('sample_study')
      .collection('notes')
      .orderBy('createdAt', 'desc')
      .get();

    console.log('Study notes found:', studyNotesQuery.size);
    studyNotesQuery.forEach(doc => {
      console.log('Study Note:', {
        id: doc.id,
        content: doc.data().content,
        createdAt: doc.data().createdAt?.toDate()
      });
    });

    console.log('\nAll index tests completed successfully!');
    process.exit(0);
  } catch (error) {
    if (error.code === 'failed-precondition') {
      console.error('\nError: Index not found. Please ensure you have created the following indexes in Firebase Console:');
      console.error('1. Collection: bible_studies (Collection scope)');
      console.error('   - userId (Ascending)');
      console.error('   - createdAt (Descending)');
      console.error('\n2. Collection: notes (Collection group scope)');
      console.error('   - studyId (Ascending)');
      console.error('   - createdAt (Descending)');
    } else {
      console.error('\nError testing indexes:', error);
    }
    process.exit(1);
  }
}

testIndexes(); 