import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  createdAt: string;
  updatedAt: string;
}

export interface StudyProgress {
  userId: string;
  studyId: string;
  completedSteps: number[];
  lastUpdated: string;
}

export async function uploadBibleStudy(study: Omit<BibleStudy, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const timestamp = new Date().toISOString();
  const studyId = `${timestamp}-${Math.random().toString(36).substring(2, 15)}`;
  
  const studyData: BibleStudy = {
    ...study,
    id: studyId,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  const fileName = `bible-studies/${study.userId}/${studyId}.json`;
  
  const { error } = await supabase.storage
    .from('bible-studies')
    .upload(fileName, JSON.stringify(studyData), {
      contentType: 'application/json',
      cacheControl: '3600'
    });

  if (error) throw error;
  return studyId;
}

export async function getBibleStudy(userId: string, studyId: string): Promise<BibleStudy | null> {
  const { data, error } = await supabase.storage
    .from('bible-studies')
    .download(`bible-studies/${userId}/${studyId}.json`);

  if (error) {
    if (error.message.includes('Object not found')) {
      return null;
    }
    throw error;
  }
  
  const text = await data.text();
  return JSON.parse(text);
}

export async function getUserBibleStudies(userId: string): Promise<BibleStudy[]> {
  const { data, error } = await supabase.storage
    .from('bible-studies')
    .list(`bible-studies/${userId}`);

  if (error) throw error;

  const studies: BibleStudy[] = [];
  
  for (const file of data) {
    const { data: fileData } = await supabase.storage
      .from('bible-studies')
      .download(`bible-studies/${userId}/${file.name}`);

    if (fileData) {
      const study = JSON.parse(await fileData.text());
      studies.push(study);
    }
  }

  return studies.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function updateBibleStudy(
  userId: string, 
  studyId: string, 
  updates: Partial<BibleStudy>
): Promise<void> {
  const study = await getBibleStudy(userId, studyId);
  if (!study) throw new Error('Study not found');

  const updatedStudy: BibleStudy = {
    ...study,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  const { error } = await supabase.storage
    .from('bible-studies')
    .update(`bible-studies/${userId}/${studyId}.json`, JSON.stringify(updatedStudy), {
      contentType: 'application/json',
      cacheControl: '3600'
    });

  if (error) throw error;
}

export async function deleteBibleStudy(userId: string, studyId: string): Promise<void> {
  const { error } = await supabase.storage
    .from('bible-studies')
    .remove([`bible-studies/${userId}/${studyId}.json`]);

  if (error) throw error;
}

export async function updateStudyProgress(
  userId: string,
  studyId: string,
  completedSteps: number[]
): Promise<void> {
  const progressData: StudyProgress = {
    userId,
    studyId,
    completedSteps,
    lastUpdated: new Date().toISOString()
  };

  const fileName = `progress/${userId}/${studyId}.json`;

  const { error } = await supabase.storage
    .from('bible-studies')
    .upload(fileName, JSON.stringify(progressData), {
      contentType: 'application/json',
      cacheControl: '3600',
      upsert: true
    });

  if (error) throw error;
}

export async function getStudyProgress(
  userId: string,
  studyId: string
): Promise<StudyProgress | null> {
  const { data, error } = await supabase.storage
    .from('bible-studies')
    .download(`progress/${userId}/${studyId}.json`);

  if (error) {
    if (error.message.includes('Object not found')) {
      return null;
    }
    throw error;
  }

  const text = await data.text();
  return JSON.parse(text);
} 