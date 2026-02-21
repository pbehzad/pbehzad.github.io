import { NextResponse } from 'next/server';
import { getAllTexts } from '@/services/contentService';

export async function GET() {
  try {
    const { data, error } = await getAllTexts();

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Failed to load texts' },
      { status: 500 }
    );
  }
}
