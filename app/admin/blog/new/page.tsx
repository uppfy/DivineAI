"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createBlogPost } from '@/lib/db';
import { BlogPost, BlogCategory } from '@/types/database';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, ArrowLeft, Plus, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from '@/components/ui/use-toast';

export default function NewBlogPostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [category, setCategory] = useState<BlogCategory>('General');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleAddKeyword = () => {
    if (currentKeyword.trim() && !metaKeywords.includes(currentKeyword.trim())) {
      setMetaKeywords([...metaKeywords, currentKeyword.trim()]);
      setCurrentKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setMetaKeywords(metaKeywords.filter(k => k !== keyword));
  };

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
        category,
        tags,
        status: 'draft',
        metaDescription,
        metaKeywords,
      };
      
      const postId = await createBlogPost(blogPostData);
      
      toast({
        title: 'Success',
        description: 'Blog post created successfully',
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
      <div className="flex items-center mb-8">
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
      
      <Separator className="my-6" />
      
      <form onSubmit={handleSubmit}>
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
                  <div className="text-xs text-gray-500 mb-2">
                    <p>Use [verse]...[/verse] to format Bible verses</p>
                    <p>Use [quote]...[/quote] to format quotes</p>
                  </div>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter blog post content"
                    required
                    rows={15}
                    className="font-mono"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
                <CardDescription>
                  Add a featured image for your blog post
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="featuredImageUrl">Image URL *</Label>
                  <Input
                    id="featuredImageUrl"
                    value={featuredImageUrl}
                    onChange={(e) => setFeaturedImageUrl(e.target.value)}
                    placeholder="Enter URL for featured image"
                    required
                  />
                </div>
                
                {featuredImageUrl && (
                  <div className="mt-4 border rounded-md p-2">
                    <p className="text-sm text-gray-500 mb-2">Preview:</p>
                    <div className="relative h-40 w-full rounded overflow-hidden">
                      <img 
                        src={featuredImageUrl} 
                        alt="Featured image preview" 
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                )}
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
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={category} 
                    onValueChange={(value) => setCategory(value as BlogCategory)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Spiritual Growth">Spiritual Growth</SelectItem>
                      <SelectItem value="Bible Study">Bible Study</SelectItem>
                      <SelectItem value="Prayer">Prayer</SelectItem>
                      <SelectItem value="Testimony">Testimony</SelectItem>
                      <SelectItem value="Community">Community</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      placeholder="Add a tag"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={handleAddTag}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <div 
                          key={tag} 
                          className="flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>
                  Optimize your blog post for search engines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Enter meta description for SEO"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="metaKeywords">Meta Keywords</Label>
                  <div className="flex gap-2">
                    <Input
                      id="metaKeywords"
                      value={currentKeyword}
                      onChange={(e) => setCurrentKeyword(e.target.value)}
                      placeholder="Add a keyword"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddKeyword();
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={handleAddKeyword}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {metaKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {metaKeywords.map((keyword) => (
                        <div 
                          key={keyword} 
                          className="flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyword(keyword)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Blog Post'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
} 