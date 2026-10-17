/**
 * BrewFlow Domain Interfaces
 * Contracts for Menu, Order, Loyalty, and Telemetry Services.
 * Supports swappable storage backends (LocalStorageBroadcastAdapter vs SupabaseAdapter).
 */

import {
  MenuCategory,
  MenuItem,
  Order,
  OrderStatus,
  CreateOrderInput,
  LoyaltyAccount,
  StoreMetrics,
  RealtimeEvent,
} from './types';

export interface IMenuService {
  getCategories(): Promise<MenuCategory[]>;
  getMenuItems(categorySlug?: string): Promise<MenuItem[]>;
  getMenuItem(id: string): Promise<MenuItem | null>;
  toggleItemAvailability(id: string, isAvailable: boolean): Promise<MenuItem>;
  updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem>;
  addMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem>;
}

export interface IOrderService {
  createOrder(input: CreateOrderInput): Promise<Order>;
  getOrders(statusFilter?: OrderStatus | 'active'): Promise<Order[]>;
  getOrder(id: string): Promise<Order | null>;
  updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    actor?: 'customer' | 'barista' | 'system'
  ): Promise<Order>;
  subscribe(callback: (event: RealtimeEvent) => void): () => void;
}

export interface ILoyaltyService {
  getLoyaltyAccount(): Promise<LoyaltyAccount>;
  redeemPoints(points: number, orderId?: string): Promise<{ success: boolean; discountDollars: number }>;
  earnPoints(points: number, orderId?: string, note?: string): Promise<number>;
}

export interface IStoreService {
  getMetrics(): Promise<StoreMetrics>;
  resetDemoData(): Promise<void>;
}
