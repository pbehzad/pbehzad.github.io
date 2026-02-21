import { NextResponse } from 'next/server';
import { getProfile } from '@/services/contentService';

export async function GET() {
  try {
    const { data, error } = await getProfile();

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Failed to load profile' },
      { status: 500 }
    );
  }
}
