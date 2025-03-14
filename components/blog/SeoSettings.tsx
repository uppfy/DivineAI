'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SeoSettingsProps {
  title: string;
  metaDescription: string;
  metaKeywords: string[];
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onKeywordsChange: (keywords: string[]) => void;
}

export default function SeoSettings({
  title,
  metaDescription,
  metaKeywords,
  onTitleChange,
  onDescriptionChange,
  onKeywordsChange
}: SeoSettingsProps) {
  const [currentKeyword, setCurrentKeyword] = useState('');
  
  const handleAddKeyword = () => {
    if (currentKeyword.trim() && !metaKeywords.includes(currentKeyword.trim())) {
      onKeywordsChange([...metaKeywords, currentKeyword.trim()]);
      setCurrentKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    onKeywordsChange(metaKeywords.filter(k => k !== keyword));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  // Calculate SEO scores
  const titleLength = title.length;
  const descriptionLength = metaDescription.length;
  const keywordsCount = metaKeywords.length;
  
  const titleScore = titleLength >= 40 && titleLength <= 60 ? 'good' : (titleLength > 0 ? 'fair' : 'poor');
  const descriptionScore = descriptionLength >= 120 && descriptionLength <= 160 ? 'good' : (descriptionLength > 0 ? 'fair' : 'poor');
  const keywordsScore = keywordsCount >= 3 && keywordsCount <= 8 ? 'good' : (keywordsCount > 0 ? 'fair' : 'poor');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          SEO Settings
          <div className="flex items-center gap-2">
            <Badge variant={titleScore === 'good' ? 'default' : (titleScore === 'fair' ? 'outline' : 'destructive')}>
              Title: {titleScore}
            </Badge>
            <Badge variant={descriptionScore === 'good' ? 'default' : (descriptionScore === 'fair' ? 'outline' : 'destructive')}>
              Description: {descriptionScore}
            </Badge>
            <Badge variant={keywordsScore === 'good' ? 'default' : (keywordsScore === 'fair' ? 'outline' : 'destructive')}>
              Keywords: {keywordsScore}
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>
          Optimize your blog post for search engines
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="seoTitle">SEO Title</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-xs text-gray-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {titleLength}/60 characters
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Optimal length: 40-60 characters</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="seoTitle"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter SEO title (defaults to post title)"
            className={titleScore === 'good' ? 'border-green-500' : (titleScore === 'fair' ? 'border-yellow-500' : '')}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-xs text-gray-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {descriptionLength}/160 characters
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Optimal length: 120-160 characters</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Textarea
            id="metaDescription"
            value={metaDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Enter meta description (appears in search results)"
            rows={3}
            className={descriptionScore === 'good' ? 'border-green-500' : (descriptionScore === 'fair' ? 'border-yellow-500' : '')}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="metaKeywords">Meta Keywords</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-xs text-gray-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {keywordsCount} keywords
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Optimal count: 3-8 keywords</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex gap-2">
            <Input
              id="metaKeywords"
              value={currentKeyword}
              onChange={(e) => setCurrentKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter keyword and press Enter"
              className="flex-1"
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleAddKeyword}
              disabled={!currentKeyword.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          
          {metaKeywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {metaKeywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                  {keyword}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleRemoveKeyword(keyword)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 