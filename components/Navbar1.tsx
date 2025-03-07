import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import Image from 'next/image';
import { useState } from 'react';

export default function Navbar1() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsProfileOpen(!isProfileOpen)}
        className="flex items-center"
      >
        <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200">
          {(profile?.avatarUrl || user?.photoURL) ? (
            <Image
              src={profile?.avatarUrl || user?.photoURL || ''}
              alt={profile?.displayName || user?.displayName || ''}
              width={32}
              height={32}
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <span className="text-sm text-gray-500">
                {(profile?.displayName || user?.displayName || 'U')[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </button>
    </div>
  );
} 