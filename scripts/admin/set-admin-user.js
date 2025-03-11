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

// Email to set as admin
const adminEmail = 'joseph.mj.oc@gmail.com';

// Function to set user as admin
async function setUserAsAdmin(email) {
  try {
    console.log(`Setting user with email ${email} as admin...`);
    
    // Get user by email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (snapshot.empty) {
      console.log('No user found with that email.');
      return;
    }
    
    // Should only be one user with this email
    let userDoc = null;
    snapshot.forEach(doc => {
      userDoc = doc;
    });
    
    // Update user role to admin
    await db.collection('users').doc(userDoc.id).update({
      role: 'admin',
      updatedAt: new Date().toISOString()
    });
    
    console.log(`User ${userDoc.id} (${email}) has been set as admin successfully!`);
    
  } catch (error) {
    console.error('Error setting user as admin:', error);
  } finally {
    // Exit the process
    process.exit(0);
  }
}

// Run the function
setUserAsAdmin(adminEmail); 