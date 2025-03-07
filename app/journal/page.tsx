"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useJournal } from "@/hooks/useJournal";
import {
  Calendar,
  Edit,
  Search,
  PlusCircle,
  BookOpen,
  Heart,
  Tag,
  Clock,
  ChevronRight,
  Smile,
  HandHeart,
  CheckCircle2,
  Filter,
  Grid,
  List,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
  Plus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from 'date-fns';
import EntryForm, { MOODS } from './components/EntryForm';
import { JournalEntry } from '@/lib/journal';

// Daily prompts - could be moved to a separate file or fetched from an API
const DAILY_PROMPTS = [
  "What Bible verse spoke to you today and why?",
  "How did you see God's hand in your life today?",
  "What are you grateful for today?",
  "What prayer was answered today?",
  "What spiritual lesson did you learn today?",
];

export default function Journal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  // Get today's prompt
  const todayPrompt = DAILY_PROMPTS[new Date().getDay() % DAILY_PROMPTS.length];

  // Use the journal hook
  const {
    entries,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    markAsAnswered,
    updateFilter,
  } = useJournal({
    initialFilter: {
      searchTerm: '',
      isPrayer: activeTab === 'prayers',
    },
  });

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    updateFilter({ searchTerm: term });
  };

  // Handle new entry submission
  const handleSubmitEntry = async (data: Partial<JournalEntry>) => {
    if (!user) return;

    try {
      const date = new Date().toISOString().split('T')[0];
      await createEntry({
        title: data.title || 'Untitled Entry',
        content: data.content || '',
        mood: data.mood,
        tags: data.tags || [],
        verse: data.verse || '',
        isPrayer: data.isPrayer || false,
        date,
        isAnswered: false,
      });

      toast({
        title: "Success",
        description: "Journal entry created successfully",
      });

      setActiveTab('dashboard');
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create journal entry",
        variant: "destructive",
      });
    }
  };

  // Handle entry update
  const handleUpdateEntry = async (data: Partial<JournalEntry>) => {
    if (!editingEntry) return;

    try {
      await updateEntry(editingEntry.id!, data);
      toast({
        title: "Success",
        description: "Journal entry updated successfully",
      });
      setEditingEntry(null);
      setActiveTab('dashboard');
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update journal entry",
        variant: "destructive",
      });
    }
  };

  // Handle entry deletion
  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      await deleteEntry(entryId);
      toast({
        title: "Success",
        description: "Journal entry deleted successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete journal entry",
        variant: "destructive",
      });
    }
  };

  // Handle marking prayer as answered
  const handleMarkAnswered = async (entryId: string) => {
    try {
      await markAsAnswered(entryId);
      toast({
        title: "Success",
        description: "Prayer marked as answered",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to mark prayer as answered",
        variant: "destructive",
      });
    }
  };

  // Render entry card
  const renderEntryCard = (entry: JournalEntry) => {
    const mood = entry.mood ? MOODS[entry.mood as keyof typeof MOODS] : null;

    return (
      <Card key={entry.id} className="group">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-4 flex-1">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(entry.createdAt.toDate(), { addSuffix: true })}
                  </span>
                  {mood && (
                    <span className={`px-2 py-1 rounded-full text-xs ${mood.color}`}>
                      {mood.label}
                    </span>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      setEditingEntry(entry);
                      setActiveTab('edit-entry');
                    }}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDeleteEntry(entry.id!)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Title and Content */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{entry.title}</h3>
                <p className="mt-2 text-gray-700">{entry.content}</p>
              </div>

              {/* Bible Verse */}
              {entry.verse && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="w-4 h-4" />
                  <span>{entry.verse}</span>
                </div>
              )}

              {/* Tags */}
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map(tag => (
                    <span
                      key={tag}
                      className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Prayer Status */}
              {entry.isPrayer && (
                <div className="flex items-center gap-2">
                  {entry.isAnswered ? (
                    <span className="flex items-center gap-1 text-green-600 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      Prayer Answered
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-purple-600"
                      onClick={() => handleMarkAnswered(entry.id!)}
                    >
                      <HandHeart className="w-4 h-4 mr-1" />
                      Mark as Answered
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
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
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb
            items={[
              { title: "Home", href: "/" },
              { title: "Journal", href: "/journal", isCurrentPage: true }
            ]}
            description="Record your spiritual journey and prayers."
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dashboard">
                <Heart className="w-4 h-4 mr-2" />
                Journal Entries
              </TabsTrigger>
              <TabsTrigger value="prayers">
                <HandHeart className="w-4 h-4 mr-2" />
                Prayer Requests
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              {entries
                .filter(entry => !entry.isPrayer)
                .map(renderEntryCard)}
            </TabsContent>

            <TabsContent value="prayers" className="space-y-6">
              {entries
                .filter(entry => entry.isPrayer)
                .map(renderEntryCard)}
            </TabsContent>

            <TabsContent value="new-entry">
              <Card>
                <CardContent className="p-6">
                  <EntryForm onSubmit={handleSubmitEntry} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="edit-entry">
              {editingEntry && (
                <Card>
                  <CardContent className="p-6">
                    <EntryForm
                      entry={editingEntry}
                      onSubmit={handleUpdateEntry}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Floating Action Button */}
          <Button
            onClick={() => setActiveTab('new-entry')}
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-[#6b21a8] hover:bg-[#5b1b8f] md:hidden"
          >
            <Plus className="h-6 w-6" />
          </Button>

          {/* Desktop New Entry Button */}
          <Button
            onClick={() => setActiveTab('new-entry')}
            className="hidden md:flex items-center mt-6 bg-[#6b21a8] hover:bg-[#5b1b8f]"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Entry
          </Button>
        </div>
      </div>
    </div>
  );
} 