"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import { useBibleStudy } from "@/hooks/useBibleStudy";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ChevronRight, Clock, CheckCircle2, PlusCircle, Loader2 } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Progress } from "@/components/ui/progress";

interface StudyStep {
  heading: string;
  description: string;
  completed: boolean;
}

interface StudyPlan {
  id: string;
  title: string;
  description: string;
  scripture_reference: string;
  checklist: StudyStep[];
  createdAt: string;
  updatedAt: string;
}

// Helper function to calculate plan status and progress
const getPlanStatus = (checklist: StudyStep[]) => {
  const completedSteps = checklist.filter(step => step.completed).length;
  const totalSteps = checklist.length;
  const progress = Math.round((completedSteps / totalSteps) * 100);
  
  if (completedSteps === 0) return { status: 'not-started', progress };
  if (completedSteps === totalSteps) return { status: 'completed', progress };
  return { status: 'in-progress', progress };
};

export default function BibleStudyPlans() {
  const router = useRouter();
  const { user } = useAuth();
  const { studies: plans, loading, error } = useBibleStudy();

  // Auth check
  if (!user) {
    return (
      <div className="min-h-screen py-8 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-[#6b21a8] mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sign in to View Study Plans</h2>
              <p className="text-gray-600 mb-4">
                Please sign in to view and manage your Bible study plans.
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen py-8 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#6b21a8]" />
                <p className="text-gray-600">Loading your study plans...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-8 bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Breadcrumb
              items={[
                { title: "Home", href: "/" },
                { title: "Bible Study", href: "/bible-study" },
                { title: "Plans", href: "/bible-study/plans", isCurrentPage: true }
              ]}
              description="Explore and manage your Bible study plans."
            />
            <Button
              onClick={() => router.push('/bible-study')}
              className="bg-[#6b21a8] hover:bg-[#5b1b8f]"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create New Plan
            </Button>
          </div>

          {plans && plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const { status, progress } = getPlanStatus(plan.checklist);
                return (
                <Card
                  key={plan.id}
                    className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                    onClick={() => router.push(`/bible-study/plan/${plan.id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-[#6b21a8] line-clamp-1">
                              {plan.title}
                      </h3>
                            <p className="text-sm text-gray-500 line-clamp-2">
                              {plan.description}
                            </p>
                          </div>
                          {status === 'completed' && (
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                          )}
                    </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="text-[#6b21a8] font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                    </div>

                    <div className="pt-2 flex items-center justify-between text-sm">
                          <span className="text-gray-500 flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(plan.createdAt).toLocaleDateString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#6b21a8] hover:bg-[#6b21a8] hover:text-white -mr-2"
                      >
                        Continue
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                        </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12">
                <div className="text-center space-y-4">
                  <BookOpen className="w-12 h-12 mx-auto text-gray-400" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-medium text-gray-900">
                      No Study Plans Yet
                    </h3>
                    <p className="text-gray-600 max-w-sm mx-auto">
                      Create your first Bible study plan to begin your journey of spiritual growth and understanding.
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push('/bible-study')}
                    className="bg-[#6b21a8] hover:bg-[#5b1b8f]"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Your First Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
} 