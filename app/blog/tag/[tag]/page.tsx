import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BlogPost } from '@/types/database';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, Calendar, Tag } from 'lucide-react';
import BlogSidebar from '@/components/blog/BlogSidebar';

type Props = {
  params: {
    tag: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tag = decodeURIComponent(params.tag);
  
  return {
    title: `${tag} | Divine Comfort Blog`,
    description: `Explore blog posts about ${tag} on Divine Comfort.`,
    keywords: `${tag}, spiritual blog, Christian blog, Bible study, spiritual guidance`,
  };
}

async function getBlogPostsByTag(tag: string): Promise<BlogPost[]> {
  try {
    const postsRef = collection(db, 'blogPosts');
    const q = query(
      postsRef,
      where('status', '==', 'published'),
      where('tags', 'array-contains', tag),
      orderBy('publishedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as BlogPost);
  } catch (error) {
    console.error(`Error fetching posts with tag ${tag}:`, error);
    return [];
  }
}

export default async function TagPage({ params }: Props) {
  const tag = decodeURIComponent(params.tag);
  const posts = await getBlogPostsByTag(tag);
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Posts tagged with "{tag}"
            </h1>
            <p className="text-lg text-gray-600">
              Explore our blog posts related to {tag}
            </p>
            <Separator className="my-6" />
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {posts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Tag className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">No posts found</h2>
              <p className="text-gray-500 mb-6">
                We couldn't find any blog posts tagged with "{tag}"
              </p>
              <Link 
                href="/blog"
                className="inline-flex items-center text-purple-700 hover:text-purple-900 font-medium"
              >
                Browse all blog posts <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          )}
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