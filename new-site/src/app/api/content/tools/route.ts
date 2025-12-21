import { NextResponse } from 'next/server';
import { getAllTools } from '@/services/contentService';

export async function GET() {
  try {
    const { data, error } = getAllTools();

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load tools' },
      { status: 500 }
    );
  }
}
