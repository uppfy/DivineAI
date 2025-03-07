import { User, Community, Post, Comment, UserRole, CommunityPrivacy, PostType, PostStatus, CommentStatus } from '../types/database';
import { ValidationError } from './errors';

// Validation rules
const VALIDATION_RULES = {
  username: /^[a-zA-Z0-9_]{3,20}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
};

// Generic validation function
function validateField(value: any, fieldName: string, rules: any): void {
  if (value === undefined || value === null) {
    throw new ValidationError(`${fieldName} is required`);
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    throw new ValidationError(`Invalid ${fieldName} format`, fieldName);
  }

  if (rules.min && value.length < rules.min) {
    throw new ValidationError(`${fieldName} must be at least ${rules.min} characters`, fieldName);
  }

  if (rules.max && value.length > rules.max) {
    throw new ValidationError(`${fieldName} must be at most ${rules.max} characters`, fieldName);
  }

  if (rules.enum && !rules.enum.includes(value)) {
    throw new ValidationError(`Invalid ${fieldName}`, fieldName);
  }
}

// User validation
export function validateUser(data: Partial<User>): void {
  if (data.username) {
    validateField(data.username, 'username', {
      pattern: VALIDATION_RULES.username,
      min: 3,
      max: 20,
    });
  }

  if (data.email) {
    validateField(data.email, 'email', {
      pattern: VALIDATION_RULES.email,
    });
  }

  if (data.role) {
    validateField(data.role, 'role', {
      enum: ['user', 'admin', 'moderator'] as UserRole[],
    });
  }

  if (data.website) {
    validateField(data.website, 'website', {
      pattern: VALIDATION_RULES.url,
    });
  }
}

// Community validation
export function validateCommunity(data: Partial<Community>): void {
  if (data.name) {
    validateField(data.name, 'name', {
      min: 3,
      max: 50,
    });
  }

  if (data.description) {
    validateField(data.description, 'description', {
      min: 10,
      max: 1000,
    });
  }

  if (data.privacy) {
    validateField(data.privacy, 'privacy', {
      enum: ['public', 'private', 'restricted'] as CommunityPrivacy[],
    });
  }

  if (data.slug) {
    validateField(data.slug, 'slug', {
      pattern: /^[a-z0-9-]+$/,
      min: 3,
      max: 50,
    });
  }
}

// Post validation
export function validatePost(data: Partial<Post>): void {
  if (data.title) {
    validateField(data.title, 'title', {
      min: 3,
      max: 300,
    });
  }

  if (data.content) {
    validateField(data.content, 'content', {
      min: 1,
      max: 40000,
    });
  }

  if (data.type) {
    validateField(data.type, 'type', {
      enum: ['text', 'image', 'link', 'video'] as PostType[],
    });
  }

  if (data.status) {
    validateField(data.status, 'status', {
      enum: ['draft', 'published', 'archived', 'removed'] as PostStatus[],
    });
  }

  if (data.linkUrl) {
    validateField(data.linkUrl, 'linkUrl', {
      pattern: VALIDATION_RULES.url,
    });
  }
}

// Comment validation
export function validateComment(data: Partial<Comment>): void {
  if (data.content) {
    validateField(data.content, 'content', {
      min: 1,
      max: 10000,
    });
  }

  if (data.status) {
    validateField(data.status, 'status', {
      enum: ['active', 'removed', 'flagged'] as CommentStatus[],
    });
  }
} 