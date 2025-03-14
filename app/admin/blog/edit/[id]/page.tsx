"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getBlogPost, updateBlogPost } from '@/lib/db';
import { BlogPost, BlogCategory } from '@/types/database';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Import our new components
import dynamic from 'next/dynamic';
import ImageUploader from '@/components/blog/ImageUploader';
import SeoSettings from '@/components/blog/SeoSettings';
import CategorySelector from '@/components/blog/CategorySelector';
import TagManager from '@/components/blog/TagManager';

// Dynamically import RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(() => import('@/components/blog/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-64 w-full border rounded-md flex items-center justify-center bg-gray-50">
    <Loader2 className="h-8 w-8 text-gray-300 animate-spin" />
  </div>
});

type Props = {
  params: {
    id: string;
  };
};

export default function EditBlogPostPage({ params }: Props) {
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [category, setCategory] = useState<BlogCategory>('General');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not admin
    if (user && !isAdmin) {
      router.push('/');
      return;
    }

    const fetchBlogPost = async () => {
      try {
        const post = await getBlogPost(params.id);
        if (post) {
          setBlogPost(post);
          setTitle(post.title);
          setContent(post.content);
          setExcerpt(post.excerpt);
          setFeaturedImageUrl(post.featuredImageUrl);
          setCategory(post.category);
          setMetaDescription(post.metaDescription);
          setMetaKeywords(post.metaKeywords || []);
          setTags(post.tags || []);
        } else {
          toast({
            title: 'Error',
            description: 'Blog post not found',
            variant: 'destructive',
          });
          router.push('/admin/blog');
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
        toast({
          title: 'Error',
          description: 'Failed to load blog post',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [params.id, user, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content || !excerpt || !featuredImageUrl) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    setSaving(true);
    
    try {
      if (!blogPost) return;
      
      await updateBlogPost(blogPost.id, {
        title,
        content,
        excerpt,
        featuredImageUrl,
        category,
        tags,
        metaDescription,
        metaKeywords,
      });
      
      toast({
        title: 'Success',
        description: 'Blog post updated successfully',
        variant: 'default',
      });
      
      router.push('/admin/blog');
    } catch (error) {
      console.error('Error updating blog post:', error);
      toast({
        title: 'Error',
        description: 'Failed to update blog post',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Function to render content preview with basic formatting
  const renderContentPreview = () => {
    if (!content) return <p className="text-gray-400 italic">No content to preview</p>;
    
    // Replace [verse]...[/verse] with styled div
    let formattedContent = content.replace(
      /\[verse\](.*?)\[\/verse\]/gs, 
      '<div class="bg-blue-50 border-l-4 border-blue-500 p-4 my-4 italic">$1</div>'
    );
    
    // Replace [quote]...[/quote] with styled div
    formattedContent = formattedContent.replace(
      /\[quote\](.*?)\[\/quote\]/gs, 
      '<div class="bg-gray-50 border-l-4 border-gray-500 p-4 my-4">$1</div>'
    );
    
    // Replace newlines with <br>
    formattedContent = formattedContent.replace(/\n/g, '<br>');
    
    return <div dangerouslySetInnerHTML={{ __html: formattedContent }} />;
  };

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
        <Button asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Loader2 className="mx-auto h-12 w-12 text-gray-300 animate-spin mb-4" />
        <h1 className="text-2xl font-bold mb-2">Loading</h1>
        <p className="text-gray-600">Loading blog post data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-4">
            <Link href="/admin/blog">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Blog Post</h1>
            <p className="text-gray-600">Update your blog post</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setPreviewMode(!previewMode)}
          className="flex items-center gap-2"
        >
          {previewMode ? (
            <>
              <EyeOff className="h-4 w-4" />
              <span>Edit Mode</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              <span>Preview Mode</span>
            </>
          )}
        </Button>
      </div>
      
      <Separator className="my-6" />
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Blog Content</CardTitle>
                <CardDescription>
                  Edit the main content for your blog post
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter blog post title"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt *</Label>
                  <Textarea
                    id="excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Enter a short excerpt (will be displayed in blog listings)"
                    required
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  {previewMode ? (
                    <div className="border rounded-md p-4 min-h-[300px] prose max-w-none">
                      {renderContentPreview()}
                    </div>
                  ) : (
                    <RichTextEditor
                      value={content}
                      onChange={setContent}
                      placeholder="Enter blog post content"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
                <CardDescription>
                  Update the featured image for your blog post
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUploader
                  value={featuredImageUrl}
                  onChange={setFeaturedImageUrl}
                  label="Featured Image URL *"
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Blog Settings</CardTitle>
                <CardDescription>
                  Configure settings for your blog post
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CategorySelector
                  value={category}
                  onChange={setCategory}
                />
                
                <TagManager
                  tags={tags}
                  onChange={setTags}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>
                  Optimize your blog post for search engines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SeoSettings
                  title={title}
                  metaDescription={metaDescription}
                  metaKeywords={metaKeywords}
                  onTitleChange={setTitle}
                  onDescriptionChange={setMetaDescription}
                  onKeywordsChange={setMetaKeywords}
                />
              </CardContent>
            </Card>
            
            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.push('/admin/blog')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-purple-700 hover:bg-purple-800"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
} 