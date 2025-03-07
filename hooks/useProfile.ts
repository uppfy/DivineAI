import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getUser } from '../lib/db';
import { User } from '../types/database';

export function useProfile() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setProfile(null);
          setLoading(false);
          return;
        }

        const userData = await getUser(user.uid);
        if (!userData) {
          throw new Error('Profile not found');
        }
        setProfile(userData);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError(err instanceof Error ? err : new Error('Failed to load profile'));
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { profile, loading, error };
} 