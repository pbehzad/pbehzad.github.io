import { NextRequest, NextResponse } from 'next/server';
import { getHomeContent, writeJsonContent } from '@/services/contentService';
import { homeContentSchema } from '@/data/schemas';

export async function GET() {
  const { data, error } = await getHomeContent();
  return error ? NextResponse.json({ error }, { status: 500 }) : NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = { ...body, updated_at: new Date().toISOString() };
    const result = await writeJsonContent('home.json', updated, homeContentSchema);
    return result.success
      ? NextResponse.json(updated)
      : NextResponse.json({ error: result.error }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update' }, { status: 500 });
  }
}
