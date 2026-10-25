'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  INITIAL_HISTORY,
  PESOS_PER_POINT,
  SERVICE_FEE,
  findProduct,
  unitPrice,
  type MilkId,
  type PastOrder,
  type Reward,
  type SizeId,
} from './mobileData';

export type MobileScreen =
  | 'splash'
  | 'auth'
  | 'home'
  | 'menu'
  | 'product'
  | 'customize'
  | 'cart'
  | 'checkout'
  | 'tracking'
  | 'completed'
  | 'rewards'
  | 'history'
  | 'profile';

export interface CartLine {
  key: string;
  productId: string;
  size: SizeId;
  milk: MilkId;
  addons: string[];
  qty: number;
}

/** 0 Received · 1 Preparing · 2 Ready · 3 Completed */
export type OrderStage = 0 | 1 | 2 | 3;

export interface ActiveOrder {
  number: number;
  stage: OrderStage;
  lines: CartLine[];
  total: number;
  pointsEarned: number;
  placedAt: string;
  preparingAt: string;
}

export interface Voucher {
  id: string;
  rewardName: string;
  code: string;
}

export type PickupOption = 'store' | 'takeaway';
export type PaymentMethod = 'cash' | 'gcash';

const INITIAL_CART: CartLine[] = [
  { key: 'seed-1', productId: 'iced-latte', size: 'Medium', milk: 'Whole Milk', addons: [], qty: 1 },
  { key: 'seed-2', productId: 'blueberry-muffin', size: 'Medium', milk: 'Whole Milk', addons: [], qty: 1 },
];

export function lineTotal(line: CartLine): number {
  return unitPrice(findProduct(line.productId), line.size, line.addons) * line.qty;
}

export function lineSummary(line: CartLine): string {
  const product = findProduct(line.productId);
  if (!product.customizable) return product.description;
  return [line.size, line.milk, ...line.addons].join(' · ');
}

function subtotalOf(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + lineTotal(l), 0);
}

function clockTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

const SEED_ORDER: ActiveOrder = {
  number: 1024,
  stage: 1,
  lines: INITIAL_CART,
  total: subtotalOf(INITIAL_CART) + SERVICE_FEE,
  pointsEarned: Math.floor((subtotalOf(INITIAL_CART) + SERVICE_FEE) / PESOS_PER_POINT),
  placedAt: '9:42 AM',
  preparingAt: '9:46 AM',
};

function useMobileAppState(autoAdvance: boolean) {
  const [screen, setScreen] = useState<MobileScreen>('home');
  const [points, setPoints] = useState(120);
  const [favorites, setFavorites] = useState<string[]>(['iced-latte']);

  // Drink being viewed / customized
  const [productId, setProductId] = useState('iced-latte');
  const [size, setSize] = useState<SizeId>('Medium');
  const [milk, setMilk] = useState<MilkId>('Whole Milk');
  const [addons, setAddons] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  /** Set when the customizer is editing an existing cart line. */
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const [cart, setCart] = useState<CartLine[]>(INITIAL_CART);
  const [pickup, setPickup] = useState<PickupOption>('store');
  const [payment, setPayment] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');

  const [order, setOrder] = useState<ActiveOrder>(SEED_ORDER);
  const [nextOrderNumber, setNextOrderNumber] = useState(1024);
  const [history, setHistory] = useState<PastOrder[]>(INITIAL_HISTORY);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  const subtotal = subtotalOf(cart);
  const total = cart.length > 0 ? subtotal + SERVICE_FEE : 0;
  const cartCount = cart.reduce((n, l) => n + l.qty, 0);
  const draftUnitPrice = unitPrice(findProduct(productId), size, addons);

  const openProduct = useCallback((id: string) => {
    setEditingKey(null);
    setProductId(id);
    setSize('Medium');
    setMilk('Whole Milk');
    setAddons([]);
    setQty(1);
    setScreen('product');
  }, []);

  const editLine = useCallback((line: CartLine) => {
    setEditingKey(line.key);
    setProductId(line.productId);
    setSize(line.size);
    setMilk(line.milk);
    setAddons(line.addons);
    setQty(line.qty);
    setScreen('customize');
  }, []);

  const toggleAddon = useCallback((id: string) => {
    setAddons((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  }, []);

  const addDraftToCart = useCallback(() => {
    if (editingKey) {
      setCart((prev) =>
        prev.map((l) => (l.key === editingKey ? { ...l, productId, size, milk, addons, qty } : l))
      );
      setEditingKey(null);
      setScreen('cart');
      return;
    }
    setCart((prev) => {
      const sameConfig = prev.find(
        (l) =>
          l.productId === productId &&
          l.size === size &&
          l.milk === milk &&
          l.addons.length === addons.length &&
          l.addons.every((a) => addons.includes(a))
      );
      if (sameConfig) {
        return prev.map((l) => (l === sameConfig ? { ...l, qty: l.qty + qty } : l));
      }
      return [...prev, { key: `${productId}-${Date.now()}`, productId, size, milk, addons, qty }];
    });
    setScreen('cart');
  }, [editingKey, productId, size, milk, addons, qty]);

  const changeLineQty = useCallback((key: string, delta: number) => {
    setCart((prev) =>
      prev.map((l) => (l.key === key ? { ...l, qty: Math.max(1, l.qty + delta) } : l))
    );
  }, []);

  const removeLine = useCallback((key: string) => {
    setCart((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const placeOrder = useCallback(() => {
    if (cart.length === 0) return;
    const now = new Date();
    setOrder({
      number: nextOrderNumber,
      stage: 1,
      lines: cart,
      total,
      pointsEarned: Math.floor(total / PESOS_PER_POINT),
      placedAt: clockTime(now),
      preparingAt: clockTime(now),
    });
    setNextOrderNumber((n) => n + 1);
    setCart([]);
    setNotes('');
    setScreen('tracking');
  }, [cart, total, nextOrderNumber]);

  const redeem = useCallback(
    (reward: Reward) => {
      if (points < reward.points) return;
      setPoints((p) => p - reward.points);
      setVouchers((prev) => [
        {
          id: `${reward.id}-${Date.now()}`,
          rewardName: reward.name,
          code: `BF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        },
        ...prev,
      ]);
    },
    [points]
  );

  // In the interactive phone, a placed order moves itself to "Ready" so the
  // tracking → completed hand-off can be seen without a staff device.
  useEffect(() => {
    if (!autoAdvance || screen !== 'tracking' || order.stage !== 1) return;
    const readyTimer = setTimeout(() => {
      setOrder((o) => ({ ...o, stage: 2 }));
      setPoints((p) => p + order.pointsEarned);
      setHistory((prev) => [
        {
          number: order.number,
          placedAt: `Oct 25, 2026 · ${order.placedAt}`,
          total: order.total,
          status: 'Completed',
        },
        ...prev.filter((h) => h.number !== order.number),
      ]);
    }, 6000);
    return () => clearTimeout(readyTimer);
  }, [autoAdvance, screen, order]);

  useEffect(() => {
    if (!autoAdvance || screen !== 'tracking' || order.stage !== 2) return;
    const completedTimer = setTimeout(() => setScreen('completed'), 1500);
    return () => clearTimeout(completedTimer);
  }, [autoAdvance, screen, order.stage]);

  return {
    screen,
    navigate: setScreen,
    points,
    favorites,
    toggleFavorite,
    product: findProduct(productId),
    size,
    setSize,
    milk,
    setMilk,
    addons,
    toggleAddon,
    qty,
    setQty,
    draftUnitPrice,
    editingKey,
    openProduct,
    editLine,
    addDraftToCart,
    cart,
    cartCount,
    subtotal,
    total,
    changeLineQty,
    removeLine,
    pickup,
    setPickup,
    payment,
    setPayment,
    notes,
    setNotes,
    order,
    placeOrder,
    history,
    vouchers,
    redeem,
  };
}

export type MobileAppState = ReturnType<typeof useMobileAppState>;

const MobileAppContext = createContext<MobileAppState | null>(null);

export function MobileAppProvider({
  autoAdvance,
  children,
}: {
  autoAdvance: boolean;
  children: React.ReactNode;
}) {
  const state = useMobileAppState(autoAdvance);
  return <MobileAppContext.Provider value={state}>{children}</MobileAppContext.Provider>;
}

export function useMobileApp(): MobileAppState {
  const ctx = useContext(MobileAppContext);
  if (!ctx) throw new Error('useMobileApp must be used inside <MobileAppProvider>');
  return ctx;
}
