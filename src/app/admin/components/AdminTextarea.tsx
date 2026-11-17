'use client';

import React, { useId } from 'react';

interface AdminTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  /** A short note under the field, read out with it by screen readers. */
  hint?: string;
}

export default function AdminTextarea({ label, value, onChange, rows = 4, placeholder, hint }: AdminTextareaProps) {
  const hintId = useId();

  return (
    <div className="admin-field">
      <label className="admin-field-label">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        aria-describedby={hint ? hintId : undefined}
        className="admin-control resize-y"
      />
      {hint && (
        <p id={hintId} className="admin-field-hint">
          {hint}
        </p>
      )}
    </div>
  );
}
