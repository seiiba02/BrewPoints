'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Bell,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Coins,
  CreditCard,
  Gift,
  Heart,
  LogOut,
  Mail,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Ticket,
  Trash2,
  User,
} from 'lucide-react';
import {
  lineSummary,
  lineTotal,
  useMobileApp,
  type MobileScreen,
  type OrderStage,
} from './MobileAppContext';
import {
  ADDONS,
  CATEGORIES,
  FEATURED_IDS,
  MILKS,
  PRODUCTS,
  REWARDS,
  SERVICE_FEE,
  SIZES,
  findProduct,
  peso,
  type MenuCategory,
  type Product,
} from './mobileData';
import {
  BottomNav,
  C,
  CheckRow,
  GoogleMark,
  LeafMark,
  OptionTile,
  PrimaryButton,
  Screen,
  SecondaryButton,
  StatusBar,
  SectionLabel,
  SegmentedTabs,
  Stepper,
  Thumb,
  TopBar,
} from './MobileUI';

/* ===================================================================== */
/* 1. SPLASH                                                             */
/* ===================================================================== */
function SplashScreen() {
  const { navigate } = useMobileApp();
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#1C1612] text-white">
      <Image src="/images/hero-coffee.jpg" alt="" fill sizes="320px" className="object-cover" priority />
      <div className="absolute inset-0 bg-linear-to-b from-[#2A1D14]/85 via-[#2A1D14]/30 to-[#120D0A]/95" />
      <div className="relative z-10 flex h-full flex-col">
        <StatusBar tone="light" />
        <div className="flex flex-col items-center pt-14 text-center">
          <LeafMark className="h-11 w-11" color="#FFFFFF" />
          <div className="mt-2 text-[28px] font-semibold tracking-tight">BrewFlow</div>
          <div className="text-[12px] text-white/75">Good Coffee. Better Days.</div>
        </div>
        <div className="mt-auto space-y-3 px-6 pb-10">
          <PrimaryButton onClick={() => navigate('auth')}>Get Started</PrimaryButton>
          <p className="mx-auto text-center text-[11px] text-white/70">
            Already have an account?{' '}
            <button onClick={() => navigate('auth')} className="font-semibold text-white underline-offset-2 hover:underline">
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================== */
/* 2. SIGN UP / LOG IN                                                   */
/* ===================================================================== */
function AuthScreen() {
  const { navigate } = useMobileApp();
  return (
    <Screen>
      <div className="relative flex min-h-full flex-col px-6 pb-8">
        <div className="flex flex-col items-center pt-12 text-center">
          <LeafMark className="h-11 w-11" />
          <div className="mt-2 text-[26px] font-semibold tracking-tight" style={{ color: C.ink }}>
            BrewFlow
          </div>
          <div className="text-[12px]" style={{ color: C.muted }}>
            Good Coffee. Better Days.
          </div>
        </div>

        <div className="mt-12 space-y-3">
          <AuthButton icon={<GoogleMark />} label="Continue with Google" onClick={() => navigate('home')} />
          <AuthButton icon={<Mail className="h-4 w-4" />} label="Continue with Email" onClick={() => navigate('home')} />
          <div className="flex items-center gap-3 py-1 text-[11px]" style={{ color: C.muted }}>
            <span className="h-px flex-1" style={{ background: C.border }} />
            or
            <span className="h-px flex-1" style={{ background: C.border }} />
          </div>
          <button
            onClick={() => navigate('home')}
            className="w-full py-1 text-center text-[12px] font-medium underline-offset-2 hover:underline"
            style={{ color: C.ink }}
          >
            Use Magic Link (Email)
          </button>
        </div>

        <p className="relative z-10 mx-auto mt-auto pt-10 text-center text-[11px]" style={{ color: C.muted }}>
          Already have an account?{' '}
          <button onClick={() => navigate('home')} className="font-semibold" style={{ color: C.green }}>
            Log in
          </button>
        </p>

        {/* Decorative foliage, as in the brand board */}
        <svg viewBox="0 0 120 160" className="pointer-events-none absolute -right-6 bottom-0 h-40 w-28 opacity-25" aria-hidden="true">
          <path d="M70 160C72 110 60 60 30 20" stroke={C.green} strokeWidth="2" fill="none" />
          {[30, 55, 80, 105].map((y, i) => (
            <g key={y}>
              <path d={`M${66 - i * 4} ${y + 40}c-22-4-34-16-38-34 20 2 34 14 38 34z`} fill={C.green} />
              <path d={`M${68 - i * 4} ${y + 30}c18-8 26-22 26-40-18 6-26 20-26 40z`} fill={C.green} />
            </g>
          ))}
        </svg>
      </div>
    </Screen>
  );
}

function AuthButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2.5 rounded-xl border bg-white py-3 text-[12px] font-medium shadow-xs transition-colors hover:bg-[#F7F4EE]"
      style={{ borderColor: C.border }}
    >
      {icon}
      {label}
    </button>
  );
}

/* ===================================================================== */
/* 3. HOME                                                               */
/* ===================================================================== */
function HomeScreen() {
  const { navigate, openProduct } = useMobileApp();
  const quickActions: { label: string; icon: typeof Gift; to: MobileScreen }[] = [
    { label: 'Menu', icon: BookOpen, to: 'menu' },
    { label: 'Rewards', icon: Gift, to: 'rewards' },
    { label: 'Order History', icon: ClipboardList, to: 'history' },
    { label: 'Profile', icon: User, to: 'profile' },
  ];

  return (
    <Screen
      footer={<BottomNav active="home" />}
      header={
        <div className="flex h-11 shrink-0 items-center justify-between px-5">
          <span className="text-[16px] font-semibold tracking-tight">BrewFlow</span>
          <div className="flex items-center gap-2.5">
            <button aria-label="Notifications" className="relative">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#D9731F]" />
            </button>
            <button
              onClick={() => navigate('profile')}
              aria-label="Profile"
              className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-white"
              style={{ background: '#8B6A4E' }}
            >
              AS
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 px-5 pb-5 pt-1">
        {/* Hero */}
        <div className="relative h-[150px] overflow-hidden rounded-2xl bg-[#2A1D14] text-white">
          <Image src="/images/hero-coffee.jpg" alt="" fill sizes="300px" className="object-cover object-right" />
          <div className="absolute inset-0 bg-linear-to-r from-[#1E150F] via-[#1E150F]/80 to-transparent" />
          <div className="relative flex h-full flex-col justify-center p-4">
            <div className="text-[19px] font-semibold leading-tight">
              Good Coffee
              <br />
              Better Days
            </div>
            <div className="mt-1 text-[10px] text-white/75">Freshly brewed. Made for you.</div>
            <button
              onClick={() => navigate('menu')}
              className="mt-3 w-fit rounded-full bg-white px-3.5 py-1.5 text-[10px] font-semibold"
              style={{ color: C.ink }}
            >
              Order Now
            </button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map(({ label, icon: Icon, to }) => (
            <button key={label} onClick={() => navigate(to)} className="flex flex-col items-center gap-1.5">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-xl border bg-white transition-colors hover:border-[#133E2B]"
                style={{ borderColor: C.border, color: C.green }}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </span>
              <span className="text-[10px] leading-tight" style={{ color: C.muted }}>
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* Featured */}
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="text-[14px] font-semibold">Featured</h3>
            <button onClick={() => navigate('menu')} className="flex items-center text-[11px] font-medium" style={{ color: C.muted }}>
              View All <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {FEATURED_IDS.map((id) => {
              const p = findProduct(id);
              return (
                <button key={id} onClick={() => openProduct(id)} className="text-left">
                  <Thumb src={p.image} alt={p.name} className="aspect-square w-full rounded-xl" />
                  <div className="mt-1.5 truncate text-[11px] font-medium">{p.name}</div>
                  <div className="text-[11px]" style={{ color: C.muted }}>
                    {peso(p.price)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Earn points banner */}
        <div className="relative h-[92px] overflow-hidden rounded-2xl text-white" style={{ background: C.green }}>
          <div className="absolute inset-y-0 right-0 w-1/2">
            <Image src="/images/caramel-macchiato.jpg" alt="" fill sizes="160px" className="object-cover" />
            <div className="absolute inset-0 bg-linear-to-r from-[#133E2B] to-transparent" />
          </div>
          <div className="relative flex h-full flex-col justify-center p-4">
            <div className="text-[14px] font-semibold leading-tight">Earn Points</div>
            <div className="text-[10px] text-white/75">with Every Purchase</div>
            <button
              onClick={() => navigate('rewards')}
              className="mt-2 w-fit rounded-full bg-white px-3 py-1 text-[10px] font-semibold"
              style={{ color: C.green }}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </Screen>
  );
}

/* ===================================================================== */
/* 4. MENU BROWSING                                                      */
/* ===================================================================== */
const SECTION_TITLES: Record<MenuCategory, string> = {
  coffee: 'Coffee',
  'non-coffee': 'Non-Coffee',
  tea: 'Tea',
  pastries: 'Pastries',
};

function MenuScreen() {
  const { openProduct, navigate, cartCount } = useMobileApp();
  const [category, setCategory] = useState<MenuCategory | 'all'>('all');
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const visible = PRODUCTS.filter(
    (p) => (category === 'all' || p.category === category) && (!q || p.name.toLowerCase().includes(q))
  );
  const sections = (Object.keys(SECTION_TITLES) as MenuCategory[])
    .map((cat) => ({ cat, items: visible.filter((p) => p.category === cat) }))
    .filter((s) => s.items.length > 0);

  return (
    <Screen
      footer={<BottomNav active="menu" />}
      header={
        <div className="shrink-0 space-y-3 px-4 pb-3">
          <TopBar
            title="Menu"
            back="home"
            right={
              <button onClick={() => navigate('cart')} aria-label="Cart" className="relative p-1">
                <ShoppingBag className="h-[18px] w-[18px]" />
                {cartCount > 0 && (
                  <span
                    className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-0.5 text-[8px] font-bold text-white"
                    style={{ background: C.green }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            }
          />
          <label className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: '#F4F1EB' }}>
            <Search className="h-3.5 w-3.5" style={{ color: C.muted }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search drinks..."
              className="w-full bg-transparent text-[12px] outline-none placeholder:text-[#A39D93]"
            />
          </label>
          <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
            {CATEGORIES.map((c) => {
              const active = c.id === category;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className="whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors"
                  style={{ background: active ? C.green : 'transparent', color: active ? '#FFF' : C.muted }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      }
    >
      <div className="space-y-4 px-4 pb-5">
        {sections.length === 0 && (
          <div className="py-16 text-center text-[12px]" style={{ color: C.muted }}>
            {q ? `No drinks match “${query}”.` : 'Nothing here yet. Check back soon.'}
          </div>
        )}
        {sections.map(({ cat, items }) => (
          <div key={cat}>
            <h3 className="mb-1 text-[13px] font-semibold">{SECTION_TITLES[cat]}</h3>
            <div className="divide-y" style={{ borderColor: C.border }}>
              {items.map((p) => (
                <MenuRow key={p.id} product={p} onOpen={() => openProduct(p.id)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
}

function MenuRow({ product, onOpen }: { product: Product; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="flex w-full items-center gap-3 py-2.5 text-left" style={{ borderColor: C.border }}>
      <Thumb src={product.image} alt={product.name} className="h-12 w-12 rounded-lg" />
      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-medium">{product.name}</div>
        <div className="truncate text-[10px]" style={{ color: C.muted }}>
          {product.description}
        </div>
        <div className="mt-0.5 text-[11px] font-medium">{peso(product.price)}</div>
      </div>
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white" style={{ background: C.green }}>
        <Plus className="h-3.5 w-3.5" strokeWidth={2.6} />
      </span>
    </button>
  );
}

/* ===================================================================== */
/* 5. PRODUCT DETAILS                                                    */
/* ===================================================================== */
function DrinkOptions() {
  const { product, size, setSize, milk, setMilk, addons, toggleAddon } = useMobileApp();
  if (!product.customizable) return null;
  return (
    <div className="space-y-4">
      <div>
        <SectionLabel>Size</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {SIZES.map((s) => (
            <OptionTile key={s.id} selected={size === s.id} onClick={() => setSize(s.id)} label={s.id} sub={peso(product.price + s.delta)} />
          ))}
        </div>
      </div>
      <div>
        <SectionLabel>Milk</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {MILKS.map((m) => (
            <OptionTile key={m} selected={milk === m} onClick={() => setMilk(m)} label={m} />
          ))}
        </div>
      </div>
      <div>
        <SectionLabel>Add-ons</SectionLabel>
        {ADDONS.map((a) => (
          <CheckRow key={a.id} checked={addons.includes(a.id)} onClick={() => toggleAddon(a.id)} label={a.id} trailing={`+${peso(a.price)}`} />
        ))}
      </div>
    </div>
  );
}

function ProductScreen() {
  const { product, navigate, favorites, toggleFavorite, qty, setQty, draftUnitPrice, addDraftToCart } = useMobileApp();
  const isFavorite = favorites.includes(product.id);
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-white" style={{ color: C.ink }}>
      <div className="relative h-[40%] shrink-0 bg-[#E9E1D6]">
        <Image src={product.image} alt={product.name} fill sizes="320px" className="object-cover" />
        <div className="absolute inset-x-0 top-0 h-20 bg-linear-to-b from-black/30 to-transparent" />
        <div className="absolute inset-x-0 top-0">
          <StatusBar tone="light" />
          <div className="flex items-center justify-between px-4">
            <button
              onClick={() => navigate('menu')}
              aria-label="Back"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/85 backdrop-blur"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => toggleFavorite(product.id)}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={isFavorite}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/85 backdrop-blur"
            >
              <Heart className="h-4 w-4" style={{ color: '#C2412D' }} fill={isFavorite ? '#C2412D' : 'none'} />
            </button>
          </div>
        </div>
      </div>

      <div className="relative -mt-5 min-h-0 flex-1 overflow-y-auto rounded-t-3xl bg-white px-5 pb-4 pt-5 [scrollbar-width:none]">
        <h2 className="text-[18px] font-semibold">{product.name}</h2>
        <div className="text-[15px] font-semibold" style={{ color: C.green }}>
          {peso(product.price)}
        </div>
        <p className="mb-4 mt-1 text-[11px]" style={{ color: C.muted }}>
          {product.description}
        </p>
        <DrinkOptions />
      </div>

      <div className="flex shrink-0 items-center gap-3 border-t px-5 pb-6 pt-3" style={{ borderColor: C.border }}>
        <Stepper value={qty} onChange={setQty} />
        <PrimaryButton onClick={addDraftToCart}>Add to Cart {peso(draftUnitPrice * qty)}</PrimaryButton>
      </div>
    </div>
  );
}

/* ===================================================================== */
/* 6. CUSTOMIZATION (review / edit a cart item)                          */
/* ===================================================================== */
function CustomizeScreen() {
  const { product, size, milk, addons, qty, draftUnitPrice, addDraftToCart, editingKey, removeLine, navigate } = useMobileApp();
  const summary = product.customizable ? [size, milk, ...addons].join(' · ') : product.description;

  const discard = () => {
    if (editingKey) removeLine(editingKey);
    navigate(editingKey ? 'cart' : 'menu');
  };

  return (
    <Screen
      header={<TopBar title="Customize Your Drink" back={editingKey ? 'cart' : 'product'} />}
      footer={
        <div className="shrink-0 px-5 pb-6 pt-3">
          <PrimaryButton onClick={addDraftToCart}>
            {editingKey ? 'Update Cart' : 'Add to Cart'} {peso(draftUnitPrice * qty)}
          </PrimaryButton>
        </div>
      }
    >
      <div className="space-y-5 px-5 pb-4 pt-2">
        <div className="flex items-start gap-3 rounded-2xl border p-3" style={{ borderColor: C.border }}>
          <Thumb src={product.image} alt={product.name} className="h-16 w-16 rounded-xl" />
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold">{product.name}</div>
            <div className="text-[10px] leading-snug" style={{ color: C.muted }}>
              {summary}
            </div>
            <div className="mt-1 text-[12px] font-semibold">
              {peso(draftUnitPrice)}
              {qty > 1 && <span className="font-normal" style={{ color: C.muted }}> × {qty}</span>}
            </div>
          </div>
          <button onClick={discard} aria-label="Remove item" className="p-1" style={{ color: C.muted }}>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <DrinkOptions />
      </div>
    </Screen>
  );
}

/* ===================================================================== */
/* 7. CART                                                               */
/* ===================================================================== */
function CartScreen() {
  const { cart, subtotal, total, changeLineQty, removeLine, editLine, navigate } = useMobileApp();
  return (
    <Screen
      header={<TopBar title="Your Cart" back="menu" />}
      footer={
        cart.length > 0 && (
          <div className="shrink-0 space-y-2 px-5 pb-6 pt-3">
            <PrimaryButton onClick={() => navigate('checkout')}>Checkout · {peso(total)}</PrimaryButton>
          </div>
        )
      }
    >
      {cart.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: C.greenTint, color: C.green }}>
            <ShoppingBag className="h-6 w-6" />
          </span>
          <div className="text-[14px] font-semibold">Your cart is empty</div>
          <p className="text-[11px]" style={{ color: C.muted }}>
            Pick a drink from the menu to get started.
          </p>
          <div className="w-40 pt-1">
            <PrimaryButton onClick={() => navigate('menu')}>Browse Menu</PrimaryButton>
          </div>
        </div>
      ) : (
        <div className="space-y-3 px-5 pb-4 pt-2">
          {cart.map((line) => {
            const p = findProduct(line.productId);
            return (
              <div key={line.key} className="flex gap-3 rounded-2xl border p-3" style={{ borderColor: C.border }}>
                <Thumb src={p.image} alt={p.name} className="h-14 w-14 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-[12px] font-semibold">{p.name}</div>
                    <button onClick={() => removeLine(line.key)} aria-label={`Remove ${p.name}`} style={{ color: C.muted }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="truncate text-[10px]" style={{ color: C.muted }}>
                    {lineSummary(line)}
                  </div>
                  {p.customizable && (
                    <button onClick={() => editLine(line)} className="text-[10px] font-semibold" style={{ color: C.green }}>
                      Edit
                    </button>
                  )}
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[12px] font-semibold">{peso(lineTotal(line))}</span>
                    <Stepper value={line.qty} onChange={(v) => changeLineQty(line.key, v - line.qty)} />
                  </div>
                </div>
              </div>
            );
          })}
          <Totals subtotal={subtotal} total={total} />
        </div>
      )}
    </Screen>
  );
}

function Totals({ subtotal, total }: { subtotal: number; total: number }) {
  return (
    <div className="space-y-1.5 pt-2 text-[12px]">
      <div className="flex justify-between" style={{ color: C.muted }}>
        <span>Subtotal</span>
        <span style={{ color: C.ink }}>{peso(subtotal)}</span>
      </div>
      <div className="flex justify-between" style={{ color: C.muted }}>
        <span>Service Fee</span>
        <span style={{ color: C.ink }}>{peso(SERVICE_FEE)}</span>
      </div>
      <div className="flex justify-between border-t pt-2 text-[14px] font-semibold" style={{ borderColor: C.border }}>
        <span>Total</span>
        <span>{peso(total)}</span>
      </div>
    </div>
  );
}

/* ===================================================================== */
/* 8. CHECKOUT                                                           */
/* ===================================================================== */
function CheckoutScreen() {
  const { pickup, setPickup, payment, setPayment, notes, setNotes, subtotal, total, cart, placeOrder } = useMobileApp();
  return (
    <Screen
      header={<TopBar title="Checkout" back="cart" />}
      footer={
        <div className="shrink-0 px-5 pb-6 pt-3">
          <PrimaryButton onClick={placeOrder} disabled={cart.length === 0}>
            Place Order
          </PrimaryButton>
        </div>
      }
    >
      <div className="space-y-5 px-5 pb-4 pt-2">
        <div>
          <SectionLabel>Pickup Option</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <OptionTile selected={pickup === 'store'} onClick={() => setPickup('store')} label="In Store" />
            <OptionTile selected={pickup === 'takeaway'} onClick={() => setPickup('takeaway')} label="Takeaway" />
          </div>
        </div>

        <div>
          <SectionLabel>Payment Method</SectionLabel>
          <div className="space-y-2" role="radiogroup">
            <PaymentRow selected={payment === 'cash'} onClick={() => setPayment('cash')} label="Cash on Pickup" />
            <PaymentRow selected={false} disabled label="GCash / Card" note="Coming Soon" />
          </div>
        </div>

        <div>
          <SectionLabel>
            Order Notes <span className="font-normal" style={{ color: C.muted }}>(Optional)</span>
          </SectionLabel>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="e.g. Less ice, extra shot..."
            className="w-full resize-none rounded-xl border px-3 py-2 text-[12px] outline-none placeholder:text-[#A39D93] focus:border-[#133E2B]"
            style={{ borderColor: C.border }}
          />
        </div>

        <Totals subtotal={subtotal} total={total} />
      </div>
    </Screen>
  );
}

function PaymentRow({
  selected,
  onClick,
  label,
  note,
  disabled,
}: {
  selected: boolean;
  onClick?: () => void;
  label: string;
  note?: string;
  disabled?: boolean;
}) {
  return (
    <button
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-[12px] disabled:cursor-not-allowed"
      style={{ borderColor: selected ? C.green : C.border, background: selected ? C.greenTint : '#FFF', color: disabled ? '#A39D93' : C.ink }}
    >
      <span
        className="flex h-4 w-4 items-center justify-center rounded-full border"
        style={{ borderColor: selected ? C.green : '#CFC8BC', background: selected ? C.green : 'transparent' }}
      >
        {selected && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />}
      </span>
      {label}
      {note && <span className="text-[10px]">({note})</span>}
    </button>
  );
}

/* ===================================================================== */
/* 9. ORDER TRACKING                                                     */
/* ===================================================================== */
const STAGES = ['Received', 'Preparing', 'Ready', 'Completed'] as const;

const STAGE_COPY: Record<OrderStage, { title: string; body: string }> = {
  0: { title: 'Received', body: 'We got your order and it’s in the queue.' },
  1: { title: 'Preparing', body: 'Your order is being prepared. We’ll notify you when it’s ready.' },
  2: { title: 'Ready for pickup', body: 'Head to the counter, your order is waiting for you.' },
  3: { title: 'Completed', body: 'Enjoy your coffee! Thanks for ordering with BrewFlow.' },
};

function TrackingScreen() {
  const { order } = useMobileApp();
  const copy = STAGE_COPY[order.stage];
  const times = [order.placedAt, order.preparingAt, order.stage >= 2 ? 'Now' : '', ''];

  return (
    <div className="flex h-full w-full flex-col overflow-hidden" style={{ background: C.green, color: C.ink }}>
      <StatusBar tone="light" />
      <div className="shrink-0 px-5 pb-8 pt-2 text-white">
        <div className="text-[14px] font-semibold">Order #{order.number}</div>
        <div className="mt-4 flex items-center gap-2 text-[18px] font-semibold">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4CC38A]">
            <Check className="h-3 w-3 text-white" strokeWidth={3.5} />
          </span>
          {copy.title}
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-white/75">{copy.body}</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-t-3xl bg-white px-5 pt-5 [scrollbar-width:none]">
        {/* Progress steps */}
        <ol className="relative grid grid-cols-4 pb-5">
          <div className="absolute left-[12.5%] right-[12.5%] top-[9px] h-0.5 bg-[#E6E1D8]" aria-hidden="true" />
          <div
            className="absolute left-[12.5%] top-[9px] h-0.5 transition-all duration-700"
            style={{ background: C.green, width: `${(Math.min(order.stage, 3) / 3) * 75}%` }}
            aria-hidden="true"
          />
          {STAGES.map((label, i) => {
            const done = i <= order.stage;
            return (
              <li key={label} className="relative flex flex-col items-center text-center" aria-current={i === order.stage ? 'step' : undefined}>
                <span
                  className="flex h-[19px] w-[19px] items-center justify-center rounded-full border-2 bg-white"
                  style={{ borderColor: done ? C.green : '#D6D0C5', background: done ? C.green : '#FFF' }}
                >
                  {done && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />}
                </span>
                <span className="mt-1.5 text-[10px] font-medium" style={{ color: done ? C.ink : C.muted }}>
                  {label}
                </span>
                <span className="text-[9px]" style={{ color: C.muted }}>
                  {times[i]}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="border-t pt-4" style={{ borderColor: C.border }}>
          <h3 className="mb-2 text-[13px] font-semibold">Order Items</h3>
          <div className="space-y-3 pb-4">
            {order.lines.map((line) => {
              const p = findProduct(line.productId);
              return (
                <div key={line.key} className="flex items-center gap-3">
                  <Thumb src={p.image} alt={p.name} className="h-11 w-11 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-medium">
                      {line.qty > 1 && `${line.qty}× `}
                      {p.name}
                      {p.customizable && <span style={{ color: C.muted }}> ({line.size})</span>}
                    </div>
                    <div className="truncate text-[10px]" style={{ color: C.muted }}>
                      {lineSummary(line)}
                    </div>
                  </div>
                  <span className="text-[12px] font-medium">{peso(lineTotal(line))}</span>
                </div>
              );
            })}
            <div className="flex justify-between border-t pt-3 text-[13px] font-semibold" style={{ borderColor: C.border }}>
              <span>Total</span>
              <span>{peso(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
      <BottomNav active="history" />
    </div>
  );
}

/* ===================================================================== */
/* 10. ORDER COMPLETED                                                   */
/* ===================================================================== */
const CONFETTI = [
  { x: 18, y: 14, c: '#D9731F', r: 20 },
  { x: 74, y: 10, c: '#133E2B', r: -30 },
  { x: 86, y: 30, c: '#E3B341', r: 45 },
  { x: 10, y: 38, c: '#4CC38A', r: -15 },
  { x: 30, y: 6, c: '#E3B341', r: 70 },
  { x: 62, y: 4, c: '#D9731F', r: -60 },
  { x: 90, y: 50, c: '#C2412D', r: 10 },
  { x: 6, y: 58, c: '#C2412D', r: 35 },
];

function CompletedScreen() {
  const { order, navigate } = useMobileApp();
  const hero = findProduct(order.lines[0]?.productId ?? 'iced-latte');
  return (
    <Screen>
      <div className="relative flex min-h-full flex-col items-center px-6 pb-8 pt-8 text-center">
        <div className="relative h-48 w-full">
          {CONFETTI.map((p, i) => (
            <span
              key={i}
              className="absolute h-2.5 w-1 rounded-sm"
              style={{ left: `${p.x}%`, top: `${p.y}%`, background: p.c, transform: `rotate(${p.r}deg)` }}
              aria-hidden="true"
            />
          ))}
          <div className="absolute left-1/2 top-4 h-40 w-32 -translate-x-1/2 overflow-hidden rounded-[28px] shadow-lg">
            <Image src={hero.image} alt={hero.name} fill sizes="160px" className="object-cover" />
          </div>
          <span
            className="absolute bottom-0 left-1/2 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white text-white shadow-md"
            style={{ background: C.green }}
          >
            <Check className="h-5 w-5" strokeWidth={3} />
          </span>
        </div>

        <h2 className="mt-5 text-[19px] font-semibold">Order Completed!</h2>
        <p className="mt-1 text-[12px]" style={{ color: C.muted }}>
          Your order #{order.number} is ready for pickup.
        </p>
        <div
          className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold"
          style={{ background: C.greenTint, color: C.green }}
        >
          <Coins className="h-3.5 w-3.5" />+{order.pointsEarned} points earned
        </div>

        <div className="mt-auto w-full space-y-2.5 pt-8">
          <PrimaryButton onClick={() => navigate('tracking')}>View Order Details</PrimaryButton>
          <SecondaryButton onClick={() => navigate('home')}>Back to Home</SecondaryButton>
        </div>
      </div>
    </Screen>
  );
}

/* ===================================================================== */
/* 11. REWARDS & LOYALTY                                                 */
/* ===================================================================== */
function RewardsScreen() {
  const { points, redeem, vouchers } = useMobileApp();
  const [tab, setTab] = useState<'available' | 'mine'>('available');
  const next = REWARDS.find((r) => r.points > points);
  const progress = next ? Math.min(100, (points / next.points) * 100) : 100;

  return (
    <Screen footer={<BottomNav active="rewards" />} header={<TopBar title="Rewards" />}>
      <div className="space-y-4 px-5 pb-5 pt-1">
        <div className="relative overflow-hidden rounded-2xl p-4 text-white" style={{ background: C.green }}>
          <LeafMark className="absolute -right-3 -top-2 h-24 w-24 opacity-10" color="#FFFFFF" />
          <div className="text-[11px] text-white/75">Your Points</div>
          <div className="text-[30px] font-semibold leading-tight tabular-nums">{points}</div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-white/80">
            {next ? (
              <>
                <span>
                  Next Reward: {next.name} ({next.points} pts)
                </span>
                <span>{next.points - points} pts to go</span>
              </>
            ) : (
              <span>You can redeem every reward!</span>
            )}
          </div>
        </div>

        <SegmentedTabs
          tabs={[
            { id: 'available', label: 'Available Rewards' },
            { id: 'mine', label: `My Rewards${vouchers.length ? ` (${vouchers.length})` : ''}` },
          ]}
          value={tab}
          onChange={setTab}
        />

        {tab === 'available' ? (
          <div className="divide-y" style={{ borderColor: C.border }}>
            {REWARDS.map((r) => {
              const canRedeem = points >= r.points;
              return (
                <div key={r.id} className="flex items-center gap-3 py-2.5" style={{ borderColor: C.border }}>
                  <Thumb src={r.image} alt={r.name} className="h-11 w-11 rounded-lg" />
                  <div className="flex-1">
                    <div className="text-[12px] font-medium">{r.name}</div>
                    <div className="text-[10px]" style={{ color: C.muted }}>
                      {r.points} points
                    </div>
                  </div>
                  <button
                    onClick={() => redeem(r)}
                    disabled={!canRedeem}
                    className="rounded-lg px-3 py-1.5 text-[10px] font-semibold text-white transition-colors disabled:cursor-not-allowed"
                    style={{ background: canRedeem ? C.green : '#D6D0C5' }}
                  >
                    {canRedeem ? 'Redeem' : `${r.points - points} more`}
                  </button>
                </div>
              );
            })}
          </div>
        ) : vouchers.length === 0 ? (
          <div className="py-10 text-center">
            <Ticket className="mx-auto h-7 w-7" style={{ color: '#C9C2B6' }} />
            <div className="mt-2 text-[12px] font-medium">No rewards yet</div>
            <p className="mx-auto mt-0.5 max-w-[200px] text-[11px]" style={{ color: C.muted }}>
              Redeem a reward and its voucher will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {vouchers.map((v) => (
              <div key={v.id} className="flex items-center gap-3 rounded-xl border border-dashed p-3" style={{ borderColor: C.green }}>
                <Ticket className="h-5 w-5" style={{ color: C.green }} />
                <div className="flex-1">
                  <div className="text-[12px] font-semibold">{v.rewardName}</div>
                  <div className="text-[10px]" style={{ color: C.muted }}>
                    Show this code at the counter
                  </div>
                </div>
                <span className="font-mono text-[11px] font-semibold tracking-wider">{v.code}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Screen>
  );
}

/* ===================================================================== */
/* 12. ORDER HISTORY                                                     */
/* ===================================================================== */
function HistoryScreen() {
  const { history, order, navigate } = useMobileApp();
  const [filter, setFilter] = useState<'all' | 'Completed' | 'Cancelled'>('all');
  const inProgress = order.stage < 2 && !history.some((h) => h.number === order.number);
  const rows = history.filter((h) => filter === 'all' || h.status === filter);

  return (
    <Screen footer={<BottomNav active="history" />} header={<TopBar title="Order History" />}>
      <div className="space-y-3 px-5 pb-5 pt-1">
        <SegmentedTabs
          tabs={[
            { id: 'all', label: 'All' },
            { id: 'Completed', label: 'Completed' },
            { id: 'Cancelled', label: 'Cancelled' },
          ]}
          value={filter}
          onChange={setFilter}
        />

        <div className="divide-y" style={{ borderColor: C.border }}>
          {inProgress && filter === 'all' && (
            <HistoryRow
              number={order.number}
              placedAt={`Today · ${order.placedAt}`}
              total={order.total}
              status="Preparing"
              onClick={() => navigate('tracking')}
            />
          )}
          {rows.map((h) => (
            <HistoryRow key={h.number} {...h} />
          ))}
          {rows.length === 0 && !(inProgress && filter === 'all') && (
            <div className="py-10 text-center text-[12px]" style={{ color: C.muted }}>
              No {filter.toLowerCase()} orders.
            </div>
          )}
        </div>
      </div>
    </Screen>
  );
}

const STATUS_COLORS: Record<string, string> = {
  Completed: '#1F8A5B',
  Cancelled: '#C2412D',
  Preparing: '#D9731F',
};

function HistoryRow({
  number,
  placedAt,
  total,
  status,
  onClick,
}: {
  number: number;
  placedAt: string;
  total: number;
  status: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="flex w-full items-center justify-between py-3 text-left disabled:cursor-default"
      style={{ borderColor: C.border }}
    >
      <div>
        <div className="text-[12px] font-semibold">#{number}</div>
        <div className="text-[10px]" style={{ color: C.muted }}>
          {placedAt}
        </div>
      </div>
      <div className="text-right">
        <div className="text-[12px] font-semibold">{peso(total)}</div>
        <div className="text-[10px] font-medium" style={{ color: STATUS_COLORS[status] }}>
          {status}
        </div>
      </div>
    </button>
  );
}

/* ===================================================================== */
/* 13. PROFILE                                                           */
/* ===================================================================== */
function ProfileScreen() {
  const { points, navigate } = useMobileApp();
  const rows: { label: string; icon: typeof Gift; to?: MobileScreen; value?: string }[] = [
    { label: 'My Points', icon: Coins, to: 'rewards', value: String(points) },
    { label: 'Order History', icon: ClipboardList, to: 'history' },
    { label: 'Rewards', icon: Gift, to: 'rewards' },
    { label: 'Payment Methods', icon: CreditCard },
    { label: 'Notifications', icon: Bell },
    { label: 'Help & Support', icon: CircleHelp },
    { label: 'Settings', icon: Settings },
  ];

  return (
    <Screen footer={<BottomNav active="profile" />}>
      <div className="px-5 pb-5 pt-3">
        <div className="flex items-center gap-3 pb-5">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full text-[16px] font-semibold text-white"
            style={{ background: '#8B6A4E' }}
          >
            AS
          </span>
          <div>
            <div className="text-[14px] font-semibold">Arwil Sambajon</div>
            <div className="text-[11px]" style={{ color: C.muted }}>
              arwil@example.com
            </div>
            <span
              className="mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold"
              style={{ background: C.greenTint, color: C.green }}
            >
              Member
            </span>
          </div>
        </div>

        <div className="divide-y border-t" style={{ borderColor: C.border }}>
          {rows.map(({ label, icon: Icon, to, value }) => (
            <button
              key={label}
              onClick={to ? () => navigate(to) : undefined}
              className="flex w-full items-center gap-3 py-3 text-left text-[12px]"
              style={{ borderColor: C.border }}
            >
              <Icon className="h-4 w-4" style={{ color: C.ink }} strokeWidth={1.8} />
              <span className="flex-1">{label}</span>
              {value && <span className="font-medium">{value}</span>}
              <ChevronRight className="h-4 w-4" style={{ color: '#B5AEA3' }} />
            </button>
          ))}
          <button
            onClick={() => navigate('splash')}
            className="flex w-full items-center gap-3 py-3 text-left text-[12px] font-medium"
            style={{ borderColor: C.border, color: '#C2412D' }}
          >
            <LogOut className="h-4 w-4" strokeWidth={1.8} />
            Log Out
          </button>
        </div>
      </div>
    </Screen>
  );
}

/* ===================================================================== */
/* REGISTRY                                                              */
/* ===================================================================== */
export interface ScreenDef {
  id: MobileScreen;
  number: number;
  title: string;
  caption: string;
  Component: () => React.ReactNode;
}

export const SCREENS: ScreenDef[] = [
  { id: 'splash', number: 1, title: 'Splash Screen', caption: 'Welcome screen with brand and quick access to get started.', Component: SplashScreen },
  { id: 'auth', number: 2, title: 'Sign Up / Log In', caption: 'Multiple authentication options for easy and secure access.', Component: AuthScreen },
  { id: 'home', number: 3, title: 'Home', caption: 'Quick access to menu, rewards, orders, and promotions.', Component: HomeScreen },
  { id: 'menu', number: 4, title: 'Menu Browsing', caption: 'Explore the full menu with categories, search, and add to cart.', Component: MenuScreen },
  { id: 'product', number: 5, title: 'Product Details', caption: 'View description, choose size, milk, and add-ons.', Component: ProductScreen },
  { id: 'customize', number: 6, title: 'Customization', caption: 'Review and fine-tune your drink with options and add-ons.', Component: CustomizeScreen },
  { id: 'cart', number: 7, title: 'Cart', caption: 'Adjust quantities, edit drinks, and see your total.', Component: CartScreen },
  { id: 'checkout', number: 8, title: 'Checkout', caption: 'Choose pickup option, payment method, and place your order.', Component: CheckoutScreen },
  { id: 'tracking', number: 9, title: 'Order Tracking', caption: 'Real-time order status from preparation to ready.', Component: TrackingScreen },
  { id: 'completed', number: 10, title: 'Order Completed', caption: 'Confirmation with order details and next steps.', Component: CompletedScreen },
  { id: 'rewards', number: 11, title: 'Rewards & Loyalty', caption: 'View your points, progress, and redeem rewards.', Component: RewardsScreen },
  { id: 'history', number: 12, title: 'Order History', caption: 'Track all your past orders and purchases.', Component: HistoryScreen },
  { id: 'profile', number: 13, title: 'Profile', caption: 'Manage your account, points, notifications, and settings.', Component: ProfileScreen },
];
