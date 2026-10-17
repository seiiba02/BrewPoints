'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  MenuCategory,
  MenuItem,
  CartItem,
  Order,
  LoyaltyAccount,
} from '@/lib/domain/types';
import {
  menuService,
  orderService,
  loyaltyService,
} from '@/lib/services/brewflowService';
import { DrinkCustomizerModal } from './DrinkCustomizerModal';
import { CartCheckoutSheet } from './CartCheckoutSheet';
import { OrderLiveTracker } from './OrderLiveTracker';
import { ShoppingBag, Sparkles, Check, AlertCircle } from 'lucide-react';
import { computeSpecimenAxes } from '@/lib/design-tokens';

interface CustomerOrderingAppProps {
  initialCategories: MenuCategory[];
  initialMenuItems: MenuItem[];
  initialLoyalty: LoyaltyAccount;
}

export function CustomerOrderingApp({
  initialCategories,
  initialMenuItems,
  initialLoyalty,
}: CustomerOrderingAppProps) {
  const [categories, setCategories] = useState<MenuCategory[]>(initialCategories);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loyaltyAccount, setLoyaltyAccount] = useState<LoyaltyAccount>(initialLoyalty);

  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [, startTransition] = useTransition();

  // Load from local storage on client mount and subscribe to real-time events
  useEffect(() => {
    async function loadClientData() {
      const [cats, items, loyalty, orders] = await Promise.all([
        menuService.getCategories(),
        menuService.getMenuItems(),
        loyaltyService.getLoyaltyAccount(),
        orderService.getOrders('active'),
      ]);
      setCategories(cats);
      setMenuItems(items);
      setLoyaltyAccount(loyalty);

      // Restore active order if one exists
      if (orders.length > 0) {
        setActiveOrder(orders[0]);
      }
    }
    loadClientData();

    // Subscribe to cross-tab BroadcastChannel events
    const unsubscribe = orderService.subscribe((event) => {
      startTransition(async () => {
        if (event.type === 'MENU_ITEM_TOGGLED') {
          setMenuItems((prev) =>
            prev.map((item) =>
              item.id === event.itemId
                ? { ...item, isAvailable: event.isAvailable }
                : item
            )
          );
        } else if (event.type === 'MENU_ITEM_UPDATED') {
          setMenuItems((prev) => {
            const index = prev.findIndex((i) => i.id === event.item.id);
            if (index >= 0) {
              const next = [...prev];
              next[index] = event.item;
              return next;
            }
            return [...prev, event.item];
          });
        } else if (event.type === 'ORDER_STATUS_CHANGED') {
          setActiveOrder((current) => {
            if (current && current.id === event.orderId) {
              return event.order;
            }
            return current;
          });
        } else if (event.type === 'STORE_RESET') {
          const [cats, items, loyalty, activeOrders] = await Promise.all([
            menuService.getCategories(),
            menuService.getMenuItems(),
            loyaltyService.getLoyaltyAccount(),
            orderService.getOrders('active'),
          ]);
          setCategories(cats);
          setMenuItems(items);
          setLoyaltyAccount(loyalty);
          setActiveOrder(activeOrders[0] || null);
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Filter items by category
  const displayedItems =
    activeCategorySlug === 'all'
      ? menuItems
      : menuItems.filter((i) => i.categorySlug === activeCategorySlug);

  // Cart calculations
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);
  const cartFontAxes = computeSpecimenAxes(cartSubtotal, 40);

  const handleAddToCart = (newItem: CartItem) => {
    setCart((prev) => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleOrderPlaced = async (newOrder: Order) => {
    setActiveOrder(newOrder);
    setIsCartOpen(false);
    // Refresh loyalty balance
    const updatedLoyalty = await loyaltyService.getLoyaltyAccount();
    setLoyaltyAccount(updatedLoyalty);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#111110] pb-28 md:pb-20">
      {/* Editorial Hero Header */}
      <section className="border-b border-[#D4D0C5] bg-[#FFFFFF] px-4 md:px-8 py-8 md:py-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 font-mono text-xs text-[#4A4843]">
                <span className="h-2 w-2 bg-[#E02E24] inline-block" />
                <span>ROASTERY & BOTANICAL BAR</span>
                <span aria-hidden="true">·</span>
                <span>IN-STORE COUNTER PICKUP</span>
              </div>
              <h1
                className="text-3xl md:text-5xl font-bold tracking-tight text-[#111110]"
                style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
              >
                BrewFlow Espresso Foundry
              </h1>
              <p className="mt-2 text-sm text-[#4A4843] max-w-xl leading-relaxed">
                Single-origin pour-overs, nitro cold taps, and artisanal viennoiserie. Place your order online, skip the wait, and settle at the counter upon collection.
              </p>
            </div>

            {/* Loyalty Pill Banner */}
            <div className="flex items-center gap-3 border border-[#111110] bg-[#F8F6F0] p-3 text-xs font-mono">
              <Sparkles className="h-4 w-4 text-[#E02E24]" />
              <div>
                <span className="text-[#4A4843] block">YOUR LOYALTY BALANCE</span>
                <span className="text-sm font-bold text-[#111110]">
                  {loyaltyAccount.balance} PTS
                </span>
              </div>
              <span className="text-xs text-[#15803D] font-bold border-l border-[#D4D0C5] pl-3">
                $1.00 = 1 PT
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="mx-auto max-w-[1440px] px-4 md:px-8 py-6 space-y-8">
        {/* Active Order Live Tracker (if active order exists) */}
        {activeOrder && activeOrder.status !== 'completed' && activeOrder.status !== 'cancelled' && (
          <div className="mb-6">
            <OrderLiveTracker
              order={activeOrder}
              onDismiss={() => setActiveOrder(null)}
            />
          </div>
        )}

        {/* Sticky Category Tab Navigation */}
        <div className="sticky top-16 z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-3 bg-[#F8F6F0]/95 backdrop-blur-xs border-b border-[#D4D0C5]">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveCategorySlug('all')}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                activeCategorySlug === 'all'
                  ? 'border-[#111110] bg-[#111110] text-[#F8F6F0]'
                  : 'border-[#D4D0C5] bg-[#FFFFFF] text-[#4A4843] hover:border-[#111110] hover:text-[#111110]'
              }`}
            >
              All Items ({menuItems.length})
            </button>
            {categories.map((cat) => {
              const count = menuItems.filter((i) => i.categorySlug === cat.slug).length;
              const isActive = activeCategorySlug === cat.slug;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategorySlug(cat.slug)}
                  className={`px-4 py-2 text-xs font-mono uppercase tracking-wider font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                    isActive
                      ? 'border-[#111110] bg-[#111110] text-[#F8F6F0]'
                      : 'border-[#D4D0C5] bg-[#FFFFFF] text-[#4A4843] hover:border-[#111110] hover:text-[#111110]'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Catalog Grid */}
        <section aria-label="Menu Catalog">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedItems.map((item) => (
              <div
                key={item.id}
                className={`flex flex-col justify-between border bg-[#FFFFFF] p-5 transition-colors ${
                  item.isAvailable
                    ? 'border-[#D4D0C5] hover:border-[#111110]'
                    : 'border-[#EFECE3] bg-[#F8F6F0] opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs uppercase px-1.5 py-0.5 bg-[#EFECE3] text-[#4A4843] border border-[#D4D0C5]">
                        {item.categorySlug.replace('-', ' ')}
                      </span>
                      {item.isPopular && item.isAvailable && (
                        <span className="font-mono text-xs uppercase px-1.5 py-0.5 bg-[#DCFCE7] text-[#15803D] font-bold border border-[#15803D]">
                          Popular
                        </span>
                      )}
                      {!item.isAvailable && (
                        <span className="font-mono text-xs uppercase px-1.5 py-0.5 bg-[#FDF2F2] text-[#E02E24] font-bold border border-[#E02E24] flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Sold Out (86&apos;d)
                        </span>
                      )}
                    </div>

                    <span className="font-mono text-sm font-bold tabular-nums text-[#111110]">
                      ${item.basePrice.toFixed(2)}
                    </span>
                  </div>

                  <h3
                    className="text-lg font-bold text-[#111110] tracking-tight"
                    style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                  >
                    {item.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-[#4A4843] leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#D4D0C5] flex items-center justify-between">
                  <span className="font-mono text-xs text-[#4A4843]">
                    {item.customizationGroups.length} options
                  </span>

                  <button
                    type="button"
                    disabled={!item.isAvailable}
                    onClick={() => setCustomizingItem(item)}
                    className={`px-4 py-2 text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                      item.isAvailable
                        ? 'bg-[#111110] text-[#F8F6F0] hover:bg-[#E02E24]'
                        : 'bg-[#D4D0C5] text-[#4A4843] cursor-not-allowed'
                    }`}
                  >
                    {item.isAvailable ? 'Customize & Add' : 'Temporarily Unavailable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Floating Sticky Cart Pill (Thumb Zone) */}
      {cartItemCount > 0 && (
        <aside
          aria-label="Active order drawer"
          className="fixed bottom-4 inset-x-4 md:inset-x-auto md:right-8 md:w-96 z-40"
        >
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full flex items-center justify-between p-3.5 bg-[#111110] text-[#F8F6F0] border border-[#2C2B29] shadow-2xl hover:bg-[#1A1918] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center bg-[#E02E24] text-[#F8F6F0]">
                <ShoppingBag className="h-4 w-4" />
              </span>
              <div className="text-left font-mono">
                <span className="text-xs font-bold block">
                  {cartItemCount} {cartItemCount === 1 ? 'ITEM' : 'ITEMS'} IN TRAY
                </span>
                <span className="text-xs text-[#D4D0C5]">Tap to review & checkout</span>
              </div>
            </div>

            <span
              className="text-lg font-bold tabular-nums pr-2"
              style={{
                fontFamily: 'var(--font-fraunces), Georgia, serif',
                fontVariationSettings: cartFontAxes.fontVariationSettings,
              }}
            >
              ${cartSubtotal.toFixed(2)}
            </span>
          </button>
        </aside>
      )}

      {/* Customizer Modal */}
      {customizingItem && (
        <DrinkCustomizerModal
          item={customizingItem}
          onClose={() => setCustomizingItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Cart & Checkout Sheet */}
      {isCartOpen && (
        <CartCheckoutSheet
          cart={cart}
          loyaltyBalance={loyaltyAccount.balance}
          onClose={() => setIsCartOpen(false)}
          onRemoveItem={handleRemoveFromCart}
          onClearCart={handleClearCart}
          onOrderPlaced={handleOrderPlaced}
        />
      )}
    </div>
  );
}
