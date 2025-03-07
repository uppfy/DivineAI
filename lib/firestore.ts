import { db } from './firebase';
import { adminDb } from './firebase-admin';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  getDoc,
  limit,
  startAfter,
  DocumentSnapshot,
  writeBatch,
  increment,
  setDoc
} from 'firebase/firestore';

export interface Post {
  id: string;
  type: 'prayer' | 'testimony' | 'thought';
  userId: string;
  userDisplayName: string;
  userPhotoURL: string;
  title: string;
  content: string;
  createdAt: any;
  likeCount: number;
  commentCount: number;
}

export interface PostReaction {
  userId: string;
  createdAt: any;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL: string;
  content: string;
  createdAt: any;
}

// Posts Collection Operations
export const createPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'likeCount' | 'commentCount'>) => {
  try {
    const docRef = await addDoc(collection(db, 'posts'), {
      ...postData,
      createdAt: serverTimestamp(),
      likeCount: 0,
      commentCount: 0
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const getPosts = async (
  filterType: string = 'all',
  lastPost: DocumentSnapshot | null = null,
  pageSize: number = 10
) => {
  try {
    let postsQuery = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (filterType !== 'all') {
      postsQuery = query(
        collection(db, 'posts'),
        where('type', '==', filterType),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
    }

    if (lastPost) {
      postsQuery = query(
        postsQuery,
        startAfter(lastPost)
      );
    }

    const querySnapshot = await getDocs(postsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Post[];
  } catch (error) {
    console.error('Error getting posts:', error);
    throw error;
  }
};

export const subscribeToPostUpdates = (
  filterType: string = 'all',
  callback: (posts: Post[]) => void
) => {
  let postsQuery = query(
    collection(db, 'posts'),
    orderBy('createdAt', 'desc'),
    limit(10)
  );

  if (filterType !== 'all') {
    postsQuery = query(
      collection(db, 'posts'),
      where('type', '==', filterType),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
  }

  return onSnapshot(postsQuery, (snapshot) => {
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Post[];
    callback(posts);
  });
};

// Post Reactions Operations
export const togglePostLike = async (postId: string, userId: string) => {
  try {
    const reactionRef = doc(db, 'posts', postId, 'reactions', userId);
    const reactionDoc = await getDoc(reactionRef);
    const batch = writeBatch(db);
    const postRef = doc(db, 'posts', postId);

    if (reactionDoc.exists()) {
      // Remove like
      batch.delete(reactionRef);
      batch.update(postRef, {
        likeCount: increment(-1)
      });
      await batch.commit();
      return false; // Like removed
    } else {
      // Add like
      batch.set(reactionRef, {
        userId,
        createdAt: serverTimestamp()
      });
      batch.update(postRef, {
        likeCount: increment(1)
      });
      await batch.commit();
      return true; // Like added
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

export const hasUserLiked = async (postId: string, userId: string) => {
  try {
    if (!userId) {
      console.log('No userId provided, returning false');
      return false;
    }

    console.log(`Checking if user ${userId} has liked post ${postId}`);
    
    // First verify the post exists
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      console.error(`Post ${postId} does not exist`);
      throw new Error(`Post ${postId} not found`);
    }
    
    console.log('Post exists, checking reaction...');
    const reactionRef = doc(db, 'posts', postId, 'reactions', userId);
    
    try {
      const reactionDoc = await getDoc(reactionRef);
      const hasLiked = reactionDoc.exists();
      console.log(`User ${userId} has${hasLiked ? '' : ' not'} liked post ${postId}`);
      return hasLiked;
    } catch (error) {
      console.error('Error reading reaction:', error);
      // If we get a permission error, the user is probably not authenticated
      if (error instanceof Error && error.message.includes('permission')) {
        console.log('Permission error, user might not be authenticated');
        return false;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in hasUserLiked:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to check like status: ${error.message}`);
    }
    throw error;
  }
};

export const getPostLikes = async (postId: string) => {
  try {
    const reactionsRef = collection(db, 'posts', postId, 'reactions');
    const snapshot = await getDocs(reactionsRef);
    return snapshot.docs.length;
  } catch (error) {
    console.error('Error getting likes:', error);
    throw error;
  }
};

export const subscribeToPostLikes = (postId: string, callback: (likes: number) => void) => {
  const reactionsRef = collection(db, 'posts', postId, 'reactions');
  return onSnapshot(reactionsRef, (snapshot) => {
    callback(snapshot.docs.length);
  }, (error) => {
    console.error('Error in likes subscription:', error);
  });
};

// Comments Operations
export const addComment = async (commentData: Omit<PostComment, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'comments'), {
      ...commentData,
      createdAt: serverTimestamp()
    });

    // Update post comment count
    const postRef = doc(db, 'posts', commentData.postId);
    const postDoc = await getDoc(postRef);
    await updateDoc(postRef, {
      commentCount: (postDoc.data()?.commentCount || 0) + 1
    });

    return docRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const getPostComments = async (postId: string) => {
  try {
    const commentsQuery = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(commentsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PostComment[];
  } catch (error) {
    console.error('Error getting comments:', error);
    throw error;
  }
};

export const subscribeToComments = (postId: string, callback: (comments: PostComment[]) => void) => {
  const commentsQuery = query(
    collection(db, 'comments'),
    where('postId', '==', postId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(commentsQuery, (snapshot) => {
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PostComment[];
    callback(comments);
  });
};

export const getPostById = async (postId: string): Promise<Post | null> => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      return null;
    }

    return {
      id: postDoc.id,
      ...postDoc.data()
    } as Post;
  } catch (error) {
    console.error('Error getting post:', error);
    throw error;
  }
}; 