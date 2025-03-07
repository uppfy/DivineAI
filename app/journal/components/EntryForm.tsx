"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Smile,
  Tag as TagIcon,
  Book,
  X,
  Plus
} from "lucide-react";
import { JournalEntry } from '@/lib/journal';

// Predefined moods with their colors and icons
export const MOODS = {
  peaceful: { color: "bg-blue-100 text-blue-700", label: "Peaceful" },
  hopeful: { color: "bg-green-100 text-green-700", label: "Hopeful" },
  grateful: { color: "bg-purple-100 text-purple-700", label: "Grateful" },
  joyful: { color: "bg-yellow-100 text-yellow-700", label: "Joyful" },
  reflective: { color: "bg-gray-100 text-gray-700", label: "Reflective" },
  challenged: { color: "bg-orange-100 text-orange-700", label: "Challenged" }
};

// Common spiritual tags
const SUGGESTED_TAGS = [
  "prayer", "worship", "scripture", "testimony",
  "guidance", "blessing", "growth", "faith"
];

interface EntryFormProps {
  initialData?: Partial<JournalEntry>;
  onSubmit: (data: Partial<JournalEntry>) => Promise<void>;
  isEditing?: boolean;
}

export default function EntryForm({ initialData, onSubmit, isEditing = false }: EntryFormProps) {
  const [entry, setEntry] = useState({
    title: '',
    content: '',
    mood: '',
    tags: [] as string[],
    verse: '',
    isPrayer: false,
    ...initialData
  });
  const [newTag, setNewTag] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(entry);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle tag addition
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !entry.tags.includes(trimmedTag)) {
      setEntry(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
    }
    setNewTag('');
  };

  // Handle tag removal
  const removeTag = (tagToRemove: string) => {
    setEntry(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title Input */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <Input
          id="title"
          value={entry.title}
          onChange={(e) => setEntry(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Give your entry a title..."
          required
        />
      </div>

      {/* Content Textarea */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        <Textarea
          id="content"
          value={entry.content}
          onChange={(e) => setEntry(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Share your thoughts, prayers, or reflections..."
          className="min-h-[200px]"
          required
        />
      </div>

      {/* Mood Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How are you feeling?
        </label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {Object.entries(MOODS).map(([key, { color, label }]) => (
            <button
              key={key}
              type="button"
              onClick={() => setEntry(prev => ({ ...prev, mood: key }))}
              className={`p-2 rounded-lg flex items-center justify-center gap-2 border transition-colors
                ${entry.mood === key ? color : 'hover:bg-gray-50'}`}
            >
              <Smile className="w-4 h-4" />
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bible Verse Reference */}
      <div>
        <label htmlFor="verse" className="block text-sm font-medium text-gray-700 mb-1">
          Bible Verse Reference
        </label>
        <div className="relative">
          <Book className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="verse"
            value={entry.verse}
            onChange={(e) => setEntry(prev => ({ ...prev, verse: e.target.value }))}
            placeholder="e.g., John 3:16"
            className="pl-10"
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="space-y-3">
          {/* Current Tags */}
          <div className="flex flex-wrap gap-2">
            {entry.tags.map(tag => (
              <span
                key={tag}
                className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-purple-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add New Tag */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(newTag);
                  }
                }}
                placeholder="Add a tag..."
                className="pl-10"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => addTag(newTag)}
              disabled={!newTag.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Suggested Tags */}
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_TAGS.filter(tag => !entry.tags.includes(tag)).map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="text-sm text-gray-600 hover:text-purple-700 hover:bg-purple-50 px-2 py-1 rounded-full border"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Prayer Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPrayer"
          checked={entry.isPrayer}
          onChange={(e) => setEntry(prev => ({ ...prev, isPrayer: e.target.checked }))}
          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />
        <label htmlFor="isPrayer" className="text-sm text-gray-700">
          This is a prayer request
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={submitting}
          className="bg-[#6b21a8] hover:bg-[#5b1b8f]"
        >
          {submitting ? 'Saving...' : isEditing ? 'Update Entry' : 'Create Entry'}
        </Button>
      </div>
    </form>
  );
} 