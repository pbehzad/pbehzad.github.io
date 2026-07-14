import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import * as path from 'path';
import { getMimeType } from '@/lib/media-storage';

const githubDownloadCache = new Map<string, { url: string; expiresAt: number }>();

function commonHeaders(filename: string) {
  return {
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=3600',
    'Content-Type': getMimeType(filename),
    'Content-Disposition': `inline; filename="${filename.replace(/["\\]/g, '')}"`,
  };
}

async function getGitHubMedia(
  request: NextRequest,
  filename: string,
): Promise<NextResponse> {
  const owner = process.env.CONTENT_GITHUB_OWNER;
  const repo = process.env.CONTENT_GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  const branch = process.env.CONTENT_GITHUB_BRANCH || 'main';
  if (!owner || !repo || !token) {
    return NextResponse.json({ error: 'Media storage is not configured' }, { status: 500 });
  }

  const cachedDownload = githubDownloadCache.get(filename);
  let downloadUrl = cachedDownload && cachedDownload.expiresAt > Date.now()
    ? cachedDownload.url
    : undefined;

  if (!downloadUrl) {
    const apiUrl = new URL(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}` +
      `/contents/media/${encodeURIComponent(filename)}`,
    );
    apiUrl.searchParams.set('ref', branch);
    const metadataResponse = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      cache: 'no-store',
    });
    if (metadataResponse.status === 404) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (!metadataResponse.ok) {
      return NextResponse.json({ error: 'Unable to read media storage' }, { status: 502 });
    }

    const metadata = await metadataResponse.json() as { download_url?: string };
    downloadUrl = metadata.download_url;
    if (!downloadUrl) {
      return NextResponse.json({ error: 'Media download is unavailable' }, { status: 502 });
    }
    githubDownloadCache.set(filename, {
      url: downloadUrl,
      expiresAt: Date.now() + 3 * 60 * 1000,
    });
  }

  const range = request.headers.get('range');
  const upstreamResponse = await fetch(downloadUrl, {
    headers: range ? { Range: range } : undefined,
    cache: 'no-store',
  });
  if (!upstreamResponse.ok) {
    return NextResponse.json({ error: 'Unable to download media' }, { status: 502 });
  }

  const headers = new Headers(commonHeaders(filename));
  for (const name of ['content-length', 'content-range']) {
    const value = upstreamResponse.headers.get(name);
    if (value) headers.set(name, value);
  }

  if (range && upstreamResponse.status === 200) {
    const match = /^bytes=(\d+)-(\d*)$/.exec(range);
    const source = new Uint8Array(await upstreamResponse.arrayBuffer());
    if (!match) {
      return new NextResponse(null, {
        status: 416,
        headers: { 'Content-Range': `bytes */${source.length}` },
      });
    }
    const start = Number(match[1]);
    const end = match[2] ? Math.min(Number(match[2]), source.length - 1) : source.length - 1;
    if (start > end || start >= source.length) {
      return new NextResponse(null, {
        status: 416,
        headers: { 'Content-Range': `bytes */${source.length}` },
      });
    }
    const body = source.slice(start, end + 1);
    headers.set('Content-Length', String(body.length));
    headers.set('Content-Range', `bytes ${start}-${end}/${source.length}`);
    return new NextResponse(body, { status: 206, headers });
  }

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  try {
    const { filename } = await params;
    if (!filename || path.basename(filename) !== filename) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    if ((process.env.CONTENT_STORAGE || 'local') === 'github') {
      return await getGitHubMedia(request, filename);
    }

    const filePath = path.join(process.cwd(), 'content-data', 'media', filename);
    const stats = await fs.stat(filePath);
    const range = request.headers.get('range');
    const headers = commonHeaders(filename);

    if (range) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(range);
      if (!match) {
        return new NextResponse(null, {
          status: 416,
          headers: { 'Content-Range': `bytes */${stats.size}` },
        });
      }

      const start = Number(match[1]);
      const end = match[2] ? Math.min(Number(match[2]), stats.size - 1) : stats.size - 1;
      if (start > end || start >= stats.size) {
        return new NextResponse(null, {
          status: 416,
          headers: { 'Content-Range': `bytes */${stats.size}` },
        });
      }

      const length = end - start + 1;
      const buffer = Buffer.alloc(length);
      const handle = await fs.open(filePath, 'r');
      try {
        await handle.read(buffer, 0, length, start);
      } finally {
        await handle.close();
      }

      return new NextResponse(new Uint8Array(buffer), {
        status: 206,
        headers: {
          ...headers,
          'Content-Length': String(length),
          'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        },
      });
    }

    const buffer = await fs.readFile(filePath);
    return new NextResponse(new Uint8Array(buffer), {
      headers: { ...headers, 'Content-Length': String(stats.size) },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
