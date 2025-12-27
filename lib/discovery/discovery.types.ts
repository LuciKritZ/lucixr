import { JsonValue } from '../xray/xray.types';

export interface CompetitorProduct extends Record<string, JsonValue> {
  id: string;
  title: string;
  price: number;
  rating: number;
  reviews: number;
  category: string;
}

export interface ProspectProduct {
  id: string;
  title: string;
  price: number;
  rating: number;
  category: string;
}

export interface DiscoveryConfig {
  minRating: number;
  minReviews: number;
  priceTolerance: number; // e.g., 0.5 for 50% range
}
