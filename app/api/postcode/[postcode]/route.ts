import { NextResponse } from 'next/server';
import { getPostcodeSummary } from '@/lib/queries';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ postcode: string }> }
) {
  try {
    const { postcode: rawPostcode } = await params;
    const postcode = decodeURIComponent(rawPostcode);
    const summary = await getPostcodeSummary(postcode);

    if (!summary) {
      return NextResponse.json({ error: 'No data for postcode' }, { status: 404 });
    }

    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    console.error('GET /api/postcode failed', error);
    return NextResponse.json({ error: 'Unable to load postcode data' }, { status: 500 });
  }
}
