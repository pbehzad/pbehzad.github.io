'use client';

import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';

export interface ManagedFileReference {
  type: 'composition' | 'text';
  id: string;
  title: string;
  field: string;
}

export interface ManagedFile {
  name: string;
  path: string;
  url: string;
  mimeType: string;
  size: number;
  sha?: string;
  modifiedAt?: string;
  references: ManagedFileReference[];
}

type FileKind = 'all' | 'pdf' | 'image' | 'audio';

interface AdminFileLibraryProps {
  kind?: FileKind;
  selectedUrl?: string;
  onSelect?: (file: ManagedFile) => void;
  showDelete?: boolean;
}

const ACCEPT_BY_KIND: Record<FileKind, string> = {
  all: 'application/pdf,image/jpeg,image/png,image/gif,image/webp,image/svg+xml,audio/mpeg,audio/wav,audio/mp4,audio/aac,audio/ogg,audio/flac',
  pdf: 'application/pdf,.pdf',
  image: 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml',
  audio: 'audio/mpeg,audio/wav,audio/mp4,audio/aac,audio/ogg,audio/flac',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function typeLabel(mimeType: string): string {
  if (mimeType === 'application/pdf') return 'PDF';
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('audio/')) return 'AUDIO';
  return 'FILE';
}

function managedFilename(url: string): string {
  try {
    const pathname = new URL(url, window.location.origin).pathname;
    return decodeURIComponent(pathname.split('/').pop() || '');
  } catch {
    return '';
  }
}

export default function AdminFileLibrary({
  kind = 'all',
  selectedUrl,
  onSelect,
  showDelete = false,
}: AdminFileLibraryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<ManagedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = kind === 'all' ? '' : `?kind=${kind}`;
      const response = await fetch(`/api/admin/files${query}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load files');
      setFiles(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/admin/files', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');
      const uploaded = data as ManagedFile;
      setFiles((current) => [uploaded, ...current]);
      onSelect?.(uploaded);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDelete = async (file: ManagedFile) => {
    if (file.references.length) return;
    if (!confirm(`Delete "${file.name}" permanently?`)) return;

    setError(null);
    const response = await fetch('/api/admin/files', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: file.path, url: file.url, sha: file.sha }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Delete failed');
      return;
    }
    setFiles((current) => current.filter((item) => item.path !== file.path));
  };

  return (
    <div className="overflow-hidden rounded" style={{ border: '1px solid #292929', background: '#121212' }}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3" style={{ borderBottom: '1px solid #242424' }}>
        <div>
          <div className="text-xs font-normal uppercase tracking-wider" style={{ color: '#aaa' }}>
            File library
          </div>
          <div className="mt-1 text-[11px] font-normal" style={{ color: '#555' }}>
            PDF, image, and audio files · maximum 50 MB
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadFiles()}
            className="rounded px-3 py-2 text-xs font-normal"
            style={{ color: '#888', border: '1px solid #333', background: 'transparent' }}
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded px-3 py-2 text-xs font-normal disabled:opacity-40"
            style={{ color: '#000', background: '#fff' }}
          >
            {uploading ? 'Uploading…' : 'Upload file'}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT_BY_KIND[kind]}
            onChange={handleUpload}
            className="hidden"
          />
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 text-xs font-normal" style={{ color: '#f87171', borderBottom: '1px solid #2f1818' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="px-4 py-10 text-center text-xs font-normal" style={{ color: '#555' }}>
          Loading files…
        </div>
      ) : files.length === 0 ? (
        <div className="px-4 py-10 text-center text-xs font-normal" style={{ color: '#555' }}>
          No files yet. Upload one to begin.
        </div>
      ) : (
        <div>
          {files.map((file) => {
            const selected = selectedUrl === file.url || (
              Boolean(selectedUrl) && managedFilename(selectedUrl || '') === file.name
            );
            return (
              <div
                key={file.path}
                className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center"
                style={{
                  borderBottom: '1px solid #1f1f1f',
                  background: selected ? '#1b1b1b' : 'transparent',
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-[9px] font-normal tracking-wider" style={{ color: '#777' }}>
                      {typeLabel(file.mimeType)}
                    </span>
                    <span className="truncate text-sm font-normal" style={{ color: '#ddd' }} title={file.name}>
                      {file.name}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-normal" style={{ color: '#555' }}>
                    <span>{formatBytes(file.size)}</span>
                    {file.references.map((reference) => (
                      <Link
                        key={`${reference.type}-${reference.id}-${reference.field}`}
                        href={`/admin/${reference.type === 'text' ? 'texts' : 'compositions'}/${reference.id}`}
                        style={{ color: '#999', borderBottom: '1px solid #555' }}
                      >
                        Used by {reference.title} ({reference.field})
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded px-3 py-1.5 text-xs font-normal"
                    style={{ color: '#888', border: '1px solid #333' }}
                  >
                    Open
                  </a>
                  <button
                    type="button"
                    onClick={() => void navigator.clipboard.writeText(file.url)}
                    className="rounded px-3 py-1.5 text-xs font-normal"
                    style={{ color: '#888', border: '1px solid #333', background: 'transparent' }}
                  >
                    Copy URL
                  </button>
                  {onSelect && (
                    <button
                      type="button"
                      onClick={() => onSelect(file)}
                      className="rounded px-3 py-1.5 text-xs font-normal"
                      style={{ color: selected ? '#aaa' : '#000', background: selected ? '#252525' : '#fff' }}
                    >
                      {selected ? 'Selected' : 'Use file'}
                    </button>
                  )}
                  {showDelete && (
                    <button
                      type="button"
                      onClick={() => void handleDelete(file)}
                      disabled={file.references.length > 0}
                      title={file.references.length ? 'Remove this file from its content before deleting it' : 'Delete file'}
                      className="rounded px-3 py-1.5 text-xs font-normal disabled:cursor-not-allowed disabled:opacity-30"
                      style={{ color: '#f87171', border: '1px solid #4a2222', background: 'transparent' }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
