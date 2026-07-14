import { NextRequest, NextResponse } from 'next/server';
import { getAllToolsRaw, writeJsonContent } from '@/services/contentService';
import { toolsArraySchema } from '@/data/schemas';
import type { Tool } from '@/data/types';

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function GET(request: NextRequest) {
  const { data, error } = await getAllToolsRaw();
  if (error) return NextResponse.json({ error }, { status: 500 });
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json(data);
  const item = data.find((tool) => tool.id === id);
  return item ? NextResponse.json(item) : NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function POST(request: NextRequest) {
  try {
    const fields = await request.json();
    const { data } = await getAllToolsRaw();
    const slug = slugify(fields.slug || fields.name);
    if (!slug) return NextResponse.json({ error: 'A valid slug is required' }, { status: 400 });
    if (data.some((tool) => tool.id === slug || tool.slug === slug)) return NextResponse.json({ error: 'This slug already exists' }, { status: 409 });
    const now = new Date().toISOString();
    const item: Tool = { ...fields, id: slug, slug, technologies: fields.technologies || [], featured: Boolean(fields.featured), status: fields.status || 'draft', created_at: now, updated_at: now };
    const result = await writeJsonContent('tools.json', [...data, item], toolsArraySchema);
    return result.success ? NextResponse.json(item, { status: 201 }) : NextResponse.json({ error: result.error }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const fields = await request.json();
    const { data } = await getAllToolsRaw();
    const index = data.findIndex((tool) => tool.id === fields.id);
    if (index < 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    data[index] = { ...data[index], ...fields, id: data[index].id, updated_at: new Date().toISOString() };
    const result = await writeJsonContent('tools.json', data, toolsArraySchema);
    return result.success ? NextResponse.json(data[index]) : NextResponse.json({ error: result.error }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  const { data } = await getAllToolsRaw();
  const filtered = data.filter((tool) => tool.id !== id);
  if (filtered.length === data.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const result = await writeJsonContent('tools.json', filtered, toolsArraySchema);
  return result.success ? NextResponse.json({ success: true }) : NextResponse.json({ error: result.error }, { status: 400 });
}
