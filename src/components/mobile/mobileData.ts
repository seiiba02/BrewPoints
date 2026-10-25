export type MenuCategory = 'coffee' | 'non-coffee' | 'tea' | 'pastries';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: MenuCategory;
  /** Drinks take size, milk and add-ons; pastries are sold as-is. */
  customizable: boolean;
}

export const PRODUCTS: Product[] = [
  {
    id: 'americano',
    name: 'Americano',
    description: 'Bold and smooth.',
    price: 100,
    image: '/images/americano.jpg',
    category: 'coffee',
    customizable: true,
  },
  {
    id: 'iced-latte',
    name: 'Iced Latte',
    description: 'Espresso with cold milk, served over ice.',
    price: 120,
    image: '/images/iced-latte.jpg',
    category: 'coffee',
    customizable: true,
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    description: 'Espresso, steamed milk, foam.',
    price: 120,
    image: '/images/cappuccino.jpg',
    category: 'coffee',
    customizable: true,
  },
  {
    id: 'spanish-latte',
    name: 'Spanish Latte',
    description: 'Rich espresso with sweetened condensed milk.',
    price: 140,
    image: '/images/spanish-latte.jpg',
    category: 'coffee',
    customizable: true,
  },
  {
    id: 'mocha',
    name: 'Mocha',
    description: 'Chocolate + espresso + milk.',
    price: 140,
    image: '/images/mocha.jpg',
    category: 'coffee',
    customizable: true,
  },
  {
    id: 'caramel-macchiato',
    name: 'Caramel Macchiato',
    description: 'Vanilla, steamed milk and a caramel drizzle.',
    price: 150,
    image: '/images/caramel-macchiato.jpg',
    category: 'coffee',
    customizable: true,
  },
  {
    id: 'matcha-latte',
    name: 'Matcha Latte',
    description: 'Earthy and refreshing.',
    price: 130,
    image: '/images/matcha-latte.jpg',
    category: 'non-coffee',
    customizable: true,
  },
  {
    id: 'blueberry-muffin',
    name: 'Blueberry Muffin',
    description: 'Freshly baked every morning.',
    price: 85,
    image: '/images/blueberry-muffin.jpg',
    category: 'pastries',
    customizable: false,
  },
];

export const CATEGORIES: { id: MenuCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'coffee', label: 'Coffee' },
  { id: 'non-coffee', label: 'Non-Coffee' },
  { id: 'tea', label: 'Tea' },
  { id: 'pastries', label: 'Pastries' },
];

export const FEATURED_IDS = ['iced-latte', 'spanish-latte', 'matcha-latte'];

export const SIZES = [
  { id: 'Small', delta: 0 },
  { id: 'Medium', delta: 20 },
  { id: 'Large', delta: 40 },
] as const;
export type SizeId = (typeof SIZES)[number]['id'];

export const MILKS = ['Whole Milk', 'Oat Milk', 'Almond Milk'] as const;
export type MilkId = (typeof MILKS)[number];

export const ADDONS = [
  { id: 'Extra Shot', price: 20 },
  { id: 'Vanilla Syrup', price: 15 },
  { id: 'Caramel Drizzle', price: 15 },
] as const;

export const SERVICE_FEE = 10;
/** Customers earn 1 point per P10 spent. */
export const PESOS_PER_POINT = 10;

export interface Reward {
  id: string;
  name: string;
  points: number;
  image: string;
}

export const REWARDS: Reward[] = [
  { id: 'free-espresso', name: 'Free Espresso', points: 100, image: '/images/americano.jpg' },
  { id: 'free-pastry', name: 'Free Pastry', points: 150, image: '/images/blueberry-muffin.jpg' },
  { id: 'free-latte', name: 'Free Latte', points: 200, image: '/images/iced-latte.jpg' },
  { id: 'free-muffin', name: 'Free Muffin', points: 250, image: '/images/blueberry-muffin.jpg' },
];

export type OrderStatus = 'Completed' | 'Cancelled';

export interface PastOrder {
  number: number;
  placedAt: string;
  total: number;
  status: OrderStatus;
}

export const INITIAL_HISTORY: PastOrder[] = [
  { number: 1023, placedAt: 'Oct 24, 2026 · 4:12 PM', total: 180, status: 'Completed' },
  { number: 1022, placedAt: 'Oct 22, 2026 · 8:30 AM', total: 140, status: 'Completed' },
  { number: 1021, placedAt: 'Oct 20, 2026 · 2:20 PM', total: 225, status: 'Cancelled' },
  { number: 1020, placedAt: 'Oct 18, 2026 · 9:46 AM', total: 160, status: 'Completed' },
  { number: 1019, placedAt: 'Oct 15, 2026 · 7:55 AM', total: 120, status: 'Completed' },
];

export function findProduct(id: string): Product {
  return PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];
}

export function unitPrice(product: Product, size: SizeId, addons: readonly string[]): number {
  if (!product.customizable) return product.price;
  const sizeDelta = SIZES.find((s) => s.id === size)?.delta ?? 0;
  const addonTotal = ADDONS.filter((a) => addons.includes(a.id)).reduce((sum, a) => sum + a.price, 0);
  return product.price + sizeDelta + addonTotal;
}

export function peso(amount: number): string {
  return `P${amount.toLocaleString('en-PH')}`;
}
