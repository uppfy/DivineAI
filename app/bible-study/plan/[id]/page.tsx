"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import { useBibleStudy } from "@/hooks/useBibleStudy";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { BookOpen, ArrowLeft, Share2, BookmarkPlus, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { toast } from 'sonner';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface PageProps {
  params: {
    id: string;
  }
}

export default function StudyPlanPage({ params }: PageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { currentStudy, loading, error, updateProgress } = useBibleStudy({ studyId: params.id });
  const [isProgressExpanded, setIsProgressExpanded] = useState(false);

  const handleStepToggle = async (index: number) => {
    if (!currentStudy) return;

    const newChecklist = currentStudy.checklist.map((step, i) => 
      i === index ? { ...step, completed: !step.completed } : step
    );

    try {
      await updateProgress(params.id, newChecklist);
      toast.success("Progress updated successfully");
    } catch (err) {
      console.error('Error updating progress:', err);
      toast.error("Failed to update progress");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen py-8 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-purple-100 rounded w-1/4"></div>
            <div className="h-48 bg-purple-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen py-8 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-red-600">Error: {error.message}</p>
              <Button
                onClick={() => router.push('/bible-study')}
                className="mt-4"
              >
                Return to Bible Study
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Not found state
  if (!currentStudy) {
    return (
      <div className="min-h-screen py-8 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Study Plan Not Found</h2>
              <p className="text-gray-600 mb-4">
                This study plan may have been deleted or you may not have permission to view it.
              </p>
              <Button
                onClick={() => router.push('/bible-study')}
                className="bg-[#6b21a8] hover:bg-[#5b1b8f]"
              >
                Return to Bible Study
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Auth check
  if (!user) {
    return (
      <div className="min-h-screen py-8 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-[#6b21a8] mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sign in to View Study Plan</h2>
              <p className="text-gray-600 mb-4">
                Please sign in to view and track your Bible study progress.
              </p>
              <Button
                onClick={() => router.push('/sign-in')}
                className="bg-[#6b21a8] hover:bg-[#5b1b8f]"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate progress
  const completedSteps = currentStudy.checklist.filter(step => step.completed).length;
  const progress = Math.round((completedSteps / currentStudy.checklist.length) * 100);

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb
            items={[
              { title: "Home", href: "/" },
              { title: "Bible Study", href: "/bible-study" },
              { title: "Plans", href: "/bible-study/plans" },
              { title: currentStudy.title, href: `/bible-study/plan/${params.id}`, isCurrentPage: true }
            ]}
            description="Follow your personalized Bible study journey."
          />

          {/* Mobile Progress Card */}
          <div className="lg:hidden mb-6">
            <Collapsible
              open={isProgressExpanded}
              onOpenChange={setIsProgressExpanded}
              className="space-y-2"
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium text-[#6b21a8]">Your Progress</h3>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-gray-100 rounded-full">
                          <div
                            className="h-2 bg-[#6b21a8] rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{progress}%</span>
                      </div>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {isProgressExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </CardContent>
              </Card>
              
              <CollapsibleContent>
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Created by</h4>
                      <p className="text-sm text-gray-600">{currentStudy.creator?.name || 'Anonymous'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Last updated</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(currentStudy.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        // Add share functionality
                        toast.success("Share feature coming soon!");
                      }}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Study Plan
                    </Button>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side - Study Plan Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-[#6b21a8] mb-2">
                        {currentStudy.title}
                      </h2>
                      <p className="text-gray-600">{currentStudy.description}</p>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-4">
                      <h3 className="font-medium text-[#6b21a8] mb-2">Scripture Reference</h3>
                      <p className="text-gray-700">{currentStudy.scripture_reference}</p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium text-[#6b21a8]">Study Steps</h3>
                      {currentStudy.checklist.map((step, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "h-6 w-6 p-0 rounded-full",
                              step.completed && "text-green-600"
                            )}
                            onClick={() => handleStepToggle(index)}
                          >
                            <CheckCircle2 className="h-6 w-6" />
                          </Button>
                          <div>
                            <h4 className="font-medium text-gray-900">{step.heading}</h4>
                            <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {progress === 100 && (
                <Card className="bg-purple-50 border-none">
                  <CardContent className="p-6">
                    <div className="text-center space-y-3">
                      <h3 className="text-lg font-semibold text-[#6b21a8]">
                        Congratulations!
                      </h3>
                      <p className="text-gray-600">
                        You've completed all the study steps. Would you like to start a new study?
                      </p>
                      <Button
                        onClick={() => router.push('/bible-study')}
                        className="bg-[#6b21a8] hover:bg-[#5b1b8f]"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Start New Study
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Side - Progress and Info (Desktop Only) */}
            <div className="hidden lg:block space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-[#6b21a8] mb-4">
                    Your Progress
                  </h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div
                          className="h-2 bg-[#6b21a8] rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        {progress}% Complete
                      </p>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Created by</h4>
                          <p className="text-sm text-gray-600">{currentStudy.creator?.name || 'Anonymous'}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Last updated</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(currentStudy.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            // Add share functionality
                            toast.success("Share feature coming soon!");
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share Study Plan
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 