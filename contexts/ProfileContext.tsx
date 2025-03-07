'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { User as DbUser } from '@/types/database';
import { useAuth } from './AuthContext';
import { getUser } from '@/lib/db';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ProfileContextType {
  profile: DbUser | null;
  loading: boolean;
  error: Error | null;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await getUser(user.uid);
      if (userData) {
        setProfile(userData);
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to refresh profile'));
    }
  };

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // Set up real-time listener for profile changes
    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (doc) => {
        setLoading(false);
        if (doc.exists()) {
          setProfile({ id: doc.id, ...doc.data() } as DbUser);
        } else {
          setProfile(null);
        }
      },
      (err) => {
        console.error('Error in profile snapshot:', err);
        setError(err instanceof Error ? err : new Error('Failed to load profile'));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return (
    <ProfileContext.Provider value={{ profile, loading, error, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
} 