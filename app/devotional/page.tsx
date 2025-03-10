"use client";

import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollection } from '@/hooks/useFirestore';
import {
  Share2,
  Zap,
  ChevronRight,
  Calendar,
  BookOpen,
  HandHeart,
  Heart,
  LightbulbIcon,
  Loader2
} from "lucide-react";

interface Scripture {
  text: string;
  reference: string;
}

interface Devotional {
  dateId: string;
  date: string;
  title: string;
  scripture: Scripture;
  reflection: string;
  prayer: string;
  timestamp: any;
}

const Page: NextPage = () => {
  const [selectedDevotional, setSelectedDevotional] = useState<Devotional | null>(null);
  const [showAiInsights, setShowAiInsights] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  // Fetch recent devotionals from Firestore
  const { data: devotionals, loading: isLoading, error } = useCollection<Devotional>(
    'devotionals',
    [orderBy('dateId', 'desc'), limit(3)]
  );

  useEffect(() => {
    if (devotionals && devotionals.length > 0) {
      setSelectedDevotional(devotionals[0]);
      // Reset insights state when devotional changes
      setInsights(null);
      setShowAiInsights(false);
      setInsightsError(null);
    }
  }, [devotionals]);

  // Reset insights when selecting a different devotional
  useEffect(() => {
    setInsights(null);
    setShowAiInsights(false);
    setInsightsError(null);
  }, [selectedDevotional?.dateId]);

  const handleShare = async () => {
    if (!selectedDevotional) return;
    
    const shareText = `${selectedDevotional.title}\n\n${selectedDevotional.scripture.text} - ${selectedDevotional.scripture.reference}\n\nRead more at: https://divine-comfort.com/devotional`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: selectedDevotional.title,
          text: shareText,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        // You might want to show a toast notification here
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleInsightsClick = async () => {
    if (!selectedDevotional) return;
    
    if (!showAiInsights) {
      setShowAiInsights(true);
      if (!insights) {
        setIsLoadingInsights(true);
        setInsightsError(null);
        try {
          const response = await fetch('/api/devotional/insights', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              scripture: selectedDevotional.scripture,
              reflection: selectedDevotional.reflection,
            }),
          });

          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || 'Failed to generate insights');
          }

          setInsights(data.insights);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to generate insights';
          setInsightsError(errorMessage);
          console.error('Error loading insights:', error);
        } finally {
          setIsLoadingInsights(false);
        }
      }
    } else {
      setShowAiInsights(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#6b21a8]" />
          <p className="text-gray-600">Loading today's devotional...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600">Error loading devotional: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-8 bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb
            items={[
              { title: "Home", href: "/" },
              { title: "Daily Devotional", href: "/devotional", isCurrentPage: true }
            ]}
            description="Daily inspiration and guidance from God's Word."
          />

          <div className="grid md:grid-cols-7 gap-8 mt-8">
            {/* Left Panel - Devotional History */}
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold text-[#6b21a8] flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Devotionals
              </h2>
              <div className="space-y-4">
                {devotionals.map((devotional) => (
                  <Card
                    key={devotional.dateId}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedDevotional?.dateId === devotional.dateId
                        ? 'border-[#6b21a8] bg-purple-50'
                        : 'hover:border-[#6b21a8] hover:bg-purple-50/50'
                    }`}
                    onClick={() => setSelectedDevotional(devotional)}
                  >
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500">
                        {devotional.date}
                      </p>
                      <h3 className="font-medium text-[#6b21a8] mt-1">
                        {devotional.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {devotional.scripture.reference}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right Panel - Devotional Detail */}
            {selectedDevotional && (
              <div className="md:col-span-5">
                <Card className="relative">
                  <CardContent className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[#6b21a8] font-medium">
                          {selectedDevotional.date}
                        </p>
                        <h1 className="text-2xl font-semibold text-gray-900 mt-1">
                          {selectedDevotional.title}
                        </h1>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full"
                        onClick={handleShare}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Bible Verse */}
                    <div className="bg-purple-50 rounded-xl p-6 space-y-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#6b21a8]" />
                        <h2 className="font-semibold text-[#6b21a8]">
                          Today's Scripture
                        </h2>
                      </div>
                      <blockquote className="italic text-gray-700">
                        "{selectedDevotional.scripture.text}"
                      </blockquote>
                      <p className="text-sm text-gray-500">
                        - {selectedDevotional.scripture.reference}
                      </p>
                    </div>

                    {/* Reflection */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart className="w-5 h-5 text-[#6b21a8]" />
                          <h2 className="font-semibold text-[#6b21a8]">
                            Reflection
                          </h2>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full hover:bg-purple-50"
                          onClick={handleInsightsClick}
                        >
                          <Zap className="w-5 h-5 text-[#6b21a8]" />
                        </Button>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {selectedDevotional.reflection}
                      </p>
                      
                      {/* AI Insights Modal */}
                      {showAiInsights && (
                        <div className="mt-4 bg-gradient-to-r from-purple-50 to-white rounded-xl p-6 border border-purple-100">
                          <div className="flex items-center gap-2 mb-3">
                            <LightbulbIcon className="w-5 h-5 text-[#6b21a8]" />
                            <h3 className="font-semibold text-[#6b21a8]">
                              Deeper Insights
                            </h3>
                          </div>
                          {isLoadingInsights ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="w-6 h-6 animate-spin text-[#6b21a8]" />
                              <span className="ml-2 text-gray-600">Generating insights...</span>
                            </div>
                          ) : insightsError ? (
                            <div className="text-red-600 py-2">
                              {insightsError}
                            </div>
                          ) : (
                            <p className="text-gray-700 whitespace-pre-line">
                              {insights}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Prayer */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <HandHeart className="w-5 h-5 text-[#6b21a8]" />
                        <h2 className="font-semibold text-[#6b21a8]">
                          Prayer
                        </h2>
                      </div>
                      <p className="text-gray-700 leading-relaxed italic">
                        {selectedDevotional.prayer}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page; 