import * as crypto from 'crypto';
import { getStorageAdapter } from './storage-adapter';

const MEDIA_DIRECTORY = 'media';
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
  path: string;
  url: string;
  mimeType: string;
  size: number;
  sha?: string;
  modifiedAt?: string;
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

    const owner = process.env.CONTENT_GITHUB_OWNER;
    const repo = process.env.CONTENT_GITHUB_REPO;
    const trustedPrefix = owner && repo ? `/${owner}/${repo}/` : null;
    if (
      parsed.hostname === 'raw.githubusercontent.com' &&
      trustedPrefix &&
      parsed.pathname.startsWith(trustedPrefix)
    ) {
      const mediaIndex = parsed.pathname.indexOf('/media/');
      if (mediaIndex >= 0) return decodeURIComponent(parsed.pathname.slice(mediaIndex + 7));
    }
  } catch {
    return null;
  }
  return null;
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

  return {
    name: filename,
    path: filePath,
    url: getPublicUrl(filename),
    mimeType,
    size: buffer.length,
    sha: result.sha,
    modifiedAt: new Date().toISOString(),
  };
}

export async function listMediaFiles(): Promise<MediaFile[]> {
  const entries = await getStorageAdapter().listDirectory(MEDIA_DIRECTORY);
  return entries
    .map((entry) => ({
      name: entry.name,
      path: entry.path,
      url: getPublicUrl(entry.name),
      mimeType: getMimeType(entry.name),
      size: entry.size,
      sha: entry.sha,
      modifiedAt: entry.modifiedAt,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function deleteMediaFile(filePath: string, sha?: string): Promise<void> {
  if (!filePath.startsWith(`${MEDIA_DIRECTORY}/`) || filePath.includes('..')) {
    throw new Error('Invalid media path');
  }
  await getStorageAdapter().deleteFile(filePath, sha);
}
