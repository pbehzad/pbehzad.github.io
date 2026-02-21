import { NextResponse } from 'next/server';
import { getAllEvents } from '@/services/contentService';

export async function GET() {
  try {
    const { data, error } = await getAllEvents();

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Failed to load events' },
      { status: 500 }
    );
  }
}
