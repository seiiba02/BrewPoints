'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Bell,
  ShoppingBag,
  Coffee,
  Sparkles,
  Clock,
  Plus,
  Minus,
  Check,
  ChevronRight,
  ArrowLeft,
  Trash2,
  Award,
  User,
  Home as HomeIcon,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { BrewFlowLogo } from '@/components/ui/BrewFlowLogo';

type MobileScreen =
  | 'splash'
  | 'home'
  | 'menu'
  | 'customization'
  | 'cart'
  | 'tracking'
  | 'rewards';

export function MobileShowcasePortal() {
  const [activeScreen, setActiveScreen] = useState<MobileScreen>('home');
  const [viewMode, setViewMode] = useState<'device' | 'all'>('device');

  // Interactive state
  const [points, setPoints] = useState(120);
  const [selectedSize, setSelectedSize] = useState('Medium');
  const [selectedMilk, setSelectedMilk] = useState('Oat Milk');
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['Vanilla Syrup']);
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(2);
  const [rewardTab, setRewardTab] = useState<'available' | 'vouchers'>('available');

  const toggleAddon = (name: string) => {
    setSelectedAddons((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  /* ===================================================================== */
  /* SCREEN 1: SPLASH / WELCOME                                            */
  /* ===================================================================== */
  const renderSplashScreen = () => (
    <div className="relative h-full w-full bg-[#1C1815] text-white flex flex-col justify-between overflow-hidden">
      <div className="relative h-3/5 w-full">
        <Image
          src="/images/hero-coffee.jpg"
          alt="BrewFlow Artisan Coffee"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#1C1815]" />
      </div>

      <div className="relative -mt-10 flex-1 rounded-t-[32px] bg-white p-6 text-[#111827] flex flex-col items-center justify-between shadow-2xl">
        <div className="text-center pt-2 space-y-2">
          <div className="flex justify-center mb-1">
            <BrewFlowLogo size="lg" variant="primary" />
          </div>
          <p className="text-xs text-[#6B7280]">
            Great coffee. On the go.
          </p>
        </div>

        <div className="w-full space-y-3 pb-4">
          <button
            onClick={() => setActiveScreen('home')}
            className="w-full py-3.5 rounded-full bg-[#133E2B] text-white text-xs font-semibold hover:bg-[#0E2E20] transition-colors shadow-sm cursor-pointer"
          >
            Get Started
          </button>
          <button
            onClick={() => setActiveScreen('home')}
            className="w-full py-3.5 rounded-full border border-[#E5E7EB] text-[#111827] text-xs font-semibold hover:bg-[#F8F6F0] transition-colors cursor-pointer"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );

  /* ===================================================================== */
  /* SCREEN 2: HOME (Alex's Points, Quick Actions, Popular Picks)           */
  /* ===================================================================== */
  const renderHomeScreen = () => (
    <div className="h-full w-full bg-[#F8F6F0] flex flex-col justify-between overflow-hidden">
      {/* Top Mobile Bar */}
      <div className="px-5 pt-4 pb-2 bg-white flex items-center justify-between border-b border-[#F3EFEA]">
        <BrewFlowLogo size="sm" variant="primary" />
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-[#6B7280] hover:text-[#111827]">
            <Bell className="h-4 w-4" />
          </button>
          <button
            onClick={() => setActiveScreen('cart')}
            className="relative p-1.5 text-[#6B7280] hover:text-[#111827]"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-[#133E2B] text-[9px] font-bold text-white flex items-center justify-center">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* User Greeting */}
        <div>
          <h2 className="text-base font-bold text-[#111827]">
            Good morning, Alex! ☀️
          </h2>
          <p className="text-xs text-[#6B7280]">
            Your next great cup is just a few taps away.
          </p>
        </div>

        {/* Loyalty Points Card (Showcase Dark Green Card) */}
        <div className="rounded-2xl bg-[#133E2B] p-4 text-white shadow-md space-y-3">
          <div className="flex justify-between items-baseline">
            <span className="text-[11px] text-white/80 uppercase tracking-wider font-medium">
              Your Points
            </span>
            <span className="text-xs font-semibold text-white/90">P 150</span>
          </div>

          <div className="text-3xl font-extrabold tracking-tight">
            {points}
          </div>

          <div className="space-y-1">
            <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${(points / 200) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-white/80 pt-0.5">
              <span>Next reward at 200 pts</span>
              <span>{Math.max(0, 200 - points)} pts to go</span>
            </div>
          </div>
        </div>

        {/* Quick Actions (Order · Rewards · History) */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setActiveScreen('menu')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#133E2B] transition-colors cursor-pointer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F3EE] text-[#133E2B] mb-1.5">
              <Coffee className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-[#111827]">Order</span>
          </button>

          <button
            onClick={() => setActiveScreen('rewards')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#133E2B] transition-colors cursor-pointer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F3EE] text-[#133E2B] mb-1.5">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-[#111827]">Rewards</span>
          </button>

          <button
            onClick={() => setActiveScreen('tracking')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#133E2B] transition-colors cursor-pointer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F3EE] text-[#133E2B] mb-1.5">
              <Clock className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-[#111827]">History</span>
          </button>
        </div>

        {/* Popular Picks Horizontal Scroll */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111827]">Popular Picks</h3>
            <button
              onClick={() => setActiveScreen('menu')}
              className="text-xs font-semibold text-[#133E2B] flex items-center"
            >
              <span>View</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => setActiveScreen('customization')}
              className="p-3 rounded-2xl bg-white border border-[#E5E7EB] space-y-2 cursor-pointer hover:shadow-xs"
            >
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#F3EFEA]">
                <Image
                  src="/images/iced-latte.jpg"
                  alt="Iced Latte"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex justify-between items-center pt-1">
                <div>
                  <h4 className="text-xs font-bold text-[#111827]">Iced Latte</h4>
                  <div className="text-xs font-semibold text-[#6B7280]">P120</div>
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#111827] text-white">
                  <Plus className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            <div
              onClick={() => setActiveScreen('customization')}
              className="p-3 rounded-2xl bg-white border border-[#E5E7EB] space-y-2 cursor-pointer hover:shadow-xs"
            >
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#F3EFEA]">
                <Image
                  src="/images/spanish-latte.jpg"
                  alt="Spanish Latte"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex justify-between items-center pt-1">
                <div>
                  <h4 className="text-xs font-bold text-[#111827]">Spanish Latte</h4>
                  <div className="text-xs font-semibold text-[#6B7280]">P140</div>
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#111827] text-white">
                  <Plus className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav Bar (Home · Menu · Rewards · Profile) */}
      <div className="px-6 py-2.5 bg-white border-t border-[#F3EFEA] flex justify-between items-center">
        <button
          onClick={() => setActiveScreen('home')}
          className="flex flex-col items-center text-[#133E2B]"
        >
          <HomeIcon className="h-5 w-5" />
          <span className="text-[10px] font-bold mt-0.5">Home</span>
        </button>
        <button
          onClick={() => setActiveScreen('menu')}
          className="flex flex-col items-center text-[#9CA3AF] hover:text-[#111827]"
        >
          <Coffee className="h-5 w-5" />
          <span className="text-[10px] font-medium mt-0.5">Menu</span>
        </button>
        <button
          onClick={() => setActiveScreen('rewards')}
          className="flex flex-col items-center text-[#9CA3AF] hover:text-[#111827]"
        >
          <Sparkles className="h-5 w-5" />
          <span className="text-[10px] font-medium mt-0.5">Rewards</span>
        </button>
        <button
          onClick={() => setActiveScreen('tracking')}
          className="flex flex-col items-center text-[#9CA3AF] hover:text-[#111827]"
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium mt-0.5">Profile</span>
        </button>
      </div>
    </div>
  );

  /* ===================================================================== */
  /* SCREEN 3: MENU                                                        */
  /* ===================================================================== */
  const renderMenuScreen = () => (
    <div className="h-full w-full bg-[#F8F6F0] flex flex-col justify-between overflow-hidden">
      <div className="px-5 pt-4 pb-3 bg-white border-b border-[#F3EFEA] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#111827]">Menu</h2>
          <button
            onClick={() => setActiveScreen('cart')}
            className="p-1.5 text-[#6B7280] relative"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-[#133E2B] text-[9px] font-bold text-white flex items-center justify-center">
              {cartCount}
            </span>
          </button>
        </div>

        {/* Category Horizontal Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button className="px-4 py-1.5 rounded-full bg-[#133E2B] text-white text-xs font-semibold whitespace-nowrap">
            Coffee
          </button>
          <button className="px-4 py-1.5 rounded-full bg-[#F3EFEA] text-[#6B7280] text-xs font-semibold whitespace-nowrap">
            Non-Coffee
          </button>
          <button className="px-4 py-1.5 rounded-full bg-[#F3EFEA] text-[#6B7280] text-xs font-semibold whitespace-nowrap">
            Frappé
          </button>
          <button className="px-4 py-1.5 rounded-full bg-[#F3EFEA] text-[#6B7280] text-xs font-semibold whitespace-nowrap">
            Tea
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {[
          { name: 'Iced Latte', price: 120, img: '/images/iced-latte.jpg' },
          { name: 'Spanish Latte', price: 140, img: '/images/spanish-latte.jpg' },
          { name: 'Matcha Latte', price: 130, img: '/images/matcha-latte.jpg' },
          { name: 'Americano', price: 100, img: '/images/americano.jpg' },
          { name: 'Mocha', price: 140, img: '/images/mocha.jpg' },
        ].map((drink) => (
          <div
            key={drink.name}
            onClick={() => setActiveScreen('customization')}
            className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#133E2B] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-[#F3EFEA] shrink-0">
                <Image
                  src={drink.img}
                  alt={drink.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#111827]">{drink.name}</h4>
                <div className="text-xs font-semibold text-[#6B7280]">
                  P{drink.price}
                </div>
              </div>
            </div>

            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#111827] text-white">
              <Plus className="h-3.5 w-3.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Nav Bar */}
      <div className="px-6 py-2.5 bg-white border-t border-[#F3EFEA] flex justify-between items-center">
        <button
          onClick={() => setActiveScreen('home')}
          className="flex flex-col items-center text-[#9CA3AF]"
        >
          <HomeIcon className="h-5 w-5" />
          <span className="text-[10px] font-medium mt-0.5">Home</span>
        </button>
        <button
          onClick={() => setActiveScreen('menu')}
          className="flex flex-col items-center text-[#133E2B]"
        >
          <Coffee className="h-5 w-5" />
          <span className="text-[10px] font-bold mt-0.5">Menu</span>
        </button>
        <button
          onClick={() => setActiveScreen('rewards')}
          className="flex flex-col items-center text-[#9CA3AF]"
        >
          <Sparkles className="h-5 w-5" />
          <span className="text-[10px] font-medium mt-0.5">Rewards</span>
        </button>
        <button
          onClick={() => setActiveScreen('tracking')}
          className="flex flex-col items-center text-[#9CA3AF]"
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium mt-0.5">Profile</span>
        </button>
      </div>
    </div>
  );

  /* ===================================================================== */
  /* SCREEN 4: CUSTOMIZATION                                               */
  /* ===================================================================== */
  const renderCustomizationScreen = () => (
    <div className="h-full w-full bg-[#FFFFFF] flex flex-col justify-between overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-[#F3EFEA] flex items-center justify-between">
        <button
          onClick={() => setActiveScreen('menu')}
          className="p-1 rounded-full text-[#6B7280] hover:text-[#111827]"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <BrewFlowLogo size="sm" variant="primary" />
        <div className="w-5" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <div className="flex items-center gap-3">
          <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-[#F3EFEA] shrink-0">
            <Image
              src="/images/iced-latte.jpg"
              alt="Iced Latte"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#111827]">Iced Latte</h3>
            <div className="text-sm font-bold text-[#133E2B]">P120</div>
            <p className="text-[11px] text-[#6B7280]">
              Espresso with cold milk, served over ice.
            </p>
          </div>
        </div>

        {/* Size Selection */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#111827]">Size</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Small', price: 'P120' },
              { label: 'Medium', price: 'P140' },
              { label: 'Large', price: 'P160' },
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => setSelectedSize(s.label)}
                className={`py-2 rounded-xl text-center border text-xs font-semibold transition-colors ${
                  selectedSize === s.label
                    ? 'border-[#133E2B] bg-[#E8F3EE] text-[#133E2B]'
                    : 'border-[#E5E7EB] text-[#6B7280]'
                }`}
              >
                <div>{s.label}</div>
                <div className="text-[10px] font-normal">{s.price}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Milk Selection */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#111827]">Milk</span>
          <div className="grid grid-cols-3 gap-2">
            {['Whole Milk', 'Oat Milk', 'Almond Milk'].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMilk(m)}
                className={`py-2 rounded-xl text-center border text-xs font-semibold transition-colors ${
                  selectedMilk === m
                    ? 'border-[#133E2B] bg-[#E8F3EE] text-[#133E2B]'
                    : 'border-[#E5E7EB] text-[#6B7280]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Add-ons */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#111827]">Add-ons</span>
          <div className="space-y-2">
            {[
              { name: 'Extra Shot', delta: '+P20' },
              { name: 'Vanilla Syrup', delta: '+P15' },
              { name: 'Caramel Drizzle', delta: '+P15' },
            ].map((addon) => {
              const isSelected = selectedAddons.includes(addon.name);
              return (
                <button
                  key={addon.name}
                  onClick={() => toggleAddon(addon.name)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#E5E7EB] text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-4 w-4 rounded-md border flex items-center justify-center ${
                        isSelected
                          ? 'border-[#133E2B] bg-[#133E2B] text-white'
                          : 'border-[#D1D5DB]'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span className="font-medium text-[#111827]">{addon.name}</span>
                  </div>
                  <span className="text-[#6B7280]">{addon.delta}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[#F3EFEA] bg-white">
        <button
          onClick={() => {
            setCartCount((c) => c + 1);
            setActiveScreen('cart');
          }}
          className="w-full py-3.5 rounded-2xl bg-[#133E2B] text-white font-semibold text-xs shadow-sm hover:bg-[#0E2E20] transition-colors cursor-pointer"
        >
          Add to Cart P140
        </button>
      </div>
    </div>
  );

  /* ===================================================================== */
  /* SCREEN 5: CART & CHECKOUT                                             */
  /* ===================================================================== */
  const renderCartScreen = () => (
    <div className="h-full w-full bg-[#FFFFFF] flex flex-col justify-between overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-[#F3EFEA] flex items-center justify-between">
        <h2 className="text-base font-bold text-[#111827]">Your Cart</h2>
        <button
          onClick={() => setActiveScreen('home')}
          className="p-1 rounded-full text-[#6B7280]"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Item 1 */}
        <div className="flex items-start gap-3 p-3 rounded-2xl border border-[#E5E7EB]">
          <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-[#F3EFEA] shrink-0">
            <Image
              src="/images/iced-latte.jpg"
              alt="Iced Latte"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h4 className="text-xs font-bold text-[#111827]">Iced Latte</h4>
              <Trash2 className="h-3.5 w-3.5 text-[#9CA3AF]" />
            </div>
            <p className="text-[10px] text-[#6B7280] truncate">
              Medium • Oat Milk • Vanilla Syrup
            </p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs font-bold text-[#133E2B]">P155</span>
              <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-full px-2 py-0.5">
                <Minus className="h-3 w-3 text-[#6B7280]" />
                <span className="text-xs font-semibold">1</span>
                <Plus className="h-3 w-3 text-[#6B7280]" />
              </div>
            </div>
          </div>
        </div>

        {/* Item 2 */}
        <div className="flex items-start gap-3 p-3 rounded-2xl border border-[#E5E7EB]">
          <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-[#F3EFEA] shrink-0">
            <Image
              src="/images/blueberry-muffin.jpg"
              alt="Blueberry Muffin"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h4 className="text-xs font-bold text-[#111827]">Blueberry Muffin</h4>
              <Trash2 className="h-3.5 w-3.5 text-[#9CA3AF]" />
            </div>
            <p className="text-[10px] text-[#6B7280]">Freshly baked</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs font-bold text-[#133E2B]">P85</span>
              <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-full px-2 py-0.5">
                <Minus className="h-3 w-3 text-[#6B7280]" />
                <span className="text-xs font-semibold">1</span>
                <Plus className="h-3 w-3 text-[#6B7280]" />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-[#F3EFEA] space-y-1.5 text-xs">
          <div className="flex justify-between text-[#6B7280]">
            <span>Subtotal</span>
            <span className="font-semibold text-[#111827]">P240</span>
          </div>
          <div className="flex justify-between text-[#6B7280]">
            <span>Service Fee</span>
            <span className="font-semibold text-[#111827]">P0</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-[#111827] pt-1 border-t border-[#F3EFEA]">
            <span>Total</span>
            <span>P240</span>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[#F3EFEA] space-y-2">
        <button
          onClick={() => setActiveScreen('tracking')}
          className="w-full py-3.5 rounded-2xl bg-[#133E2B] text-white font-semibold text-xs shadow-sm hover:bg-[#0E2E20] transition-colors cursor-pointer"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );

  /* ===================================================================== */
  /* SCREEN 6: ORDER TRACKING (#1024 Preparing)                            */
  /* ===================================================================== */
  const renderTrackingScreen = () => (
    <div className="h-full w-full bg-[#F8F6F0] flex flex-col justify-between overflow-hidden">
      <div className="px-5 pt-4 pb-3 bg-white border-b border-[#F3EFEA] flex items-center justify-between">
        <h2 className="text-base font-bold text-[#111827]">Order #1024</h2>
        <button
          onClick={() => setActiveScreen('home')}
          className="p-1 rounded-full text-[#6B7280]"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
        <div className="p-5 rounded-3xl bg-white border border-[#E5E7EB] text-center space-y-3 shadow-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFEDD5] text-[#EA580C]">
            <span className="h-2 w-2 rounded-full bg-[#EA580C] animate-ping" />
            <span>Preparing</span>
          </div>

          <h3 className="text-sm font-bold text-[#111827]">
            Your order is being prepared.
          </h3>
          <p className="text-xs text-[#6B7280]">
            We&apos;ll notify you when it&apos;s ready for counter pickup.
          </p>

          <div className="h-1.5 w-full rounded-full bg-[#F3EFEA] overflow-hidden mt-3">
            <div className="h-full w-2/3 rounded-full bg-[#EA580C] transition-all" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] space-y-2">
          <span className="text-xs font-bold text-[#111827]">Items</span>
          <div className="text-xs text-[#6B7280] space-y-1">
            <div className="flex justify-between">
              <span>1x Iced Latte</span>
              <span>P155</span>
            </div>
            <div className="flex justify-between">
              <span>1x Blueberry Muffin</span>
              <span>P85</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border-t border-[#F3EFEA]">
        <button
          onClick={() => setActiveScreen('home')}
          className="w-full py-3 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#111827] hover:bg-[#F8F6F0] transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );

  /* ===================================================================== */
  /* SCREEN 7: REWARDS                                                     */
  /* ===================================================================== */
  const renderRewardsScreen = () => (
    <div className="h-full w-full bg-[#F8F6F0] flex flex-col justify-between overflow-hidden">
      <div className="px-5 pt-4 pb-3 bg-white border-b border-[#F3EFEA] flex items-center justify-between">
        <h2 className="text-base font-bold text-[#111827]">Rewards</h2>
        <button
          onClick={() => setActiveScreen('home')}
          className="p-1 text-[#6B7280]"
        >
          <HomeIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Points Banner */}
        <div className="rounded-2xl bg-[#133E2B] p-4 text-white shadow-sm space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-white/80">
            Your Points
          </span>
          <div className="text-2xl font-bold">{points}</div>
          <p className="text-[10px] text-white/80">Next reward at 200 pts</p>
        </div>

        {/* Tabs: Available / My Vouchers */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-[#E8E5DE] text-xs font-semibold">
          <button
            onClick={() => setRewardTab('available')}
            className={`py-1.5 rounded-lg text-center transition-colors ${
              rewardTab === 'available'
                ? 'bg-white text-[#111827] shadow-xs'
                : 'text-[#6B7280]'
            }`}
          >
            Available
          </button>
          <button
            onClick={() => setRewardTab('vouchers')}
            className={`py-1.5 rounded-lg text-center transition-colors ${
              rewardTab === 'vouchers'
                ? 'bg-white text-[#111827] shadow-xs'
                : 'text-[#6B7280]'
            }`}
          >
            My Vouchers
          </button>
        </div>

        {/* Reward Items List */}
        <div className="space-y-3">
          {[
            {
              name: 'Free Espresso',
              pts: 100,
              img: '/images/americano.jpg',
            },
            {
              name: 'Free Pastry',
              pts: 150,
              img: '/images/blueberry-muffin.jpg',
            },
            {
              name: 'Free Latte',
              pts: 200,
              img: '/images/iced-latte.jpg',
            },
          ].map((r) => {
            const canRedeem = points >= r.pts;
            return (
              <div
                key={r.name}
                className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E5E7EB]"
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-[#F3EFEA] shrink-0">
                    <Image
                      src={r.img}
                      alt={r.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111827]">{r.name}</h4>
                    <div className="text-[11px] font-semibold text-[#133E2B]">
                      {r.pts} pts
                    </div>
                  </div>
                </div>

                <button
                  disabled={!canRedeem}
                  onClick={() => {
                    setPoints((p) => p - r.pts);
                    alert(`Redeemed voucher for ${r.name}!`);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    canRedeem
                      ? 'bg-[#133E2B] text-white hover:bg-[#0E2E20] cursor-pointer'
                      : 'bg-[#F3EFEA] text-[#9CA3AF] cursor-not-allowed'
                  }`}
                >
                  Redeem
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="px-6 py-2.5 bg-white border-t border-[#F3EFEA] flex justify-between items-center">
        <button
          onClick={() => setActiveScreen('home')}
          className="flex flex-col items-center text-[#9CA3AF]"
        >
          <HomeIcon className="h-5 w-5" />
          <span className="text-[10px] font-medium mt-0.5">Home</span>
        </button>
        <button
          onClick={() => setActiveScreen('menu')}
          className="flex flex-col items-center text-[#9CA3AF]"
        >
          <Coffee className="h-5 w-5" />
          <span className="text-[10px] font-medium mt-0.5">Menu</span>
        </button>
        <button
          onClick={() => setActiveScreen('rewards')}
          className="flex flex-col items-center text-[#133E2B]"
        >
          <Sparkles className="h-5 w-5" />
          <span className="text-[10px] font-bold mt-0.5">Rewards</span>
        </button>
        <button
          onClick={() => setActiveScreen('tracking')}
          className="flex flex-col items-center text-[#9CA3AF]"
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium mt-0.5">Profile</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F6F0] py-8 px-4 text-[#111827]">
      <div className="max-w-[1440px] mx-auto space-y-8">
        {/* Showcase Header & Screen Switcher Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#111827]">
              Mobile App (Customer View)
            </h1>
            <p className="text-xs text-[#6B7280] mt-1">
              A clean, fast, and intuitive experience — anytime, anywhere.
            </p>
          </div>

          {/* Screen Selection Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-white border border-[#E5E7EB] overflow-x-auto no-scrollbar">
            {[
              { id: 'splash', label: 'Splash' },
              { id: 'home', label: 'Home' },
              { id: 'menu', label: 'Menu' },
              { id: 'customization', label: 'Customization' },
              { id: 'cart', label: 'Cart' },
              { id: 'tracking', label: 'Order Tracking' },
              { id: 'rewards', label: 'Rewards' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveScreen(tab.id as MobileScreen)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeScreen === tab.id
                    ? 'bg-[#133E2B] text-white'
                    : 'text-[#4B5563] hover:bg-[#F3EFEA]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Device Frame View */}
        <div className="flex justify-center items-center py-4">
          <div className="relative w-[340px] h-[680px] rounded-[48px] bg-[#111827] p-3 shadow-2xl ring-1 ring-black/10">
            {/* Notch / Dynamic Island */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 h-4 w-28 rounded-full bg-black z-30" />

            {/* Inner Phone Screen Container */}
            <div className="relative h-full w-full rounded-[40px] overflow-hidden bg-white shadow-inner">
              {activeScreen === 'splash' && renderSplashScreen()}
              {activeScreen === 'home' && renderHomeScreen()}
              {activeScreen === 'menu' && renderMenuScreen()}
              {activeScreen === 'customization' && renderCustomizationScreen()}
              {activeScreen === 'cart' && renderCartScreen()}
              {activeScreen === 'tracking' && renderTrackingScreen()}
              {activeScreen === 'rewards' && renderRewardsScreen()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
