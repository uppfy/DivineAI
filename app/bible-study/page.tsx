"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import { useBibleStudy } from "@/hooks/useBibleStudy";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, BookOpen, ChevronRight, CheckCircle2, ListTodo } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { toast } from 'sonner';

// Types for the study plan response
interface StudyStep {
  heading: string;
  description: string;
  completed: boolean;
}

interface StudyPlan {
  title: string;
  description: string;
  scripture_reference: string;
  checklist: StudyStep[];
}

const THEME_SUGGESTIONS = [
  { label: "Faith", value: "Understanding and growing in faith" },
  { label: "Forgiveness", value: "The power of forgiveness in Christianity" },
  { label: "Prayer", value: "How to develop a deeper prayer life" },
  { label: "Love", value: "God's love and loving others" },
];

export default function BibleStudy() {
  const router = useRouter();
  const { user } = useAuth();
  const { createStudy } = useBibleStudy();
  const [inputType, setInputType] = useState<'verse' | 'question' | 'theme'>('verse');
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const responseRef = useRef<HTMLDivElement>(null);

  const scrollToResponse = () => {
    if (responseRef.current) {
      const yOffset = -20; // Add some padding from the top
      const y = responseRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  };

  // Get placeholder text based on input type
  const getPlaceholder = () => {
    switch (inputType) {
      case 'verse':
        return "e.g., John 3:16, Psalms 23, Romans";
      case 'question':
        return "e.g., What does the Bible say about forgiveness?";
      case 'theme':
        return "Choose from suggestions or enter your own theme";
      default:
        return "";
    }
  };

  // Get helper text based on input type
  const getHelperText = () => {
    switch (inputType) {
      case 'verse':
        return "Enter a specific verse, entire chapter, or book of the Bible to study its meaning and context";
      case 'question':
        return "Ask a spiritual question to explore Biblical teachings and guidance";
      case 'theme':
        return "Select a theme or enter your own to study Biblical teachings on that topic";
      default:
        return "";
    }
  };

  // Handle input focus or change
  const handleInputActivation = () => {
    if (isPreviewMode) {
      setIsPreviewMode(false);
      setStudyPlan(null);
    }
  };

  // Handle dropdown change
  const handleDropdownChange = (value: 'verse' | 'question' | 'theme') => {
    setInputType(value);
    setInput("");
    setStudyPlan(null);
    setIsPreviewMode(false);
  };

  const handleThemeClick = (theme: string) => {
    setInput(theme);
    handleGenerateStudyPlan(theme);
  };

  const handleGenerateStudyPlan = async (themeInput?: string) => {
    const studyInput = themeInput || input;
    if (!studyInput.trim()) return;

    setIsLoading(true);
    setError(null);

    // Scroll to response section immediately when loading starts
    scrollToResponse();

    try {
      const res = await fetch('/api/bible-study', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          input: studyInput,
          type: inputType 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate study plan');
      }

      // Add completed field to each checklist item
      const studyPlan: StudyPlan = {
        ...data,
        checklist: data.checklist.map((item: Omit<StudyStep, 'completed'>) => ({
          ...item,
          completed: false
        }))
      };

      setStudyPlan(studyPlan);
      setIsPreviewMode(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate study plan. Please try again.';
      setError(errorMessage);
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartStudyPlan = async () => {
    if (!studyPlan) return;
    
    if (!user) {
      toast.error("Please sign in to save your study plan");
      return;
    }

    try {
      setIsLoading(true);
      const studyId = await createStudy({
        title: studyPlan.title,
        description: studyPlan.description,
        scripture_reference: studyPlan.scripture_reference,
        type: inputType,
        checklist: studyPlan.checklist,
      });
      
      if (studyId) {
        // Use router.push with replace option to prevent adding to history
        await router.replace(`/bible-study/plan/${studyId}`);
        toast.success("Study plan created successfully!");
      } else {
        throw new Error("Failed to create study plan - no ID returned");
      }
    } catch (error) {
      console.error('Error saving study plan:', error);
      toast.error("Failed to save study plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen py-8 bg-gradient-to-b from-purple-50 to-white relative">
      {/* Auth Overlay */}
      {!user && studyPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6 text-center space-y-4">
              <BookOpen className="w-12 h-12 mx-auto text-[#6b21a8]" />
              <h2 className="text-xl font-semibold">Sign in to Save Your Study Plan</h2>
              <p className="text-gray-600">
                Create an account or sign in to save your Bible study plan and track your progress.
              </p>
              <Button
                onClick={() => router.push('/sign-in')}
                className="bg-[#6b21a8] hover:bg-[#5b1b8f] w-full"
              >
                Sign In to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating Action Button for Plans */}
      <div className="fixed bottom-8 right-8 z-40">
        <Button
          onClick={() => router.push('/bible-study/plans')}
          className="bg-[#6b21a8] hover:bg-[#5b1b8f] rounded-full p-4 shadow-lg group"
        >
          <ListTodo className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="ml-2 hidden group-hover:inline">View Study Plans</span>
        </Button>
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb
            items={[
              { title: "Home", href: "/" },
              { title: "Bible Study", href: "/bible-study", isCurrentPage: true }
            ]}
            description="Deepen your understanding of God's Word through guided Bible studies."
          />

          <div className="grid md:grid-cols-2 gap-8 mt-8">
            {/* Left Panel - Input Form */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6 space-y-6 h-[500px] flex flex-col">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      What would you like to study?
                    </label>
                    <Select
                      value={inputType}
                      onValueChange={handleDropdownChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="verse">Bible Book, Chapter or Verse</SelectItem>
                        <SelectItem value="question">Spiritual Question</SelectItem>
                        <SelectItem value="theme">Theme</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500">{getHelperText()}</p>
                  </div>

                  {inputType === 'theme' && (
                    <div className="flex flex-wrap gap-2">
                      {THEME_SUGGESTIONS.map((theme) => (
                        <Button
                          key={theme.label}
                          variant="outline"
                          size="sm"
                          className="text-[#6b21a8] hover:bg-[#6b21a8] hover:text-white"
                          onClick={() => handleThemeClick(theme.value)}
                        >
                          {theme.label}
                        </Button>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2 flex-grow">
                    <Textarea
                      placeholder={getPlaceholder()}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        handleInputActivation();
                      }}
                      onFocus={handleInputActivation}
                      className={`h-full resize-none ${isPreviewMode ? 'opacity-50' : ''}`}
                      disabled={isLoading || isPreviewMode}
                    />
                    {error && (
                      <p className="text-red-500 text-sm">{error}</p>
                    )}
                  </div>

                  <Button
                    onClick={() => handleGenerateStudyPlan()}
                    className={`w-full bg-[#6b21a8] hover:bg-[#5b1b8f] ${isPreviewMode ? 'opacity-50' : ''}`}
                    disabled={isLoading || !input.trim() || isPreviewMode}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Bible Study Plan...
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4 mr-2" />
                        Generate Bible Study Guide
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Study Plan Preview */}
            <div ref={responseRef} className="space-y-6">
              {isLoading ? (
                <Card>
                  <CardContent className="p-6 h-[500px] flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#6b21a8]" />
                      <p className="text-gray-600">Generating Bible Study Plan...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : studyPlan ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-semibold text-[#6b21a8] mb-2">
                          {studyPlan.title}
                        </h2>
                        <p className="text-gray-600">{studyPlan.description}</p>
                      </div>

                      <div className="bg-purple-50 rounded-xl p-4">
                        <h3 className="font-medium text-[#6b21a8] mb-2">Scripture Reference</h3>
                        <p className="text-gray-700">{studyPlan.scripture_reference}</p>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium text-[#6b21a8]">Study Steps</h3>
                        {studyPlan.checklist.map((step, index) => (
                          <div key={index} className="p-4 rounded-lg hover:bg-gray-50">
                            <h4 className="font-medium text-gray-900">{step.heading}</h4>
                            <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                          </div>
                        ))}
                      </div>

                      <Button
                        onClick={handleStartStudyPlan}
                        className="w-full bg-[#6b21a8] hover:bg-[#5b1b8f] mt-6"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Start Bible Study Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 h-[500px] flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <BookOpen className="w-12 h-12 mx-auto text-gray-400" />
                      <div className="space-y-2">
                        <p className="text-gray-600">
                          Enter a Bible book, chapter, verse, theme, or question to generate a personalized study plan.
                        </p>
                      </div>
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