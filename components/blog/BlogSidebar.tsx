"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Book, Users, Zap, ChevronRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BlogSidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/blog/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="space-y-8 sticky top-24">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search blog posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Spiritual Guidance CTA */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-700" />
            Spiritual Guidance
          </CardTitle>
          <CardDescription>
            Receive personalized spiritual guidance and comfort
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Connect with our spiritual advisors for personalized guidance on your faith journey.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full bg-purple-700 hover:bg-purple-800">
            <Link href="/spiritual-guidance" className="inline-flex items-center justify-center">
              Get Guidance <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Bible Study CTA */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5 text-blue-700" />
            Bible Study
          </CardTitle>
          <CardDescription>
            Explore the Word of God with guided studies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Deepen your understanding of Scripture with our comprehensive Bible study resources.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full bg-blue-700 hover:bg-blue-800">
            <Link href="/bible-study" className="inline-flex items-center justify-center">
              Start Studying <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Community Engagement CTA */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-700" />
            Community
          </CardTitle>
          <CardDescription>
            Connect with like-minded believers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Join our supportive community to share experiences, ask questions, and grow together in faith.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full bg-green-700 hover:bg-green-800">
            <Link href="/community" className="inline-flex items-center justify-center">
              Join Community <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link href="/blog?category=Spiritual Growth" className="block text-purple-700 hover:text-purple-900 hover:underline">
            Spiritual Growth
          </Link>
          <Link href="/blog?category=Bible Study" className="block text-purple-700 hover:text-purple-900 hover:underline">
            Bible Study
          </Link>
          <Link href="/blog?category=Prayer" className="block text-purple-700 hover:text-purple-900 hover:underline">
            Prayer
          </Link>
          <Link href="/blog?category=Testimony" className="block text-purple-700 hover:text-purple-900 hover:underline">
            Testimony
          </Link>
          <Link href="/blog?category=Community" className="block text-purple-700 hover:text-purple-900 hover:underline">
            Community
          </Link>
          <Link href="/blog?category=General" className="block text-purple-700 hover:text-purple-900 hover:underline">
            General
          </Link>
        </CardContent>
      </Card>
    </div>
  );
} 