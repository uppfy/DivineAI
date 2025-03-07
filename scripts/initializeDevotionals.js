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

async function initializeDevotionals() {
  try {
    // Create the devotionals collection with a sample devotional
    const today = new Date();
    const dateId = today.toLocaleDateString('en-US', {
      timeZone: 'Africa/Nairobi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split('/').reverse().join('-');

    const formattedDate = today.toLocaleDateString('en-US', {
      timeZone: 'Africa/Nairobi',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Sample devotional to initialize the collection
    const sampleDevotional = {
      dateId: dateId,
      date: formattedDate,
      title: "Finding Strength in God's Presence",
      scripture: {
        text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
        reference: "Joshua 1:9"
      },
      reflection: "In times of uncertainty and challenge, God's promise of His constant presence gives us the strength to move forward. This verse reminds us that we are never alone in our journey. When God commands us to be strong and courageous, He backs it up with His promise to be with us. This isn't just about physical courage, but about the spiritual fortitude to face life's challenges with faith.",
      prayer: "Heavenly Father, thank You for Your constant presence in our lives. Help us to remember that You are always with us, giving us strength when we feel weak and courage when we are afraid. Guide us to trust in Your promises and to step forward in faith, knowing that You go before us. In Jesus' name, Amen.",
      timestamp: admin.firestore.Timestamp.now()
    };

    // Create the devotional document
    await db.collection('devotionals').doc(dateId).set(sampleDevotional);
    console.log('Successfully created devotionals collection with sample devotional');

    // Create the composite index for devotionals
    await db.collection('devotionals').doc('_indexes').set({
      byDateId: 'dateId DESC'
    });

    console.log('\nIMPORTANT: The following index has been configured:');
    console.log('Collection: devotionals');
    console.log('Fields:');
    console.log('  - dateId: Descending');
    console.log('\nVerify the index is created in Firebase Console at:');
    console.log(`https://console.firebase.google.com/project/${process.env.FIREBASE_PROJECT_ID}/firestore/indexes`);

  } catch (error) {
    console.error('Error initializing devotionals collection:', error);
  }
}

initializeDevotionals(); 