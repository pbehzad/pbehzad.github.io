'use client';

import React from 'react';
import AdminFileLibrary from '../components/AdminFileLibrary';

export default function FilesAdminPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-lg font-normal" style={{ color: '#e5e5e5' }}>
          Files
        </h1>
        <p className="mt-2 max-w-2xl text-xs font-normal leading-relaxed" style={{ color: '#666' }}>
          Upload and manage PDFs, images, and audio in the same storage backend as your content.
          Files in use must be detached from their text or composition before deletion.
        </p>
      </div>
      <AdminFileLibrary showDelete />
    </div>
  );
}
