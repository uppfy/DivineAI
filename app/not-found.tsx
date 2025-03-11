'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import { useEffect, useState } from 'react';

const comfortingVerses = [
  "\"For I know the plans I have for you,\" declares the LORD, \"plans to prosper you and not to harm you, plans to give you hope and a future.\" — Jeremiah 29:11",
  "\"Come to me, all you who are weary and burdened, and I will give you rest.\" — Matthew 11:28",
  "\"The LORD is close to the brokenhearted and saves those who are crushed in spirit.\" — Psalm 34:18",
  "\"Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.\" — John 14:27",
  "\"Cast all your anxiety on him because he cares for you.\" — 1 Peter 5:7"
];

export default function NotFound() {
  const [verse, setVerse] = useState('');
  
  useEffect(() => {
    // Select a random verse
    const randomVerse = comfortingVerses[Math.floor(Math.random() * comfortingVerses.length)];
    setVerse(randomVerse);
  }, []);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-white to-purple-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto"
      >
        <h1 className="text-6xl font-bold text-purple-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Page Not Found</h2>
        
        <p className="text-gray-600 mb-8 max-w-xl mx-auto">
          The page you're looking for doesn't seem to exist. Perhaps you've taken a path less traveled, 
          but we're here to guide you back.
        </p>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-xl mx-auto border border-purple-100"
        >
          <p className="text-gray-700 italic">{verse}</p>
        </motion.div>
        
        <div className="flex flex-col w-full gap-4 justify-center mt-8 max-w-xs mx-auto">
          <Button 
            onClick={() => window.history.back()}
            variant="outline" 
            className="w-full flex items-center justify-center gap-2 border-2 border-purple-200 hover:bg-purple-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          
          <Link href="/" passHref className="w-full">
            <Button className="w-full flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 text-white">
              <Home className="h-4 w-4" />
              Return Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
} 