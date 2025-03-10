"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function VerificationSuccess() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      router.push('/profile?newUser=true');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900">Email Verified Successfully!</h1>
          
          <div className="space-y-2">
            <p className="text-gray-600">
              Thank you for verifying your email address. Your account is now fully activated.
            </p>
            <p className="text-sm text-gray-500">
              You will be redirected to complete your profile in a few seconds...
            </p>
          </div>

          <Button
            onClick={() => router.push('/profile?newUser=true')}
            className="bg-[#6b21a8] hover:bg-[#581c87] mt-4"
          >
            Complete Your Profile Now
          </Button>
        </div>
      </Card>
    </div>
  );
} 