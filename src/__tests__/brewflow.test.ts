import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageBroadcastAdapter } from '../lib/storage/localStorageAdapter';
import { CreateOrderInput, RealtimeEvent } from '../lib/domain/types';

describe('BrewFlow Domain & Storage Engine Suite', () => {
  let adapter: LocalStorageBroadcastAdapter;

  beforeEach(() => {
    // Fresh adapter in Node/Vitest test environment
    adapter = new LocalStorageBroadcastAdapter();
  });

  it('loads default menu categories and items', async () => {
    const categories = await adapter.getCategories();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories.some((c) => c.slug === 'hot-coffee')).toBe(true);

    const hotCoffeeItems = await adapter.getMenuItems('hot-coffee');
    expect(hotCoffeeItems.length).toBeGreaterThan(0);
    expect(hotCoffeeItems.every((i) => i.categorySlug === 'hot-coffee')).toBe(true);
  });

  it('toggles item availability (86-ing an item)', async () => {
    const items = await adapter.getMenuItems();
    const target = items[0];
    const initialStatus = target.isAvailable;

    const toggled = await adapter.toggleItemAvailability(target.id, !initialStatus);
    expect(toggled.isAvailable).toBe(!initialStatus);

    const refetched = await adapter.getMenuItem(target.id);
    expect(refetched?.isAvailable).toBe(!initialStatus);
  });

  it('updates item base price and persists changes', async () => {
    const items = await adapter.getMenuItems();
    const target = items[0];
    const newPrice = 5.75;

    const updated = await adapter.updateMenuItem(target.id, { basePrice: newPrice });
    expect(updated.basePrice).toBe(newPrice);

    const refetched = await adapter.getMenuItem(target.id);
    expect(refetched?.basePrice).toBe(newPrice);
  });

  it('adds a new product to the catalog', async () => {
    const initialItems = await adapter.getMenuItems();
    const initialCount = initialItems.length;

    const created = await adapter.addMenuItem({
      categoryId: 'cat-hot',
      categorySlug: 'hot-coffee',
      name: 'Cascara Reserve Drip',
      description: 'Sun-dried coffee cherry infusion with notes of hibiscus and raw sugar.',
      basePrice: 5.25,
      isAvailable: true,
      customizationGroups: [],
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe('Cascara Reserve Drip');

    const updatedItems = await adapter.getMenuItems();
    expect(updatedItems.length).toBe(initialCount + 1);
  });

  it('correctly calculates order price with customizations and loyalty discounts', async () => {
    const input: CreateOrderInput = {
      customerName: 'Alice Portfolio',
      customerPhone: '+1 (555) 019-2834',
      pickupSlot: 'Next available (10–15 min)',
      items: [
        {
          id: 'cart-1',
          menuItemId: 'item-01',
          name: 'Foundry Drip Coffee',
          basePrice: 4.0,
          selectedOptions: [
            {
              groupId: 'grp-size',
              groupName: 'Cup Size',
              optionId: 'opt-sz-reg',
              optionName: 'Regular (12 oz)',
              priceDelta: 0.75,
            },
            {
              groupId: 'grp-milk',
              groupName: 'Milk Selection',
              optionId: 'opt-milk-oat',
              optionName: 'Minor Figures Oat Milk',
              priceDelta: 0.85,
            },
          ],
          quantity: 2,
          unitPrice: 5.6, // 4.00 + 0.75 + 0.85
          lineTotal: 11.2, // 5.60 * 2
        },
      ],
      redeemPoints: 20, // 20 points = $2.00 off
    };

    const order = await adapter.createOrder(input);

    expect(order.id).toMatch(/^ORD-\d{4}$/);
    expect(order.subtotal).toBe(11.2);
    expect(order.discount).toBe(2.0);
    expect(order.total).toBe(9.2);
    expect(order.pointsEarned).toBe(9); // 1 point per $1.00 spent
    expect(order.status).toBe('pending');
    expect(order.history.length).toBe(1);
    expect(order.history[0].status).toBe('pending');
  });

  it('clamps discount when loyalty points discount exceeds subtotal', async () => {
    const input: CreateOrderInput = {
      customerName: 'Bob Customer',
      customerPhone: '+1 (555) 888-9999',
      pickupSlot: 'Next available (10–15 min)',
      items: [
        {
          id: 'cart-2',
          menuItemId: 'item-01',
          name: 'Foundry Drip Coffee',
          basePrice: 4.0,
          selectedOptions: [],
          quantity: 1,
          unitPrice: 4.0,
          lineTotal: 4.0,
        },
      ],
      redeemPoints: 100, // 100 points = $10.00 off, but subtotal is only $4.00
    };

    const order = await adapter.createOrder(input);
    expect(order.subtotal).toBe(4.0);
    expect(order.discount).toBe(4.0); // clamped to subtotal
    expect(order.total).toBe(0.0);
  });

  it('advances order status and records history transitions', async () => {
    const orders = await adapter.getOrders();
    const order = orders[0];

    const accepted = await adapter.updateOrderStatus(
      order.id,
      'accepted',
      'Barista accepted ticket'
    );
    expect(accepted.status).toBe('accepted');
    expect(accepted.history[accepted.history.length - 1].status).toBe('accepted');
    expect(accepted.history[accepted.history.length - 1].note).toBe(
      'Barista accepted ticket'
    );

    const completed = await adapter.updateOrderStatus(
      order.id,
      'completed',
      'Picked up and finalized'
    );
    expect(completed.status).toBe('completed');
    expect(completed.paymentStatus).toBe('paid_at_pickup');
  });

  it('notifies subscribers on realtime events', async () => {
    const listener = vi.fn((event: RealtimeEvent) => event);
    const unsubscribe = adapter.subscribe(listener);

    const items = await adapter.getMenuItems();
    await adapter.toggleItemAvailability(items[0].id, false);

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'MENU_ITEM_TOGGLED',
        itemId: items[0].id,
        isAvailable: false,
      })
    );

    unsubscribe();
  });

  it('calculates store sales metrics accurately', async () => {
    const metrics = await adapter.getMetrics();
    expect(metrics.totalOrders).toBeGreaterThan(0);
    expect(metrics.grossRevenue).toBeGreaterThan(0);
    expect(metrics.averageOrderValue).toBeGreaterThan(0);
    expect(Array.isArray(metrics.topSellingItems)).toBe(true);
  });

  it('manages loyalty points earning and redemption accounts', async () => {
    const initialAccount = await adapter.getLoyaltyAccount();
    const initialBalance = initialAccount.balance;

    const newBalance = await adapter.earnPoints(25, 'ORD-TEST', 'Test earning');
    expect(newBalance).toBe(initialBalance + 25);

    const redeemResult = await adapter.redeemPoints(20, 'ORD-TEST');
    expect(redeemResult.success).toBe(true);
    expect(redeemResult.discountDollars).toBe(2.0);

    const finalAccount = await adapter.getLoyaltyAccount();
    expect(finalAccount.balance).toBe(initialBalance + 5);
  });
});
