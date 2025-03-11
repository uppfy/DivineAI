import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BlogNotFound() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <FileQuestion className="mx-auto h-24 w-24 text-gray-300 mb-6" />
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
        We couldn't find the blog post you're looking for. It may have been removed or the URL might be incorrect.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="default" className="bg-purple-700 hover:bg-purple-800">
          <Link href="/blog">
            Browse All Blog Posts
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
} 