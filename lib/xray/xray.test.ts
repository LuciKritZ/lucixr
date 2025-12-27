import { describe, it, expect, vi, beforeEach } from 'vitest';

import { initXRay } from './xray.client';
import { XRay } from './xray.index';

describe('XRay Core - Production Readiness', () => {
  const mockProspect = {
    id: 'p-1',
    metadata: { price: 25 },
    name: 'ProBrand Bottle',
  };

  it('should initialize and record basic generative steps', async () => {
    const xray = new XRay('Competitor Search', mockProspect);
    const keywords = await xray.recordStep(
      'Keyword Gen',
      'generative',
      { title: 'Bottle' },
      async () => ({
        output: ['insulated'],
        reasoning: 'Extracted key attribute',
      })
    );

    expect(keywords).toContain('insulated');
    const trace = xray.getTraceSnapshot();
    expect(trace.steps[0].name).toBe('Keyword Gen');
  });

  it('UC1: should capture full audit trail for multiple filter failures', async () => {
    const xray = new XRay('Filter Test', mockProspect);
    const candidates = [{ id: 'c-1', price: 100, rating: 2 }];

    await xray.recordFilterStep('Business Filters', candidates, {
      identity: c => ({
        id: c.id,
        metrics: { price: c.price, rating: c.rating },
        name: 'Bad Item',
      }),
      rules: [
        {
          check: c => ({ detail: 'Too high', passed: c.price < 50 }),
          label: 'Price',
        },
        {
          check: c => ({ detail: 'Too low', passed: c.rating > 4 }),
          label: 'Rating',
        },
      ],
    });

    const trace = xray.getTraceSnapshot();
    const step = trace.steps[0];
    if (step.type === 'filter') {
      const result = step.evaluations[0];
      expect(result.passed).toBe(false);
      expect(result.filterResults['Price'].passed).toBe(false);
      expect(result.filterResults['Rating'].passed).toBe(false);
    }
  });

  it('UC2: should record ranking reasoning accurately', async () => {
    const xray = new XRay('Rank Test', mockProspect);
    await xray.recordStep('Scoring', 'rank', { count: 2 }, async () => ({
      output: { winner: 'c-1' },
      reasoning: 'c-1 selected due to higher review count (5k vs 1k)',
    }));

    const trace = xray.getTraceSnapshot();
    expect(trace.steps[0].reasoning).toContain('higher review count');
  });

  it('UC3: should handle zero candidates gracefully', async () => {
    const xray = new XRay('Empty Set', mockProspect);
    const passed = await xray.recordFilterStep('Empty Filter', [], {
      identity: (i: { id: string }) => ({ id: i.id, metrics: {}, name: '' }),
      rules: [],
    });

    expect(passed).toHaveLength(0);
    expect(xray.getTraceSnapshot().steps[0].output).toEqual({ passedCount: 0 });
  });

  it('UC4: should capture explicit failure states', async () => {
    const xray = new XRay('Crash Test', mockProspect);
    await xray.fail('API Connection Timeout');

    const trace = xray.getTraceSnapshot();
    expect(trace.status).toBe('failed');
    expect(trace.steps[0].type).toBe('error');
    expect((trace.steps[0].output as Record<string, string>).message).toBe(
      'API Connection Timeout'
    );
  });
});

describe('X-Ray Module Reliability', () => {
  const mockProspect = {
    id: 'p-1',
    metadata: { price: 25 },
    name: 'ProBrand Bottle',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should automate transmission on flush', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    const xrayModule = initXRay({ apiUrl: '/api/test' });
    const trace = xrayModule.createTrace('Auto Flush Test', mockProspect);

    await trace.flush();
    expect(fetchMock).toHaveBeenCalled();

    const callArgs = fetchMock.mock.calls[0];
    const body = JSON.parse(callArgs[1]?.body as string);

    expect(body.name).toBe('Auto Flush Test');
    expect(body.status).toBe('completed');
  });

  it('should suppress transmission errors to prevent app crashes', async () => {
    // Simulate a network crash
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network Down'))
    );
    const xrayModule = initXRay({ apiUrl: '/api/test' });
    const trace = xrayModule.createTrace('Resilience Test', mockProspect);

    // This should NOT throw
    await expect(trace.flush()).resolves.toBeDefined();
  });

  it('should capture complex multi-filter failure states', async () => {
    const xray = new XRay('Funnel Test', mockProspect);
    const candidates = [{ id: 'c-1', price: 100, rating: 2 }];

    await xray.recordFilterStep('Selection Funnel', candidates, {
      identity: c => ({
        id: c.id,
        metrics: { price: c.price, rating: c.rating },
        name: 'Item',
      }),
      rules: [
        {
          check: c => ({ detail: 'Fail', passed: c.price < 50 }),
          label: 'Price',
        },
        {
          check: c => ({ detail: 'Fail', passed: c.rating > 4 }),
          label: 'Rating',
        },
      ],
    });

    const snapshot = xray.getTraceSnapshot();
    const step = snapshot.steps[0];
    if (step.type === 'filter') {
      expect(step.evaluations[0].filterResults['Price'].passed).toBe(false);
      expect(step.evaluations[0].filterResults['Rating'].passed).toBe(false);
    }
  });
});
