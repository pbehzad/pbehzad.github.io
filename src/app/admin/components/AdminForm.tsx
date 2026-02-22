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
    <div className="flex flex-col gap-5">
      {children}

      {error && (
        <div className="text-sm px-4 py-3 rounded" style={{ background: '#2a1010', color: '#f87171', border: '1px solid #5a1a1a' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="text-sm px-4 py-3 rounded" style={{ background: '#0f2a18', color: '#4ade80', border: '1px solid #1a5a2a' }}>
          {success}
        </div>
      )}

      <div className="flex items-center gap-3 pt-5" style={{ borderTop: '1px solid #222' }}>
        <button
          onClick={onSave}
          disabled={saving}
          className="text-sm font-normal px-5 py-2 rounded transition-opacity disabled:opacity-40"
          style={{ background: '#ffffff', color: '#000000' }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            className="text-sm font-normal px-5 py-2 rounded transition-colors"
            style={{ background: 'transparent', color: '#888', border: '1px solid #333' }}
          >
            Cancel
          </button>
        )}

        {onDelete && (
          <button
            onClick={onDelete}
            className="text-sm font-normal px-5 py-2 rounded transition-colors ml-auto"
            style={{ background: 'transparent', color: '#f87171', border: '1px solid #5a1a1a' }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
