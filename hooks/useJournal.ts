import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  JournalEntry,
  getUserJournalEntries,
  getUserPrayerEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  searchJournalEntries,
  markPrayerAsAnswered
} from '@/lib/journal';
import { Timestamp } from 'firebase/firestore';

interface UseJournalOptions {
  initialFilter?: {
    isPrayer?: boolean;
    isAnswered?: boolean;
    searchTerm?: string;
  };
}

export function useJournal(options: UseJournalOptions = {}) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState(options.initialFilter || {});

  // Fetch entries based on current filter
  const fetchEntries = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let fetchedEntries: JournalEntry[];
      
      if (filter.searchTerm) {
        fetchedEntries = await searchJournalEntries(user.uid, filter.searchTerm);
      } else if (filter.isPrayer) {
        fetchedEntries = await getUserPrayerEntries(user.uid, filter.isAnswered);
      } else {
        fetchedEntries = await getUserJournalEntries(user.uid);
      }
      
      setEntries(fetchedEntries);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch entries when user or filter changes
  useEffect(() => {
    fetchEntries();
  }, [user, filter.isPrayer, filter.isAnswered, filter.searchTerm]);

  // Create new entry
  const createEntry = async (entry: Omit<JournalEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      const newEntry = await createJournalEntry(user, entry);
      // Convert to Timestamp objects for state management
      const entryWithTimestamp = {
        ...newEntry,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      setEntries(prev => [entryWithTimestamp, ...prev]);
      return entryWithTimestamp;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  // Update existing entry
  const updateEntry = async (entryId: string, updates: Partial<JournalEntry>) => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      const updatedEntry = await updateJournalEntry(user.uid, entryId, updates);
      setEntries(prev => prev.map(entry => 
        entry.id === entryId ? updatedEntry : entry
      ));
      return updatedEntry;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  // Delete entry
  const deleteEntry = async (entryId: string) => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      await deleteJournalEntry(user.uid, entryId);
      setEntries(prev => prev.filter(entry => entry.id !== entryId));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  // Mark prayer as answered
  const markAsAnswered = async (entryId: string, reflection?: string) => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      const updatedEntry = await markPrayerAsAnswered(user.uid, entryId, reflection);
      setEntries(prev => prev.map(entry => 
        entry.id === entryId ? updatedEntry : entry
      ));
      return updatedEntry;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  // Update filter
  const updateFilter = (newFilter: Partial<typeof filter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };

  return {
    entries,
    loading,
    error,
    filter,
    createEntry,
    updateEntry,
    deleteEntry,
    markAsAnswered,
    updateFilter,
    refresh: fetchEntries
  };
} 