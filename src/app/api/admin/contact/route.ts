import { NextRequest, NextResponse } from 'next/server';
import { getContactInfo, writeJsonContent } from '@/services/contentService';
import { contactSchema } from '@/data/schemas';

export async function GET() {
  try {
    const { data, error } = getContactInfo();
    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to load contact' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    const result = writeJsonContent('contact.json', updated, contactSchema);
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
