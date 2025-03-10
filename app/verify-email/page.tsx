"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
  const { user, isEmailVerified, sendVerificationEmail } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (isEmailVerified) {
      router.push('/dashboard');
    }
  }, [user, isEmailVerified, router]);

  useEffect(() => {
    if (resendDisabled) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setResendDisabled(false);
            clearInterval(timer);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [resendDisabled]);

  const handleResendVerification = async () => {
    if (resendDisabled) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await sendVerificationEmail();
      setSuccess('Verification email sent! Please check your inbox.');
      setResendDisabled(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Mail className="h-12 w-12 text-[#6b21a8]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="text-gray-600">
            We've sent a verification email to:
            <br />
            <span className="font-medium text-[#6b21a8]">{user.email}</span>
          </p>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <XCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <p>{success}</p>
            </div>
          )}

          <div className="space-y-2">
            <Button
              className="w-full bg-[#6b21a8] hover:bg-[#581c87]"
              onClick={handleResendVerification}
              disabled={loading || resendDisabled}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : resendDisabled ? (
                `Resend in ${countdown}s`
              ) : (
                'Resend Verification Email'
              )}
            </Button>
          </div>

          <div className="text-sm text-gray-500 text-center">
            <p>
              Didn't receive the email? Check your spam folder or request a new verification email.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
} 