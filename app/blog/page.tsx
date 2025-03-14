import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getPublishedBlogPosts, getBlogPostsByCategory } from '@/lib/db';
import { BlogPost, BlogCategory } from '@/types/database';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, Calendar, Tag, PenLine } from 'lucide-react';
import BlogSidebar from '@/components/blog/BlogSidebar';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

export const metadata: Metadata = {
  title: 'Blog | Divine Comfort',
  description: 'Explore our blog for spiritual guidance, Bible study resources, and community engagement.',
  keywords: 'spiritual blog, Christian blog, Bible study, spiritual guidance, faith journey',
};

// Direct Firestore query to debug
async function getBlogPostsDirect() {
  try {
    console.log('Fetching blog posts directly from Firestore');
    const blogPostsRef = collection(db, 'blogPosts');
    const q = query(
      blogPostsRef,
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    console.log('Direct query returned', querySnapshot.size, 'documents');
    
    if (querySnapshot.empty) {
      console.log('No documents found in direct query');
      return [];
    }
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Document data:', data);
      return { id: doc.id, ...data } as BlogPost;
    });
  } catch (error) {
    console.error('Error in direct Firestore query:', error);
    return [];
  }
}

async function getBlogPosts() {
  try {
    // Try the original method first
    const { items } = await getPublishedBlogPosts();
    
    // If no items, try direct query
    if (items.length === 0) {
      console.log('No items from getPublishedBlogPosts, trying direct query');
      return await getBlogPostsDirect();
    }
    
    return items;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    // Fallback to direct query on error
    return await getBlogPostsDirect();
  }
}

async function getCategoryPosts(category: BlogCategory) {
  try {
    const { items } = await getBlogPostsByCategory(category);
    return items;
  } catch (error) {
    console.error(`Error fetching ${category} blog posts:`, error);
    return [];
  }
}

export default async function BlogPage() {
  const allPosts = await getBlogPosts();
  const categories: BlogCategory[] = ['General', 'Spiritual Growth', 'Bible Study', 'Prayer', 'Testimony', 'Community'];
  
  // Fetch posts for each category
  const categoryPosts: Record<BlogCategory, BlogPost[]> = {
    'General': await getCategoryPosts('General'),
    'Spiritual Growth': await getCategoryPosts('Spiritual Growth'),
    'Bible Study': await getCategoryPosts('Bible Study'),
    'Prayer': await getCategoryPosts('Prayer'),
    'Testimony': await getCategoryPosts('Testimony'),
    'Community': await getCategoryPosts('Community'),
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Divine Comfort Blog</h1>
            <p className="text-lg text-gray-600">
              Explore spiritual insights, Bible studies, and community stories to nurture your faith journey.
            </p>
            <Separator className="my-6" />
          </div>

          <Tabs defaultValue="all" className="mb-12">
            <TabsList className="mb-8 flex flex-wrap gap-2">
              <TabsTrigger value="all">All Posts</TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all">
              <div className="grid grid-cols-1 gap-8">
                {allPosts.length > 0 ? (
                  allPosts.map((post) => (
                    <BlogPostCard key={post.id} post={post} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <PenLine className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Blog Posts Yet</h3>
                    <p className="text-gray-500">Check back soon for new content!</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {categories.map((category) => (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-1 gap-8">
                  {categoryPosts[category].length > 0 ? (
                    categoryPosts[category].map((post) => (
                      <BlogPostCard key={post.id} post={post} />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <PenLine className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No Posts in {category}</h3>
                      <p className="text-gray-500">Check back soon for new content in this category!</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="w-full md:w-1/3">
          <BlogSidebar />
        </div>
      </div>
    </div>
  );
}

function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-60 w-full">
        <Image
          src={post.featuredImageUrl}
          alt={post.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <CardHeader>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Tag className="h-4 w-4" />
            <span>{post.category}</span>
          </div>
        </div>
        <CardTitle className="text-2xl">
          <Link href={`/blog/${post.slug}`} className="hover:text-purple-700 transition-colors">
            {post.title}
          </Link>
        </CardTitle>
        <CardDescription className="text-base">{post.excerpt}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-gray-600">{post.excerpt}</p>
      </CardContent>
      <CardFooter>
        <Link 
          href={`/blog/${post.slug}`}
          className="inline-flex items-center text-purple-700 hover:text-purple-900 font-medium"
        >
          Read More <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}