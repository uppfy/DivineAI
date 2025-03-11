"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Heart, 
  BookOpen, 
  Users, 
  BookText, 
  PenLine, 
  HandHeart, 
  ArrowRight, 
  CheckCircle2,
  Sparkles,
  Target,
  Send
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function AboutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [showPrayerDialog, setShowPrayerDialog] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [prayerRequest, setPrayerRequest] = useState({
    title: '',
    content: ''
  });

  const handlePrayerRequestClick = () => {
    if (user) {
      setShowPrayerDialog(true);
    } else {
      setShowLoginDialog(true);
    }
  };

  const handleSubmitPrayer = () => {
    router.push('/community');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#6b21a8] mb-6">
              Your Journey to Spiritual Growth
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Divine Comfort combines the timeless wisdom of scripture with modern technology to create a 
              personalized and enriching faith experience.
            </p>
            <Button 
              className="bg-[#6b21a8] hover:bg-[#5b1b8f] text-lg px-8 py-6 h-auto"
              onClick={() => router.push('/sign-up')}
            >
              Begin Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-[#6b21a8] mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              We believe that everyone deserves access to meaningful spiritual guidance and 
              support in their faith journey. Divine Comfort was created to provide personalized, 
              scripture-based insights and tools that help you grow closer to God, understand 
              His word more deeply, and find peace in His presence.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="w-6 h-6 text-[#6b21a8]" />
                </div>
                <h3 className="font-semibold text-gray-900">Personal Growth</h3>
                <p className="text-gray-600">Tailored guidance for your spiritual journey</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <BookOpen className="w-6 h-6 text-[#6b21a8]" />
                </div>
                <h3 className="font-semibold text-gray-900">Biblical Wisdom</h3>
                <p className="text-gray-600">Scripture-based insights and understanding</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 text-[#6b21a8]" />
                </div>
                <h3 className="font-semibold text-gray-900">Community</h3>
                <p className="text-gray-600">Connect with fellow believers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-r from-purple-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-[#6b21a8] mb-12">
              Features Designed for Your Faith Journey
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <BookText className="w-6 h-6 text-[#6b21a8]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#6b21a8] mb-2">Daily Devotionals</h3>
                      <p className="text-gray-600 mb-4">
                        Start each day with inspiring scripture-based reflections and guided prayers 
                        tailored to your spiritual journey.
                      </p>
                      <Button 
                        variant="link" 
                        className="text-[#6b21a8] p-0 hover:text-[#5b1b8f]"
                        onClick={() => router.push('/devotional')}
                      >
                        Read Today's Devotional
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-[#6b21a8]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#6b21a8] mb-2">Bible Study Plans</h3>
                      <p className="text-gray-600 mb-4">
                        Follow structured study plans that help you dive deep into God's word with 
                        interactive checkpoints and progress tracking.
                      </p>
                      <Button 
                        variant="link" 
                        className="text-[#6b21a8] p-0 hover:text-[#5b1b8f]"
                        onClick={() => router.push('/bible-study')}
                      >
                        Explore Study Plans
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <HandHeart className="w-6 h-6 text-[#6b21a8]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#6b21a8] mb-2">Spiritual Guidance</h3>
                      <p className="text-gray-600 mb-4">
                        Receive personalized spiritual guidance and biblical wisdom for life's 
                        challenges and questions.
                      </p>
                      <Button 
                        variant="link" 
                        className="text-[#6b21a8] p-0 hover:text-[#5b1b8f]"
                        onClick={() => router.push('/spiritual-guidance')}
                      >
                        Get Spiritual Guidance
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <PenLine className="w-6 h-6 text-[#6b21a8]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#6b21a8] mb-2">Spiritual Journal</h3>
                      <p className="text-gray-600 mb-4">
                        Document your spiritual journey, prayers, and reflections in a private, 
                        organized digital journal.
                      </p>
                      <Button 
                        variant="link" 
                        className="text-[#6b21a8] p-0 hover:text-[#5b1b8f]"
                        onClick={() => router.push('/journal')}
                      >
                        Start Journaling
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 lg:col-span-2">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-[#6b21a8]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#6b21a8] mb-2">Christ-Centered Community</h3>
                      <p className="text-gray-600 mb-4">
                        Join a vibrant community of believers united in Christ. Share your journey, lift each other up in prayer, 
                        and experience the power of collective worship. As Acts 2:42 reminds us, we devote ourselves to fellowship, 
                        breaking of bread, and prayers together. Your spiritual walk is strengthened through meaningful connections 
                        and shared experiences with fellow believers.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <Button 
                          variant="outline"
                          className="text-[#6b21a8] border-[#6b21a8]"
                          onClick={() => router.push('/community')}
                        >
                          Join the Community
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button 
                          variant="link" 
                          className="text-[#6b21a8] p-0 hover:text-[#5b1b8f]"
                          onClick={handlePrayerRequestClick}
                        >
                          Share Prayer Requests
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-[#6b21a8] mb-12">
              Transform Your Spiritual Journey
            </h2>
            <div className="space-y-6">
              {[
                {
                  title: "Deepen Your Faith",
                  description: "Regular engagement with scripture and guided reflection helps strengthen your relationship with God."
                },
                {
                  title: "Find Peace and Clarity",
                  description: "Receive biblical wisdom and guidance to navigate life's challenges with confidence."
                },
                {
                  title: "Track Your Growth",
                  description: "Monitor your progress and celebrate spiritual milestones along your journey."
                },
                {
                  title: "Connect with Purpose",
                  description: "Join a community of believers sharing the same path toward spiritual growth."
                }
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#6b21a8] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-[#6b21a8] text-white rounded-3xl p-12">
              <Sparkles className="w-12 h-12 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">
                Ready to Start Your Spiritual Journey?
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Join thousands of believers who have found guidance, peace, and deeper faith through Divine Comfort.
              </p>
              <Button 
                className="bg-white text-[#6b21a8] hover:bg-gray-100 text-lg px-8 py-6 h-auto"
                onClick={() => router.push('/sign-up')}
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Prayer Request Dialog */}
      <Dialog open={showPrayerDialog} onOpenChange={setShowPrayerDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HandHeart className="w-5 h-5" />
              Share Prayer Request
            </DialogTitle>
            <DialogDescription>
              Share your heart with the community. Your words can inspire and encourage others.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="What would you like prayer for?"
                value={prayerRequest.title}
                onChange={(e) => setPrayerRequest(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="Describe your prayer request. Be specific about what you're seeking prayer for..."
                className="min-h-[150px]"
                value={prayerRequest.content}
                onChange={(e) => setPrayerRequest(prev => ({ ...prev, content: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrayerDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitPrayer}
              className="bg-[#6b21a8] hover:bg-[#5b1b8f]"
            >
              Share
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Sign in to Share Prayer Requests</DialogTitle>
            <DialogDescription>
              Join our community to share and receive prayer support.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <p className="text-center text-gray-600 mb-6">
              Sign in to connect with fellow believers and share your prayer requests.
            </p>
            <Button 
              className="w-full bg-[#6b21a8] hover:bg-[#5b1b8f]"
              onClick={() => router.push('/sign-in')}
            >
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              Don't have an account?{" "}
              <Button 
                variant="link" 
                className="text-[#6b21a8] p-0 hover:text-[#5b1b8f]"
                onClick={() => router.push('/sign-up')}
              >
                Sign up
              </Button>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 