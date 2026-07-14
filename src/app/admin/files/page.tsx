'use client';

import React from 'react';
import AdminFileLibrary from '../components/AdminFileLibrary';

export default function FilesAdminPage() {
  return (
    <div>
      <div className="mb-7">
        <h1>File library</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed" style={{ color: '#77766f' }}>
          Upload and manage PDFs, images, and audio in the same storage backend as your content.
          Organize them into folders without changing their public URLs. Files in use must be
          detached from their composition, text, or tool before deletion.
        </p>
      </div>
      <AdminFileLibrary showDelete />
    </div>
  );
}
