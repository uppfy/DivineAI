"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BlogPost } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  Eye, 
  FileText, 
  Calendar, 
  Tag, 
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from '@/components/ui/use-toast';

export default function AdminBlogPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not admin
    if (user && !isAdmin) {
      router.push('/');
      return;
    }

    const fetchBlogPosts = async () => {
      try {
        const postsRef = collection(db, 'blogPosts');
        const q = query(postsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const posts = querySnapshot.docs.map(doc => doc.data() as BlogPost);
        setBlogPosts(posts);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        toast({
          title: 'Error',
          description: 'Failed to load blog posts',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, [user, isAdmin, router]);

  const handlePublishToggle = async (post: BlogPost) => {
    try {
      const newStatus = post.status === 'published' ? 'draft' : 'published';
      const publishedAt = newStatus === 'published' ? new Date().toISOString() : post.publishedAt;
      
      await updateDoc(doc(db, 'blogPosts', post.id), {
        status: newStatus,
        publishedAt,
        updatedAt: new Date().toISOString(),
      });
      
      // Update local state
      setBlogPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === post.id 
            ? { ...p, status: newStatus, publishedAt, updatedAt: new Date().toISOString() } 
            : p
        )
      );
      
      toast({
        title: 'Success',
        description: `Blog post ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update blog post status',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    
    try {
      await deleteDoc(doc(db, 'blogPosts', postToDelete.id));
      
      // Update local state
      setBlogPosts(prevPosts => prevPosts.filter(p => p.id !== postToDelete.id));
      
      toast({
        title: 'Success',
        description: 'Blog post deleted successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete blog post',
        variant: 'destructive',
      });
    } finally {
      setPostToDelete(null);
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Blog Posts</h1>
          <p className="text-gray-600">Create, edit, and manage your blog content</p>
        </div>
        <Button asChild className="bg-purple-700 hover:bg-purple-800">
          <Link href="/admin/blog/new" className="inline-flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" /> New Blog Post
          </Link>
        </Button>
      </div>
      
      <Separator className="my-6" />
      
      {loading ? (
        <div className="text-center py-12">
          <p>Loading blog posts...</p>
        </div>
      ) : (
        <>
          {blogPosts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Blog Posts Yet</h2>
                <p className="text-gray-500 mb-6">
                  Get started by creating your first blog post
                </p>
                <Button asChild className="bg-purple-700 hover:bg-purple-800">
                  <Link href="/admin/blog/new">
                    Create Your First Blog Post
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>All Blog Posts</CardTitle>
                <CardDescription>
                  {blogPosts.length} {blogPosts.length === 1 ? 'post' : 'posts'} total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blogPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell>
                          {post.status === 'published' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle2 className="mr-1 h-3 w-3" /> Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <XCircle className="mr-1 h-3 w-3" /> Draft
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{post.category}</TableCell>
                        <TableCell>{formatDate(post.publishedAt || post.createdAt)}</TableCell>
                        <TableCell>{post.views}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePublishToggle(post)}
                            >
                              {post.status === 'published' ? 'Unpublish' : 'Publish'}
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              asChild
                            >
                              <Link href={`/blog/${post.slug}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              asChild
                            >
                              <Link href={`/admin/blog/edit/${post.id}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => setPostToDelete(post)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the blog post "{postToDelete?.title}". 
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setPostToDelete(null)}>
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleDeletePost}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
} 