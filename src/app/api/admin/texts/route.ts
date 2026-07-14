import { NextRequest, NextResponse } from 'next/server';
import { getAllTextsRaw, writeJsonContent } from '@/services/contentService';
import { getTextMarkdown, saveTextMarkdown, deleteTextMarkdown } from '@/lib/text-content-manager';
import { textsArraySchema } from '@/data/schemas';
import type { Text } from '@/data/types';

// GET /api/admin/texts        → all texts (raw, drafts included)
// GET /api/admin/texts?id=x   → one text + its markdown source
export async function GET(request: NextRequest) {
  const { data, error } = await getAllTextsRaw();
  if (error) return NextResponse.json({ error }, { status: 500 });

  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json(data);

  const item = data.find((t) => t.id === id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const markdown = item.content_file ? await getTextMarkdown(item.content_file) : null;
  return NextResponse.json({ item, markdown });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { markdown, ...fields } = body;
    const { data: existing } = await getAllTextsRaw();

    const now = new Date().toISOString();
    const slug = (fields.slug || fields.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const contentFile = markdown ? `${slug}.md` : null;
    if (!slug) return NextResponse.json({ error: 'A valid slug is required' }, { status: 400 });
    if (existing.some((item) => item.id === slug || item.slug === slug)) {
      return NextResponse.json({ error: 'This slug already exists' }, { status: 409 });
    }

    const newItem: Text = {
      ...fields,
      id: slug,
      slug,
      year: Number(fields.year),
      content_file: contentFile,
      tags: fields.tags ?? [],
      featured: fields.featured ?? false,
      related_compositions: fields.related_compositions ?? [],
      status: fields.status || 'draft',
      created_at: now,
      updated_at: now,
    };

    const updated = [...existing, newItem];
    const result = await writeJsonContent('texts.json', updated, textsArraySchema);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    if (markdown && contentFile) await saveTextMarkdown(contentFile, markdown);

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { markdown, ...fields } = body;
    const { data: existing } = await getAllTextsRaw();

    const index = existing.findIndex((t) => t.id === fields.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const current = existing[index];
    if (typeof fields.slug === 'string') {
      fields.slug = fields.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (!fields.slug) return NextResponse.json({ error: 'A valid slug is required' }, { status: 400 });
      if (existing.some((item, itemIndex) => itemIndex !== index && item.slug === fields.slug)) {
        return NextResponse.json({ error: 'This slug already exists' }, { status: 409 });
      }
    }
    // markdown present → ensure a content file; empty string clears the body
    let contentFile = current.content_file ?? null;
    if (typeof markdown === 'string') {
      if (markdown.trim()) {
        contentFile = contentFile ?? `${current.slug}.md`;
        await saveTextMarkdown(contentFile, markdown);
      } else if (contentFile) {
        await deleteTextMarkdown(contentFile);
        contentFile = null;
      }
    }

    existing[index] = {
      ...current,
      ...fields,
      year: Number(fields.year ?? current.year),
      content_file: contentFile,
      updated_at: new Date().toISOString(),
    };

    const result = await writeJsonContent('texts.json', existing, textsArraySchema);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(existing[index]);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const { data: existing } = await getAllTextsRaw();

    const item = existing.find((t) => t.id === id);
    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const filtered = existing.filter((t) => t.id !== id);
    const result = await writeJsonContent('texts.json', filtered, textsArraySchema);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    if (item.content_file) await deleteTextMarkdown(item.content_file);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete' },
      { status: 500 }
    );
  }
}
