import { describe, it, expect, vi, beforeEach } from 'vitest';

import { DiscoveryEngine } from './discovery.logic';

describe('Discovery Engine', () => {
  const engine = new DiscoveryEngine({
    minRating: 4.0,
    minReviews: 100,
    priceTolerance: 0.5,
  });

  const prospect = {
    category: 'Bottles',
    id: 'P1',
    price: 30.0,
    rating: 4.5,
    title: 'ProBrand 32oz Steel Bottle',
  };

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  });

  it('should successfully find the best competitor', async () => {
    const winner = await engine.run(prospect);

    expect(winner).toBeDefined();
    expect(winner?.id).toBe('C1'); // HydroFlask has most reviews
    expect(winner?.title).not.toContain('Lid'); // False positive removed
  });

  it('should return null if no products pass filters', async () => {
    const strictEngine = new DiscoveryEngine({
      minRating: 5.0, // Impossible rating
      minReviews: 100000,
      priceTolerance: 0.1,
    });

    const winner = await strictEngine.run(prospect);
    expect(winner).toBeNull();
  });
});
