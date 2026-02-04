'use client';

import React from 'react';

interface AdminFormProps {
  children: React.ReactNode;
  onSave: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  saving?: boolean;
  error?: string | null;
  success?: string | null;
}

export default function AdminForm({ children, onSave, onCancel, onDelete, saving, error, success }: AdminFormProps) {
  return (
    <div className="flex flex-col gap-6">
      {children}

      {error && (
        <div className="text-xs font-normal text-red-400">{error}</div>
      )}

      {success && (
        <div className="text-xs font-normal text-green-400">{success}</div>
      )}

      <div className="flex items-center gap-4 pt-4 border-t border-white/10">
        <button
          onClick={onSave}
          disabled={saving}
          className="text-xs font-normal uppercase tracking-wider px-4 py-2 border border-white/30 hover:border-white/60 transition-colors disabled:opacity-20"
        >
          {saving ? 'saving...' : 'save'}
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs font-normal uppercase tracking-wider opacity-40 hover:opacity-100 transition-opacity"
          >
            cancel
          </button>
        )}

        {onDelete && (
          <button
            onClick={onDelete}
            className="text-xs font-normal uppercase tracking-wider opacity-30 hover:opacity-100 hover:text-red-400 transition-all ml-auto"
          >
            delete
          </button>
        )}
      </div>
    </div>
  );
}
