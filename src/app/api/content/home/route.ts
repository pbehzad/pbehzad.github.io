import { NextResponse } from 'next/server';
import { getHomeContent } from '@/services/contentService';

export async function GET() {
  try {
    const { data, error } = await getHomeContent();

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Failed to load home content' },
      { status: 500 }
    );
  }
}
