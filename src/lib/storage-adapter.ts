import * as fs from 'fs/promises';
import * as path from 'path';
import * as github from './github-storage';

export interface StorageFile {
  content: string;
  sha?: string;
}

export interface StorageAdapter {
  readFile(filePath: string): Promise<StorageFile | null>;
  writeFile(filePath: string, content: string, sha?: string): Promise<{ sha: string }>;
  deleteFile(filePath: string, sha?: string): Promise<void>;
}

// Local filesystem adapter for development
const CONTENT_DIR = path.join(process.cwd(), 'content-data');

const localAdapter: StorageAdapter = {
  async readFile(filePath: string): Promise<StorageFile | null> {
    try {
      const fullPath = path.join(CONTENT_DIR, filePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      return { content, sha: 'local' };
    } catch {
      return null;
    }
  },

  async writeFile(filePath: string, content: string): Promise<{ sha: string }> {
    const fullPath = path.join(CONTENT_DIR, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
    return { sha: 'local' };
  },

  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(CONTENT_DIR, filePath);
      await fs.unlink(fullPath);
    } catch {
      // File doesn't exist, that's fine
    }
  },
};

// GitHub API adapter for production
const githubAdapter: StorageAdapter = {
  async readFile(filePath: string): Promise<StorageFile | null> {
    const result = await github.readFile(filePath);
    if (!result) return null;
    return { content: result.content, sha: result.sha };
  },

  async writeFile(filePath: string, content: string, sha?: string): Promise<{ sha: string }> {
    return github.writeFile(filePath, content, sha);
  },

  async deleteFile(filePath: string, sha?: string): Promise<void> {
    if (!sha) {
      // Need to fetch sha first
      const file = await github.readFile(filePath);
      if (!file) return;
      sha = file.sha;
    }
    await github.deleteFile(filePath, sha);
  },
};

export function getStorageAdapter(): StorageAdapter {
  const storage = process.env.CONTENT_STORAGE || 'local';
  if (storage === 'github') return githubAdapter;
  return localAdapter;
}
