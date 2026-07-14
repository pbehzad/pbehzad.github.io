import { getStorageAdapter } from './storage-adapter';
import * as crypto from 'crypto';

export async function uploadImage(
  buffer: Buffer,
  originalFilename: string,
): Promise<string> {
  const ext = originalFilename.split('.').pop() || 'jpg';
  const random = crypto.randomBytes(4).toString('hex');
  const filename = `${Date.now()}-${random}.${ext}`;
  const filePath = `images/${filename}`;

  const adapter = getStorageAdapter();

  await adapter.writeBinaryFile(filePath, buffer);

  const storage = process.env.CONTENT_STORAGE || 'local';

  if (storage === 'github') {
    const owner = process.env.CONTENT_GITHUB_OWNER;
    const repo = process.env.CONTENT_GITHUB_REPO;
    return `https://raw.githubusercontent.com/${owner}/${repo}/main/${filePath}`;
  } else {
    return `/api/admin/images/${filename}`;
  }
}
