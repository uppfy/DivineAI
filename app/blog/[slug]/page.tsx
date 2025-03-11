import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug, getRelatedBlogPosts, incrementBlogPostViews } from '@/lib/db';
import { BlogPost } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Tag, ChevronRight } from 'lucide-react';
import BlogSidebar from '@/components/blog/BlogSidebar';

type Props = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: 'Blog Post Not Found | Divine Comfort',
      description: 'The requested blog post could not be found.',
    };
  }
  
  return {
    title: `${post.title} | Divine Comfort Blog`,
    description: post.metaDescription,
    keywords: post.metaKeywords.join(', '),
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      type: 'article',
      url: `https://divine-comfort.com/blog/${post.slug}`,
      images: [
        {
          url: post.featuredImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.metaDescription,
      images: [post.featuredImageUrl],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getBlogPostBySlug(params.slug);
  
  if (!post) {
    notFound();
  }
  
  // Increment view count (this is a server action, so it won't affect the rendered page)
  incrementBlogPostViews(post.id);
  
  // Get related posts
  const relatedPosts = await getRelatedBlogPosts(post.category, post.id);
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3">
          <article className="prose prose-lg max-w-none">
            {/* Featured Image */}
            <div className="relative h-[400px] w-full mb-8 rounded-lg overflow-hidden">
              <Image
                src={post.featuredImageUrl}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 66vw"
              />
            </div>
            
            {/* Blog Meta */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.publishedAt || post.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                <Link 
                  href={`/blog?category=${encodeURIComponent(post.category)}`}
                  className="hover:text-purple-700 hover:underline"
                >
                  {post.category}
                </Link>
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-6">{post.title}</h1>
            
            {/* Content */}
            <div 
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: formatBlogContent(post.content) }}
            />
            
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog/tag/${encodeURIComponent(tag)}`}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <RelatedPostCard key={relatedPost.id} post={relatedPost} />
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
        
        <div className="w-full md:w-1/3">
          <BlogSidebar />
        </div>
      </div>
    </div>
  );
}

function RelatedPostCard({ post }: { post: BlogPost }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-40 w-full">
        <Image
          src={post.featuredImageUrl}
          alt={post.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <CardHeader className="p-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(post.publishedAt || post.createdAt)}</span>
        </div>
        <CardTitle className="text-lg">
          <Link href={`/blog/${post.slug}`} className="hover:text-purple-700 transition-colors">
            {post.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardFooter className="p-4 pt-0">
        <Link 
          href={`/blog/${post.slug}`}
          className="inline-flex items-center text-purple-700 hover:text-purple-900 text-sm font-medium"
        >
          Read More <ChevronRight className="ml-1 h-3 w-3" />
        </Link>
      </CardFooter>
    </Card>
  );
}

// Helper function to format blog content with special styling for Bible verses and quotes
function formatBlogContent(content: string): string {
  // Format Bible verses (assumed format: [verse]Content[/verse])
  content = content.replace(
    /\[verse\](.*?)\[\/verse\]/g,
    '<div class="my-6 p-4 bg-amber-50 border-l-4 border-amber-500 italic text-gray-700">$1</div>'
  );
  
  // Format quotes (assumed format: [quote]Content[/quote])
  content = content.replace(
    /\[quote\](.*?)\[\/quote\]/g,
    '<blockquote class="my-6 p-4 border-l-4 border-gray-300 bg-gray-50 italic">$1</blockquote>'
  );
  
  // Format headings with proper styling
  content = content.replace(
    /<h2>(.*?)<\/h2>/g,
    '<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-800">$1</h2>'
  );
  
  content = content.replace(
    /<h3>(.*?)<\/h3>/g,
    '<h3 class="text-xl font-bold mt-6 mb-3 text-gray-800">$1</h3>'
  );
  
  return content;
} 