import { NextRequest, NextResponse } from 'next/server';
import { getAllEventsRaw, writeJsonContent } from '@/services/contentService';
import { eventsArraySchema } from '@/data/schemas';
import type { Event } from '@/data/types';

export async function GET() {
  const { data, error } = getAllEventsRaw();
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data: existing } = getAllEventsRaw();

    const now = new Date().toISOString();
    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newItem: Event = {
      ...body,
      id: slug,
      slug,
      status: body.status || 'draft',
      created_at: now,
      updated_at: now,
    };

    const updated = [...existing, newItem];
    const result = writeJsonContent('events.json', updated, eventsArraySchema);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

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
    const { data: existing } = getAllEventsRaw();

    const index = existing.findIndex(e => e.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    existing[index] = {
      ...existing[index],
      ...body,
      updated_at: new Date().toISOString(),
    };

    const result = writeJsonContent('events.json', existing, eventsArraySchema);
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
    const { data: existing } = getAllEventsRaw();

    const filtered = existing.filter(e => e.id !== id);
    if (filtered.length === existing.length) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const result = writeJsonContent('events.json', filtered, eventsArraySchema);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete' },
      { status: 500 }
    );
  }
}
