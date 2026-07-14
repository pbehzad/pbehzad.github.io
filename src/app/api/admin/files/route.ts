import { NextRequest, NextResponse } from 'next/server';
import { getAllCompositionsRaw } from '@/lib/content-manager';
import {
  deleteMediaFile,
  listMediaFiles,
  uploadMediaFile,
  type MediaFile,
} from '@/lib/media-storage';
import { getAllTextsRaw } from '@/services/contentService';

interface FileReference {
  type: 'composition' | 'text';
  id: string;
  title: string;
  field: string;
}

async function buildReferenceMap(): Promise<Map<string, FileReference[]>> {
  const [compositions, textsResult] = await Promise.all([
    getAllCompositionsRaw(),
    getAllTextsRaw(),
  ]);
  const referenceMap = new Map<string, FileReference[]>();
  const addReference = (url: string, reference: FileReference) => {
    referenceMap.set(url, [...(referenceMap.get(url) || []), reference]);
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

  return referenceMap;
}

export async function GET(request: NextRequest) {
  try {
    const kind = request.nextUrl.searchParams.get('kind');
    let files = await listMediaFiles();
    if (kind === 'pdf') files = files.filter((file) => file.mimeType === 'application/pdf');
    if (kind === 'image') files = files.filter((file) => file.mimeType.startsWith('image/'));
    if (kind === 'audio') files = files.filter((file) => file.mimeType.startsWith('audio/'));

    const referenceMap = await buildReferenceMap();
    const result = files.map((file: MediaFile) => ({
      ...file,
      references: referenceMap.get(file.url) || [],
    }));
    return NextResponse.json(result);
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

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadMediaFile(buffer, file.name, file.type);
    return NextResponse.json({ ...uploaded, references: [] }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
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

    const references = (await buildReferenceMap()).get(url) || [];
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
