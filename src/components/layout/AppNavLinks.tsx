'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coffee, ClipboardList, LayoutDashboard, Wallet } from 'lucide-react';

export function AppNavLinks() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Order Menu', icon: Coffee },
    { href: '/queue', label: 'Kitchen Queue', icon: ClipboardList },
    { href: '/dashboard', label: 'Owner Admin', icon: LayoutDashboard },
    { href: '/wallet', label: 'Loyalty Pass', icon: Wallet },
  ];

  return (
    <>
      {/* Desktop Navigation Links */}
      <nav
        aria-label="Primary Navigation"
        className="hidden md:flex items-stretch h-16"
      >
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 transition-colors ${
                isActive
                  ? 'border-[#E02E24] text-[#F8F6F0] bg-[#1C1B19]'
                  : 'border-transparent text-[#C7C2B6] hover:text-[#F8F6F0] hover:bg-[#191816]'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Bottom Thumb-Zone Bar */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#111110] border-t border-[#2C2B29] text-[#F8F6F0] grid grid-cols-4"
      >
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2.5 px-1 text-xs font-mono uppercase tracking-wider font-semibold border-t-2 transition-colors ${
                isActive
                  ? 'border-[#E02E24] text-[#F8F6F0] bg-[#1C1B19]'
                  : 'border-transparent text-[#C7C2B6] hover:text-[#F8F6F0]'
              }`}
            >
              <Icon className="h-4 w-4 mb-1 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
