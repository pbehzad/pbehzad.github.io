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
    <div className="admin-file-library overflow-hidden rounded-xl" style={{ border: '1px solid #dcdad2', background: '#fbfaf7', boxShadow: '0 8px 28px rgb(37 36 31 / 0.035)' }}>
      <div className="flex flex-col gap-4 px-4 py-4" style={{ borderBottom: '1px solid #dcdad2' }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 text-xs font-normal">
            <button type="button" onClick={() => setFolder('')} style={{ color: folder ? '#77766f' : '#24231f' }}>
              Media
            </button>
            {breadcrumbs.map((crumb) => (
              <React.Fragment key={crumb.path}>
                <span style={{ color: '#c8c5bb' }}>/</span>
                <button type="button" onClick={() => setFolder(crumb.path)} className="truncate" style={{ color: crumb.path === folder ? '#24231f' : '#77766f' }}>
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditDialog({ type: 'create-folder', value: '' })}
              className="admin-button"
            >
              New folder
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="admin-button admin-button-primary disabled:opacity-40"
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
                  color: activeKind === option ? '#fff' : '#77766f',
                  background: activeKind === option ? '#292824' : 'transparent',
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
            className="admin-control w-full !min-h-0 !py-2 text-xs md:w-64"
          />
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 text-xs" style={{ color: '#963a32', borderBottom: '1px solid #e6c3bf', background: '#fff4f2' }}>
          {error}
        </div>
      )}

      {folders.length > 0 && (
        <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3" style={{ borderBottom: '1px solid #dcdad2' }}>
          {folders.map((item) => (
            <div key={item.path} className="flex items-center gap-2 rounded-lg px-3 py-3" style={{ background: '#fff', border: '1px solid #e2e0d9' }}>
              <button type="button" onClick={() => setFolder(item.path)} className="min-w-0 flex-1 truncate text-left text-sm" style={{ color: '#393833' }}>
                <span className="mr-2" style={{ color: '#9d9a91' }}>▰</span>{item.name}
              </button>
              {showDelete && (
                <>
                  <button type="button" onClick={() => setEditDialog({ type: 'rename-folder', value: item.name, folder: item })} className="text-[10px]" style={{ color: '#77766f' }}>
                    Rename
                  </button>
                  <button type="button" disabled={busyPath === item.path} onClick={() => void handleDeleteFolder(item)} className="text-[10px] disabled:opacity-30" style={{ color: '#a33d35' }}>
                    Delete
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="px-4 py-10 text-center text-xs" style={{ color: '#77766f' }}>Loading files…</div>
      ) : visibleFiles.length === 0 ? (
        <div className="px-4 py-10 text-center text-xs" style={{ color: '#77766f' }}>
          {folders.length ? 'No matching files in this folder.' : 'This folder is empty.'}
        </div>
      ) : (
        <div>
          {visibleFiles.map((file) => {
            const selected = selectedUrl === file.url || (Boolean(selectedUrl) && managedFilename(selectedUrl || '') === file.name);
            return (
              <div key={file.path} className="flex flex-col gap-3 px-4 py-3.5 md:flex-row md:items-center" style={{ borderBottom: '1px solid #e8e6df', background: selected ? '#efeee8' : 'transparent' }}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-[9px] tracking-wider" style={{ color: '#77766f' }}>{typeLabel(file.mimeType)}</span>
                    <span className="truncate text-sm font-medium" style={{ color: '#393833' }} title={file.displayName}>{file.displayName}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px]" style={{ color: '#89877f' }}>
                    <span>{formatBytes(file.size)}</span>
                    {file.references.map((reference) => (
                      <Link key={`${reference.type}-${reference.id}-${reference.field}`} href={`/admin/${reference.type === 'text' ? 'texts' : reference.type === 'tool' ? 'tools' : 'compositions'}/${reference.id}`} style={{ color: '#55544e', borderBottom: '1px solid #aaa79d' }}>
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
                      className="admin-control !min-h-0 !w-auto !px-2 !py-1.5 text-[10px]"
                      title="Move to folder"
                    >
                      <option value="">Media root</option>
                      {allFolders.map((target) => <option key={target.path} value={target.path}>{target.path}</option>)}
                    </select>
                  )}
                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="admin-button !min-h-0 !px-3 !py-1.5">Open</a>
                  <button type="button" onClick={() => void navigator.clipboard.writeText(file.url)} className="admin-button !min-h-0 !px-3 !py-1.5">Copy URL</button>
                  {showDelete && (
                    <button type="button" onClick={() => setEditDialog({ type: 'rename-file', value: file.displayName, file })} className="admin-button !min-h-0 !px-3 !py-1.5">Rename</button>
                  )}
                  {onSelect && (
                    <button type="button" onClick={() => onSelect(file)} className={`admin-button !min-h-0 !px-3 !py-1.5 ${selected ? '' : 'admin-button-primary'}`}>
                      {selected ? 'Selected' : 'Use file'}
                    </button>
                  )}
                  {showDelete && (
                    <button type="button" onClick={() => void handleDeleteFile(file)} disabled={file.references.length > 0 || busyPath === file.path} title={file.references.length ? 'Detach this file from content before deleting it' : 'Delete file'} className="admin-button admin-button-danger !min-h-0 !px-3 !py-1.5 disabled:cursor-not-allowed disabled:opacity-30">Delete</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-5" style={{ background: 'rgba(0,0,0,0.72)' }}>
          <div className="w-full max-w-sm rounded-xl p-5" style={{ background: '#fbfaf7', border: '1px solid #dcdad2', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>
            <div className="admin-field-label mb-4">
              {editDialog.type === 'create-folder' ? 'New folder' : editDialog.type === 'rename-folder' ? 'Rename folder' : 'Rename file'}
            </div>
            <input autoFocus value={editDialog.value} onChange={(event) => setEditDialog({ ...editDialog, value: event.target.value })} onKeyDown={(event) => { if (event.key === 'Enter') void handleDialogSave(); }} className="admin-control" />
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setEditDialog(null)} className="admin-button">Cancel</button>
              <button type="button" onClick={() => void handleDialogSave()} className="admin-button admin-button-primary">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
