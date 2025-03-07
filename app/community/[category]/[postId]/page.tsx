"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Heart, Send } from "lucide-react";
import { toast } from 'sonner';
import { 
  Post,
  PostComment,
  togglePostLike,
  hasUserLiked,
  subscribeToPostLikes,
  addComment,
  subscribeToComments,
  getPostById,
  getPostComments
} from '@/lib/firestore';
import { formatDistanceToNow } from 'date-fns';

interface PageProps {
  params: {
    category: string;
    postId: string;
  }
}

export default function PostPage({ params }: PageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load post data
  useEffect(() => {
    async function loadPost() {
      try {
        const postData = await getPostById(params.postId);
        if (!postData) {
          toast.error("Post not found");
          router.push('/community');
          return;
        }
        setPost(postData);
      } catch (error) {
        console.error('Error loading post:', error);
        toast.error("Failed to load post");
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [params.postId, router]);

  // Load initial comments and subscribe to updates
  useEffect(() => {
    if (!post?.id) return;

    let unsubscribe: (() => void) | undefined;

    async function loadComments() {
      try {
        setCommentsLoading(true);
        // First load comments normally
        const initialComments = await getPostComments(post!.id);
        setComments(initialComments);
        
        // Then subscribe to real-time updates
        unsubscribe = subscribeToComments(post!.id, (updatedComments) => {
          setComments(updatedComments);
        });
      } catch (error) {
        console.error('Error loading comments:', error);
        toast.error("Failed to load comments");
      } finally {
        setCommentsLoading(false);
      }
    }

    loadComments();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [post]);

  // Check if user has liked the post
  useEffect(() => {
    if (!user?.uid || !post?.id) return;

    async function checkUserLike() {
      try {
        const liked = await hasUserLiked(post!.id, user!.uid);
        setHasLiked(liked);
      } catch (error) {
        console.error('Error checking user like:', error);
      }
    }

    checkUserLike();
  }, [user, post]);

  // Subscribe to likes
  useEffect(() => {
    if (!post) return;

    const unsubscribe = subscribeToPostLikes(post.id, (count) => {
      setLikeCount(count);
    });

    return () => unsubscribe();
  }, [post]);

  const handleLike = async () => {
    if (!user || !post) {
      toast.error("Please sign in to like posts");
      return;
    }

    try {
      const liked = await togglePostLike(post.id, user.uid);
      setHasLiked(liked);
      toast.success(liked ? "Post liked!" : "Post unliked!");
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error("Failed to update like. Please try again.");
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !post) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      setSubmitting(true);
      await addComment({
        postId: post.id,
        userId: user.uid,
        userDisplayName: user.displayName || 'Anonymous',
        userPhotoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        content: newComment.trim()
      });

      setNewComment('');
      toast.success("Comment added successfully");
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error("Failed to add comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-purple-100 rounded w-1/4"></div>
            <div className="h-48 bg-purple-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Timeline</span>
        </button>

        {/* Post Card */}
        <Card className="p-6 mb-8">
          <div className="flex items-start gap-4">
            <img
              src={post.userPhotoURL}
              alt={post.userDisplayName}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{post.userDisplayName}</h3>
                  <span className="text-sm text-gray-500">
                    {post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : ''}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  post.type === 'prayer' 
                    ? 'bg-purple-100 text-[#6b21a8]' 
                    : post.type === 'testimony'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {post.type === 'prayer' ? 'Prayer Request' : post.type === 'testimony' ? 'Testimony' : 'Thought'}
                </span>
              </div>
              <h4 className="font-medium text-gray-900 mt-2">{post.title}</h4>
              <p className="text-gray-700 mt-2">{post.content}</p>
              
              {/* Like Button */}
              <div className="flex items-center gap-6 mt-4">
                <button 
                  className={`flex items-center gap-2 ${
                    hasLiked ? 'text-[#6b21a8] font-semibold' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={handleLike}
                >
                  <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : 'fill-none'}`} />
                  <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Comment Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Comments ({comments.length})</h2>
          
          {/* New Comment Input */}
          {user && (
            <div className="flex gap-4">
              <img
                src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
                alt={user.displayName || 'User'}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSubmitComment();
                      }
                    }}
                    className="w-full px-4 py-2 bg-gray-100 rounded-full pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleSubmitComment}
                    disabled={submitting || !newComment.trim()}
                    className="absolute right-2 p-2 text-[#6b21a8] hover:text-[#581c87] disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {commentsLoading ? (
              // Loading skeleton for comments
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <Card key={n} className="p-4">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-baseline gap-2">
                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                          <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                        </div>
                        <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <Card key={comment.id} className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={comment.userPhotoURL}
                      alt={comment.userDisplayName}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-gray-900">
                          {comment.userDisplayName}
                        </span>
                        <span className="text-sm text-gray-500">
                          {comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : ''}
                        </span>
                      </div>
                      <p className="text-gray-700 mt-1">{comment.content}</p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 