'use client';

import { useEffect, useState } from 'react';
import { getUser } from '../../lib/db';
import { User } from '../../types/database';

export default function TestPage() {
  const [testUser, setTestUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTestUser() {
      try {
        const user = await getUser('test-user');
        console.log('Fetched test user:', user);
        setTestUser(user);
      } catch (err) {
        console.error('Error fetching test user:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchTestUser();
  }, []);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!testUser) {
    return <div className="p-4">No test user found</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test User Data</h1>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
        {JSON.stringify(testUser, null, 2)}
      </pre>
    </div>
  );
} 