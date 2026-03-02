'use client';

import React from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function TiptapEditor({ content, onChange, placeholder }: TiptapEditorProps) {
  return (
    <div className="border border-white/20 rounded">
      {/* Labels */}
      <div className="flex border-b border-white/10">
        <div className="w-1/2 px-4 py-1 text-xs font-mono opacity-40 border-r border-white/10">Code</div>
        <div className="w-1/2 px-4 py-1 text-xs font-mono opacity-40">Preview</div>
      </div>

      {/* Side-by-side panels */}
      <div className="flex min-h-[600px]">
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Write HTML content...'}
          className="w-1/2 bg-transparent text-white/80 font-mono text-xs px-4 py-3 focus:outline-none resize-none border-r border-white/10"
          spellCheck={false}
        />
        <div
          className="w-1/2 prose prose-invert prose-sm max-w-none px-4 py-3 overflow-auto"
          dangerouslySetInnerHTML={{ __html: content || '<p style="opacity:0.3">Nothing to preview</p>' }}
        />
      </div>
    </div>
  );
}
