'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Check, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUploader({ value, onChange, label = 'Image URL' }: ImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState(value);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(!!value);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    setIsValid(false);
  };

  const validateImage = () => {
    if (!imageUrl) {
      toast({
        title: 'Error',
        description: 'Please enter an image URL',
        variant: 'destructive',
      });
      return;
    }

    setIsValidating(true);
    
    const img = new Image();
    img.onload = () => {
      setIsValidating(false);
      setIsValid(true);
      onChange(imageUrl);
      toast({
        title: 'Success',
        description: 'Image validated successfully',
        variant: 'default',
      });
    };
    
    img.onerror = () => {
      setIsValidating(false);
      setIsValid(false);
      toast({
        title: 'Error',
        description: 'Invalid image URL or image could not be loaded',
        variant: 'destructive',
      });
    };
    
    img.src = imageUrl;
  };

  const clearImage = () => {
    setImageUrl('');
    setIsValid(false);
    onChange('');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="imageUrl">{label}</Label>
        <div className="flex gap-2">
          <Input
            id="imageUrl"
            value={imageUrl}
            onChange={handleUrlChange}
            placeholder="Enter image URL"
            className="flex-1"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={validateImage}
            disabled={isValidating || !imageUrl}
          >
            {isValidating ? (
              <span className="animate-spin">⟳</span>
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Validate
          </Button>
        </div>
      </div>
      
      {imageUrl && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              {isValid ? (
                <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                  <Check className="h-4 w-4" />
                </div>
              ) : null}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 left-2 h-8 w-8 rounded-full"
                onClick={clearImage}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="relative h-48 w-full">
                {isValid ? (
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <div className="text-center p-4">
                      <ImageIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        {isValidating ? 'Validating image...' : 'Image preview will appear here'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 