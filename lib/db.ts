import { adminDb } from './firebase-admin';
import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  DocumentData,
  QueryConstraint,
  limit,
  orderBy,
  startAfter,
  increment,
  serverTimestamp,
} from 'firebase/firestore';

import {
  User,
  Community,
  Post,
  Comment,
  Notification,
  WithOptional,
  BlogPost,
  BlogCategory,
} from '../types/database';

import { validateUser, validateCommunity, validatePost, validateComment } from './validation';
import { handleFirebaseError } from './errors';

// Collections
export const COLLECTIONS = {
  USERS: 'users',
  COMMUNITIES: 'communities',
  POSTS: 'posts',
  COMMENTS: 'comments',
  NOTIFICATIONS: 'notifications',
  BLOG_POSTS: 'blogPosts',
} as const;

// User Operations
export async function createUser(user: User): Promise<void> {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, user.id);
    await setDoc(userRef, {
      ...user,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log(`Created user profile for ID: ${user.id}`);
  } catch (error) {
    console.error('Error creating user:', error);
    throw handleFirebaseError(error);
  }
}

export async function updateUser(uid: string, data: Partial<User>): Promise<void> {
  try {
    validateUser(data);
    await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

export async function getUser(uid: string): Promise<User | null> {
  try {
    console.log('Attempting to fetch user with ID:', uid);
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    console.log('User document reference:', userRef.path);
    
    const userDoc = await getDoc(userRef);
    console.log('Document exists?', userDoc.exists());
    
    if (!userDoc.exists()) {
      console.log(`No user found with ID: ${uid}`);
      return null;
    }
    
    const userData = userDoc.data();
    console.log('Raw user data:', userData);
    
    // Validate the data structure
    if (!userData.id || !userData.uid || !userData.email) {
      console.error('Invalid user data structure:', userData);
      throw new Error('Invalid user data structure');
    }
    
    return userData as User;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

// Community Operations
export async function createCommunity(data: Omit<Community, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    validateCommunity(data);
    const communityRef = doc(collection(db, COLLECTIONS.COMMUNITIES));
    const now = new Date().toISOString();
    
    await setDoc(communityRef, {
      ...data,
      id: communityRef.id,
      createdAt: now,
      updatedAt: now,
      memberCount: 0,
      postCount: 0,
    });
    
    return communityRef.id;
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

export async function updateCommunity(id: string, data: Partial<Community>): Promise<void> {
  try {
    validateCommunity(data);
    await updateDoc(doc(db, COLLECTIONS.COMMUNITIES, id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

export async function getCommunity(id: string): Promise<Community | null> {
  try {
    const communityDoc = await getDoc(doc(db, COLLECTIONS.COMMUNITIES, id));
    return communityDoc.exists() ? communityDoc.data() as Community : null;
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

// Post Operations
export async function createPost(data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    validatePost(data);
    const postRef = doc(collection(db, COLLECTIONS.POSTS));
    const now = new Date().toISOString();
    
    await setDoc(postRef, {
      ...data,
      id: postRef.id,
      createdAt: now,
      updatedAt: now,
      views: 0,
      commentCount: 0,
      likes: [],
    });
    
    // Update community post count
    await updateDoc(doc(db, COLLECTIONS.COMMUNITIES, data.communityId), {
      postCount: increment(1),
    });
    
    return postRef.id;
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

export async function updatePost(id: string, data: Partial<Post>): Promise<void> {
  try {
    validatePost(data);
    await updateDoc(doc(db, COLLECTIONS.POSTS, id), {
      ...data,
      updatedAt: new Date().toISOString(),
      isEdited: true,
      lastEditedAt: new Date().toISOString(),
    });
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

export async function getPost(id: string): Promise<Post | null> {
  try {
    const postDoc = await getDoc(doc(db, COLLECTIONS.POSTS, id));
    return postDoc.exists() ? postDoc.data() as Post : null;
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

// Comment Operations
export async function createComment(data: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    validateComment(data);
    const commentRef = doc(collection(db, COLLECTIONS.COMMENTS));
    const now = new Date().toISOString();
    
    await setDoc(commentRef, {
      ...data,
      id: commentRef.id,
      createdAt: now,
      updatedAt: now,
      likes: [],
      replyCount: 0,
      status: 'active',
    });
    
    // Update post comment count
    await updateDoc(doc(db, COLLECTIONS.POSTS, data.postId), {
      commentCount: increment(1),
    });
    
    // If this is a reply, update parent comment's reply count
    if (data.parentCommentId) {
      await updateDoc(doc(db, COLLECTIONS.COMMENTS, data.parentCommentId), {
        replyCount: increment(1),
      });
    }
    
    return commentRef.id;
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

export async function updateComment(id: string, data: Partial<Comment>): Promise<void> {
  try {
    validateComment(data);
    await updateDoc(doc(db, COLLECTIONS.COMMENTS, id), {
      ...data,
      updatedAt: new Date().toISOString(),
      isEdited: true,
      lastEditedAt: new Date().toISOString(),
    });
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

export async function getComment(id: string): Promise<Comment | null> {
  try {
    const commentDoc = await getDoc(doc(db, COLLECTIONS.COMMENTS, id));
    return commentDoc.exists() ? commentDoc.data() as Comment : null;
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

// Pagination helper
export interface PaginationParams {
  limit?: number;
  startAfter?: string;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
}

// Generic paginated query function
export async function getPaginatedDocs<T extends { id: string }>(
  collectionName: string,
  constraints: QueryConstraint[],
  pagination: PaginationParams
): Promise<{ items: T[]; lastDoc: string | null }> {
  try {
    const queryConstraints: QueryConstraint[] = [...constraints];
    
    if (pagination.orderByField) {
      queryConstraints.push(orderBy(pagination.orderByField, pagination.orderDirection || 'desc'));
    }
    
    if (pagination.startAfter) {
      const startAfterDoc = await getDoc(doc(db, collectionName, pagination.startAfter));
      if (startAfterDoc.exists()) {
        queryConstraints.push(startAfter(startAfterDoc));
      }
    }
    
    queryConstraints.push(limit(pagination.limit || 10));
    
    const q = query(collection(db, collectionName), ...queryConstraints);
    const snapshot = await getDocs(q);
    
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    const lastDoc = items.length > 0 ? items[items.length - 1].id : null;
    
    return { items, lastDoc };
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

// Blog Post Operations
export async function createBlogPost(data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'views'>): Promise<string> {
  try {
    const blogPostRef = doc(collection(db, COLLECTIONS.BLOG_POSTS));
    const now = new Date().toISOString();
    
    // Generate slug from title if not provided
    const slug = data.slug || data.title.toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
    
    // Set default category if not provided
    const category = data.category || 'General';
    
    await setDoc(blogPostRef, {
      ...data,
      id: blogPostRef.id,
      slug,
      category,
      createdAt: now,
      updatedAt: now,
      views: 0,
      status: data.status || 'draft',
    });
    
    return blogPostRef.id;
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

export async function updateBlogPost(id: string, data: Partial<BlogPost>): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTIONS.BLOG_POSTS, id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

export async function getBlogPost(id: string): Promise<BlogPost | null> {
  try {
    const blogPostDoc = await getDoc(doc(db, COLLECTIONS.BLOG_POSTS, id));
    return blogPostDoc.exists() ? blogPostDoc.data() as BlogPost : null;
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const q = query(collection(db, COLLECTIONS.BLOG_POSTS), where('slug', '==', slug), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    return querySnapshot.docs[0].data() as BlogPost;
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

export async function getPublishedBlogPosts(
  pagination: PaginationParams = { limit: 10, orderByField: 'publishedAt', orderDirection: 'desc' }
): Promise<{ items: BlogPost[]; lastDoc: string | null }> {
  try {
    const constraints: QueryConstraint[] = [
      where('status', '==', 'published'),
    ];
    
    return getPaginatedDocs<BlogPost>(COLLECTIONS.BLOG_POSTS, constraints, pagination);
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

export async function getBlogPostsByCategory(
  category: BlogCategory,
  pagination: PaginationParams = { limit: 10, orderByField: 'publishedAt', orderDirection: 'desc' }
): Promise<{ items: BlogPost[]; lastDoc: string | null }> {
  try {
    const constraints: QueryConstraint[] = [
      where('status', '==', 'published'),
      where('category', '==', category),
    ];
    
    return getPaginatedDocs<BlogPost>(COLLECTIONS.BLOG_POSTS, constraints, pagination);
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

export async function getRelatedBlogPosts(
  category: BlogCategory,
  currentPostId: string,
  limitCount: number = 3
): Promise<BlogPost[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.BLOG_POSTS),
      where('status', '==', 'published'),
      where('category', '==', category),
      where('id', '!=', currentPostId),
      orderBy('publishedAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as BlogPost);
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

export async function incrementBlogPostViews(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTIONS.BLOG_POSTS, id), {
      views: increment(1),
    });
  } catch (error) {
    throw handleFirebaseError(error);
  }
} 