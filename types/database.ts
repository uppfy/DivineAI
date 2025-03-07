import { Timestamp } from 'firebase/firestore';

// Base interface for common fields
interface BaseDocument {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// User related interfaces
export type UserRole = 'user' | 'admin' | 'moderator';

export interface User extends BaseDocument {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  role: UserRole;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  joinedCommunities: string[]; // Array of community IDs
  followers: string[]; // Array of user IDs
  following: string[]; // Array of user IDs
  isOnline: boolean;
  lastSeen: string;
  notifications: {
    email: boolean;
    push: boolean;
  };
}

// Community related interfaces
export type CommunityPrivacy = 'public' | 'private' | 'restricted';

export interface Community extends BaseDocument {
  name: string;
  description: string;
  slug: string;
  privacy: CommunityPrivacy;
  creatorId: string;
  moderators: string[]; // Array of user IDs
  members: string[]; // Array of user IDs
  rules: string[];
  categories: string[];
  tags: string[];
  imageUrl?: string;
  coverImageUrl?: string;
  isVerified: boolean;
  memberCount: number;
  postCount: number;
  settings: {
    allowPublicPosts: boolean;
    requirePostApproval: boolean;
    allowMemberInvites: boolean;
  };
}

// Post related interfaces
export type PostType = 'text' | 'image' | 'link' | 'video';
export type PostStatus = 'draft' | 'published' | 'archived' | 'removed';

export interface Post extends BaseDocument {
  type: PostType;
  status: PostStatus;
  title: string;
  content: string;
  authorId: string;
  communityId: string;
  tags: string[];
  mediaUrls?: string[]; // Array of media URLs (images, videos)
  linkUrl?: string;
  likes: string[]; // Array of user IDs
  views: number;
  commentCount: number;
  isPinned: boolean;
  isLocked: boolean;
  isEdited: boolean;
  lastEditedAt?: string;
  metadata?: {
    originalSource?: string;
    linkPreview?: {
      title?: string;
      description?: string;
      imageUrl?: string;
    };
  };
}

// Comment related interfaces
export type CommentStatus = 'active' | 'removed' | 'flagged';

export interface Comment extends BaseDocument {
  content: string;
  authorId: string;
  postId: string;
  parentCommentId?: string; // For nested comments
  status: CommentStatus;
  likes: string[]; // Array of user IDs
  isEdited: boolean;
  lastEditedAt?: string;
  replyCount: number;
}

// Notification types
export type NotificationType = 
  | 'like' 
  | 'comment' 
  | 'mention' 
  | 'follow' 
  | 'community_invite' 
  | 'post_reply';

export interface Notification extends BaseDocument {
  type: NotificationType;
  recipientId: string;
  senderId: string;
  read: boolean;
  title: string;
  message: string;
  linkUrl: string;
  metadata?: {
    postId?: string;
    commentId?: string;
    communityId?: string;
  };
}

// Helper type for Firestore document references
export type FirestoreDate = Timestamp | string;

// Helper type for partial updates
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>; 