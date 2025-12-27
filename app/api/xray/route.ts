import { NextResponse } from 'next/server';

import { getStore } from '@/lib/xray/xray.store';
import type { XRayTrace } from '@/lib/xray/xray.types';

/**
 * Endpoint to ingest new traces from the X-Ray Module.
 */
export async function POST(request: Request) {
  try {
    // TODO: Implement request signature verification for security
    const body = (await request.json()) as XRayTrace;

    if (!body.id || !Array.isArray(body.steps)) {
      return NextResponse.json(
        { error: 'Invalid trace format' },
        { status: 400 }
      );
    }

    const store = getStore();
    await store.save(body);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    // TODO: Integrate with centralized error logging (e.g., Sentry)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * Endpoint to list trace summaries for the dashboard.
 */
export async function GET() {
  try {
    const store = getStore();
    const traces = await store.list();

    // We map to a summary type to reduce payload size for the list view
    // TODO: Move this mapping to a dedicated DTO (Data Transfer Object) layer
    const summaries = traces.map(t => ({
      id: t.id,
      name: t.name,
      prospectName: t.prospect.name,
      status: t.status,
      stepCount: t.steps.length,
      timestamp: t.startTime,
    }));

    return NextResponse.json(summaries);
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
