'use client';

import Image from 'next/image';
import {
  BookOpen,
  Check,
  ChevronLeft,
  ClipboardList,
  House,
  Minus,
  Plus,
  Star,
  User,
} from 'lucide-react';
import { useMobileApp, type MobileScreen } from './MobileAppContext';

/* Palette shared by every phone screen */
export const C = {
  green: '#133E2B',
  greenDeep: '#0D2E20',
  greenTint: '#EAF1EC',
  cream: '#F7F4EE',
  border: '#ECE6DC',
  ink: '#1F1B16',
  muted: '#7A746B',
} as const;

export function LeafMark({ className = 'h-8 w-8', color = C.green }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M15 29C15.5 19 11 10.5 2 7.5c-.4 10.2 4.6 18.3 13 21.5z" fill={color} />
      <path d="M17 29c-.3-11 4.4-19.3 13-23 .6 10.6-4.3 19.3-13 23z" fill={color} />
      <path
        d="M15 28.5C13.4 21 9.6 14.4 4.5 10.2M17 28.5c1.4-8.3 5.3-15.5 11-20"
        stroke="#fff"
        strokeOpacity="0.35"
        strokeWidth="0.9"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GoogleMark({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export function StatusBar({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const color = tone === 'light' ? '#FFFFFF' : C.ink;
  return (
    <div
      className="relative z-20 flex h-11 shrink-0 items-center justify-between px-7 pt-1 text-[12px] font-semibold"
      style={{ color }}
    >
      <span>9:41</span>
      <div className="flex items-center gap-1" aria-hidden="true">
        {/* signal */}
        <svg viewBox="0 0 18 12" className="h-2.5 w-4" fill={color}>
          <rect x="0" y="8" width="3" height="4" rx="0.8" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="0.8" />
          <rect x="10" y="3" width="3" height="9" rx="0.8" />
          <rect x="15" y="0" width="3" height="12" rx="0.8" />
        </svg>
        {/* wifi */}
        <svg viewBox="0 0 16 12" className="h-2.5 w-3.5" fill={color}>
          <path d="M8 2.2c2.5 0 4.8 1 6.5 2.6l1.2-1.3C13.7 1.6 11 .4 8 .4S2.3 1.6.3 3.5l1.2 1.3C3.2 3.2 5.5 2.2 8 2.2zm0 3.6c1.5 0 2.9.6 3.9 1.5l1.3-1.3C11.8 4.8 10 4 8 4s-3.8.8-5.2 2l1.3 1.3c1-.9 2.4-1.5 3.9-1.5zM8 9.4c-.6 0-1.2.2-1.6.6L8 11.6 9.6 10c-.4-.4-1-.6-1.6-.6z" />
        </svg>
        {/* battery */}
        <svg viewBox="0 0 26 12" className="h-2.5 w-5" fill="none">
          <rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke={color} strokeOpacity="0.4" />
          <rect x="2" y="2" width="19" height="8" rx="1.8" fill={color} />
          <path d="M24 4v4c.8-.3 1.3-1.1 1.3-2S24.8 4.3 24 4z" fill={color} fillOpacity="0.5" />
        </svg>
      </div>
    </div>
  );
}

/** Screen wrapper: status bar + scrollable body + optional footer. */
export function Screen({
  children,
  footer,
  tone = 'dark',
  bg = '#FFFFFF',
  header,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
  tone?: 'dark' | 'light';
  bg?: string;
  header?: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden" style={{ background: bg, color: C.ink }}>
      <StatusBar tone={tone} />
      {header}
      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
      {footer}
    </div>
  );
}

export function TopBar({ title, back, right }: { title: string; back?: MobileScreen; right?: React.ReactNode }) {
  const { navigate } = useMobileApp();
  return (
    <div className="flex h-11 shrink-0 items-center gap-1.5 px-4">
      {back && (
        <button
          onClick={() => navigate(back)}
          aria-label="Back"
          className="-ml-1 flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      <h2 className="flex-1 text-[15px] font-semibold">{title}</h2>
      {right}
    </div>
  );
}

const NAV_ITEMS: { id: MobileScreen; label: string; icon: typeof House }[] = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'menu', label: 'Menu', icon: BookOpen },
  { id: 'history', label: 'Orders', icon: ClipboardList },
  { id: 'rewards', label: 'Rewards', icon: Star },
  { id: 'profile', label: 'Profile', icon: User },
];

export function BottomNav({ active }: { active: MobileScreen }) {
  const { navigate } = useMobileApp();
  return (
    <nav className="flex shrink-0 items-start justify-around border-t bg-white px-2 pb-5 pt-2" style={{ borderColor: C.border }}>
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
        const isActive = id === active;
        return (
          <button
            key={id}
            onClick={() => navigate(id)}
            className="flex w-12 flex-col items-center gap-0.5 text-[10px]"
            style={{ color: isActive ? C.green : '#9A948A', fontWeight: isActive ? 600 : 500 }}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.4 : 1.8} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

export function Thumb({ src, alt, className = 'h-12 w-12 rounded-xl' }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative shrink-0 overflow-hidden bg-[#F1ECE4] ${className}`}>
      <Image src={src} alt={alt} fill sizes="160px" className="object-cover" />
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-xl py-3 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0D2E20] disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      style={{ background: C.green }}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border bg-white py-3 text-[13px] font-semibold transition-colors hover:bg-[#F7F4EE]"
      style={{ borderColor: C.border, color: C.ink }}
    >
      {children}
    </button>
  );
}

/** Selectable tile used for size and milk choices. */
export function OptionTile({
  selected,
  onClick,
  label,
  sub,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  sub?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className="rounded-lg border py-2 text-center text-[11px] transition-colors"
      style={{
        borderColor: selected ? C.green : C.border,
        background: selected ? C.greenTint : '#FFFFFF',
        color: selected ? C.green : C.muted,
        fontWeight: selected ? 600 : 500,
        boxShadow: selected ? `inset 0 0 0 1px ${C.green}` : undefined,
      }}
    >
      <div>{label}</div>
      {sub && <div className="mt-0.5 text-[10px] font-normal opacity-80">{sub}</div>}
    </button>
  );
}

export function CheckRow({
  checked,
  onClick,
  label,
  trailing,
}: {
  checked: boolean;
  onClick: () => void;
  label: string;
  trailing?: string;
}) {
  return (
    <button onClick={onClick} role="checkbox" aria-checked={checked} className="flex w-full items-center gap-2.5 py-1.5 text-[12px]">
      <span
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded border"
        style={{ borderColor: checked ? C.green : '#CFC8BC', background: checked ? C.green : '#FFF' }}
      >
        {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </span>
      <span className="flex-1 text-left">{label}</span>
      {trailing && <span style={{ color: C.muted }}>{trailing}</span>}
    </button>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 text-[12px] font-semibold">{children}</div>;
}

export function Stepper({ value, onChange, min = 1 }: { value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div className="flex items-center rounded-lg border bg-white" style={{ borderColor: C.border }}>
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Decrease quantity"
        className="flex h-8 w-8 items-center justify-center disabled:opacity-30"
        disabled={value <= min}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-5 text-center text-[12px] font-semibold tabular-nums">{value}</span>
      <button onClick={() => onChange(value + 1)} aria-label="Increase quantity" className="flex h-8 w-8 items-center justify-center">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function SegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex gap-1.5 rounded-xl p-1" style={{ background: '#F1ECE4' }} role="tablist">
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className="flex-1 rounded-lg py-1.5 text-[11px] font-semibold transition-colors"
            style={{ background: active ? C.green : 'transparent', color: active ? '#FFF' : C.muted }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
