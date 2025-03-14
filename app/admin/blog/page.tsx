"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BlogPost, BlogCategory } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatDate, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  XCircle,
  Search,
  Filter,
  ArrowUpDown,
  BarChart,
  Clock,
  Loader2
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from '@/components/ui/use-toast';

export default function AdminBlogPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
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
        setFilteredPosts(posts);
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

  // Apply filters and search
  useEffect(() => {
    let result = [...blogPosts];
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(post => 
        post.title.toLowerCase().includes(query) || 
        post.excerpt.toLowerCase().includes(query) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(post => post.status === statusFilter);
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(post => post.category === categoryFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valueA, valueB;
      
      // Handle different field types
      switch (sortField) {
        case 'title':
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;
        case 'views':
          valueA = a.views || 0;
          valueB = b.views || 0;
          break;
        case 'publishedAt':
          valueA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
          valueB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
          break;
        case 'createdAt':
        default:
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
      }
      
      // Apply sort direction
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    setFilteredPosts(result);
  }, [blogPosts, searchQuery, statusFilter, categoryFilter, sortField, sortDirection]);

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

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Get unique categories from posts
  const categories = ['all', ...new Set(blogPosts.map(post => post.category))];

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
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-gray-300 animate-spin mr-2" />
          <p className="text-gray-600">Loading blog posts...</p>
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
                  {filteredPosts.length} of {blogPosts.length} {blogPosts.length === 1 ? 'post' : 'posts'} shown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search posts by title, excerpt or tags..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[130px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <span>Status</span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-[150px]">
                        <Tag className="mr-2 h-4 w-4" />
                        <span>Category</span>
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category === 'all' ? 'All Categories' : category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <Button 
                            variant="ghost" 
                            className="p-0 font-semibold flex items-center"
                            onClick={() => handleSort('title')}
                          >
                            Title
                            {sortField === 'title' && (
                              <ArrowUpDown className={cn(
                                "ml-1 h-4 w-4", 
                                sortDirection === 'asc' ? "rotate-180" : ""
                              )} />
                            )}
                          </Button>
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>
                          <Button 
                            variant="ghost" 
                            className="p-0 font-semibold flex items-center"
                            onClick={() => handleSort('publishedAt')}
                          >
                            Date
                            {sortField === 'publishedAt' && (
                              <ArrowUpDown className={cn(
                                "ml-1 h-4 w-4", 
                                sortDirection === 'asc' ? "rotate-180" : ""
                              )} />
                            )}
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button 
                            variant="ghost" 
                            className="p-0 font-semibold flex items-center"
                            onClick={() => handleSort('views')}
                          >
                            Views
                            {sortField === 'views' && (
                              <ArrowUpDown className={cn(
                                "ml-1 h-4 w-4", 
                                sortDirection === 'asc' ? "rotate-180" : ""
                              )} />
                            )}
                          </Button>
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPosts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No posts match your filters
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPosts.map((post) => (
                          <TableRow key={post.id}>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span>{post.title}</span>
                                {post.tags && post.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {post.tags.slice(0, 3).map(tag => (
                                      <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {post.tags.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{post.tags.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {post.status === 'published' ? (
                                <Badge variant="default" className="bg-green-500">
                                  <CheckCircle2 className="mr-1 h-3 w-3" /> Published
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <XCircle className="mr-1 h-3 w-3" /> Draft
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{post.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <div className="flex items-center text-sm">
                                  <Calendar className="mr-1 h-3 w-3 text-gray-500" />
                                  {formatDate(post.publishedAt || post.createdAt)}
                                </div>
                                {post.updatedAt && post.updatedAt !== post.createdAt && (
                                  <div className="flex items-center text-xs text-gray-500 mt-1">
                                    <Clock className="mr-1 h-3 w-3" />
                                    Updated {formatDate(post.updatedAt)}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <BarChart className="mr-1 h-3 w-3 text-gray-500" />
                                {post.views || 0}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    Actions
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Manage Post</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem asChild>
                                    <Link href={`/admin/blog/edit/${post.id}`} className="cursor-pointer">
                                      <Edit className="mr-2 h-4 w-4" /> Edit
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/blog/${post.slug}`} className="cursor-pointer">
                                      <Eye className="mr-2 h-4 w-4" /> View
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handlePublishToggle(post)}>
                                    {post.status === 'published' ? (
                                      <>
                                        <XCircle className="mr-2 h-4 w-4" /> Unpublish
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 className="mr-2 h-4 w-4" /> Publish
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem
                                        onSelect={(e) => {
                                          e.preventDefault();
                                          setPostToDelete(post);
                                        }}
                                        className="text-red-500 focus:text-red-500"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                      </DropdownMenuItem>
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
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
} 