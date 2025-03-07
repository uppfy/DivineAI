import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

async function createTestUser() {
  try {
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
      lastSeen: new Date().toISOString(),
      notifications: {
        email: true,
        push: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const userRef = doc(db, 'users', 'test-user');
    await setDoc(userRef, testUser);
    console.log('Test user created successfully');
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

createTestUser(); 