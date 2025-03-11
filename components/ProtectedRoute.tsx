'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const protectedPaths = [
  '/bible-study',
  '/community',
  '/journal',
];

// Check if the current path or any of its parent paths are protected
const isProtectedPath = (path: string): boolean => {
  return protectedPaths.some(protectedPath => 
    path === protectedPath || 
    path.startsWith(`${protectedPath}/`)
  );
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only check after auth has loaded
    if (!loading) {
      if (!user && isProtectedPath(pathname)) {
        // Redirect to sign-in page with return URL
        router.push(`/sign-in?returnUrl=${encodeURIComponent(pathname)}`);
      }
    }
  }, [user, loading, pathname, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-700" />
      </div>
    );
  }

  // If not a protected path or user is authenticated, render children
  if (!isProtectedPath(pathname) || user) {
    return <>{children}</>;
  }

  // This will briefly show while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-purple-700" />
    </div>
  );
} 