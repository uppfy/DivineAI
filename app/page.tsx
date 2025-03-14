"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Book, Users, BookText, ArrowRight, PenLine, HandHeart, ChevronRight, Loader2, UserPlus, Calendar, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { collection, query, orderBy, limit, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollection } from '@/hooks/useFirestore';
import { formatDate } from '@/lib/utils';
import { BlogPost } from '@/types/database';

interface Scripture {
  text: string;
  reference: string;
}

interface Devotional {
  dateId: string;
  date: string;
  title: string;
  scripture: Scripture;
  reflection: string;
  prayer: string;
}

export default function Home() {
  const router = useRouter();
  const [feeling, setFeeling] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingDevotional, setIsGeneratingDevotional] = useState(false);
  const [latestBlogPosts, setLatestBlogPosts] = useState<BlogPost[]>([]);
  const [loadingBlogPosts, setLoadingBlogPosts] = useState(true);

  // Get today's date in YYYY-MM-DD format for the timezone
  const today = new Date();
  const dateId = today.toLocaleDateString('en-US', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split('/').reverse().join('-');

  // Fetch today's devotional from Firestore
  const { data: devotionals, loading: isLoadingDevotional, error: devotionalError } = useCollection<Devotional>(
    'devotionals',
    [where('dateId', '==', dateId), limit(1)]
  );

  const devotional = devotionals?.[0];

  // Client-side fallback to generate devotional if none exists for today
  useEffect(() => {
    // Only attempt to generate if:
    // 1. We're not already loading or generating
    // 2. We've finished the initial loading
    // 3. There's no error
    // 4. No devotional was found for today
    if (!isLoadingDevotional && !devotionalError && !devotional && !isGeneratingDevotional) {
      const generateDevotional = async () => {
        try {
          setIsGeneratingDevotional(true);
          // Call the API to generate today's devotional with token
          const response = await fetch(`/api/devotional?token=${process.env.NEXT_PUBLIC_CRON_SECRET_TOKEN}`);
          if (!response.ok) {
            throw new Error('Failed to generate devotional');
          }
          // No need to handle the response - the useCollection hook will
          // automatically update with the new data
        } catch (err) {
          console.error('Error generating devotional:', err);
        } finally {
          setIsGeneratingDevotional(false);
        }
      };

      generateDevotional();
    }
  }, [isLoadingDevotional, devotionalError, devotional, isGeneratingDevotional]);

  // Fetch latest blog posts
  useEffect(() => {
    const fetchLatestBlogPosts = async () => {
      try {
        setLoadingBlogPosts(true);
        const blogPostsRef = collection(db, 'blogPosts');
        
        console.log('Fetching from collection:', blogPostsRef.path);
        
        // First try: Query with status filter and publishedAt ordering
        const q = query(
          blogPostsRef,
          where('status', '==', 'published'),
          orderBy('publishedAt', 'desc'),
          limit(3)
        );
        
        console.log('Executing filtered query...');
        let querySnapshot = await getDocs(q);
        console.log('Filtered query returned', querySnapshot.size, 'documents');
        
        // If no results, try with createdAt ordering instead
        if (querySnapshot.empty) {
          console.log('No documents found with publishedAt ordering, trying createdAt...');
          
          const qByCreatedAt = query(
            blogPostsRef,
            where('status', '==', 'published'),
            orderBy('createdAt', 'desc'),
            limit(3)
          );
          
          querySnapshot = await getDocs(qByCreatedAt);
          console.log('CreatedAt query returned', querySnapshot.size, 'documents');
        }
        
        // If still no results, try without filters
        if (querySnapshot.empty) {
          console.log('No documents found with filters, trying without filters...');
          
          const qNoFilters = query(
            blogPostsRef,
            orderBy('createdAt', 'desc'),
            limit(3)
          );
          
          querySnapshot = await getDocs(qNoFilters);
          console.log('Unfiltered query returned', querySnapshot.size, 'documents');
        }
        
        if (!querySnapshot.empty) {
          const posts = querySnapshot.docs.map(doc => {
            const data = doc.data();
            console.log('Document data:', data);
            return { 
              id: doc.id, 
              ...data,
              // Ensure required fields have default values if missing
              status: data.status || 'published',
              publishedAt: data.publishedAt || data.createdAt,
              category: data.category || 'General',
              excerpt: data.excerpt || 'No excerpt available',
              slug: data.slug || doc.id
            } as BlogPost;
          });
          setLatestBlogPosts(posts);
        } else {
          console.log('No documents found in the collection at all');
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoadingBlogPosts(false);
      }
    };

    fetchLatestBlogPosts();
  }, []);

  const handleSubmit = async () => {
    if (!feeling.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/guidance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feeling }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate response');
      }

      // Store the response in localStorage before redirecting
      localStorage.setItem('guidanceResponse', JSON.stringify(data));
      router.push(`/spiritual-guidance?feeling=${encodeURIComponent(feeling)}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate response. Please try again.';
      setError(errorMessage);
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) {
        handleSubmit();
      }
    }
  };

  const features = [
    {
      title: "Spiritual Guidance",
      description: "Receive personalized spiritual guidance based on your feelings and concerns.",
      icon: <HandHeart className="h-8 w-8" />,
      href: "/spiritual-guidance"
    },
    {
      title: "Bible Study",
      description: "Access structured lessons and guided plans.",
      icon: <Book className="h-8 w-8" />,
      href: "/bible-study"
    },
    {
      title: "Journal",
      description: "Write and reflect on your spiritual journey.",
      icon: <BookText className="h-8 w-8" />,
      href: "/journal"
    },
    {
      title: "Community",
      description: "Join prayer groups, share testimonies, request prayers.",
      icon: <Users className="h-8 w-8" />,
      href: "/community"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-purple-50 to-white">
        <div className="container max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#6b21a8] mb-6">
            Find Peace, Strength, and Community in Christ
          </h1>
          <p className="text-lg text-gray-600 mb-12">
            Engage with daily devotionals, seek spiritual guidance, and connect with a faith-based community.
          </p>
          <div className="max-w-2xl mx-auto space-y-4">
            <Textarea
              placeholder="What's on your heart today?"
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
              onKeyDown={handleKeyPress}
              className="min-h-[100px] resize-none rounded-xl border-gray-200 text-lg"
              disabled={isLoading}
            />
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <Button
              onClick={handleSubmit}
              className="w-full bg-[#6b21a8] hover:bg-[#5b1b8f] text-white rounded-xl h-12 font-medium text-lg"
              disabled={isLoading || !feeling.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Finding Guidance...
                </>
              ) : (
                <>
                  <HandHeart className="h-4 w-4 mr-2" />
                  Get Spiritual Guidance
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Daily Devotional Section */}
      <section className="py-16 bg-white">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#6b21a8] mb-3">Daily Devotional</h2>
            <p className="text-gray-600">Start your day with spiritual inspiration and guidance from God's Word.</p>
          </div>
          <Card className="overflow-hidden border-t-4 border-t-[#6b21a8]">
            <CardContent className="p-8">
              {isLoadingDevotional ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#6b21a8]" />
                    <p className="text-gray-600">Loading today's devotional...</p>
                  </div>
                </div>
              ) : devotionalError ? (
                <div className="text-center space-y-4 h-64 flex items-center justify-center">
                  <div>
                    <BookText className="w-12 h-12 mx-auto text-red-500 mb-4" />
                    <p className="text-red-500">Error loading devotional: {devotionalError.message}</p>
                  </div>
                </div>
              ) : devotional ? (
              <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-[#6b21a8]">{devotional.title}</h2>
                    <p className="text-gray-600">{devotional.scripture.reference} • {devotional.date}</p>
                </div>

                {/* Scripture */}
                <div className="relative">
                  <div className="absolute left-0 top-0 w-1 h-full bg-[#6b21a8] rounded-full opacity-20"></div>
                  <blockquote className="pl-6">
                    <p className="text-xl text-[#6b21a8] font-serif">
                        "{devotional.scripture.text}"
                    </p>
                  </blockquote>
                </div>

                {/* Revelation */}
                <div className="bg-purple-50 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-[#6b21a8] flex items-center justify-center">
                      <BookText className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#6b21a8]">Today's Revelation</h3>
                  </div>
                    <p className="text-gray-700 leading-relaxed line-clamp-3">
                      {devotional.reflection}
                  </p>
                </div>

                {/* Prayer */}
                <div className="bg-gradient-to-r from-purple-50 to-white rounded-2xl p-6 space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-[#6b21a8] flex items-center justify-center">
                      <HandHeart className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#6b21a8]">Prayer Focus</h3>
                  </div>
                    <p className="text-gray-700 leading-relaxed italic line-clamp-3">
                      {devotional.prayer}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-center">
                  <Button 
                    className="bg-[#6b21a8] hover:bg-[#5b1b8f]"
                    onClick={() => router.push('/devotional')}
                  >
                    Read More
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              ) : (
                <div className="text-center space-y-4 h-64 flex items-center justify-center">
                  <div>
                    <BookText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No devotional available for today.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#6b21a8] mb-12">
            Explore Our Faith-Based Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => router.push(feature.href)}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-purple-50 text-[#6b21a8] group-hover:bg-[#6b21a8] group-hover:text-white transition-colors duration-200">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-[#6b21a8]">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button 
              className="bg-[#6b21a8] hover:bg-[#5b1b8f]"
              onClick={() => router.push('/sign-up')}
            >
              Sign Up Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Blog Posts Section */}
      <section className="py-16 bg-gradient-to-t from-purple-50 to-white">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#6b21a8] mb-12">
            Latest Divine Comfort Blogs
          </h2>
          {loadingBlogPosts ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#6b21a8]" />
                <p className="text-gray-600">Loading latest blog posts...</p>
              </div>
            </div>
          ) : latestBlogPosts.length === 0 ? (
            <div className="text-center space-y-4 h-64 flex items-center justify-center">
              <div>
                <PenLine className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No blog posts available yet.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestBlogPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={post.featuredImageUrl || 'https://via.placeholder.com/800x450?text=No+Image'}
                      alt={post.title || 'Blog post'}
                      fill
                      className="object-cover transform hover:scale-105 transition-transform duration-200"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(post.publishedAt || post.createdAt || new Date().toISOString())}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        <span>{post.category || 'General'}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-[#6b21a8] mb-2">{post.title || 'Untitled Post'}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt || 'No excerpt available'}</p>
                    <Button 
                      variant="link" 
                      className="text-[#6b21a8] p-0 hover:text-[#5b1b8f]"
                      asChild
                    >
                      <Link href={`/blog/${post.slug || post.id}`}>
                        Read More
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Button 
              className="bg-[#6b21a8] hover:bg-[#5b1b8f]"
              onClick={() => router.push('/blog')}
            >
              View All Blog Posts
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-900 to-purple-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Begin Your Spiritual Journey Today
            </h2>
            <p className="text-lg mb-8">
              Join our community of believers seeking growth, wisdom, and deeper faith.
            </p>
            <Button 
              asChild
              size="lg" 
              className="bg-white text-purple-900 hover:bg-gray-100"
            >
              <a href="/sign-up">
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up Today
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
} 