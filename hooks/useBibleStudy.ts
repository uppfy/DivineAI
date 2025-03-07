import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  BibleStudy,
  StudyProgress,
  uploadBibleStudy,
  getBibleStudy,
  getUserBibleStudies,
  updateBibleStudy,
  deleteBibleStudy,
  updateStudyProgress,
  getStudyProgress
} from '@/lib/supabase-storage';

interface UseBibleStudyOptions {
  studyId?: string;
}

export function useBibleStudy(options: UseBibleStudyOptions = {}) {
  const { user } = useAuth();
  const [studies, setStudies] = useState<BibleStudy[]>([]);
  const [currentStudy, setCurrentStudy] = useState<BibleStudy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch studies or single study based on options
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (options.studyId) {
          const study = await getBibleStudy(user.uid, options.studyId);
          setCurrentStudy(study);
        } else {
          const userStudies = await getUserBibleStudies(user.uid);
          setStudies(userStudies);
        }
      } catch (err) {
        console.error('Error loading studies:', err);
        setError(err instanceof Error ? err : new Error('Failed to load studies'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, options.studyId]);

  const handleCreateStudy = async (studyData: Omit<BibleStudy, 'id' | 'userId' | 'userDisplayName' | 'userPhotoURL' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('User must be logged in to create a study plan');

    try {
      const newStudy = {
        ...studyData,
        userId: user.uid,
        userDisplayName: user.displayName || 'Anonymous',
        userPhotoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
      };

      const studyId = await uploadBibleStudy(newStudy);
      
      if (!options.studyId) {
        const createdStudy = await getBibleStudy(user.uid, studyId);
        if (createdStudy) {
          setStudies([createdStudy, ...studies]);
        }
      }

      return studyId;
    } catch (error) {
      console.error('Error creating study:', error);
      throw error;
    }
  };

  const handleUpdateProgress = async (studyId: string, checklist: BibleStudy['checklist']) => {
    if (!user) throw new Error('User must be logged in to update progress');
    
    try {
      const completedSteps = checklist
        .map((step, index) => step.completed ? index : -1)
        .filter(index => index !== -1);

      await updateStudyProgress(user.uid, studyId, completedSteps);
      
      if (currentStudy) {
        const updatedStudy = { ...currentStudy, checklist };
        await updateBibleStudy(user.uid, studyId, updatedStudy);
        setCurrentStudy(updatedStudy);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  };

  const handleDeleteStudy = async (studyId: string) => {
    if (!user) throw new Error('User must be logged in to delete a study plan');
    
    try {
      await deleteBibleStudy(user.uid, studyId);
      if (options.studyId) {
        setCurrentStudy(null);
      } else {
        setStudies(studies.filter(study => study.id !== studyId));
      }
    } catch (error) {
      console.error('Error deleting study:', error);
      throw error;
    }
  };

  return {
    studies,
    currentStudy,
    loading,
    error,
    createStudy: handleCreateStudy,
    updateProgress: handleUpdateProgress,
    deleteStudy: handleDeleteStudy
  };
} 