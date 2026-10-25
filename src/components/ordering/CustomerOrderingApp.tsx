'use client';

import { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
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
import { AppNav } from '@/components/layout/AppNav';
import {
  Coffee,
  ShoppingBag,
  Clock,
  Sparkles,
  Plus,
  ChevronRight,
  CupSoda,
  GlassWater,
  Flame,
  Search,
} from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
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

      if (orders.length > 0) {
        setActiveOrder(orders[0]);
      }
    }
    loadClientData();

    const unsubscribe = orderService.subscribe((event) => {
      startTransition(async () => {
        if (event.type === 'ORDER_STATUS_CHANGED') {
          setActiveOrder((current) => {
            if (current && current.id === event.orderId) {
              return event.order;
            }
            return current;
          });
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Filter items by category & search
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      activeCategorySlug === 'all' || item.categorySlug === activeCategorySlug;
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Popular items for the showcase top carousel
  const popularItems = menuItems.filter((i) => i.isPopular);

  // Cart operations
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const handleAddToCart = (newItem: CartItem) => {
    setCart((prev) => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          const quantity = Math.max(1, newQty);
          return {
            ...item,
            quantity,
            lineTotal: item.unitPrice * quantity,
          };
        }
        return item;
      })
    );
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleOrderPlaced = async (newOrder: Order) => {
    setActiveOrder(newOrder);
    setIsCartOpen(false);
    const updatedLoyalty = await loyaltyService.getLoyaltyAccount();
    setLoyaltyAccount(updatedLoyalty);
  };

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'coffee':
        return <Coffee className="h-4 w-4" />;
      case 'non-coffee':
        return <CupSoda className="h-4 w-4" />;
      case 'frappe':
        return <GlassWater className="h-4 w-4" />;
      case 'tea':
        return <Flame className="h-4 w-4" />;
      default:
        return <Coffee className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#111827]">
      {/* Sub-header notification if there's an active order */}
      {activeOrder && activeOrder.status !== 'completed' && activeOrder.status !== 'cancelled' && (
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-4">
          <OrderLiveTracker
            order={activeOrder}
            onDismiss={() => setActiveOrder(null)}
          />
        </div>
      )}

      {/* Main Container */}
      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        {/* ========================================================= */}
        {/* HERO SECTION: "Good Coffee Better Days" (Showcase Screen 1) */}
        {/* ========================================================= */}
        <section className="relative overflow-hidden rounded-3xl bg-[#1C1815] text-white shadow-xl">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-[#3D2619]/40 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-8 px-6 py-10 sm:px-12 sm:py-16">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
                  Good Coffee
                  <br />
                  <span className="text-[#F3EFEA]">Better Days</span>
                </h1>
                <p className="text-sm sm:text-base text-[#D1D5DB] max-w-md font-normal leading-relaxed pt-1">
                  Freshly brewed. Made for you.
                </p>
              </div>

              <div>
                <a
                  href="#menu"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#FFFFFF] text-[#111827] text-sm font-semibold hover:bg-[#F3EFEA] transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Order Now
                </a>
              </div>
            </div>

            {/* Right Product Image Showcase */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative h-64 sm:h-80 w-64 sm:w-80 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 group">
                <Image
                  src="/images/hero-coffee.jpg"
                  alt="BrewFlow Iced Specialty Coffee"
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 256px, 320px"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3-PILL FEATURE STRIP (Order · Pickup · Earn Points)         */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8F3EE] text-[#133E2B]">
              <Coffee className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Order</h3>
              <p className="text-xs text-[#6B7280]">Your Favorites</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8F3EE] text-[#133E2B]">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Pickup</h3>
              <p className="text-xs text-[#6B7280]">At Your Convenience</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8F3EE] text-[#133E2B]">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Earn Points</h3>
              <p className="text-xs text-[#6B7280]">With Every Purchase</p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* POPULAR PICKS SECTION (Showcase Screen 1)                 */}
        {/* ========================================================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">
              Popular Picks
            </h2>
            <a
              href="#menu"
              className="flex items-center gap-1 text-xs font-semibold text-[#133E2B] hover:underline cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularItems.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="group flex flex-col justify-between rounded-3xl bg-[#FFFFFF] p-3.5 border border-[#E5E7EB] shadow-xs hover:shadow-md transition-all"
              >
                <div>
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#F3EFEA] mb-3">
                    <Image
                      src={item.imageUrl || '/images/iced-latte.jpg'}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <h3 className="text-sm font-bold text-[#111827] truncate">
                    {item.name}
                  </h3>
                </div>

                <div className="flex items-center justify-between mt-2 pt-1">
                  <span className="text-xs font-semibold text-[#6B7280]">
                    P{item.basePrice}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCustomizingItem(item)}
                    aria-label={`Customize ${item.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111827] hover:bg-[#133E2B] text-white shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* MENU BROWSING WITH CATEGORY SIDEBAR (Showcase Screen 2)     */}
        {/* ========================================================= */}
        <section id="menu" className="pt-6 space-y-6">
          {/* Search Bar & Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight text-[#111827]">
              Menu Browsing
            </h2>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
              <input
                id="search-catalog"
                type="text"
                placeholder="Search coffee or snacks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-[#E5E7EB] bg-white text-[#111827] placeholder-[#9CA3AF] focus:border-[#133E2B] focus:outline-hidden transition-colors"
              />
            </div>
          </div>

          {/* Main 2-Column Split: Category Navigation & Item List */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Category Sidebar / Pills */}
            <aside className="md:col-span-3 sticky top-20 z-20 space-y-1 bg-[#FFFFFF] p-2 rounded-2xl border border-[#E5E7EB] shadow-xs">
              <button
                type="button"
                onClick={() => setActiveCategorySlug('all')}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                  activeCategorySlug === 'all'
                    ? 'bg-[#133E2B] text-white'
                    : 'text-[#4B5563] hover:bg-[#F3EFEA]'
                }`}
              >
                <span>All</span>
              </button>

              {categories.map((cat) => {
                const isActive = activeCategorySlug === cat.slug;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategorySlug(cat.slug)}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-[#133E2B] text-white'
                        : 'text-[#4B5563] hover:bg-[#F3EFEA]'
                    }`}
                  >
                    {getCategoryIcon(cat.slug)}
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </aside>

            {/* Right Item List Rows (Matches Screen 2) */}
            <div className="md:col-span-9 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
                <h3 className="text-base font-bold text-[#111827] capitalize">
                  {activeCategorySlug === 'all' ? 'All Items' : activeCategorySlug.replace('-', ' ')}
                </h3>
                <span className="text-xs text-[#6B7280]">
                  {filteredItems.length} available
                </span>
              </div>

              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#D1D5DB] hover:shadow-xs transition-all"
                  >
                    {/* Thumbnail & Text Info */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F3EFEA]">
                        <Image
                          src={item.imageUrl || '/images/iced-latte.jpg'}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[#111827] truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-[#6B7280] truncate mt-0.5 max-w-md">
                          {item.description}
                        </p>
                        <div className="text-xs font-bold text-[#111827] mt-1">
                          P{item.basePrice}
                        </div>
                      </div>
                    </div>

                    {/* Circular Add Button */}
                    <button
                      type="button"
                      onClick={() => setCustomizingItem(item)}
                      aria-label={`Customize ${item.name}`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#111827] hover:bg-[#133E2B] text-white shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Cart Button on mobile */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-6 right-6 z-40 md:hidden">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#133E2B] text-white font-semibold text-xs shadow-xl active:scale-95 transition-transform cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Cart ({cartItemCount}) • P{cart.reduce((s, i) => s + i.lineTotal, 0)}</span>
          </button>
        </div>
      )}

      {/* Drink Customization Modal (Screen 3) */}
      {customizingItem && (
        <DrinkCustomizerModal
          item={customizingItem}
          onClose={() => setCustomizingItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Cart & Checkout Sheet (Screen 4) */}
      {isCartOpen && (
        <CartCheckoutSheet
          cart={cart}
          loyaltyBalance={loyaltyAccount.balance}
          onClose={() => setIsCartOpen(false)}
          onRemoveItem={handleRemoveFromCart}
          onUpdateQuantity={handleUpdateQuantity}
          onClearCart={handleClearCart}
          onOrderPlaced={handleOrderPlaced}
        />
      )}
    </div>
  );
}
