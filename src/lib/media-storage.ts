import * as crypto from 'crypto';
import { getStorageAdapter } from './storage-adapter';

const MEDIA_DIRECTORY = 'media';
const MEDIA_MANIFEST = 'media-index.json';
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  ogg: 'audio/ogg',
  flac: 'audio/flac',
};

const ALLOWED_MIME_TYPES = new Set(Object.values(MIME_BY_EXTENSION));

export interface MediaFile {
  name: string;
  displayName: string;
  folder: string;
  path: string;
  url: string;
  mimeType: string;
  size: number;
  sha?: string;
  modifiedAt?: string;
}

export interface MediaFolder {
  name: string;
  path: string;
}

interface MediaManifest {
  version: 1;
  folders: string[];
  files: Record<string, {
    displayName: string;
    folder: string;
    createdAt: string;
  }>;
}

const emptyManifest = (): MediaManifest => ({ version: 1, folders: [], files: {} });

function normalizeFolder(folder: string): string {
  return folder
    .split('/')
    .map((part) => part.trim().replace(/[\\/\u0000-\u001f]/g, '-').slice(0, 80))
    .filter(Boolean)
    .join('/');
}

function cleanDisplayName(name: string): string {
  return name.trim().replace(/[\u0000-\u001f]/g, '').slice(0, 160) || 'Untitled file';
}

function folderParent(folder: string): string {
  const parts = folder.split('/').filter(Boolean);
  parts.pop();
  return parts.join('/');
}

function folderName(folder: string): string {
  return folder.split('/').filter(Boolean).pop() || '';
}

function addFolderHierarchy(manifest: MediaManifest, folder: string) {
  const parts = normalizeFolder(folder).split('/').filter(Boolean);
  for (let index = 1; index <= parts.length; index += 1) {
    const current = parts.slice(0, index).join('/');
    if (!manifest.folders.includes(current)) manifest.folders.push(current);
  }
  manifest.folders.sort((a, b) => a.localeCompare(b));
}

async function readManifest(): Promise<{ manifest: MediaManifest; sha?: string }> {
  const file = await getStorageAdapter().readFile(MEDIA_MANIFEST);
  if (!file) return { manifest: emptyManifest() };
  try {
    const parsed = JSON.parse(file.content) as Partial<MediaManifest>;
    return {
      manifest: {
        version: 1,
        folders: Array.isArray(parsed.folders) ? parsed.folders.map(normalizeFolder).filter(Boolean) : [],
        files: parsed.files && typeof parsed.files === 'object' ? parsed.files : {},
      },
      sha: file.sha,
    };
  } catch {
    return { manifest: emptyManifest(), sha: file.sha };
  }
}

async function writeManifest(manifest: MediaManifest, sha?: string): Promise<void> {
  manifest.folders = [...new Set(manifest.folders.map(normalizeFolder).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
  await getStorageAdapter().writeFile(MEDIA_MANIFEST, JSON.stringify(manifest, null, 2), sha);
}

export function getMimeType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  return MIME_BY_EXTENSION[extension] || 'application/octet-stream';
}

function getPublicUrl(filename: string): string {
  return `/api/media/${encodeURIComponent(filename)}`;
}

export function getManagedMediaFilename(url: string): string | null {
  try {
    const parsed = new URL(url, 'https://local.invalid');
    const localMatch = /^\/api\/media\/([^/]+)$/.exec(parsed.pathname);
    if (localMatch) return decodeURIComponent(localMatch[1]);

    const owner = process.env.CONTENT_GITHUB_OWNER?.toLowerCase();
    const repo = process.env.CONTENT_GITHUB_REPO?.toLowerCase();
    if (!owner || !repo) return null;
    const parts = parsed.pathname.split('/').filter(Boolean).map(decodeURIComponent);
    const matchesRepo = parts[0]?.toLowerCase() === owner && parts[1]?.toLowerCase() === repo;

    if (parsed.hostname === 'raw.githubusercontent.com' && matchesRepo) {
      const mediaIndex = parts.findIndex((part, index) => index >= 2 && part === 'media');
      if (mediaIndex >= 0 && parts.length === mediaIndex + 2) return parts[mediaIndex + 1];
    }

    if (parsed.hostname === 'github.com' && matchesRepo && parts[2] === 'blob') {
      const mediaIndex = parts.findIndex((part, index) => index >= 4 && part === 'media');
      if (mediaIndex >= 0 && parts.length === mediaIndex + 2) return parts[mediaIndex + 1];
    }

    if (
      parsed.hostname === 'api.github.com' &&
      parts[0] === 'repos' &&
      parts[1]?.toLowerCase() === owner &&
      parts[2]?.toLowerCase() === repo &&
      parts[3] === 'contents' &&
      parts[4] === 'media' &&
      parts.length === 6
    ) return parts[5];
  } catch {
    return null;
  }
  return null;
}

export function getPublicMediaUrl(url: string): string {
  const filename = getManagedMediaFilename(url);
  return filename ? getPublicUrl(filename) : url;
}

function safeFilename(originalFilename: string): string {
  const dot = originalFilename.lastIndexOf('.');
  const extension = dot >= 0 ? originalFilename.slice(dot + 1).toLowerCase() : '';
  const basename = (dot >= 0 ? originalFilename.slice(0, dot) : originalFilename)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80) || 'file';
  const suffix = crypto.randomBytes(3).toString('hex');
  return `${basename}-${suffix}.${extension}`;
}

export async function uploadMediaFile(
  buffer: Buffer,
  originalFilename: string,
  suppliedMimeType: string,
  targetFolder = '',
): Promise<MediaFile> {
  if (!buffer.length) throw new Error('The selected file is empty');
  if (buffer.length > MAX_FILE_SIZE) throw new Error('Files must be 50 MB or smaller');

  const detectedMimeType = getMimeType(originalFilename);
  const mimeType = detectedMimeType !== 'application/octet-stream'
    ? detectedMimeType
    : suppliedMimeType;
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error('Unsupported file type. Use PDF, image, MP3, WAV, M4A, AAC, OGG, or FLAC');
  }

  const filename = safeFilename(originalFilename);
  const filePath = `${MEDIA_DIRECTORY}/${filename}`;
  const adapter = getStorageAdapter();
  const result = await adapter.writeBinaryFile(filePath, buffer);
  const { manifest, sha } = await readManifest();
  const folder = normalizeFolder(targetFolder);
  if (folder) addFolderHierarchy(manifest, folder);
  manifest.files[filename] = {
    displayName: cleanDisplayName(originalFilename),
    folder,
    createdAt: new Date().toISOString(),
  };
  await writeManifest(manifest, sha);

  return {
    name: filename,
    displayName: originalFilename,
    folder,
    path: filePath,
    url: getPublicUrl(filename),
    mimeType,
    size: buffer.length,
    sha: result.sha,
    modifiedAt: new Date().toISOString(),
  };
}

export async function listMediaFiles(): Promise<MediaFile[]> {
  const [entries, { manifest }] = await Promise.all([
    getStorageAdapter().listDirectory(MEDIA_DIRECTORY),
    readManifest(),
  ]);
  return entries
    .filter((entry) => !entry.name.startsWith('.'))
    .map((entry) => ({
      name: entry.name,
      displayName: manifest.files[entry.name]?.displayName || entry.name,
      folder: normalizeFolder(manifest.files[entry.name]?.folder || ''),
      path: entry.path,
      url: getPublicUrl(entry.name),
      mimeType: getMimeType(entry.name),
      size: entry.size,
      sha: entry.sha,
      modifiedAt: entry.modifiedAt,
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export async function listMediaLibrary(currentFolder = ''): Promise<{
  folder: string;
  folders: MediaFolder[];
  allFolders: MediaFolder[];
  files: MediaFile[];
}> {
  const folder = normalizeFolder(currentFolder);
  const [{ manifest }, files] = await Promise.all([readManifest(), listMediaFiles()]);
  const folders = manifest.folders
    .filter((candidate) => folderParent(candidate) === folder)
    .map((candidate) => ({ name: folderName(candidate), path: candidate }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return {
    folder,
    folders,
    allFolders: manifest.folders.map((candidate) => ({
      name: folderName(candidate),
      path: candidate,
    })),
    files: files.filter((file) => file.folder === folder),
  };
}

export async function createMediaFolder(parent: string, name: string): Promise<string> {
  const cleanName = normalizeFolder(name);
  if (!cleanName || cleanName.includes('/')) throw new Error('Enter a valid folder name');
  const target = normalizeFolder([normalizeFolder(parent), cleanName].filter(Boolean).join('/'));
  const { manifest, sha } = await readManifest();
  if (manifest.folders.includes(target)) throw new Error('A folder with that name already exists');
  addFolderHierarchy(manifest, target);
  await writeManifest(manifest, sha);
  return target;
}

export async function renameMediaFolder(folder: string, name: string): Promise<string> {
  const source = normalizeFolder(folder);
  const cleanName = normalizeFolder(name);
  if (!source || !cleanName || cleanName.includes('/')) throw new Error('Enter a valid folder name');
  const target = normalizeFolder([folderParent(source), cleanName].filter(Boolean).join('/'));
  const { manifest, sha } = await readManifest();
  if (!manifest.folders.includes(source)) throw new Error('Folder not found');
  if (manifest.folders.includes(target)) throw new Error('A folder with that name already exists');

  manifest.folders = manifest.folders.map((candidate) =>
    candidate === source || candidate.startsWith(`${source}/`)
      ? `${target}${candidate.slice(source.length)}`
      : candidate
  );
  for (const metadata of Object.values(manifest.files)) {
    if (metadata.folder === source || metadata.folder.startsWith(`${source}/`)) {
      metadata.folder = `${target}${metadata.folder.slice(source.length)}`;
    }
  }
  await writeManifest(manifest, sha);
  return target;
}

export async function deleteMediaFolder(folder: string): Promise<void> {
  const target = normalizeFolder(folder);
  if (!target) throw new Error('The media root cannot be deleted');
  const { manifest, sha } = await readManifest();
  const hasFiles = Object.values(manifest.files).some(
    (metadata) => metadata.folder === target || metadata.folder.startsWith(`${target}/`),
  );
  const hasChildren = manifest.folders.some((candidate) => candidate.startsWith(`${target}/`));
  if (hasFiles || hasChildren) throw new Error('Move or delete the folder contents first');
  manifest.folders = manifest.folders.filter((candidate) => candidate !== target);
  await writeManifest(manifest, sha);
}

export async function moveMediaFile(filePath: string, targetFolder: string): Promise<void> {
  const filename = filePath.split('/').pop() || '';
  const folder = normalizeFolder(targetFolder);
  const { manifest, sha } = await readManifest();
  const existing = manifest.files[filename] || {
    displayName: filename,
    folder: '',
    createdAt: new Date().toISOString(),
  };
  if (folder) addFolderHierarchy(manifest, folder);
  manifest.files[filename] = { ...existing, folder };
  await writeManifest(manifest, sha);
}

export async function renameMediaFile(filePath: string, displayName: string): Promise<void> {
  const filename = filePath.split('/').pop() || '';
  const { manifest, sha } = await readManifest();
  const existing = manifest.files[filename] || {
    displayName: filename,
    folder: '',
    createdAt: new Date().toISOString(),
  };
  manifest.files[filename] = { ...existing, displayName: cleanDisplayName(displayName) };
  await writeManifest(manifest, sha);
}

export async function deleteMediaFile(filePath: string, sha?: string): Promise<void> {
  if (!filePath.startsWith(`${MEDIA_DIRECTORY}/`) || filePath.includes('..')) {
    throw new Error('Invalid media path');
  }
  const adapter = getStorageAdapter();
  await adapter.deleteFile(filePath, sha);
  const filename = filePath.split('/').pop() || '';
  const { manifest, sha: manifestSha } = await readManifest();
  if (manifest.files[filename]) {
    delete manifest.files[filename];
    await writeManifest(manifest, manifestSha);
  }
}
