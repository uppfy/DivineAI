"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BookmarkPlus, Share2, Loader2, Check, Copy, HandHeart } from "lucide-react";
import Image from "next/image";
import { Breadcrumb } from "@/components/ui/breadcrumb"

interface BibleVerse {
  verse: string;
  reference: string;
}

interface Response {
  title: string;
  bibleVerses: BibleVerse[];
  spiritualGuidance: string;
  prayerPoint: string;
}

export default function SpiritualGuidance() {
  const [feeling, setFeeling] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<Response | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<{
    type: 'title' | 'verses' | 'guidance' | 'prayer' | 'all' | null;
    timestamp: number;
  }>({ type: null, timestamp: 0 });

  const responseRef = useRef<HTMLDivElement>(null);

  const scrollToResponse = () => {
    if (responseRef.current) {
      // For mobile devices, we need to ensure we're accounting for any fixed headers
      const headerOffset = window.innerWidth < 768 ? 80 : 20; // Larger offset on mobile
      const elementPosition = responseRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    // Check for pre-fetched response in localStorage
    const savedResponse = localStorage.getItem('guidanceResponse');
    if (savedResponse) {
      try {
        const parsedResponse = JSON.parse(savedResponse);
        setResponse(parsedResponse);
        setShowResponse(true);
        // Clear the saved response
        localStorage.removeItem('guidanceResponse');
        
        // Add a small delay to ensure the component is fully rendered
        setTimeout(() => {
          scrollToResponse();
        }, 100);
      } catch (err) {
        console.error('Error parsing saved response:', err);
      }
    }
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (feeling.trim() && !isLoading) {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    if (!feeling.trim()) return;

    setIsLoading(true);
    setError(null);

    // Scroll to response section immediately when loading starts
    scrollToResponse();

    try {
      const res = await fetch('/api/guidance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feeling }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate response');
      }

      setResponse(data);
      setShowResponse(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate response. Please try again.';
      setError(errorMessage);
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string, type: 'title' | 'verses' | 'guidance' | 'prayer' | 'all') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback({ type, timestamp: Date.now() });
      setTimeout(() => {
        setCopyFeedback(prev => prev.timestamp === Date.now() ? { type: null, timestamp: 0 } : prev);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleShare = async () => {
    if (!response) return;

    try {
      const fullText = `${response.title}\n\nBible Verses:\n${response.bibleVerses.map(v => `${v.verse}\n- ${v.reference}`).join('\n\n')}\n\nSpiritual Guidance:\n${response.spiritualGuidance}\n\nPrayer:\n${response.prayerPoint}`;

      if (navigator.share) {
        await navigator.share({
          title: response.title,
          text: fullText,
        });
      } else {
        handleCopy(fullText, 'all');
      }
    } catch (err) {
      console.error("Failed to share: ", err);
    }
  };

  return (
    <main className="min-h-screen py-8 bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb
            items={[
              { title: "Home", href: "/" },
              { title: "Spiritual Guidance", href: "/spiritual-guidance", isCurrentPage: true }
            ]}
            description="Share your heart and receive personalized spiritual guidance, Bible verses, and prayer points."
          />

          <div className="grid md:grid-cols-2 gap-8 mt-8">
            {/* Left Panel - Query Card */}
            <Card className="shadow-[0_2px_10px_rgba(0,0,0,0.06)] rounded-2xl h-fit">
              <CardHeader className="space-y-2">
                <h2 className="text-2xl font-semibold text-[#6b21a8] text-center">
                  How are you feeling today?
                </h2>
                <p className="text-center text-gray-600">
                  Share your heart and receive spiritual guidance
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Type your feelings, concerns, or what's on your heart..."
                  value={feeling}
                  onChange={(e) => setFeeling(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="min-h-[150px] resize-none"
                />
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-[#6b21a8] hover:bg-[#5b1b8f]"
                  disabled={isLoading || !feeling.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating guidance...
                    </>
                  ) : (
                    <>
                      <HandHeart className="w-4 h-4 mr-2" />
                      Receive Guidance
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Right Panel - Response Cards */}
            <div ref={responseRef} className="space-y-6">
              {isLoading ? (
                <Card className="shadow-[0_2px_10px_rgba(0,0,0,0.06)] rounded-2xl">
                  <CardContent className="p-6 min-h-[200px] flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#6b21a8]" />
                      <p className="text-gray-600">Finding spiritual guidance for you...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : response ? (
                <>
                  <Card className="shadow-[0_2px_10px_rgba(0,0,0,0.06)] rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h2 className="text-2xl font-semibold text-[#6b21a8]">{response.title}</h2>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {}} // To be implemented with profile integration
                            variant="outline"
                            size="icon"
                            className="rounded-full relative"
                            title="Save for later (coming soon)"
                          >
                            <BookmarkPlus className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={handleShare}
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-[0_2px_10px_rgba(0,0,0,0.06)] rounded-2xl">
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[#6b21a8] text-xl">✝</span>
                            <h2 className="text-xl font-semibold text-[#6b21a8]">Bible Verses</h2>
                          </div>
                          <Button
                            onClick={() => handleCopy(response.bibleVerses.map(v => `${v.verse}\n- ${v.reference}`).join('\n\n'), 'verses')}
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                          >
                            {copyFeedback.type === 'verses' ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {copyFeedback.type === 'verses' && (
                          <p className="text-sm text-green-600 -mt-4 transition-opacity">Verses copied!</p>
                        )}
                        <div className="space-y-4">
                          {response.bibleVerses.map((verse, index) => (
                            <div key={index} className="pl-4 border-l-4 border-[#e9d5ff] py-1">
                              <p className="italic text-gray-700">"{verse.verse}"</p>
                              <p className="text-gray-500 mt-2">- {verse.reference}</p>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-[#6b21a8]">Spiritual Guidance</h2>
                            <Button
                              onClick={() => handleCopy(response.spiritualGuidance, 'guidance')}
                              variant="outline"
                              size="icon"
                              className="rounded-full"
                            >
                              {copyFeedback.type === 'guidance' ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          {copyFeedback.type === 'guidance' && (
                            <p className="text-sm text-green-600 transition-opacity">Guidance copied!</p>
                          )}
                          <p className="text-gray-700 whitespace-pre-line">{response.spiritualGuidance}</p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-[#6b21a8]">Prayer</h2>
                            <Button
                              onClick={() => handleCopy(response.prayerPoint, 'prayer')}
                              variant="outline"
                              size="icon"
                              className="rounded-full"
                            >
                              {copyFeedback.type === 'prayer' ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          {copyFeedback.type === 'prayer' && (
                            <p className="text-sm text-green-600 transition-opacity">Prayer copied!</p>
                          )}
                          <p className="text-gray-700 italic">{response.prayerPoint}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="shadow-[0_2px_10px_rgba(0,0,0,0.06)] rounded-2xl">
                  <CardContent className="p-6 min-h-[200px] flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="text-[#6b21a8] text-4xl">❤</div>
                      <p className="text-gray-600">Share your feelings to receive spiritual guidance</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 