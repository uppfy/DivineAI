"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createBlogPost } from '@/lib/db';
import { BlogPost } from '@/types/database';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, ArrowLeft, Save, Eye } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import RichTextEditor from '@/components/blog/RichTextEditor';
import ImageUploader from '@/components/blog/ImageUploader';
import SeoSettings from '@/components/blog/SeoSettings';
import TagManager from '@/components/blog/TagManager';
import CategorySelector from '@/components/blog/CategorySelector';

export default function NewBlogPostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [category, setCategory] = useState('spiritual-growth');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'published' = 'draft') => {
    e.preventDefault();
    
    if (!title || !content || !excerpt || !featuredImageUrl) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Generate slug from title
      const slug = title.toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
      const blogPostData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'views'> = {
        title,
        slug,
        content,
        excerpt,
        authorId: user?.uid || '',
        authorName: user?.displayName || '',
        featuredImageUrl,
        categoryId: category,
        categoryName: '', // This will be filled in by the server
        tags,
        status,
        publishedAt: status === 'published' ? new Date().toISOString() : null,
        metaDescription,
        metaKeywords,
      };
      
      const postId = await createBlogPost(blogPostData);
      
      toast({
        title: 'Success',
        description: `Blog post ${status === 'published' ? 'published' : 'saved as draft'} successfully`,
        variant: 'default',
      });
      
      router.push('/admin/blog');
    } catch (error) {
      console.error('Error creating blog post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create blog post',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Create New Blog Post</h1>
            <p className="text-gray-600">Add a new blog post to your website</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Edit Mode' : 'Preview'}
          </Button>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <form onSubmit={(e) => handleSubmit(e)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Blog Content</CardTitle>
                <CardDescription>
                  Enter the main content for your blog post
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
                    <div 
                      className="prose prose-lg max-w-none border rounded-md p-4"
                      dangerouslySetInnerHTML={{ 
                        __html: formatBlogContent(content) 
                      }}
                    />
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
            
            <ImageUploader
              value={featuredImageUrl}
              onChange={setFeaturedImageUrl}
              label="Featured Image URL *"
            />
          </div>
          
          <div className="space-y-8">
            <SeoSettings
              title={title}
              metaDescription={metaDescription}
              metaKeywords={metaKeywords}
              onTitleChange={setTitle}
              onDescriptionChange={setMetaDescription}
              onKeywordsChange={setMetaKeywords}
            />
            
            <CategorySelector
              value={category}
              onChange={setCategory}
            />
            
            <TagManager
              tags={tags}
              onChange={setTags}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
                <CardDescription>
                  Save or publish your blog post
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-4">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save as Draft
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="default"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={loading}
                    onClick={(e) => handleSubmit(e, 'published')}
                  >
                    Publish Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
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
  
  return content;
} 