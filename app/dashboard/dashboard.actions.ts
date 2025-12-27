'use server';

import { revalidatePath } from 'next/cache';

import { DiscoveryEngine } from '@/lib/discovery/discovery.logic';

/**
 * Server Action to trigger the Discovery Engine.
 * This simulates an internal workflow request.
 */
export async function runDiscoveryAction() {
  const engine = new DiscoveryEngine({
    minRating: 4.0,
    minReviews: 100,
    priceTolerance: 0.5,
  });

  // Simulated prospect data for the internal workflow
  const prospect = {
    category: 'Bottles',
    id: `p-${Math.floor(Math.random() * 1000)}`,
    price: 35.0,
    rating: 4.2,
    title: 'ProBrand 32oz Insulated Steel Bottle',
  };

  try {
    await engine.run(prospect);

    // Purge the Next.js cache for the dashboard to show new data
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Discovery Engine Execution Failed:', error);
    return { error: 'Failed to execute discovery engine' };
  }
}
