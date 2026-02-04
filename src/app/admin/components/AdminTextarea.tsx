'use client';

import React from 'react';

interface AdminTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}

export default function AdminTextarea({ label, value, onChange, rows = 4, placeholder }: AdminTextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-normal uppercase tracking-wider opacity-40">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="bg-transparent border border-white/15 text-sm font-normal p-3 outline-none focus:border-white/50 transition-colors placeholder:opacity-20 resize-vertical"
      />
    </div>
  );
}
