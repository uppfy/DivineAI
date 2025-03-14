'use server';

import { adminDb } from '@/lib/firebase-admin';
import { increment } from 'firebase-admin/firestore';

/**
 * Increment the view count for a blog post
 * This is a server action that uses the admin SDK to bypass Firestore security rules
 */
export async function incrementBlogPostViews(postId: string): Promise<void> {
  try {
    await adminDb.collection('blogPosts').doc(postId).update({
      views: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing blog post views:', error);
    // Silently fail - we don't want to break the page if view counting fails
  }
} 