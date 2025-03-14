'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Tag } from 'lucide-react';

interface TagManagerProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagManager({ tags, onChange }: TagManagerProps) {
  const [currentTag, setCurrentTag] = useState('');
  
  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      onChange([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    onChange(tags.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Tag className="h-5 w-5 mr-2" />
          Tags
        </CardTitle>
        <CardDescription>
          Add tags to help readers find your content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tags">Add Tags</Label>
          <div className="flex gap-2">
            <Input
              id="tags"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter tag and press Enter"
              className="flex-1"
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleAddTag}
              disabled={!currentTag.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
        
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1 text-sm py-1 px-3">
                {tag}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => handleRemoveTag(tag)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 text-sm border border-dashed rounded-md">
            No tags added yet
          </div>
        )}
        
        {tags.length > 0 && (
          <div className="text-xs text-gray-500 mt-2">
            {tags.length} {tags.length === 1 ? 'tag' : 'tags'} added
          </div>
        )}
      </CardContent>
    </Card>
  );
} 