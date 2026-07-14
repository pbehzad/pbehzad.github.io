'use client';

import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface ManagedFileReference {
  type: 'composition' | 'text' | 'tool';
  id: string;
  title: string;
  field: string;
}

export interface ManagedFile {
  name: string;
  displayName: string;
  folder: string;
  path: string;
  url: string;
  mimeType: string;
  size: number;
  sha?: string;
  modifiedAt?: string;
  references: ManagedFileReference[];
}

interface ManagedFolder {
  name: string;
  path: string;
}

export type FileKind = 'all' | 'pdf' | 'image' | 'audio';
type EditDialog =
  | { type: 'create-folder'; value: string }
  | { type: 'rename-folder'; value: string; folder: ManagedFolder }
  | { type: 'rename-file'; value: string; file: ManagedFile }
  | null;

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
  const [folder, setFolder] = useState('');
  const [folders, setFolders] = useState<ManagedFolder[]>([]);
  const [allFolders, setAllFolders] = useState<ManagedFolder[]>([]);
  const [files, setFiles] = useState<ManagedFile[]>([]);
  const [activeKind, setActiveKind] = useState<FileKind>(kind);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [busyPath, setBusyPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editDialog, setEditDialog] = useState<EditDialog>(null);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ folder });
      if (activeKind !== 'all') params.set('kind', activeKind);
      const response = await fetch(`/api/admin/files?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load files');
      setFolders(data.folders || []);
      setAllFolders(data.allFolders || []);
      setFiles(data.files || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [activeKind, folder]);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  const visibleFiles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return files;
    return files.filter((file) =>
      file.displayName.toLowerCase().includes(query) || file.name.toLowerCase().includes(query)
    );
  }, [files, search]);

  const breadcrumbs = useMemo(() => {
    const parts = folder.split('/').filter(Boolean);
    return parts.map((name, index) => ({ name, path: parts.slice(0, index + 1).join('/') }));
  }, [folder]);

  const requestAction = async (body: Record<string, string>) => {
    const response = await fetch('/api/admin/files', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'File action failed');
    return data as { path?: string };
  };

  const handleDialogSave = async () => {
    if (!editDialog?.value.trim()) return;
    setError(null);
    try {
      if (editDialog.type === 'create-folder') {
        await requestAction({ action: 'create-folder', parent: folder, name: editDialog.value });
      } else if (editDialog.type === 'rename-folder') {
        await requestAction({
          action: 'rename-folder',
          folder: editDialog.folder.path,
          name: editDialog.value,
        });
      } else {
        await requestAction({
          action: 'rename-file',
          path: editDialog.file.path,
          name: editDialog.value,
        });
      }
      setEditDialog(null);
      await loadFiles();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'File action failed');
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;
    setUploading(true);
    setError(null);
    try {
      let lastUploaded: ManagedFile | null = null;
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        const response = await fetch('/api/admin/files', { method: 'POST', body: formData });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `Failed to upload ${file.name}`);
        lastUploaded = data as ManagedFile;
      }
      await loadFiles();
      if (onSelect && selectedFiles.length === 1 && lastUploaded) onSelect(lastUploaded);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleMove = async (file: ManagedFile, targetFolder: string) => {
    setBusyPath(file.path);
    setError(null);
    try {
      await requestAction({ action: 'move-file', path: file.path, folder: targetFolder });
      await loadFiles();
    } catch (moveError) {
      setError(moveError instanceof Error ? moveError.message : 'Move failed');
    } finally {
      setBusyPath(null);
    }
  };

  const handleDeleteFile = async (file: ManagedFile) => {
    if (file.references.length || !confirm(`Delete "${file.displayName}" permanently?`)) return;
    setBusyPath(file.path);
    const response = await fetch('/api/admin/files', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: file.path, url: file.url, sha: file.sha }),
    });
    const data = await response.json();
    if (!response.ok) setError(data.error || 'Delete failed');
    else await loadFiles();
    setBusyPath(null);
  };

  const handleDeleteFolder = async (target: ManagedFolder) => {
    if (!confirm(`Delete the empty folder "${target.name}"?`)) return;
    setBusyPath(target.path);
    try {
      await requestAction({ action: 'delete-folder', folder: target.path });
      await loadFiles();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Delete failed');
    } finally {
      setBusyPath(null);
    }
  };

  return (
    <div className="overflow-hidden rounded" style={{ border: '1px solid #292929', background: '#121212' }}>
      <div className="flex flex-col gap-4 px-4 py-4" style={{ borderBottom: '1px solid #242424' }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 text-xs font-normal">
            <button type="button" onClick={() => setFolder('')} style={{ color: folder ? '#777' : '#fff' }}>
              Media
            </button>
            {breadcrumbs.map((crumb) => (
              <React.Fragment key={crumb.path}>
                <span style={{ color: '#3f3f3f' }}>/</span>
                <button type="button" onClick={() => setFolder(crumb.path)} className="truncate" style={{ color: crumb.path === folder ? '#fff' : '#777' }}>
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditDialog({ type: 'create-folder', value: '' })}
              className="rounded px-3 py-2 text-xs font-normal"
              style={{ color: '#aaa', border: '1px solid #333', background: 'transparent' }}
            >
              New folder
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="rounded px-3 py-2 text-xs font-normal disabled:opacity-40"
              style={{ color: '#000', background: '#fff' }}
            >
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPT_BY_KIND[kind === 'all' ? activeKind : kind]}
              onChange={handleUpload}
              className="hidden"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-1">
            {(kind === 'all' ? ['all', 'pdf', 'image', 'audio'] as FileKind[] : [kind]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setActiveKind(option)}
                className="rounded px-3 py-1.5 text-[10px] font-normal uppercase tracking-wider"
                style={{
                  color: activeKind === option ? '#fff' : '#666',
                  background: activeKind === option ? '#242424' : 'transparent',
                }}
              >
                {option}
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search this folder"
            className="w-full rounded px-3 py-2 text-xs font-normal md:w-64"
            style={{ color: '#ddd', background: '#181818', border: '1px solid #292929' }}
          />
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 text-xs font-normal" style={{ color: '#f87171', borderBottom: '1px solid #2f1818' }}>
          {error}
        </div>
      )}

      {folders.length > 0 && (
        <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3" style={{ borderBottom: '1px solid #222' }}>
          {folders.map((item) => (
            <div key={item.path} className="flex items-center gap-2 rounded px-3 py-3" style={{ background: '#181818', border: '1px solid #252525' }}>
              <button type="button" onClick={() => setFolder(item.path)} className="min-w-0 flex-1 truncate text-left text-sm font-normal" style={{ color: '#ccc' }}>
                <span className="mr-2" style={{ color: '#666' }}>▰</span>{item.name}
              </button>
              {showDelete && (
                <>
                  <button type="button" onClick={() => setEditDialog({ type: 'rename-folder', value: item.name, folder: item })} className="text-[10px]" style={{ color: '#777' }}>
                    Rename
                  </button>
                  <button type="button" disabled={busyPath === item.path} onClick={() => void handleDeleteFolder(item)} className="text-[10px] disabled:opacity-30" style={{ color: '#9f5555' }}>
                    Delete
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="px-4 py-10 text-center text-xs font-normal" style={{ color: '#555' }}>Loading files…</div>
      ) : visibleFiles.length === 0 ? (
        <div className="px-4 py-10 text-center text-xs font-normal" style={{ color: '#555' }}>
          {folders.length ? 'No matching files in this folder.' : 'This folder is empty.'}
        </div>
      ) : (
        <div>
          {visibleFiles.map((file) => {
            const selected = selectedUrl === file.url || (Boolean(selectedUrl) && managedFilename(selectedUrl || '') === file.name);
            return (
              <div key={file.path} className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center" style={{ borderBottom: '1px solid #1f1f1f', background: selected ? '#1b1b1b' : 'transparent' }}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-[9px] font-normal tracking-wider" style={{ color: '#777' }}>{typeLabel(file.mimeType)}</span>
                    <span className="truncate text-sm font-normal" style={{ color: '#ddd' }} title={file.displayName}>{file.displayName}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-normal" style={{ color: '#555' }}>
                    <span>{formatBytes(file.size)}</span>
                    {file.references.map((reference) => (
                      <Link key={`${reference.type}-${reference.id}-${reference.field}`} href={`/admin/${reference.type === 'text' ? 'texts' : reference.type === 'tool' ? 'tools' : 'compositions'}/${reference.id}`} style={{ color: '#999', borderBottom: '1px solid #555' }}>
                        Used by {reference.title} ({reference.field})
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {showDelete && (
                    <select
                      value={file.folder}
                      disabled={busyPath === file.path}
                      onChange={(event) => void handleMove(file, event.target.value)}
                      className="rounded px-2 py-1.5 text-[10px] font-normal"
                      style={{ color: '#999', background: '#181818', border: '1px solid #333' }}
                      title="Move to folder"
                    >
                      <option value="">Media root</option>
                      {allFolders.map((target) => <option key={target.path} value={target.path}>{target.path}</option>)}
                    </select>
                  )}
                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="rounded px-3 py-1.5 text-xs font-normal" style={{ color: '#888', border: '1px solid #333' }}>Open</a>
                  <button type="button" onClick={() => void navigator.clipboard.writeText(file.url)} className="rounded px-3 py-1.5 text-xs font-normal" style={{ color: '#888', border: '1px solid #333', background: 'transparent' }}>Copy URL</button>
                  {showDelete && (
                    <button type="button" onClick={() => setEditDialog({ type: 'rename-file', value: file.displayName, file })} className="rounded px-3 py-1.5 text-xs font-normal" style={{ color: '#888', border: '1px solid #333', background: 'transparent' }}>Rename</button>
                  )}
                  {onSelect && (
                    <button type="button" onClick={() => onSelect(file)} className="rounded px-3 py-1.5 text-xs font-normal" style={{ color: selected ? '#aaa' : '#000', background: selected ? '#252525' : '#fff' }}>
                      {selected ? 'Selected' : 'Use file'}
                    </button>
                  )}
                  {showDelete && (
                    <button type="button" onClick={() => void handleDeleteFile(file)} disabled={file.references.length > 0 || busyPath === file.path} title={file.references.length ? 'Detach this file from content before deleting it' : 'Delete file'} className="rounded px-3 py-1.5 text-xs font-normal disabled:cursor-not-allowed disabled:opacity-30" style={{ color: '#f87171', border: '1px solid #4a2222', background: 'transparent' }}>Delete</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-5" style={{ background: 'rgba(0,0,0,0.72)' }}>
          <div className="w-full max-w-sm rounded p-5" style={{ background: '#151515', border: '1px solid #333', boxShadow: '0 24px 80px rgba(0,0,0,0.55)' }}>
            <div className="mb-4 text-xs font-normal uppercase tracking-wider" style={{ color: '#888' }}>
              {editDialog.type === 'create-folder' ? 'New folder' : editDialog.type === 'rename-folder' ? 'Rename folder' : 'Rename file'}
            </div>
            <input autoFocus value={editDialog.value} onChange={(event) => setEditDialog({ ...editDialog, value: event.target.value })} onKeyDown={(event) => { if (event.key === 'Enter') void handleDialogSave(); }} className="w-full rounded px-3 py-2 text-sm font-normal" style={{ color: '#fff', background: '#1d1d1d', border: '1px solid #383838' }} />
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setEditDialog(null)} className="rounded px-4 py-2 text-xs font-normal" style={{ color: '#888', border: '1px solid #333' }}>Cancel</button>
              <button type="button" onClick={() => void handleDialogSave()} className="rounded px-4 py-2 text-xs font-normal" style={{ color: '#000', background: '#fff' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
