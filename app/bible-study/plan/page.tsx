"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, ArrowLeft, Share2, BookmarkPlus } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb"

interface StudyStep {
  title: string;
  description: string;
  completed: boolean;
}

interface StudyPlan {
  explanation: string;
  verseDetails?: {
    verse: string;
    translation: string;
    context: string;
  };
  steps: StudyStep[];
}

export default function StudyPlanPage() {
  const router = useRouter();
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [steps, setSteps] = useState<StudyStep[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Retrieve the study plan from localStorage
    const savedPlan = localStorage.getItem('currentStudyPlan');
    if (savedPlan) {
      try {
        const plan = JSON.parse(savedPlan);
        setStudyPlan(plan);
        setSteps(plan.steps);
      } catch (err) {
        console.error('Error parsing study plan:', err);
        router.push('/bible-study');
      }
    } else {
      router.push('/bible-study');
    }
  }, [router]);

  useEffect(() => {
    // Calculate progress
    const completedSteps = steps.filter(step => step.completed).length;
    setProgress(Math.round((completedSteps / steps.length) * 100));
  }, [steps]);

  const handleStepToggle = (index: number) => {
    const newSteps = [...steps];
    newSteps[index].completed = !newSteps[index].completed;
    setSteps(newSteps);

    // Save progress to localStorage
    if (studyPlan) {
      const updatedPlan = { ...studyPlan, steps: newSteps };
      localStorage.setItem('currentStudyPlan', JSON.stringify(updatedPlan));
    }
  };

  if (!studyPlan) {
    return null;
  }

  return (
    <main className="min-h-screen py-8 bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb
            items={[
              { title: "Home", href: "/" },
              { title: "Bible Study", href: "/bible-study" },
              { title: "Plans", href: "/bible-study/plans" },
              { title: "New Plan", href: "/bible-study/plan", isCurrentPage: true }
            ]}
            description="Create a personalized Bible study plan."
          />

          <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
            <div className="flex gap-2">
              <Button variant="outline" className="text-[#6b21a8]">
                <BookmarkPlus className="w-4 h-4 mr-2" />
                Save Plan
              </Button>
              <Button variant="outline" className="text-[#6b21a8]">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Left Sidebar - Progress and Context */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-[#6b21a8] mb-4">
                  Your Progress
                </h2>
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
              </CardContent>
            </Card>

            {/* Context Card */}
            {studyPlan.verseDetails && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-[#6b21a8]">
                    Verse Context
                  </h2>
                  <div className="space-y-4">
                    <blockquote className="border-l-4 border-[#6b21a8] pl-4 italic text-gray-700">
                      {studyPlan.verseDetails.verse}
                    </blockquote>
                    <p className="text-sm text-gray-500">
                      {studyPlan.verseDetails.translation}
                    </p>
                    <p className="text-sm text-gray-600">
                      {studyPlan.verseDetails.context}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content - Study Steps */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-[#6b21a8]">
                      Understanding
                    </h2>
                    <p className="text-gray-700">
                      {studyPlan.explanation}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-[#6b21a8]">
                      Study Steps
                    </h3>
                    <div className="space-y-4">
                      {steps.map((step, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg transition-colors ${
                            step.completed ? 'bg-purple-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={step.completed}
                              onCheckedChange={() => handleStepToggle(index)}
                              className="mt-1"
                            />
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {step.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
        </div>
      </div>
    </main>
  );
} 