/**
 * BrewFlow Domain Models & Data Types
 * Mobile-first Coffee Shop Ordering, Kitchen Operations & Loyalty Platform
 */

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'unpaid_at_pickup' | 'paid_at_pickup';

export interface CustomizationOption {
  id: string;
  name: string;
  priceDelta: number; // in USD (e.g., 0.80 for Oat Milk)
  isDefault?: boolean;
}

export interface CustomizationGroup {
  id: string;
  name: string;
  type: 'radio' | 'checkbox';
  required: boolean;
  minSelections?: number;
  maxSelections?: number;
  options: CustomizationOption[];
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  basePrice: number; // in PHP / points
  categorySlug: string;
  isAvailable: boolean;
  isPopular?: boolean;
  imageUrl?: string;
  customizationGroups: CustomizationGroup[];
}

export interface SelectedCustomization {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceDelta: number;
}

export interface CartItem {
  id: string; // unique cart line ID (UUID or timestamp)
  menuItemId: string;
  name: string;
  basePrice: number;
  imageUrl?: string;
  selectedOptions: SelectedCustomization[];
  specialInstructions?: string;
  quantity: number;
  unitPrice: number; // basePrice + sum(selectedOptions.priceDelta)
  lineTotal: number; // unitPrice * quantity
}

export interface OrderHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  actor: 'customer' | 'barista' | 'system';
  note?: string;
}

export interface Order {
  id: string; // e.g. "ORD-0104"
  createdAt: string;
  customerName: string;
  customerPhone: string;
  pickupSlot: string; // e.g. "Next available (10–15 min)" or "8:45 AM"
  items: CartItem[];
  subtotal: number;
  discount: number; // in USD (from redeemed loyalty points)
  total: number;
  pointsRedeemed: number;
  pointsEarned: number;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  history: OrderHistoryEntry[];
}

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  pickupSlot: string;
  items: CartItem[];
  redeemPoints?: number;
}

export interface LoyaltyLedgerEntry {
  id: string;
  date: string;
  type: 'earned' | 'redeemed' | 'bonus' | 'adjustment';
  points: number;
  orderId?: string;
  balanceAfter: number;
  note: string;
}

export interface LoyaltyAccount {
  balance: number;
  ledger: LoyaltyLedgerEntry[];
}

export interface StoreMetrics {
  grossRevenue: number;
  totalOrders: number;
  activeOrders: number;
  averageOrderValue: number;
  completedOrdersCount: number;
  topSellingItems: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

export type RealtimeEvent =
  | { type: 'ORDER_CREATED'; order: Order }
  | { type: 'ORDER_STATUS_CHANGED'; orderId: string; newStatus: OrderStatus; order: Order }
  | { type: 'MENU_ITEM_TOGGLED'; itemId: string; isAvailable: boolean }
  | { type: 'MENU_ITEM_UPDATED'; item: MenuItem }
  | { type: 'STORE_RESET' };
