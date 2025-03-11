"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  reload
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUser, updateUser } from '@/lib/db';
import { User as DbUser } from '@/types/database';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, username: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  isEmailVerified: boolean;
  isAdmin: boolean;
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
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Reload user to get latest email verification status
        await reload(user);
        setIsEmailVerified(user.emailVerified);
        
        // Check if user is admin
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, username: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send verification email
      await sendEmailVerification(userCredential.user);
      
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
        emailVerified: false,
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update email verification status in Firestore
      if (userCredential.user.emailVerified) {
        await updateUser(userCredential.user.uid, {
          emailVerified: true,
          lastSeen: new Date().toISOString(),
          isOnline: true,
        });
      }
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
          username: result.user.email!.split('@')[0],
          displayName: result.user.displayName || result.user.email!.split('@')[0],
          avatarUrl: result.user.photoURL || undefined,
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
          emailVerified: true, // Google accounts are pre-verified
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
      if (user) {
        // Update user status in Firestore
        await updateUser(user.uid, {
          isOnline: false,
          lastSeen: new Date().toISOString(),
        });
      }
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

  const sendVerificationEmail = async () => {
    if (!user) throw new Error('No user logged in');
    if (user.emailVerified) throw new Error('Email already verified');
    
    try {
      await sendEmailVerification(user);
    } catch (error) {
      console.error('Error sending verification email:', error);
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
    resetPassword,
    sendVerificationEmail,
    isEmailVerified,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 