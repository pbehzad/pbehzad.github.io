'use client';

import React, { useState } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function TiptapEditor({ content, onChange, placeholder }: TiptapEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  return (
    <div className="border border-white/20 rounded">
      {/* Mode toggle */}
      <div className="flex items-center border-b border-white/10 px-1 py-1">
        <button
          type="button"
          onClick={() => setIsPreview(false)}
          className={`px-2 py-1 text-xs font-mono transition-opacity ${!isPreview ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
        >
          Code
        </button>
        <button
          type="button"
          onClick={() => setIsPreview(true)}
          className={`px-2 py-1 text-xs font-mono transition-opacity ${isPreview ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
        >
          Preview
        </button>
      </div>

      {isPreview ? (
        <div
          className="prose prose-invert prose-sm max-w-none px-4 py-3 min-h-[200px]"
          dangerouslySetInnerHTML={{ __html: content || '<p class="opacity-30">Nothing to preview</p>' }}
        />
      ) : (
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Write HTML content...'}
          className="w-full min-h-[200px] bg-transparent text-white/80 font-mono text-xs px-4 py-3 focus:outline-none resize-y"
          spellCheck={false}
        />
      )}
    </div>
  );
}
