import { NextRequest, NextResponse } from 'next/server';
import { getCompositionBySlug } from '@/lib/content-manager';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const composition = await getCompositionBySlug(slug);
    if (!composition || composition.status !== 'published') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(composition);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load' },
      { status: 500 }
    );
  }
}
