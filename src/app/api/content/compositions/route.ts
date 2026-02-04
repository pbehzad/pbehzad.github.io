import { NextResponse } from 'next/server';
import { getAllCompositions } from '@/lib/content-manager';

export async function GET() {
  try {
    const data = await getAllCompositions();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load compositions' },
      { status: 500 }
    );
  }
}
