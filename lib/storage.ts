import { supabase, STORAGE_BUCKETS } from './supabase';
import { auth } from './firebase';
import { v4 as uuidv4 } from 'uuid';

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export class StorageError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'StorageError';
  }
}

// Validate file before upload
function validateFile(file: File, allowedTypes: string[]) {
  if (!allowedTypes.includes(file.type)) {
    throw new StorageError(
      `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      'invalid_file_type'
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new StorageError(
      `File size too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      'file_too_large'
    );
  }
}

// Generate a unique file path for storage
function generateFilePath(file: File, userId: string, prefix: string = ''): string {
  const ext = file.name.split('.').pop();
  const uniqueId = uuidv4();
  return `${userId}/${prefix}${uniqueId}.${ext}`;
}

// Get current user's Firebase token
async function getFirebaseToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) {
    throw new StorageError('User not authenticated', 'unauthenticated');
  }
  return user.getIdToken();
}

// Upload a single file
async function uploadFile(
  bucket: string,
  file: File,
  userId: string,
  path: string
): Promise<string> {
  // Verify Firebase authentication
  const token = await getFirebaseToken();
  if (!token) {
    throw new StorageError('Not authenticated', 'unauthenticated');
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      // Add any additional headers or metadata if needed
      duplex: 'half'
    });

  if (error) {
    throw new StorageError(error.message, 'upload_failed');
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrl;
}

// Delete a single file
async function deleteFile(bucket: string, path: string): Promise<void> {
  // Verify Firebase authentication
  const token = await getFirebaseToken();
  if (!token) {
    throw new StorageError('Not authenticated', 'unauthenticated');
  }

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    throw new StorageError(error.message, 'delete_failed');
  }
}

// User avatar upload
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  validateFile(file, ALLOWED_IMAGE_TYPES);
  const path = generateFilePath(file, userId, 'avatar/');
  return uploadFile(STORAGE_BUCKETS.AVATARS, file, userId, path);
}

// User/Community cover image upload
export async function uploadCover(file: File, userId: string): Promise<string> {
  validateFile(file, ALLOWED_IMAGE_TYPES);
  const path = generateFilePath(file, userId, 'cover/');
  return uploadFile(STORAGE_BUCKETS.COVERS, file, userId, path);
}

// Community image upload
export async function uploadCommunityImage(file: File, userId: string): Promise<string> {
  validateFile(file, ALLOWED_IMAGE_TYPES);
  const path = generateFilePath(file, userId, 'community/');
  return uploadFile(STORAGE_BUCKETS.COMMUNITY_IMAGES, file, userId, path);
}

// Post media upload (supports both images and videos)
export async function uploadPostMedia(file: File, userId: string): Promise<string> {
  validateFile(file, [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]);
  const path = generateFilePath(file, userId, 'post/');
  return uploadFile(STORAGE_BUCKETS.POST_MEDIA, file, userId, path);
}

// Delete media file
export async function deleteMedia(bucket: string, url: string): Promise<void> {
  const path = url.split('/').pop();
  if (!path) {
    throw new StorageError('Invalid file URL', 'invalid_url');
  }
  await deleteFile(bucket, path);
}

// Upload multiple files
export async function uploadMultipleFiles(
  bucket: string,
  files: File[],
  allowedTypes: string[]
): Promise<string[]> {
  const uploadPromises = files.map(async (file) => {
    validateFile(file, allowedTypes);
    const path = generateFilePath(file, '', '');
    return uploadFile(bucket, file, '', path);
  });

  return Promise.all(uploadPromises);
} 