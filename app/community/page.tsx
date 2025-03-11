"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  Search,
  PlusCircle,
  ChevronDown,
  MessageCircle,
  Share2,
  Settings,
  HelpCircle,
  MessageSquare,
  Users,
  Calendar,
  BookOpen,
  HandHeart,
  Heart,
  ChevronRight,
  SlidersHorizontal,
  PenLine,
  Send
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from 'sonner';
import { 
  Post, 
  createPost, 
  subscribeToPostUpdates, 
  togglePostLike,
  subscribeToPostLikes,
  hasUserLiked,
  addComment,
  getPostComments,
  subscribeToComments
} from '@/lib/firestore';
import { DocumentSnapshot } from 'firebase/firestore';

const CommunityPage = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPostDropdown, setShowNewPostDropdown] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [lastPost, setLastPost] = useState<DocumentSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [newPost, setNewPost] = useState<{
    title: string;
    content: string;
    type: 'prayer' | 'testimony' | 'thought';
  }>({
    title: '',
    content: '',
    type: 'prayer'
  });
  const [postLikes, setPostLikes] = useState<{[key: string]: number}>({});
  const [userLikes, setUserLikes] = useState<{[key: string]: boolean}>({});
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [newComments, setNewComments] = useState<{[key: string]: string}>({});
  const [submittingComment, setSubmittingComment] = useState<{[key: string]: boolean}>({});
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  // Add ref for timeout
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Subscribe to posts updates with filter
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToPostUpdates(filter, (updatedPosts) => {
      setPosts(updatedPosts);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      setLoading(false);
    };
  }, [filter]);

  // Update filter when URL changes
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam && ['all', 'prayer', 'testimony', 'thought'].includes(filterParam)) {
      setFilter(filterParam);
    } else {
      setFilter('all');
    }
  }, [searchParams]);

  // Handle filter change from dropdown
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    const params = new URLSearchParams(window.location.search);
    if (newFilter === 'all') {
      params.delete('filter');
    } else {
      params.set('filter', newFilter);
    }
    router.push(`/community${params.toString() ? `?${params.toString()}` : ''}`);
  };

  // Load user likes when posts change
  useEffect(() => {
    const loadUserLikes = async () => {
      if (user && posts.length > 0) {
        try {
          const likes = await Promise.all(
            posts.map(post => hasUserLiked(post.id, user.uid))
          );
          
          const newUserLikes = posts.reduce((acc, post, index) => {
            acc[post.id] = likes[index];
            return acc;
          }, {} as {[key: string]: boolean});
          
          setUserLikes(newUserLikes);
        } catch (error) {
          console.error('Error loading user likes:', error);
        }
      }
    };

    loadUserLikes();
  }, [user, posts]);

  // Subscribe to likes for each post
  useEffect(() => {
    const unsubscribers = posts.map(post => {
      return subscribeToPostLikes(post.id, (likeCount) => {
        setPostLikes(prev => ({
          ...prev,
          [post.id]: likeCount
        }));
      });
    });

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [posts]);

  const handleMouseEnter = () => {
    if (!user) {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      setShowLoginOverlay(true);
    }
  };

  const handleMouseLeave = () => {
    if (!user) {
      hideTimeoutRef.current = setTimeout(() => {
        setShowLoginOverlay(false);
      }, 1000);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsSearchVisible(currentScrollY < lastScrollY || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    return (
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleNewPost = (type: 'prayer' | 'testimony' | 'thought') => {
    setShowNewPostDropdown(false);
    setNewPost(prev => ({ ...prev, type }));
    setShowNewPostModal(true);
  };

  const handleSubmitPost = async () => {
    if (!user) {
      toast.error("Please sign in to create a post.");
      return;
    }

    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error("Please fill in both title and content.");
      return;
    }

    try {
      await createPost({
        type: newPost.type,
        userId: user.uid,
        userDisplayName: user.displayName || 'Anonymous',
        userPhotoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        title: newPost.title,
        content: newPost.content
      });

      setShowNewPostModal(false);
      setNewPost({ title: '', content: '', type: 'prayer' });
      toast.success("Your post has been shared with the community.");
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error("Failed to create post. Please try again.");
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      toast.error("Please sign in to like posts.");
      return;
    }

    try {
      const liked = await togglePostLike(postId, user.uid);
      setUserLikes(prev => ({
        ...prev,
        [postId]: liked
      }));
      
      if (liked) {
        toast.success("Post liked!");
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error("Failed to update like. Please try again.");
    }
  };

  const handleCommentClick = (postId: string) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
    if (!newComments[postId]) {
      setNewComments(prev => ({ ...prev, [postId]: '' }));
    }
  };

  const handleSubmitComment = async (postId: string) => {
    if (!user) {
      toast.error("Please sign in to comment");
      return;
    }

    const comment = newComments[postId]?.trim();
    if (!comment) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      setSubmittingComment(prev => ({ ...prev, [postId]: true }));
      await addComment({
        postId,
        userId: user.uid,
        userDisplayName: user.displayName || 'Anonymous',
        userPhotoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        content: comment
      });

      setNewComments(prev => ({ ...prev, [postId]: '' }));
      setExpandedPostId(null);
      toast.success("Comment added successfully");
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error("Failed to add comment. Please try again.");
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleMobileNewPost = () => {
    if (!user) {
      router.push('/sign-in');
      return;
    }
    setShowCategoryDialog(true);
  };

  const handleMobileCategorySelect = (type: 'prayer' | 'testimony' | 'thought') => {
    setShowCategoryDialog(false);
    setNewPost(prev => ({ ...prev, type }));
    setShowNewPostModal(true);
  };

  return (
    <main className="min-h-screen py-8 bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb
            items={[
              { title: "Home", href: "/" },
              { title: "Community", href: "/community", isCurrentPage: true }
            ]}
            description="Connect, share, and grow together in faith."
          />

          {/* Mobile Navigation Row */}
          <div className="lg:hidden sticky top-0 z-20 bg-white/95 backdrop-blur-sm shadow-sm -mx-4 sm:mx-0 px-4 py-2 mt-4">
            <div className="flex items-center justify-between overflow-x-auto no-scrollbar">
              <button
                onClick={() => handleFilterChange('all')}
                className={`flex flex-col items-center min-w-[80px] p-2 ${
                  filter === 'all' ? 'text-[#6b21a8]' : 'text-gray-600'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs mt-1">All</span>
              </button>
              <button
                onClick={() => handleFilterChange('prayer')}
                className={`flex flex-col items-center min-w-[80px] p-2 ${
                  filter === 'prayer' ? 'text-[#6b21a8]' : 'text-gray-600'
                }`}
              >
                <HandHeart className="w-5 h-5" />
                <span className="text-xs mt-1">Prayers</span>
              </button>
              <button
                onClick={() => handleFilterChange('testimony')}
                className={`flex flex-col items-center min-w-[80px] p-2 ${
                  filter === 'testimony' ? 'text-[#6b21a8]' : 'text-gray-600'
                }`}
              >
                <Heart className="w-5 h-5" />
                <span className="text-xs mt-1">Testimonies</span>
              </button>
              <button
                onClick={() => handleFilterChange('thought')}
                className={`flex flex-col items-center min-w-[80px] p-2 ${
                  filter === 'thought' ? 'text-[#6b21a8]' : 'text-gray-600'
                }`}
              >
                <PenLine className="w-5 h-5" />
                <span className="text-xs mt-1">Thoughts</span>
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-7 gap-8 mt-8">
            {/* Left Sidebar - Hidden on Mobile */}
            <div className="hidden lg:block lg:col-span-2">
              <Card className="p-4 sticky top-4">
                <h2 className="text-base font-semibold text-[#6b21a8] mb-4">Menu</h2>
                <nav className="space-y-2">
                  <Link 
                    href="/community"
                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors text-base ${
                      filter === 'all' ? 'bg-purple-100 text-[#6b21a8]' : 'hover:bg-purple-50 text-gray-700'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>All Posts</span>
                  </Link>
                  <Link 
                    href="/community?filter=prayer" 
                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors text-base ${
                      filter === 'prayer' ? 'bg-purple-100 text-[#6b21a8]' : 'hover:bg-purple-50 text-gray-700'
                    }`}
                  >
                    <HandHeart className="w-5 h-5" />
                    <span>Prayer Requests</span>
                  </Link>
                  <Link 
                    href="/community?filter=testimony" 
                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors text-base ${
                      filter === 'testimony' ? 'bg-purple-100 text-[#6b21a8]' : 'hover:bg-purple-50 text-gray-700'
                    }`}
                  >
                    <Heart className="w-5 h-5" />
                    <span>Testimonies</span>
                  </Link>
                  <Link 
                    href="/community?filter=thought"
                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors text-base ${
                      filter === 'thought' ? 'bg-purple-100 text-[#6b21a8]' : 'hover:bg-purple-50 text-gray-700'
                    }`}
                  >
                    <PenLine className="w-5 h-5" />
                    <span>Thoughts</span>
                  </Link>
                </nav>
              </Card>
            </div>

            {/* Center Timeline */}
            <div className="lg:col-span-3 relative">
              {/* Quick Actions & Filters Header - Hidden on Mobile */}
              <Card className="hidden lg:block sticky top-4 z-10 mb-6 bg-white/95 backdrop-blur-sm shadow-lg">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="relative">
                      <div 
                        className="relative"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                      >
                      <Button
                          onClick={() => user ? setShowNewPostDropdown(!showNewPostDropdown) : null}
                          className={`bg-[#6b21a8] hover:bg-[#581c87] text-white gap-2 ${!user && 'opacity-50'}`}
                          disabled={!user}
                      >
                        <PlusCircle className="w-4 h-4" />
                        New Post
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                        {!user && showLoginOverlay && (
                          <div 
                            className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-20 p-4 text-center transform transition-opacity duration-200 ease-in-out"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                          >
                            <Link href="/sign-in" className="text-[#6b21a8] hover:underline">
                              Sign in to create a post
                            </Link>
                          </div>
                        )}
                      </div>
                      {showNewPostDropdown && user && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-20">
                          <button
                            onClick={() => handleNewPost('prayer')}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-purple-50 text-left"
                          >
                            <HandHeart className="w-4 h-4" />
                            Prayer Request
                          </button>
                          <button
                            onClick={() => handleNewPost('testimony')}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-purple-50 text-left"
                          >
                            <Heart className="w-4 h-4" />
                            Testimony
                          </button>
                          <button
                            onClick={() => handleNewPost('thought')}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-purple-50 text-left"
                          >
                            <PenLine className="w-4 h-4" />
                            Thought
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm bg-white/95 backdrop-blur-sm"
                      >
                        <option value="recent">Most Recent</option>
                        <option value="engaged">Most Engaged</option>
                      </select>
                      <select
                        value={filter}
                        onChange={(e) => handleFilterChange(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm bg-white/95 backdrop-blur-sm"
                      >
                        <option value="all">View All</option>
                        <option value="prayer">Prayer Requests</option>
                        <option value="testimony">Testimonies</option>
                        <option value="thought">Thoughts</option>
                      </select>
                    </div>
                  </div>
                  <div 
                    className={`relative overflow-hidden transition-all duration-500 ease-out ${
                      isSearchVisible 
                        ? 'opacity-100 max-h-[50px] mb-0' 
                        : 'opacity-0 max-h-0 mb-0'
                    }`}
                  >
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white/95 backdrop-blur-sm"
                    />
                  </div>
                </div>
              </Card>

              {/* Timeline Feed */}
              <div className="space-y-4 relative px-0 sm:px-0">
                <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-white to-transparent z-[5]" />
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6b21a8]"></div>
                    <p className="mt-4 text-gray-600">Loading posts...</p>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <Card className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
                      <p className="text-gray-600 mb-4">
                        {searchQuery 
                          ? "No posts match your search criteria. Try adjusting your search terms."
                          : filter === 'all'
                          ? "There are no posts yet. Be the first to share!"
                          : `There are no ${filter} posts yet. Be the first to share!`}
                      </p>
                      {user && (
                        <Button
                          onClick={() => setShowNewPostModal(true)}
                          className="bg-[#6b21a8] hover:bg-[#581c87] text-white"
                        >
                          Create a Post
                        </Button>
                      )}
                    </div>
                  </Card>
                ) : (
                  filteredPosts.map(post => (
                  <Card key={post.id} className="p-3 sm:p-6 relative">
                    <div className="flex items-start gap-2 sm:gap-4">
                      <img
                          src={post.userPhotoURL}
                          alt={post.userDisplayName}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                          <div>
                              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{post.userDisplayName}</h3>
                              <Link 
                                href={`/community/${post.type}/${post.id}`}
                                className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 block"
                              >
                                {post.createdAt?.toDate().toLocaleString()}
                              </Link>
                          </div>
                          <span className={`self-start text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium ${
                            post.type === 'prayer' 
                              ? 'bg-purple-100 text-[#6b21a8]' 
                                : post.type === 'testimony'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-blue-100 text-blue-700'
                          }`}>
                              {post.type === 'prayer' ? 'Prayer Request' : post.type === 'testimony' ? 'Testimony' : 'Thought'}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 mt-2 text-sm sm:text-base">{post.title}</h4>
                        <p className="text-gray-700 mt-1 text-sm sm:text-base line-clamp-3 sm:line-clamp-none">{post.content}</p>
                        <div className="flex items-center gap-4 sm:gap-6 mt-3 text-xs sm:text-sm">
                            <button 
                              className={`flex items-center gap-1 sm:gap-2 ${
                                userLikes[post.id]
                                  ? 'text-[#6b21a8] font-semibold' 
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                              onClick={() => handleLike(post.id)}
                            >
                              <Heart 
                                className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                  userLikes[post.id] ? 'fill-current' : 'fill-none'
                                }`} 
                              />
                              <span className="whitespace-nowrap">
                                {userLikes[post.id] ? 'Liked' : 'Like'}
                                {postLikes[post.id] > 0 ? ` (${postLikes[post.id]})` : ''}
                              </span>
                            </button>
                            <button 
                              onClick={() => handleCommentClick(post.id)}
                              className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-900"
                            >
                            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="whitespace-nowrap">Comment ({post.commentCount})</span>
                          </button>
                          <button className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-900">
                            <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="whitespace-nowrap">Share</span>
                          </button>
                        </div>

                          {/* Inline Comment Input */}
                          {expandedPostId === post.id && (
                            <div className="mt-3 flex items-center gap-2">
                              <img
                                src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'anonymous'}`}
                                alt={user?.displayName || 'User'}
                                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
                              />
                              <div className="flex-1 flex items-center gap-1 sm:gap-2 min-w-0">
                                <input
                                  type="text"
                                  placeholder="Write a comment..."
                                  value={newComments[post.id] || ''}
                                  onChange={(e) => setNewComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                                  className="flex-1 bg-gray-100 rounded-full px-3 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-0"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleSubmitComment(post.id);
                                    }
                                  }}
                                />
                                <Button
                                  size="icon"
                                  onClick={() => handleSubmitComment(post.id)}
                                  disabled={submittingComment[post.id] || !newComments[post.id]?.trim()}
                                  className="bg-[#6b21a8] hover:bg-[#581c87] text-white rounded-full p-1.5 sm:p-2 flex-shrink-0"
                                >
                                  <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </Card>
                  ))
                )}
              </div>
            </div>

            {/* Right Sidebar - Hidden on Mobile */}
            <div className="hidden lg:block lg:col-span-2">
              <Card className="p-4 sticky top-4">
                <h2 className="text-lg font-semibold text-[#6b21a8] mb-4">Sponsored</h2>
                <div className="bg-gray-100 rounded-lg h-40 flex items-center justify-center text-gray-500">
                  Ad Space
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating Action Button */}
      <Button
        onClick={handleMobileNewPost}
        className="lg:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-[#6b21a8] hover:bg-[#5b1b8f] flex items-center justify-center"
      >
        <PlusCircle className="h-6 w-6 text-white" />
      </Button>

      {/* Mobile Category Selection Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="sm:max-w-[500px] p-0">
          <DialogHeader>
            <DialogTitle>What would you like to share?</DialogTitle>
            <DialogDescription id="dialog-description" className="sr-only">
              Select a category for your community post
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 space-y-2">
            <button
              onClick={() => handleMobileCategorySelect('prayer')}
              className="w-full flex items-center gap-3 p-4 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <div className="bg-purple-100 p-2 rounded-full">
                <HandHeart className="w-6 h-6 text-[#6b21a8]" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Prayer Request</h4>
                <p className="text-sm text-gray-500">Share your prayer needs with the community</p>
              </div>
            </button>
            <button
              onClick={() => handleMobileCategorySelect('testimony')}
              className="w-full flex items-center gap-3 p-4 hover:bg-yellow-50 rounded-lg transition-colors"
            >
              <div className="bg-yellow-100 p-2 rounded-full">
                <Heart className="w-6 h-6 text-yellow-700" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Testimony</h4>
                <p className="text-sm text-gray-500">Share how God has moved in your life</p>
              </div>
            </button>
            <button
              onClick={() => handleMobileCategorySelect('thought')}
              className="w-full flex items-center gap-3 p-4 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <div className="bg-blue-100 p-2 rounded-full">
                <PenLine className="w-6 h-6 text-blue-700" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Thought</h4>
                <p className="text-sm text-gray-500">Share your spiritual reflections</p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Post Modal */}
      <Dialog open={showNewPostModal} onOpenChange={setShowNewPostModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {newPost.type === 'prayer' && <HandHeart className="w-5 h-5" />}
              {newPost.type === 'testimony' && <Heart className="w-5 h-5" />}
              {newPost.type === 'thought' && <PenLine className="w-5 h-5" />}
              {newPost.type === 'prayer' && 'Share Prayer Request'}
              {newPost.type === 'testimony' && 'Share Testimony'}
              {newPost.type === 'thought' && 'Share Thought'}
            </DialogTitle>
            <DialogDescription>
              Share your heart with the community. Your words can inspire and encourage others.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder={
                  newPost.type === 'prayer' ? 'What would you like prayer for?' :
                  newPost.type === 'testimony' ? 'What has God done in your life?' :
                  'Share your spiritual reflection'
                }
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder={
                  newPost.type === 'prayer' 
                    ? "Describe your prayer request. Be specific about what you're seeking prayer for..." 
                    : newPost.type === 'testimony'
                    ? "Share how God has moved in your life. Your testimony can encourage others..."
                    : "Share your spiritual insights, biblical reflections, or what God has been teaching you..."
                }
                className="min-h-[150px]"
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPostModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitPost}
              className="bg-[#6b21a8] hover:bg-[#581c87] text-white"
            >
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default CommunityPage; 