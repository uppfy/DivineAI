import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';

export interface JournalEntry {
  id?: string;
  title: string;
  content: string;
  date: string;
  mood?: string;
  tags: string[];
  verse?: string;
  isPrayer: boolean;
  isAnswered?: boolean;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Get all journal entries for a user
export async function getUserJournalEntries(userId: string) {
  const entriesRef = collection(db, 'users', userId, 'journal');
  const q = query(entriesRef, orderBy('date', 'desc'));
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as JournalEntry[];
}

// Get prayer entries for a user
export async function getUserPrayerEntries(userId: string, isAnswered?: boolean) {
  const entriesRef = collection(db, 'users', userId, 'journal');
  let q = query(
    entriesRef,
    where('isPrayer', '==', true),
    orderBy('date', 'desc')
  );
  
  if (typeof isAnswered === 'boolean') {
    q = query(
      entriesRef,
      where('isPrayer', '==', true),
      where('isAnswered', '==', isAnswered),
      orderBy('date', 'desc')
    );
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as JournalEntry[];
}

// Create a new journal entry
export async function createJournalEntry(user: User, entry: Omit<JournalEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
  const entriesRef = collection(db, 'users', user.uid, 'journal');
  
  const newEntry = {
    ...entry,
    userId: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  const docRef = await addDoc(entriesRef, newEntry);
  return {
    id: docRef.id,
    ...newEntry
  };
}

// Update a journal entry
export async function updateJournalEntry(userId: string, entryId: string, updates: Partial<JournalEntry>) {
  const entryRef = doc(db, 'users', userId, 'journal', entryId);
  
  const updateData = {
    ...updates,
    updatedAt: serverTimestamp(),
  };
  
  await updateDoc(entryRef, updateData);
  
  const updatedDoc = await getDoc(entryRef);
  return {
    id: updatedDoc.id,
    ...updatedDoc.data()
  } as JournalEntry;
}

// Delete a journal entry
export async function deleteJournalEntry(userId: string, entryId: string) {
  const entryRef = doc(db, 'users', userId, 'journal', entryId);
  await deleteDoc(entryRef);
}

// Search journal entries
export async function searchJournalEntries(userId: string, searchTerm: string) {
  // Note: Basic implementation - Firestore doesn't support full-text search
  // For production, consider using Algolia or a similar service
  const entriesRef = collection(db, 'users', userId, 'journal');
  const q = query(entriesRef, orderBy('date', 'desc'));
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data()
    }) as JournalEntry)
    .filter(entry => 
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
}

// Mark a prayer as answered
export async function markPrayerAsAnswered(userId: string, entryId: string, reflection?: string) {
  const entryRef = doc(db, 'users', userId, 'journal', entryId);
  
  await updateDoc(entryRef, {
    isAnswered: true,
    reflection,
    updatedAt: serverTimestamp(),
  });
  
  const updatedDoc = await getDoc(entryRef);
  return {
    id: updatedDoc.id,
    ...updatedDoc.data()
  } as JournalEntry;
} 