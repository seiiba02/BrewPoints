/**
 * BrewFlow Unified Service Client
 * Clean Architecture Boundary for UI Components.
 * Delegates to LocalStorageBroadcastAdapter (or SupabaseAdapter when configured).
 */

import { getBrewFlowAdapter } from '../storage/localStorageAdapter';
import type {
  IMenuService,
  IOrderService,
  ILoyaltyService,
  IStoreService,
} from '../domain/interfaces';

export const menuService: IMenuService = {
  getCategories: () => getBrewFlowAdapter().getCategories(),
  getMenuItems: (slug) => getBrewFlowAdapter().getMenuItems(slug),
  getMenuItem: (id) => getBrewFlowAdapter().getMenuItem(id),
  toggleItemAvailability: (id, avail) =>
    getBrewFlowAdapter().toggleItemAvailability(id, avail),
  updateMenuItem: (id, updates) =>
    getBrewFlowAdapter().updateMenuItem(id, updates),
  addMenuItem: (item) => getBrewFlowAdapter().addMenuItem(item),
};

export const orderService: IOrderService = {
  createOrder: (input) => getBrewFlowAdapter().createOrder(input),
  getOrders: (filter) => getBrewFlowAdapter().getOrders(filter),
  getOrder: (id) => getBrewFlowAdapter().getOrder(id),
  updateOrderStatus: (id, status, note, actor) =>
    getBrewFlowAdapter().updateOrderStatus(id, status, note, actor),
  subscribe: (cb) => getBrewFlowAdapter().subscribe(cb),
};

export const loyaltyService: ILoyaltyService = {
  getLoyaltyAccount: () => getBrewFlowAdapter().getLoyaltyAccount(),
  redeemPoints: (points, orderId) =>
    getBrewFlowAdapter().redeemPoints(points, orderId),
  earnPoints: (points, orderId, note) =>
    getBrewFlowAdapter().earnPoints(points, orderId, note),
};

export const storeService: IStoreService = {
  getMetrics: () => getBrewFlowAdapter().getMetrics(),
  resetDemoData: () => getBrewFlowAdapter().resetDemoData(),
};
