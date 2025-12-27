import { describe, it, expect, beforeEach } from 'vitest';

import { getStore } from './xray.store';
import { XRayTrace } from './xray.types';

describe('X-Ray Persistence Layer', () => {
  const store = getStore();

  beforeEach(async () => {
    await store.clear();
  });

  const mockTrace: XRayTrace = {
    id: 'trace-1',
    name: 'Competitor Discovery',
    prospect: { id: 'p1', metadata: {}, name: 'Test Product' },
    startTime: Date.now(),
    status: 'completed',
    steps: [],
  };

  it('should persist and retrieve a trace by identifier', async () => {
    await store.save(mockTrace);
    const result = await store.getById('trace-1');

    expect(result).toBeDefined();
    expect(result?.name).toBe('Competitor Discovery');
  });

  it('should maintain chronological order (latest first) when listing', async () => {
    await store.save({ ...mockTrace, id: 'old', startTime: 1000 });
    await store.save({ ...mockTrace, id: 'new', startTime: 2000 });

    const list = await store.list();
    expect(list[0].id).toBe('new');
    expect(list[1].id).toBe('old');
  });

  it('should return undefined for non-existent identifiers', async () => {
    const result = await store.getById('missing-id');
    expect(result).toBeUndefined();
  });
});
