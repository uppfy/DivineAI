"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Search,
  BookOpen,
  Users,
  Heart,
  Shield,
  Settings,
  HelpCircle,
  ArrowRight,
  Info
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "Getting Started",
      questions: [
        {
          q: "What is Divine Comfort?",
          a: "Divine Comfort is a spiritual companion app that combines scripture wisdom with modern technology to provide personalized faith experiences. It offers daily devotionals, Bible study plans, spiritual guidance, prayer communities, and more to support your faith journey."
        },
        {
          q: "How do I create an account?",
          a: "To create an account, click the 'Sign Up' button in the top right corner. You'll need to provide your email address and create a password. Once registered, you can personalize your profile and start your spiritual journey."
        },
        {
          q: "Is Divine Comfort free to use?",
          a: "Yes, Divine Comfort offers a free basic account with access to daily devotionals and community features. Premium features like advanced Bible study plans and spiritual guidance are available through our subscription plans."
        }
      ]
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: "Daily Devotionals",
      questions: [
        {
          q: "How do daily devotionals work?",
          a: "Each day, you'll receive a new devotional that includes a scripture passage, reflection, and prayer prompt. You can access these through the Devotionals section and save them for later reference."
        },
        {
          q: "Can I share devotionals with others?",
          a: "Yes! Each devotional has a share button that allows you to share it with friends and family through various platforms or directly within the Divine Comfort community."
        }
      ]
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "Bible Study",
      questions: [
        {
          q: "How do I start a Bible study plan?",
          a: "Navigate to the Bible Study section, browse available plans, and click 'Start Plan' on any that interest you. You can track your progress and complete study activities at your own pace."
        },
        {
          q: "Can I study with friends?",
          a: "Yes! You can invite friends to join your study plan, share insights, and discuss scripture together through our community features."
        }
      ]
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Community",
      questions: [
        {
          q: "How do I connect with other believers?",
          a: "Visit the Community section to join discussion groups, share prayer requests, and connect with fellow believers. You can also follow other users and engage with their spiritual journey."
        },
        {
          q: "How do I share prayer requests?",
          a: "In the Community section, click 'Share Prayer Request' to post your request. You can choose to share it publicly or with specific groups you're part of."
        }
      ]
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Privacy & Security",
      questions: [
        {
          q: "Is my personal information secure?",
          a: "Yes, we take your privacy seriously. All personal information is encrypted and stored securely. We never share your data with third parties without your explicit consent."
        },
        {
          q: "Can I make my profile private?",
          a: "Yes, you can adjust your privacy settings in your profile to control what information is visible to others and who can interact with your content."
        }
      ]
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#6b21a8] mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Find answers to common questions about Divine Comfort and your spiritual journey.
            </p>
            <div className="max-w-xl mx-auto relative">
              <Input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {filteredCategories.map((category, index) => (
              <div key={index} className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    {category.icon}
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {category.title}
                  </h2>
                </div>
                <Accordion type="single" collapsible className="space-y-4">
                  {category.questions.map((faq, faqIndex) => (
                    <AccordionItem
                      key={faqIndex}
                      value={`${index}-${faqIndex}`}
                      className="border rounded-lg px-6"
                    >
                      <AccordionTrigger className="text-left">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-[#6b21a8] text-white rounded-3xl p-12">
              <HelpCircle className="w-12 h-12 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">
                Still Have Questions?
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Can't find what you're looking for? Our support team is here to help you.
              </p>
              <Button 
                className="bg-white text-[#6b21a8] hover:bg-gray-100"
                onClick={() => window.location.href = '/contact'}
              >
                Contact Support
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 