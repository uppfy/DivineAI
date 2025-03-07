import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface StudyStep {
  heading: string;
  description: string;
  completed: boolean;
}

export interface BibleStudy {
  id?: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL: string;
  title: string;
  description: string;
  scripture_reference: string;
  type: 'verse' | 'question' | 'theme';
  checklist: StudyStep[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface StudyNote {
  id: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  studyId: string;
  userId: string;
}

// Create a new Bible study plan
export async function createStudyPlan(studyData: Omit<BibleStudy, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const studyRef = await addDoc(collection(db, 'bible_studies'), {
      ...studyData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return studyRef.id;
  } catch (error) {
    console.error('Error creating study plan:', error);
    throw error;
  }
}

// Get a specific Bible study plan
export async function getStudyPlan(planId: string) {
  try {
    const studyDoc = await getDoc(doc(db, 'bible_studies', planId));
    if (!studyDoc.exists()) return null;
    return { id: studyDoc.id, ...studyDoc.data() } as BibleStudy;
  } catch (error) {
    console.error('Error getting study plan:', error);
    throw error;
  }
}

// Get all Bible study plans for a user
export async function getUserStudyPlans(userId: string) {
  try {
    const q = query(
      collection(db, 'bible_studies'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BibleStudy[];
  } catch (error) {
    console.error('Error getting user study plans:', error);
    throw error;
  }
}

// Update a Bible study plan
export async function updateStudyPlan(planId: string, updates: Partial<BibleStudy>) {
  try {
    const studyRef = doc(db, 'bible_studies', planId);
    await updateDoc(studyRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating study plan:', error);
    throw error;
  }
}

// Delete a Bible study plan
export async function deleteStudyPlan(planId: string) {
  try {
    await deleteDoc(doc(db, 'bible_studies', planId));
  } catch (error) {
    console.error('Error deleting study plan:', error);
    throw error;
  }
}

// Create a note for a study plan
export async function createStudyNote(userId: string, studyId: string, content: string) {
  try {
    const notesRef = collection(db, 'users', userId, 'bible_studies', studyId, 'notes');
    const docRef = await addDoc(notesRef, {
      content,
      userId,
      studyId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating study note:', error);
    throw error;
  }
}

// Get all notes for a study plan
export async function getStudyNotes(userId: string, studyId: string) {
  try {
    const notesRef = collection(db, 'users', userId, 'bible_studies', studyId, 'notes');
    const q = query(notesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as StudyNote[];
  } catch (error) {
    console.error('Error getting study notes:', error);
    throw error;
  }
}

// Update a study note
export async function updateStudyNote(userId: string, studyId: string, noteId: string, content: string) {
  try {
    const noteRef = doc(db, 'users', userId, 'bible_studies', studyId, 'notes', noteId);
    await updateDoc(noteRef, {
      content,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating study note:', error);
    throw error;
  }
}

// Delete a study note
export async function deleteStudyNote(userId: string, studyId: string, noteId: string) {
  try {
    const noteRef = doc(db, 'users', userId, 'bible_studies', studyId, 'notes', noteId);
    await deleteDoc(noteRef);
  } catch (error) {
    console.error('Error deleting study note:', error);
    throw error;
  }
}

// Update study plan progress
export async function updateStudyProgress(planId: string, checklist: StudyStep[]) {
  try {
    const studyRef = doc(db, 'bible_studies', planId);
    await updateDoc(studyRef, {
      checklist,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating study progress:', error);
    throw error;
  }
} 