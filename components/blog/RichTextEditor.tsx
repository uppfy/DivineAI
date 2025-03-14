'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Dynamically import React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-64 w-full border rounded-md bg-gray-50 flex items-center justify-center">Loading editor...</div>
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    ['link', 'image'],
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    ['clean'],
    // Custom buttons for verse and quote formatting
    ['verse', 'quote']
  ]
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent',
  'link', 'image',
  'align',
  'blockquote', 'code-block'
];

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [editorValue, setEditorValue] = useState(value);

  // Initialize Quill custom formats for verse and quote
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const Quill = require('react-quill').Quill;
      
      // Add custom button handlers after Quill is loaded
      const toolbar = document.querySelector('.ql-toolbar');
      
      if (toolbar) {
        // Add verse button if it doesn't exist
        if (!toolbar.querySelector('.ql-verse')) {
          const verseButton = document.createElement('button');
          verseButton.className = 'ql-verse';
          verseButton.innerHTML = 'Verse';
          verseButton.title = 'Insert Bible Verse';
          toolbar.appendChild(verseButton);
          
          verseButton.addEventListener('click', () => {
            const range = (window as any).quillInstance.getSelection();
            if (range) {
              const text = '[verse]Insert Bible verse here[/verse]';
              (window as any).quillInstance.insertText(range.index, text);
            }
          });
        }
        
        // Add quote button if it doesn't exist
        if (!toolbar.querySelector('.ql-quote')) {
          const quoteButton = document.createElement('button');
          quoteButton.className = 'ql-quote';
          quoteButton.innerHTML = 'Quote';
          quoteButton.title = 'Insert Quote';
          toolbar.appendChild(quoteButton);
          
          quoteButton.addEventListener('click', () => {
            const range = (window as any).quillInstance.getSelection();
            if (range) {
              const text = '[quote]Insert quote here[/quote]';
              (window as any).quillInstance.insertText(range.index, text);
            }
          });
        }
      }
      
      setMounted(true);
    }
  }, []);

  const handleChange = (content: string) => {
    setEditorValue(content);
    onChange(content);
  };

  return (
    <div className="rich-text-editor">
      {mounted && (
        <ReactQuill
          theme="snow"
          value={editorValue}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder || "Write your content here..."}
          ref={(el) => {
            if (el) {
              (window as any).quillInstance = el.getEditor();
            }
          }}
        />
      )}
      <style jsx global>{`
        .rich-text-editor .ql-container {
          min-height: 200px;
          font-size: 16px;
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
        }
        
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
        }
        
        .rich-text-editor .ql-verse,
        .rich-text-editor .ql-quote {
          margin-left: 8px;
          padding: 3px 5px;
          background: #f1f5f9;
          border-radius: 3px;
          font-size: 12px;
        }
        
        .rich-text-editor .ql-verse:hover,
        .rich-text-editor .ql-quote:hover {
          background: #e2e8f0;
        }
      `}</style>
    </div>
  );
} 