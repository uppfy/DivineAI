"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUser } from '@/lib/db';
import { User as DbUser } from '@/types/database';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, username: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, username: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      const userData: DbUser = {
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await createUser(userData);
    } catch (error) {
      console.error('Error in signUp:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user profile exists in Firestore
      const userRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create user profile in Firestore
        const userData: DbUser = {
          id: result.user.uid,
          uid: result.user.uid,
          email: result.user.email!,
          username: result.user.email!.split('@')[0], // Use email prefix as username
          displayName: result.user.displayName || result.user.email!.split('@')[0],
          avatarUrl: result.user.photoURL || undefined, // Convert null to undefined
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await createUser(userData);
      }
    } catch (error) {
      console.error('Error in signInWithGoogle:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 