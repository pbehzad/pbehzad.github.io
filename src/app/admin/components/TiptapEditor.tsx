'use client';

import React from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function TiptapEditor({ content, onChange, placeholder }: TiptapEditorProps) {
  return (
    <div className="overflow-hidden rounded-lg border" style={{ borderColor: '#dcdad2', background: '#fff' }}>
      {/* Labels */}
      <div className="flex border-b" style={{ borderColor: '#dcdad2', background: '#f5f4ef' }}>
        <div className="w-1/2 border-r px-4 py-2 text-[11px] font-medium uppercase tracking-wider" style={{ color: '#77766f', borderColor: '#dcdad2' }}>HTML</div>
        <div className="w-1/2 px-4 py-2 text-[11px] font-medium uppercase tracking-wider" style={{ color: '#77766f' }}>Preview</div>
      </div>

      {/* Side-by-side panels */}
      <div className="flex min-h-[480px]">
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Write HTML content...'}
          className="w-1/2 resize-none border-0 border-r px-4 py-4 font-mono text-xs leading-relaxed focus:shadow-none"
          style={{ background: '#faf9f6', borderColor: '#dcdad2', color: '#3b3a35' }}
          spellCheck={false}
        />
        <div
          className="w-1/2 max-w-none overflow-auto px-5 py-4 text-sm leading-relaxed"
          style={{ color: '#292824' }}
          dangerouslySetInnerHTML={{ __html: content || '<p style="opacity:0.3">Nothing to preview</p>' }}
        />
      </div>
    </div>
  );
}
