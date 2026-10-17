import Link from 'next/link';
import { Coffee } from 'lucide-react';
import { AppNavLinks } from '@/components/layout/AppNavLinks';

export function AppNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#2C2B29] bg-[#111110] text-[#F8F6F0]">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6 h-full">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-[#F8F6F0] hover:opacity-90 transition-opacity"
          >
            <span className="flex h-8 w-8 items-center justify-center bg-[#E02E24] text-[#F8F6F0]">
              <Coffee className="h-4 w-4" />
            </span>
            <div className="flex flex-col">
              <span
                className="text-xl font-bold tracking-tight leading-none"
                style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
              >
                BrewFlow
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-[#C7C2B6] mt-0.5">
                Ordering &amp; Pickup
              </span>
            </div>
          </Link>

          <AppNavLinks />
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 border border-[#2C2B29] bg-[#1A1918] px-3 py-1 font-mono text-xs text-[#D4D0C5] tabular-nums">
            <span className="h-1.5 w-1.5 rounded-full bg-[#15803D] inline-block animate-pulse" />
            <span>STORE SYNC: BROADCAST BUS</span>
            <span aria-hidden="true">·</span>
            <span>$1 = 1 PT</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="hidden sm:inline-block border border-[#3D3B37] bg-[#1F1E1C] px-2 py-1 text-[#D4D0C5]">
              PORTFOLIO PREVIEW
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
