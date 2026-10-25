'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Search,
  ShoppingBag,
  User,
  Coffee,
  QrCode,
  LayoutDashboard,
  Smartphone,
  ChevronDown,
} from 'lucide-react';
import { BrewFlowLogo } from '@/components/ui/BrewFlowLogo';

interface AppNavProps {
  cartCount?: number;
  onOpenCart?: () => void;
}

export function AppNav({ cartCount = 0, onOpenCart }: AppNavProps) {
  const pathname = usePathname();
  const [isPortalDropdownOpen, setIsPortalDropdownOpen] = useState(false);

  // If inside staff POS or admin dashboard, we can adapt the header or show standard header
  const isStaff = pathname.startsWith('/pos') || pathname.startsWith('/queue');
  const isAdmin = pathname.startsWith('/admin') || pathname.startsWith('/dashboard');

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E5E7EB] text-[#111827] shadow-xs">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-95 transition-opacity"
          >
            <BrewFlowLogo size="md" variant="primary" />
          </Link>

          {/* Navigation Links (Menu, Rewards, About) */}
          <nav aria-label="Customer Navigation" className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-[#133E2B] ${
                pathname === '/' ? 'text-[#133E2B] font-semibold' : 'text-[#4B5563]'
              }`}
            >
              Menu
            </Link>
            <Link
              href="/rewards"
              className={`text-sm font-medium transition-colors hover:text-[#133E2B] ${
                pathname === '/rewards' || pathname === '/wallet'
                  ? 'text-[#133E2B] font-semibold'
                  : 'text-[#4B5563]'
              }`}
            >
              Rewards
            </Link>
            <Link
              href="/#about"
              className="text-sm font-medium text-[#4B5563] hover:text-[#133E2B] transition-colors"
            >
              About
            </Link>
          </nav>
        </div>

        {/* Right Actions & Portal Switcher */}
        <div className="flex items-center gap-3">
          {/* Platform Portal Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsPortalDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-[#F3EFEA] hover:bg-[#E8F3EE] text-[#133E2B] border border-[#E5E7EB] transition-colors cursor-pointer"
            >
              <span>
                {isStaff ? 'Staff POS' : isAdmin ? 'Owner Dashboard' : 'BrewFlow Views'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-[#133E2B]" />
            </button>

            {isPortalDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#FFFFFF] p-2 shadow-xl border border-[#E5E7EB] z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setIsPortalDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#9CA3AF]">
                  Showcase Portals
                </div>
                <Link
                  href="/"
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-[#F3EFEA] text-[#111827] transition-colors"
                >
                  <Coffee className="h-4 w-4 text-[#133E2B]" />
                  <span>Customer Storefront</span>
                </Link>
                <Link
                  href="/pos"
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-[#F3EFEA] text-[#111827] transition-colors"
                >
                  <QrCode className="h-4 w-4 text-[#133E2B]" />
                  <span>Staff Interface (POS)</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-[#F3EFEA] text-[#111827] transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4 text-[#133E2B]" />
                  <span>Owner Dashboard</span>
                </Link>
                <Link
                  href="/mobile"
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-[#F3EFEA] text-[#133E2B] transition-colors"
                >
                  <Smartphone className="h-4 w-4 text-[#133E2B]" />
                  <span>Mobile App Showcase</span>
                </Link>
              </div>
            )}
          </div>

          {/* Search Icon */}
          <button
            type="button"
            aria-label="Search drinks"
            onClick={() => {
              const searchInput = document.getElementById('search-catalog');
              if (searchInput) searchInput.focus();
            }}
            className="p-2 text-[#4B5563] hover:text-[#133E2B] hover:bg-[#F3EFEA] rounded-full transition-colors cursor-pointer"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Cart Icon with badge */}
          <button
            type="button"
            aria-label="Open Cart"
            onClick={onOpenCart}
            className="relative p-2 text-[#4B5563] hover:text-[#133E2B] hover:bg-[#F3EFEA] rounded-full transition-colors cursor-pointer"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#133E2B] px-1 text-[11px] font-bold text-white shadow-xs">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar */}
          <Link
            href="/wallet"
            aria-label="Loyalty Profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F3EE] text-[#133E2B] font-bold text-xs hover:bg-[#133E2B] hover:text-white transition-colors border border-[#133E2B]/20"
          >
            <User className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
