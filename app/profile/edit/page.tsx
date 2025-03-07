'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiUpload } from 'react-icons/fi';
import { useProfile } from '../../../contexts/ProfileContext';
import { updateUser } from '../../../lib/db';
import { uploadAvatar, uploadCover } from '../../../lib/storage';
import { auth } from '../../../lib/firebase';

export default function EditProfilePage() {
  const router = useRouter();
  const { profile, loading, error, refreshProfile } = useProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    bio: '',
    location: '',
    website: '',
    socialLinks: {
      twitter: '',
      facebook: '',
      instagram: '',
      linkedin: '',
    },
  });

  // File state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Load profile data into form
  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName,
        username: profile.username,
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        socialLinks: {
          twitter: profile.socialLinks?.twitter || '',
          facebook: profile.socialLinks?.facebook || '',
          instagram: profile.socialLinks?.instagram || '',
          linkedin: profile.socialLinks?.linkedin || '',
        },
      });
      
      // If no avatar URL is set, use Google profile picture as default
      if (!profile.avatarUrl && auth.currentUser?.photoURL) {
        updateUser(auth.currentUser.uid, {
          avatarUrl: auth.currentUser.photoURL
        });
      }
    }
  }, [profile]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !auth.currentUser) {
      router.push('/login');
    }
  }, [loading, router]);

  // Handle file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !auth.currentUser) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      let avatarUrl = profile.avatarUrl;
      let coverImageUrl = profile.coverImageUrl;

      // Upload new avatar if selected
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile, auth.currentUser.uid);
      }

      // Upload new cover image if selected
      if (coverFile) {
        coverImageUrl = await uploadCover(coverFile, auth.currentUser.uid);
      }

      // Update profile in database
      await updateUser(auth.currentUser.uid, {
        ...formData,
        avatarUrl,
        coverImageUrl,
      });

      // Refresh the profile to update all components
      await refreshProfile();

      router.push('/profile');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">Error loading profile</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>

            {saveError && (
              <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                {saveError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Image Upload Section */}
              <div className="space-y-6 mb-6">
                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image
                  </label>
                  <div className="relative h-48 rounded-lg bg-gray-100 overflow-hidden">
                    {(coverPreview || profile.coverImageUrl) && (
                      <Image
                        src={coverPreview || profile.coverImageUrl || ''}
                        alt="Cover"
                        fill
                        className="object-cover"
                      />
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer group">
                      <div className="flex items-center gap-2 text-white bg-black/50 px-4 py-2 rounded-lg group-hover:bg-black/70 transition">
                        <FiUpload />
                        <span>Upload Cover</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverChange}
                      />
                    </label>
                  </div>
                </div>

                {/* Avatar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture
                  </label>
                  <div className="relative h-32 w-32">
                    <div className="relative h-full w-full rounded-full overflow-hidden bg-gray-100">
                      {(avatarPreview || profile.avatarUrl || auth.currentUser?.photoURL) ? (
                        <Image
                          src={avatarPreview || profile.avatarUrl || auth.currentUser?.photoURL || ''}
                          alt="Avatar"
                          fill
                          sizes="128px"
                          className="object-cover rounded-full"
                          priority
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <span className="text-2xl text-gray-500">
                            {profile.displayName[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer group rounded-full">
                        <div className="text-white bg-black/50 p-2 rounded-full group-hover:bg-black/70 transition">
                          <FiUpload />
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Social Links</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Twitter
                    </label>
                    <input
                      type="url"
                      value={formData.socialLinks.twitter}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={formData.socialLinks.facebook}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={formData.socialLinks.instagram}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={formData.socialLinks.linkedin}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ${
                    isSaving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/profile')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 