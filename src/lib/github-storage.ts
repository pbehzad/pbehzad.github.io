const OWNER = process.env.CONTENT_GITHUB_OWNER || '';
const REPO = process.env.CONTENT_GITHUB_REPO || '';
const TOKEN = process.env.CONTENT_GITHUB_TOKEN || process.env.GITHUB_TOKEN || '';
const BRANCH = process.env.CONTENT_GITHUB_BRANCH || 'main';
const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;

interface GitHubFile {
  content: string;
  sha: string;
}

export interface GitHubListEntry {
  name: string;
  path: string;
  sha: string;
  size: number;
  downloadUrl?: string;
  type: 'file' | 'dir';
}

function headers() {
  return {
    Authorization: `token ${TOKEN}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github.v3+json',
  };
}

export async function readFile(path: string): Promise<GitHubFile | null> {
  const url = new URL(`${API_BASE}/${path}`);
  url.searchParams.set('ref', BRANCH);
  const res = await fetch(url, { headers: headers(), cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return {
    content: Buffer.from(data.content, 'base64').toString('utf-8'),
    sha: data.sha,
  };
}

export async function writeFile(
  path: string,
  content: string,
  sha?: string,
  message?: string
): Promise<{ sha: string }> {
  const body: Record<string, string> = {
    message: message || `Update ${path}`,
    content: Buffer.from(content).toString('base64'),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;

  const res = await fetch(`${API_BASE}/${path}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub API write error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return { sha: data.content.sha };
}

export async function writeBinaryFile(
  path: string,
  content: Buffer,
  sha?: string,
  message?: string
): Promise<{ sha: string }> {
  const body: Record<string, string> = {
    message: message || `Upload ${path}`,
    content: content.toString('base64'),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;

  const res = await fetch(`${API_BASE}/${path}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub API upload error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return { sha: data.content.sha };
}

export async function deleteFile(
  path: string,
  sha: string,
  message?: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/${path}`, {
    method: 'DELETE',
    headers: headers(),
    body: JSON.stringify({
      message: message || `Delete ${path}`,
      sha,
      branch: BRANCH,
    }),
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`GitHub API delete error: ${res.status} ${res.statusText}`);
  }
}

export async function listDirectory(path: string): Promise<GitHubListEntry[]> {
  const url = new URL(`${API_BASE}/${path}`);
  url.searchParams.set('ref', BRANCH);
  const res = await fetch(url, { headers: headers(), cache: 'no-store' });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`GitHub API list error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((entry: {
    name: string;
    path: string;
    sha: string;
    size: number;
    download_url?: string;
    type: 'file' | 'dir';
  }) => ({
    name: entry.name,
    path: entry.path,
    sha: entry.sha,
    size: entry.size,
    downloadUrl: entry.download_url,
    type: entry.type,
  }));
}
