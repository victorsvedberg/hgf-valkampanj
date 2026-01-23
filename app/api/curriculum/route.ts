import { NextResponse } from 'next/server';
import { getSubjectsWithStatus, getGradeLevelsWithStatus } from '@/lib/curriculum-loader';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [subjects, gradeLevels] = await Promise.all([
      getSubjectsWithStatus(),
      getGradeLevelsWithStatus(),
    ]);

    return NextResponse.json({
      subjects,
      gradeLevels,
    });
  } catch (error) {
    console.error('Error loading curriculum metadata:', error);
    return NextResponse.json(
      { error: 'Failed to load curriculum metadata' },
      { status: 500 }
    );
  }
}
