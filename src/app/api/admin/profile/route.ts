import { NextRequest, NextResponse } from 'next/server';
import { getProfile, writeJsonContent } from '@/services/contentService';
import { profileSchema } from '@/data/schemas';

export async function GET() {
  try {
    const { data, error } = await getProfile();
    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    const result = await writeJsonContent('profile.json', updated, profileSchema);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update' },
      { status: 500 }
    );
  }
}
