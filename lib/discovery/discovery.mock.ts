import { CompetitorProduct } from './discovery.types';

export const MOCK_CANDIDATES: CompetitorProduct[] = [
  // HydroFlask now has the most reviews (32,500)
  {
    category: 'Bottles',
    id: 'C1',
    price: 44.99,
    rating: 4.8,
    reviews: 32500,
    title: 'HydroFlask 32oz Wide Mouth',
  },
  {
    category: 'Bottles',
    id: 'C2',
    price: 39.99,
    rating: 4.7,
    reviews: 8400,
    title: 'Yeti Rambler 26oz',
  },
  {
    category: 'Accessories',
    id: 'C3',
    price: 12.99,
    rating: 4.2,
    reviews: 1200,
    title: 'Replacement Lid for HydroFlask',
  },
  {
    category: 'Bottles',
    id: 'C4',
    price: 9.99,
    rating: 3.1,
    reviews: 45,
    title: 'Generic Plastic Bottle 3-Pack',
  },
  // Stanley is second (25,000)
  {
    category: 'Bottles',
    id: 'C5',
    price: 45.0,
    rating: 4.9,
    reviews: 25000,
    title: 'Stanley Quencher 40oz',
  },
  {
    category: 'Tools',
    id: 'C6',
    price: 14.99,
    rating: 4.5,
    reviews: 3200,
    title: 'Bottle Cleaning Brush Set',
  },
];
