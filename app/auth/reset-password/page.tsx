"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft } from "lucide-react";

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (error: any) {
      setError(error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Reset your password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <Card className="p-6 space-y-6 bg-white/80 backdrop-blur-sm">
          {success ? (
            <div className="space-y-4">
              <div className="bg-green-50 text-green-600 p-4 rounded-lg text-sm">
                Check your email for password reset instructions
              </div>
              <Link
                href="/auth/signin"
                className="flex items-center justify-center gap-2 text-[#6b21a8] hover:text-[#581c87]"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                  placeholder="you@example.com"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#6b21a8] hover:bg-[#581c87]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Send reset link
              </Button>

              <Link
                href="/auth/signin"
                className="flex items-center justify-center gap-2 text-[#6b21a8] hover:text-[#581c87] mt-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign in
              </Link>
            </form>
          )}
        </Card>
      </div>
    </main>
  );
} 