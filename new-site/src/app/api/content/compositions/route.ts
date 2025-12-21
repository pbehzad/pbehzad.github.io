import { NextResponse } from 'next/server';
import { getAllCompositions } from '@/services/contentService';

export async function GET() {
  try {
    const { data, error } = getAllCompositions();

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load compositions' },
      { status: 500 }
    );
  }
}
