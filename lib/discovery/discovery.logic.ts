import { MOCK_CANDIDATES } from './discovery.mock';
import {
  CompetitorProduct,
  DiscoveryConfig,
  ProspectProduct,
} from './discovery.types';
import { initXRay } from '../xray/xray.client';

export class DiscoveryEngine {
  private config: DiscoveryConfig;

  constructor(config: DiscoveryConfig) {
    this.config = config;
  }

  async run(prospect: ProspectProduct): Promise<CompetitorProduct | null> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const xrayModule = initXRay({ apiUrl: `${baseUrl}/api/xray` });
    const trace = xrayModule.createTrace(
      `Competitor Discovery: ${prospect.title}`,
      {
        id: prospect.id,
        metadata: { category: prospect.category, price: prospect.price },
        name: prospect.title,
      }
    );

    try {
      const keywords = await trace.recordStep(
        'Keyword Generation',
        'generative',
        { title: prospect.title },
        async () => {
          // TODO: Integrate with OpenAI/Anthropic SDK
          const extracted = prospect.title.toLowerCase().split(' ').slice(0, 3);
          return {
            output: extracted,
            reasoning: `Extracted top 3 tokens from title: "${prospect.title}"`,
          };
        }
      );

      const candidates = await trace.recordStep(
        'Candidate Search',
        'retrieval',
        { keywords },
        async () => {
          // TODO: Integrate with Amazon/Search API
          return {
            output: MOCK_CANDIDATES,
            reasoning: `Found ${MOCK_CANDIDATES.length} candidates in category: ${prospect.category}`,
          };
        }
      );

      const filtered = await trace.recordFilterStep(
        'Business Logic Filters',
        candidates,
        {
          identity: c => ({
            id: c.id,
            metrics: { price: c.price, rating: c.rating, reviews: c.reviews },
            name: c.title,
          }),
          rules: [
            {
              check: c => {
                const min = prospect.price * (1 - this.config.priceTolerance);
                const max = prospect.price * (1 + this.config.priceTolerance);
                return {
                  actual: c.price,
                  detail: `$${c.price} is ${c.price < min ? 'below' : 'above'} tolerance ($${min.toFixed(2)}-$${max.toFixed(2)})`,
                  passed: c.price >= min && c.price <= max,
                  threshold: `${min}-${max}`,
                };
              },
              label: 'Price Range',
            },
            {
              check: c => ({
                actual: c.rating,
                detail: `${c.rating} stars vs ${this.config.minRating} required`,
                passed: c.rating >= this.config.minRating,
                threshold: this.config.minRating,
              }),
              label: 'Min Rating',
            },
            {
              check: c => ({
                actual: c.reviews,
                detail: `${c.reviews} reviews vs ${this.config.minReviews} required`,
                passed: c.reviews >= this.config.minReviews,
                threshold: this.config.minReviews,
              }),
              label: 'Social Proof',
            },
          ],
        }
      );

      const verified = await trace.recordStep(
        'LLM Relevance Check',
        'generative',
        { candidateCount: filtered.length },
        async () => {
          // TODO: Use LLM to detect false positives (accessories, parts)
          const output = filtered.filter(
            c =>
              !c.title.toLowerCase().includes('lid') &&
              !c.title.toLowerCase().includes('brush')
          );
          const removedCount = filtered.length - output.length;
          return {
            output,
            reasoning: `Removed ${removedCount} false positives (accessories/parts) via title analysis.`,
          };
        }
      );

      const winner = await trace.recordStep(
        'Final Ranking',
        'rank',
        { candidates: verified.length },
        async () => {
          if (verified.length === 0)
            return {
              output: null,
              reasoning: 'No candidates survived filtering.',
            };

          const sorted = [...verified].sort((a, b) => b.reviews - a.reviews);
          const top = sorted[0];

          return {
            output: top,
            reasoning: `Selected "${top.title}" as it has the highest review count (${top.reviews}) among qualified candidates.`,
          };
        }
      );

      await trace.flush();
      return winner as CompetitorProduct | null;
    } catch (error) {
      await trace.fail(error instanceof Error ? error : String(error));
      throw error;
    }
  }
}
