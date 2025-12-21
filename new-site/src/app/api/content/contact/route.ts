import { NextResponse } from 'next/server';
import { getContactInfo } from '@/services/contentService';

export async function GET() {
  try {
    const { data, error } = getContactInfo();

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load contact info' },
      { status: 500 }
    );
  }
}
