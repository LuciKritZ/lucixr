import { NextResponse } from 'next/server';

import { getStore } from '@/lib/xray/xray.store';

/**
 * Endpoint to retrieve the full audit trail for a specific trace.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const store = getStore();
    const trace = await store.getById(id);

    if (!trace) {
      return NextResponse.json({ error: 'Trace not found' }, { status: 404 });
    }

    return NextResponse.json(trace);
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
