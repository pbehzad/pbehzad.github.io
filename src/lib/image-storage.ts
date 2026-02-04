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

  // For GitHub storage, we need to write base64-encoded binary
  // For local storage, we write the raw buffer content
  const storage = process.env.CONTENT_STORAGE || 'local';

  if (storage === 'github') {
    // GitHub API expects base64 content — the adapter will re-encode,
    // so we pass the base64 string directly as "content"
    const base64Content = buffer.toString('base64');
    await adapter.writeFile(filePath, base64Content);

    const owner = process.env.CONTENT_GITHUB_OWNER;
    const repo = process.env.CONTENT_GITHUB_REPO;
    return `https://raw.githubusercontent.com/${owner}/${repo}/main/${filePath}`;
  } else {
    // Local: write raw binary
    const path = await import('path');
    const fs = await import('fs/promises');
    const fullPath = path.join(process.cwd(), 'content-data', filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, buffer);
    return `/api/admin/images/${filename}`;
  }
}
