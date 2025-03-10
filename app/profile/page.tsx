'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiEdit2, FiMapPin, FiLink, FiTwitter, FiFacebook, FiInstagram, FiLinkedin } from 'react-icons/fi';
import { useProfile } from '../../contexts/ProfileContext';
import { auth } from '../../lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle, Image as ImageIcon, MapPin as MapPinIcon, Link as LinkIcon, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import VerificationBanner from '@/components/VerificationBanner';

export default function ProfilePage() {
  const { user, isEmailVerified } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewUser = searchParams.get('newUser') === 'true';
  const [showWelcome, setShowWelcome] = useState(isNewUser);
  const { profile, loading, error } = useProfile();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !auth.currentUser) {
      router.push('/login');
    }
  }, [loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">Error loading profile: {error.message}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Profile not found</div>
      </div>
    );
  }

  return (
    <>
      <VerificationBanner />
      
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pt-16 pb-12">
        <div className="container mx-auto px-4">
          {showWelcome && (
            <Card className="mb-8 p-6 border-green-200 bg-green-50">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-green-800 mb-2">
                    Welcome to Divine Comfort!
                  </h2>
                  <p className="text-green-700 mb-4">
                    Let's complete your profile to get the most out of your experience.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <UserCircle className="h-5 w-5" />
                      <span>Add a profile picture and cover image</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-700">
                      <MapPinIcon className="h-5 w-5" />
                      <span>Set your location</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-700">
                      <LinkIcon className="h-5 w-5" />
                      <span>Add your social media links</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex gap-4">
                    <Link href="/profile/edit">
                      <Button className="bg-green-600 hover:bg-green-700">
                        Complete Your Profile
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="text-green-700 border-green-200 hover:bg-green-100"
                      onClick={() => setShowWelcome(false)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Cover Image Section */}
          <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600">
            {profile.coverImageUrl && (
              <Image
                src={profile.coverImageUrl}
                alt="Cover"
                fill
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/20" />
            <button 
              onClick={() => router.push('/profile/edit')}
              className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 backdrop-blur-sm transition"
            >
              <FiEdit2 className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Content */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32">
            <div className="relative">
              {/* Avatar */}
              <div className="absolute -top-16 left-4 sm:left-8">
                <div className="relative h-32 w-32 rounded-full ring-4 ring-white bg-white">
                  <div className="relative h-full w-full rounded-full overflow-hidden">
                    {(profile.avatarUrl || auth.currentUser?.photoURL) ? (
                      <Image
                        src={profile.avatarUrl || auth.currentUser?.photoURL || ''}
                        alt={profile.displayName}
                        fill
                        sizes="128px"
                        className="object-cover rounded-full"
                        priority
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <span className="text-2xl text-gray-500">
                          {profile.displayName[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => router.push('/profile/edit')}
                    className="absolute bottom-0 right-0 bg-white hover:bg-gray-50 text-gray-700 rounded-full p-2 shadow-lg border border-gray-200 transition"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Profile Info Card */}
              <div className="pt-24 pb-8 px-6 sm:px-8 bg-white rounded-lg shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{profile.displayName}</h1>
                    <p className="text-gray-500">@{profile.username}</p>
                  </div>
                  <button 
                    onClick={() => router.push('/profile/edit')}
                    className="self-start sm:self-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    Edit Profile
                  </button>
                </div>

                {/* Bio */}
                <p className="mt-4 text-gray-600">
                  {profile.bio || 'No bio yet'}
                </p>

                {/* Location and Website */}
                <div className="mt-6 flex flex-wrap gap-4">
                  {profile.location && (
                    <div className="flex items-center text-gray-600">
                      <FiMapPin className="w-4 h-4 mr-2" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center text-gray-600">
                      <FiLink className="w-4 h-4 mr-2" />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {new URL(profile.website).hostname}
                      </a>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="mt-6 flex flex-wrap gap-4">
                  {profile.socialLinks?.twitter && (
                    <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition">
                      <FiTwitter className="w-5 h-5" />
                      <span>Twitter</span>
                    </a>
                  )}
                  {profile.socialLinks?.facebook && (
                    <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-blue-700 transition">
                      <FiFacebook className="w-5 h-5" />
                      <span>Facebook</span>
                    </a>
                  )}
                  {profile.socialLinks?.instagram && (
                    <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-pink-500 transition">
                      <FiInstagram className="w-5 h-5" />
                      <span>Instagram</span>
                    </a>
                  )}
                  {profile.socialLinks?.linkedin && (
                    <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
                      <FiLinkedin className="w-5 h-5" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>

                {/* Stats */}
                <div className="mt-8 flex gap-6 border-t pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{profile.joinedCommunities?.length || 0}</div>
                    <div className="text-sm text-gray-500">Communities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{profile.followers?.length || 0}</div>
                    <div className="text-sm text-gray-500">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{profile.following?.length || 0}</div>
                    <div className="text-sm text-gray-500">Following</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Section */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              <div className="mt-4">
                <div className="text-gray-500 text-center py-8">
                  No recent activity to show
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 