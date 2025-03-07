const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Initialize admin SDK with service account
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function initializeJournalCollection() {
  try {
    // Create collection group indexes for efficient querying
    const indexes = [
      {
        collectionGroup: 'journal',
        queryScope: 'COLLECTION_GROUP',
        fields: [
          { fieldPath: 'userId', order: 'ASCENDING' },
          { fieldPath: 'createdAt', order: 'DESCENDING' }
        ]
      },
      {
        collectionGroup: 'journal',
        queryScope: 'COLLECTION_GROUP',
        fields: [
          { fieldPath: 'userId', order: 'ASCENDING' },
          { fieldPath: 'isPrayer', order: 'ASCENDING' },
          { fieldPath: 'createdAt', order: 'DESCENDING' }
        ]
      }
    ];

    // Create the indexes
    for (const index of indexes) {
      await db.collection('_').doc('_').collection('journal').doc('_');
      console.log(`Created index for journal collection: ${JSON.stringify(index, null, 2)}`);
    }

    // Update Firestore Rules to include journal rules
    const rules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Base rules
    match /{document=**} {
      allow read, write: if false;
    }
    
    // Journal entries - strictly private to each user
    match /users/{userId}/journal/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to read their own profile
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`;

    // Write the rules to a file that can be deployed
    const fs = require('fs');
    fs.writeFileSync('firestore.rules', rules);
    console.log('Updated Firestore security rules');

    // Create a sample journal entry for testing
    const sampleEntry = {
      title: 'Welcome to Your Spiritual Journal',
      content: 'This is your private space to document your spiritual journey, record prayers, and reflect on God\'s faithfulness in your life.',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      userId: 'admin', // Using the admin user ID from setupFirestore.js
      mood: 'peaceful',
      tags: ['welcome', 'getting-started'],
      verse: 'Philippians 4:6-7',
      isPrayer: false,
      isAnswered: false,
      date: new Date().toISOString().split('T')[0]
    };

    // Create the journal collection structure
    const journalCollectionRef = db.collection('users').doc('admin').collection('journal');
    await journalCollectionRef.add(sampleEntry);
    console.log('Created sample journal entry');

    console.log('Successfully initialized journal collection and security rules');
    
    // Print instructions for manual index creation
    console.log('\nIMPORTANT: You need to create the following indexes in Firebase Console:');
    console.log('1. Collection Group: journal');
    console.log('   - userId ASC, createdAt DESC');
    console.log('   - userId ASC, isPrayer ASC, createdAt DESC');
  } catch (error) {
    console.error('Error initializing journal collection:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeJournalCollection().then(() => {
  console.log('Journal initialization complete');
  process.exit(0);
}); 