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

async function setupFirestore() {
  try {
    // 1. Clear existing collections
    const collections = ['users', 'communities', 'posts', 'comments', 'notifications'];
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).get();
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`Cleared ${collectionName} collection`);
    }

    // 2. Create composite indexes for queries
    // Users collection indexes
    await db.collection('users').doc('_indexes').set({
      // These are just markers for indexes we need to create in Firebase Console
      byUsername: 'username ASC',
      byDisplayName: 'displayName ASC',
      byCreatedAt: 'createdAt DESC',
      byRole: 'role ASC',
    });

    // Communities collection indexes
    await db.collection('communities').doc('_indexes').set({
      byName: 'name ASC',
      byMemberCount: 'memberCount DESC',
      byCreatedAt: 'createdAt DESC',
      byCategory: 'categories ASC, createdAt DESC',
    });

    // Posts collection indexes
    await db.collection('posts').doc('_indexes').set({
      byCommunity: 'communityId ASC, createdAt DESC',
      byAuthor: 'authorId ASC, createdAt DESC',
      byLikes: 'likes DESC, createdAt DESC',
      byViews: 'views DESC, createdAt DESC',
    });

    // Comments collection indexes
    await db.collection('comments').doc('_indexes').set({
      byPost: 'postId ASC, createdAt DESC',
      byAuthor: 'authorId ASC, createdAt DESC',
      byParentComment: 'parentCommentId ASC, createdAt ASC',
    });

    // Notifications collection indexes
    await db.collection('notifications').doc('_indexes').set({
      byRecipient: 'recipientId ASC, createdAt DESC',
      byType: 'type ASC, createdAt DESC',
      unreadByRecipient: 'recipientId ASC, read ASC, createdAt DESC',
    });

    // 3. Create initial data structures
    // Create an admin user for testing (you can delete this later)
    const adminUser = {
      id: 'admin',
      uid: 'admin',
      email: 'admin@divineai.com',
      username: 'admin',
      displayName: 'Admin',
      role: 'admin',
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

    await db.collection('users').doc('admin').set(adminUser);
    console.log('Created admin user');

    // Create a default community
    const defaultCommunity = {
      id: 'general',
      name: 'General',
      description: 'Welcome to the general community!',
      slug: 'general',
      privacy: 'public',
      creatorId: 'admin',
      moderators: ['admin'],
      members: ['admin'],
      rules: ['Be respectful', 'No spam', 'Follow community guidelines'],
      categories: ['general'],
      tags: ['welcome'],
      imageUrl: null,
      coverImageUrl: null,
      isVerified: true,
      memberCount: 1,
      postCount: 0,
      settings: {
        allowPublicPosts: true,
        requirePostApproval: false,
        allowMemberInvites: true
      },
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    };

    await db.collection('communities').doc('general').set(defaultCommunity);
    console.log('Created default community');

    // Create welcome post
    const welcomePost = {
      id: 'welcome',
      type: 'text',
      status: 'published',
      title: 'Welcome to Divine AI',
      content: 'Welcome to our community! Feel free to introduce yourself.',
      authorId: 'admin',
      communityId: 'general',
      tags: ['welcome'],
      likes: [],
      views: 0,
      commentCount: 0,
      isPinned: true,
      isLocked: false,
      isEdited: false,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    };

    await db.collection('posts').doc('welcome').set(welcomePost);
    console.log('Created welcome post');

    console.log('Successfully set up Firestore collections and indexes');
    
    // Print instructions for manual index creation
    console.log('\nIMPORTANT: You need to create the following indexes in Firebase Console:');
    console.log('1. Collection: users');
    console.log('   - username ASC, createdAt DESC');
    console.log('2. Collection: communities');
    console.log('   - memberCount DESC, createdAt DESC');
    console.log('   - categories ASC, createdAt DESC');
    console.log('3. Collection: posts');
    console.log('   - communityId ASC, createdAt DESC');
    console.log('   - authorId ASC, createdAt DESC');
    console.log('4. Collection: comments');
    console.log('   - postId ASC, createdAt DESC');
    console.log('   - parentCommentId ASC, createdAt ASC');
    console.log('5. Collection: notifications');
    console.log('   - recipientId ASC, read ASC, createdAt DESC');

  } catch (error) {
    console.error('Error setting up Firestore:', error);
  }
}

setupFirestore(); 