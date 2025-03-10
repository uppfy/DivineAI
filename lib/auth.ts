import { auth } from './firebase';
import { createUser } from './db';
import { User } from '../types/database';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  UserCredential
} from 'firebase/auth';

export async function signUp(email: string, password: string, username: string, displayName: string): Promise<UserCredential> {
  try {
    // Create Firebase auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile in Firestore
    const userData: User = {
      id: userCredential.user.uid,
      uid: userCredential.user.uid,
      email,
      username,
      displayName,
      role: 'user',
      joinedCommunities: [],
      followers: [],
      following: [],
      isOnline: true,
      lastSeen: new Date().toISOString(),
      notifications: {
        email: true,
        push: true,
      },
      emailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await createUser(userData);
    return userCredential;
  } catch (error) {
    console.error('Error in signUp:', error);
    throw error;
  }
}

export async function signIn(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOut(): Promise<void> {
  return firebaseSignOut(auth);
} 