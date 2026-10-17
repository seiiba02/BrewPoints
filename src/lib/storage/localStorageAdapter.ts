/**
 * BrewFlow LocalStorage & BroadcastChannel Adapter
 * Production-grade Client-Side Reactive Simulation Engine
 * Synchronizes orders, menu stock, and status updates across browser tabs in real-time.
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
} from '../domain/types';
import {
  IMenuService,
  IOrderService,
  ILoyaltyService,
  IStoreService,
} from '../domain/interfaces';
import {
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_ORDERS,
  INITIAL_LOYALTY,
} from './seedData';

const STORAGE_KEYS = {
  CATEGORIES: 'brewflow_categories_v1',
  MENU_ITEMS: 'brewflow_menu_items_v1',
  ORDERS: 'brewflow_orders_v1',
  LOYALTY: 'brewflow_loyalty_v1',
} as const;

const BROADCAST_CHANNEL_NAME = 'brewflow-realtime-sync';

export class LocalStorageBroadcastAdapter
  implements IMenuService, IOrderService, ILoyaltyService, IStoreService
{
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(event: RealtimeEvent) => void> = new Set();
  private isBrowser: boolean;

  constructor() {
    this.isBrowser = typeof window !== 'undefined';
    if (this.isBrowser) {
      this.initBroadcastChannel();
      this.ensureInitialData();
    }
  }

  private initBroadcastChannel() {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.channel.onmessage = (event: MessageEvent<RealtimeEvent>) => {
          this.notifyListeners(event.data);
        };
      } catch (err) {
        console.warn('BroadcastChannel not supported in this environment', err);
      }
    }

    // Secondary sync: window storage event for background tabs
    window.addEventListener('storage', (event) => {
      if (event.key?.startsWith('brewflow_')) {
        this.notifyListeners({ type: 'STORE_RESET' });
      }
    });
  }

  private notifyListeners(event: RealtimeEvent) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in listener callback', err);
      }
    });
  }

  private broadcast(event: RealtimeEvent) {
    this.notifyListeners(event);
    if (this.channel) {
      try {
        this.channel.postMessage(event);
      } catch (err) {
        console.warn('Failed to broadcast event', err);
      }
    }
  }

  private ensureInitialData() {
    if (!this.isBrowser) return;

    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(
        STORAGE_KEYS.CATEGORIES,
        JSON.stringify(INITIAL_CATEGORIES)
      );
    }
    if (!localStorage.getItem(STORAGE_KEYS.MENU_ITEMS)) {
      localStorage.setItem(
        STORAGE_KEYS.MENU_ITEMS,
        JSON.stringify(INITIAL_MENU_ITEMS)
      );
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(
        STORAGE_KEYS.ORDERS,
        JSON.stringify(INITIAL_ORDERS)
      );
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOYALTY)) {
      localStorage.setItem(
        STORAGE_KEYS.LOYALTY,
        JSON.stringify(INITIAL_LOYALTY)
      );
    }
  }

  // --- IMenuService Implementation ---

  async getCategories(): Promise<MenuCategory[]> {
    if (!this.isBrowser) return INITIAL_CATEGORIES;
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return raw ? JSON.parse(raw) : INITIAL_CATEGORIES;
  }

  async getMenuItems(categorySlug?: string): Promise<MenuItem[]> {
    if (!this.isBrowser) {
      return categorySlug
        ? INITIAL_MENU_ITEMS.filter((item) => item.categorySlug === categorySlug)
        : INITIAL_MENU_ITEMS;
    }
    const raw = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
    const items: MenuItem[] = raw ? JSON.parse(raw) : INITIAL_MENU_ITEMS;
    if (categorySlug && categorySlug !== 'all') {
      return items.filter((item) => item.categorySlug === categorySlug);
    }
    return items;
  }

  async getMenuItem(id: string): Promise<MenuItem | null> {
    const items = await this.getMenuItems();
    return items.find((item) => item.id === id) || null;
  }

  async toggleItemAvailability(id: string, isAvailable: boolean): Promise<MenuItem> {
    const items = await this.getMenuItems();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) throw new Error(`Item ${id} not found`);

    items[index] = { ...items[index], isAvailable };
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(items));
    }

    this.broadcast({ type: 'MENU_ITEM_TOGGLED', itemId: id, isAvailable });
    return items[index];
  }

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    const items = await this.getMenuItems();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) throw new Error(`Item ${id} not found`);

    items[index] = { ...items[index], ...updates };
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(items));
    }

    this.broadcast({ type: 'MENU_ITEM_UPDATED', item: items[index] });
    return items[index];
  }

  async addMenuItem(itemInput: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    const items = await this.getMenuItems();
    const newItem: MenuItem = {
      ...itemInput,
      id: `item-${Date.now().toString(36)}`,
    };
    items.push(newItem);

    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(items));
    }

    this.broadcast({ type: 'MENU_ITEM_UPDATED', item: newItem });
    return newItem;
  }

  // --- IOrderService Implementation ---

  async createOrder(input: CreateOrderInput): Promise<Order> {
    const orders = await this.getOrders();
    const nextNum = orders.length + 105;
    const orderId = `ORD-${nextNum.toString().padStart(4, '0')}`;

    // Compute verified totals
    const subtotal = input.items.reduce(
      (acc, item) => acc + item.unitPrice * item.quantity,
      0
    );

    // Loyalty redemption calculation: 10 pts = $1.00 off
    const pointsRedeemed = Math.max(0, input.redeemPoints || 0);
    const discount = Math.min(subtotal, Math.round((pointsRedeemed / 10) * 100) / 100);
    const total = Math.max(0, Math.round((subtotal - discount) * 100) / 100);
    const pointsEarned = Math.round(total); // 1 point per $1.00 spent

    const newOrder: Order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      customerName: input.customerName.trim() || 'Guest Customer',
      customerPhone: input.customerPhone.trim() || 'In-store Pickup',
      pickupSlot: input.pickupSlot || 'Next available (10–15 min)',
      items: input.items,
      subtotal: Math.round(subtotal * 100) / 100,
      discount,
      total,
      pointsRedeemed,
      pointsEarned,
      paymentStatus: 'unpaid_at_pickup',
      status: 'pending',
      history: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          actor: 'customer',
          note: 'Order submitted via Web App',
        },
      ],
    };

    orders.unshift(newOrder);

    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

      // Process loyalty mutations
      if (pointsRedeemed > 0) {
        await this.redeemPoints(pointsRedeemed, orderId);
      }
      if (pointsEarned > 0) {
        await this.earnPoints(
          pointsEarned,
          orderId,
          `Earned from order #${orderId} ($${total.toFixed(2)})`
        );
      }
    }

    this.broadcast({ type: 'ORDER_CREATED', order: newOrder });
    return newOrder;
  }

  async getOrders(statusFilter?: OrderStatus | 'active'): Promise<Order[]> {
    if (!this.isBrowser) return INITIAL_ORDERS;
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    const orders: Order[] = raw ? JSON.parse(raw) : INITIAL_ORDERS;

    if (!statusFilter) return orders;

    if (statusFilter === 'active') {
      return orders.filter(
        (o) =>
          o.status === 'pending' ||
          o.status === 'accepted' ||
          o.status === 'preparing' ||
          o.status === 'ready'
      );
    }

    return orders.filter((o) => o.status === statusFilter);
  }

  async getOrder(id: string): Promise<Order | null> {
    const orders = await this.getOrders();
    return orders.find((o) => o.id === id) || null;
  }

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    actor: 'customer' | 'barista' | 'system' = 'barista'
  ): Promise<Order> {
    const orders = await this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error(`Order ${orderId} not found`);

    const order = orders[index];
    const updatedHistory = [
      ...order.history,
      {
        status: newStatus,
        timestamp: new Date().toISOString(),
        actor,
        note: note || `Status updated to ${newStatus}`,
      },
    ];

    const updatedOrder: Order = {
      ...order,
      status: newStatus,
      paymentStatus:
        newStatus === 'completed' ? 'paid_at_pickup' : order.paymentStatus,
      history: updatedHistory,
    };

    orders[index] = updatedOrder;

    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    }

    this.broadcast({
      type: 'ORDER_STATUS_CHANGED',
      orderId,
      newStatus,
      order: updatedOrder,
    });

    return updatedOrder;
  }

  subscribe(callback: (event: RealtimeEvent) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  // --- ILoyaltyService Implementation ---

  async getLoyaltyAccount(): Promise<LoyaltyAccount> {
    if (!this.isBrowser) return INITIAL_LOYALTY;
    const raw = localStorage.getItem(STORAGE_KEYS.LOYALTY);
    return raw ? JSON.parse(raw) : INITIAL_LOYALTY;
  }

  async redeemPoints(
    points: number,
    orderId?: string
  ): Promise<{ success: boolean; discountDollars: number }> {
    const account = await this.getLoyaltyAccount();
    if (account.balance < points) {
      return { success: false, discountDollars: 0 };
    }

    const discountDollars = Math.round((points / 10) * 100) / 100;
    const newBalance = account.balance - points;

    account.ledger.unshift({
      id: `led-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'redeemed',
      points,
      orderId,
      balanceAfter: newBalance,
      note: `Redeemed ${points} points for $${discountDollars.toFixed(2)} discount`,
    });
    account.balance = newBalance;

    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEYS.LOYALTY, JSON.stringify(account));
    }

    return { success: true, discountDollars };
  }

  async earnPoints(
    points: number,
    orderId?: string,
    note?: string
  ): Promise<number> {
    const account = await this.getLoyaltyAccount();
    const newBalance = account.balance + points;

    account.ledger.unshift({
      id: `led-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'earned',
      points,
      orderId,
      balanceAfter: newBalance,
      note: note || `Earned ${points} points`,
    });
    account.balance = newBalance;

    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEYS.LOYALTY, JSON.stringify(account));
    }

    return newBalance;
  }

  // --- IStoreService Implementation ---

  async getMetrics(): Promise<StoreMetrics> {
    const orders = await this.getOrders();
    const completed = orders.filter((o) => o.status === 'completed');
    const active = orders.filter(
      (o) =>
        o.status === 'pending' ||
        o.status === 'accepted' ||
        o.status === 'preparing' ||
        o.status === 'ready'
    );

    const grossRevenue = orders.reduce((sum, o) => {
      return o.status !== 'cancelled' ? sum + o.total : sum;
    }, 0);

    const totalOrders = orders.filter((o) => o.status !== 'cancelled').length;
    const averageOrderValue =
      totalOrders > 0 ? Math.round((grossRevenue / totalOrders) * 100) / 100 : 0;

    // Item popularity aggregation
    const itemMap = new Map<string, { count: number; revenue: number }>();
    orders
      .filter((o) => o.status !== 'cancelled')
      .forEach((order) => {
        order.items.forEach((item) => {
          const current = itemMap.get(item.name) || { count: 0, revenue: 0 };
          itemMap.set(item.name, {
            count: current.count + item.quantity,
            revenue: current.revenue + item.lineTotal,
          });
        });
      });

    const topSellingItems = Array.from(itemMap.entries())
      .map(([name, data]) => ({
        name,
        quantity: data.count,
        revenue: Math.round(data.revenue * 100) / 100,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      grossRevenue: Math.round(grossRevenue * 100) / 100,
      totalOrders: orders.length,
      activeOrders: active.length,
      averageOrderValue,
      completedOrdersCount: completed.length,
      topSellingItems,
    };
  }

  async resetDemoData(): Promise<void> {
    if (!this.isBrowser) return;

    localStorage.setItem(
      STORAGE_KEYS.CATEGORIES,
      JSON.stringify(INITIAL_CATEGORIES)
    );
    localStorage.setItem(
      STORAGE_KEYS.MENU_ITEMS,
      JSON.stringify(INITIAL_MENU_ITEMS)
    );
    localStorage.setItem(
      STORAGE_KEYS.ORDERS,
      JSON.stringify(INITIAL_ORDERS)
    );
    localStorage.setItem(
      STORAGE_KEYS.LOYALTY,
      JSON.stringify(INITIAL_LOYALTY)
    );

    this.broadcast({ type: 'STORE_RESET' });
  }
}

// Singleton instance export
let instance: LocalStorageBroadcastAdapter | null = null;

export function getBrewFlowAdapter(): LocalStorageBroadcastAdapter {
  if (!instance) {
    instance = new LocalStorageBroadcastAdapter();
  }
  return instance;
}
