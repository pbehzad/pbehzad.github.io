import { NextRequest, NextResponse } from 'next/server';
import { getAllCompositionsRaw } from '@/lib/content-manager';
import {
  deleteMediaFile,
  createMediaFolder,
  deleteMediaFolder,
  getManagedMediaFilename,
  listMediaLibrary,
  moveMediaFile,
  renameMediaFile,
  renameMediaFolder,
  uploadMediaFile,
  type MediaFile,
} from '@/lib/media-storage';
import { getAllTextsRaw, getAllToolsRaw } from '@/services/contentService';

interface FileReference {
  type: 'composition' | 'text' | 'tool';
  id: string;
  title: string;
  field: string;
}

async function buildReferenceMap(): Promise<Map<string, FileReference[]>> {
  const [compositions, textsResult, toolsResult] = await Promise.all([
    getAllCompositionsRaw(),
    getAllTextsRaw(),
    getAllToolsRaw(),
  ]);
  const referenceMap = new Map<string, FileReference[]>();
  const addReference = (url: string, reference: FileReference) => {
    const key = getManagedMediaFilename(url);
    if (!key) return;
    referenceMap.set(key, [...(referenceMap.get(key) || []), reference]);
  };

  for (const composition of compositions) {
    if (composition.score_url) {
      addReference(composition.score_url, {
        type: 'composition',
        id: composition.id,
        title: composition.title,
        field: 'score',
      });
    }
    for (const audioUrl of composition.audio_urls || []) {
      addReference(audioUrl, {
        type: 'composition',
        id: composition.id,
        title: composition.title,
        field: 'audio',
      });
    }
  }

  for (const text of textsResult.data) {
    if (text.pdf_url) {
      addReference(text.pdf_url, {
        type: 'text',
        id: text.id,
        title: text.title,
        field: 'PDF',
      });
    }
  }

  for (const tool of toolsResult.data) {
    if (tool.image_url) {
      addReference(tool.image_url, {
        type: 'tool',
        id: tool.id,
        title: tool.name,
        field: 'cover image',
      });
    }
  }

  return referenceMap;
}

export async function GET(request: NextRequest) {
  try {
    const kind = request.nextUrl.searchParams.get('kind');
    const folder = request.nextUrl.searchParams.get('folder') || '';
    const search = (request.nextUrl.searchParams.get('q') || '').trim().toLowerCase();
    const library = await listMediaLibrary(folder);
    let files = library.files;
    if (kind === 'pdf') files = files.filter((file) => file.mimeType === 'application/pdf');
    if (kind === 'image') files = files.filter((file) => file.mimeType.startsWith('image/'));
    if (kind === 'audio') files = files.filter((file) => file.mimeType.startsWith('audio/'));
    if (search) {
      files = files.filter((file) =>
        file.displayName.toLowerCase().includes(search) || file.name.toLowerCase().includes(search)
      );
    }

    const referenceMap = await buildReferenceMap();
    const result = files.map((file: MediaFile) => ({
      ...file,
      references: referenceMap.get(file.name) || [],
    }));
    return NextResponse.json({ ...library, files: result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list files' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const folder = String(formData.get('folder') || '');
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadMediaFile(buffer, file.name, file.type, folder);
    return NextResponse.json({ ...uploaded, references: [] }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 400 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    switch (body.action) {
      case 'create-folder': {
        const path = await createMediaFolder(String(body.parent || ''), String(body.name || ''));
        return NextResponse.json({ success: true, path });
      }
      case 'rename-folder': {
        const path = await renameMediaFolder(String(body.folder || ''), String(body.name || ''));
        return NextResponse.json({ success: true, path });
      }
      case 'delete-folder':
        await deleteMediaFolder(String(body.folder || ''));
        return NextResponse.json({ success: true });
      case 'move-file':
        await moveMediaFile(String(body.path || ''), String(body.folder || ''));
        return NextResponse.json({ success: true });
      case 'rename-file':
        await renameMediaFile(String(body.path || ''), String(body.name || ''));
        return NextResponse.json({ success: true });
      default:
        return NextResponse.json({ error: 'Unknown file action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'File action failed' },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { path, url, sha } = await request.json();
    if (typeof path !== 'string' || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid file' }, { status: 400 });
    }

    const filename = getManagedMediaFilename(url) || path.split('/').pop();
    const references = filename ? (await buildReferenceMap()).get(filename) || [] : [];
    if (references.length) {
      return NextResponse.json(
        { error: 'This file is still used by content', references },
        { status: 409 },
      );
    }

    await deleteMediaFile(path, typeof sha === 'string' ? sha : undefined);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Delete failed' },
      { status: 500 },
    );
  }
}
