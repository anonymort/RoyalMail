import { NextResponse } from 'next/server';
import { ValidationError, submitReport } from '@/lib/queries';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await submitReport({
      postcode: payload?.postcode ?? '',
      deliveryDate: payload?.deliveryDate ?? '',
      deliveryTime: payload?.deliveryTime ?? '',
      deliveryType: payload?.deliveryType ?? 'letters',
      note: payload?.note
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('POST /api/report failed', error);
    return NextResponse.json({ error: 'Unable to save report' }, { status: 500 });
  }
}
