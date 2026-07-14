import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import * as path from 'path';
import { getMimeType } from '@/lib/media-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  try {
    const { filename } = await params;
    if (!filename || path.basename(filename) !== filename) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'content-data', 'media', filename);
    const stats = await fs.stat(filePath);
    const mimeType = getMimeType(filename);
    const range = request.headers.get('range');
    const commonHeaders = {
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': mimeType,
      'Content-Disposition': `inline; filename="${filename.replace(/["\\]/g, '')}"`,
    };

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
          ...commonHeaders,
          'Content-Length': String(length),
          'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        },
      });
    }

    const buffer = await fs.readFile(filePath);
    return new NextResponse(new Uint8Array(buffer), {
      headers: { ...commonHeaders, 'Content-Length': String(stats.size) },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
