"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, X, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function VerificationBanner() {
  const { user, isEmailVerified } = useAuth();
  const [isHidden, setIsHidden] = useState(false);

  if (!user || isEmailVerified || isHidden) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-50 border-b border-amber-200 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-amber-800">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">
              Please verify your email address to access all features.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/verify-email">
              <Button
                variant="outline"
                size="sm"
                className="bg-amber-100 border-amber-200 hover:bg-amber-200 text-amber-800"
              >
                <Mail className="h-4 w-4 mr-2" />
                Verify Email
              </Button>
            </Link>
            
            <button
              onClick={() => setIsHidden(true)}
              className="text-amber-800 hover:text-amber-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 