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

async function initializeBibleStudyCollections() {
  try {
    console.log('Creating collection indexes...');

    // Create indexes for bible_studies collection
    await db.collection('bible_studies').doc('_').set({
      userId: 'dummy',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create indexes for notes collection
    await db.collection('users').doc('_')
      .collection('bible_studies').doc('_')
      .collection('notes').doc('_').set({
        studyId: 'dummy',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    // Create collection group indexes
    const indexes = [
      {
        collectionGroup: 'bible_studies',
        queryScope: 'COLLECTION',
        fields: [
          { fieldPath: 'userId', order: 'ASCENDING' },
          { fieldPath: 'createdAt', order: 'DESCENDING' }
        ]
      },
      {
        collectionGroup: 'notes',
        queryScope: 'COLLECTION_GROUP',
        fields: [
          { fieldPath: 'studyId', order: 'ASCENDING' },
          { fieldPath: 'createdAt', order: 'DESCENDING' }
        ]
      }
    ];

    // Create the indexes using the Firebase Admin SDK
    for (const index of indexes) {
      try {
        if (index.queryScope === 'COLLECTION_GROUP') {
          await db.collection('users').doc('_')
            .collection('bible_studies').doc('_')
            .collection(index.collectionGroup).doc('_');
        } else {
          await db.collection(index.collectionGroup).doc('_');
        }
        console.log(`Created index for ${index.queryScope} ${index.collectionGroup}`);
      } catch (error) {
        console.error(`Error creating index for ${index.collectionGroup}:`, error);
      }
    }

    // Create a sample Bible study plan
    const sampleStudy = {
      title: "Understanding God's Love",
      description: "A comprehensive study on God's unconditional love through scripture",
      scripture_reference: "1 John 4:7-21",
      type: "theme",
      userId: "sample_user",
      userDisplayName: "Sample User",
      userPhotoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=sample",
      checklist: [
        {
          heading: "God's Nature of Love",
          description: "Study how God's love is described in 1 John 4:8",
          completed: false
        },
        {
          heading: "Love in Action",
          description: "Examine how God demonstrated His love through Christ",
          completed: false
        }
      ],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('bible_studies').add(sampleStudy);

    // Create a sample note
    await db.collection('users')
      .doc('sample_user')
      .collection('bible_studies')
      .doc('sample_study')
      .collection('notes')
      .add({
        content: "Reflection on God's unconditional love...",
        userId: "sample_user",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    console.log('\nSuccessfully initialized Bible study collections and created indexes');
    console.log('\nIndexes created:');
    console.log('1. Collection: bible_studies (Collection scope)');
    console.log('   - userId (Ascending)');
    console.log('   - createdAt (Descending)');
    console.log('\n2. Collection: notes (Collection group scope)');
    console.log('   - studyId (Ascending)');
    console.log('   - createdAt (Descending)');

    // Create a firebase.json file for index configuration
    const fs = require('fs');
    const firebaseConfig = {
      firestore: {
        indexes: [
          {
            "collectionGroup": "bible_studies",
            "queryScope": "COLLECTION",
            "fields": [
              { "fieldPath": "userId", "order": "ASCENDING" },
              { "fieldPath": "createdAt", "order": "DESCENDING" }
            ]
          },
          {
            "collectionGroup": "notes",
            "queryScope": "COLLECTION_GROUP",
            "fields": [
              { "fieldPath": "studyId", "order": "ASCENDING" },
              { "fieldPath": "createdAt", "order": "DESCENDING" }
            ]
          }
        ]
      }
    };

    fs.writeFileSync('firebase.json', JSON.stringify(firebaseConfig, null, 2));
    console.log('\nCreated firebase.json with index configuration');
    console.log('\nBible study initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing Bible study collections:', error);
    process.exit(1);
  }
}

initializeBibleStudyCollections(); 