import { NextRequest, NextResponse } from 'next/server';
import { getCompositionById } from '@/lib/content-manager';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const composition = await getCompositionById(id);
    if (!composition) {
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
