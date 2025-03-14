'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BlogCategory } from '@/types/database';
import { Folder, FolderPlus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategorySelectorProps {
  value: BlogCategory;
  onChange: (category: BlogCategory) => void;
}

export default function CategorySelector({ value, onChange }: CategorySelectorProps) {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRef = collection(db, 'blogCategories');
        const snapshot = await getDocs(categoriesRef);
        
        const fetchedCategories = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
        }));
        
        // Add default categories if none exist
        if (fetchedCategories.length === 0) {
          setCategories([
            { id: 'Spiritual Growth', name: 'Spiritual Growth' },
            { id: 'Prayer', name: 'Prayer' },
            { id: 'Bible Study', name: 'Bible Study' },
            { id: 'Testimony', name: 'Testimony' },
            { id: 'Community', name: 'Community' },
            { id: 'General', name: 'General' },
          ]);
        } else {
          setCategories(fetchedCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to default categories
        setCategories([
          { id: 'Spiritual Growth', name: 'Spiritual Growth' },
          { id: 'Prayer', name: 'Prayer' },
          { id: 'Bible Study', name: 'Bible Study' },
          { id: 'Testimony', name: 'Testimony' },
          { id: 'Community', name: 'Community' },
          { id: 'General', name: 'General' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Folder className="h-5 w-5 mr-2" />
          Category
        </CardTitle>
        <CardDescription>
          Select a category for your blog post
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select 
            value={value} 
            onValueChange={(value) => onChange(value as BlogCategory)}
            disabled={loading}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {loading && (
            <div className="text-xs text-gray-500 mt-2">
              Loading categories...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 