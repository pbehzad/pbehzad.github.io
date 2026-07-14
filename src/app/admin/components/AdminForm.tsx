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
    <div className="admin-form">
      {children}

      {error && (
        <div className="admin-notice admin-notice-error">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-notice admin-notice-success">
          {success}
        </div>
      )}

      <div className="admin-form-actions flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="admin-button admin-button-primary disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            className="admin-button"
          >
            Cancel
          </button>
        )}

        {onDelete && (
          <button
            onClick={onDelete}
            className="admin-button admin-button-danger ml-auto"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
