'use client';

import React from 'react';

interface AdminInputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

export default function AdminInput({ label, value, onChange, type = 'text', placeholder, required }: AdminInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-normal uppercase tracking-wider opacity-40">
        {label}{required && ' *'}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="bg-transparent border-b border-white/15 text-sm font-normal py-2 outline-none focus:border-white/50 transition-colors placeholder:opacity-20"
      />
    </div>
  );
}
