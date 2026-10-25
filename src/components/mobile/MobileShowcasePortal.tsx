'use client';

import { useState } from 'react';
import {
  BookOpen,
  ClipboardList,
  LayoutGrid,
  ShoppingCart,
  Smartphone,
  SlidersHorizontal,
  Star,
  Timer,
  User,
} from 'lucide-react';
import { MobileAppProvider, useMobileApp } from './MobileAppContext';
import { SCREENS, type ScreenDef } from './MobileScreens';
import { C, LeafMark } from './MobileUI';

type ViewMode = 'device' | 'all';

export function MobileShowcasePortal() {
  const [viewMode, setViewMode] = useState<ViewMode>('device');
  return (
    <MobileAppProvider autoAdvance={viewMode === 'device'}>
      <ShowcaseLayout viewMode={viewMode} setViewMode={setViewMode} />
    </MobileAppProvider>
  );
}

function ShowcaseLayout({ viewMode, setViewMode }: { viewMode: ViewMode; setViewMode: (m: ViewMode) => void }) {
  const { screen, navigate } = useMobileApp();
  const active = SCREENS.find((s) => s.id === screen) ?? SCREENS[0];

  const openScreen = (def: ScreenDef) => {
    navigate(def.id);
    setViewMode('device');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className="min-h-screen px-4 py-8 font-sans sm:px-8 [&_:is(h1,h2,h3,h4)]:font-sans"
      style={{ background: '#F1ECE4', color: C.ink }}
    >
      <div className="mx-auto max-w-[1440px] space-y-8">
        {/* Brand header */}
        <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <LeafMark className="h-12 w-12" />
            <div>
              <h1 className="text-[34px] font-semibold leading-none tracking-tight">BrewFlow</h1>
              <p className="mt-1 text-[13px]" style={{ color: C.muted }}>
                Good Coffee. Better Days.
              </p>
            </div>
          </div>
          <div className="text-[13px] font-medium tracking-[0.2em]" style={{ color: C.ink }}>
            ORDER <span className="mx-2 opacity-40">/</span> EARN <span className="mx-2 opacity-40">/</span> REDEEM{' '}
            <span className="mx-2 opacity-40">/</span> ENJOY
          </div>
          <p className="max-w-[260px] text-[13px] leading-relaxed" style={{ color: C.muted }}>
            Everything you love about your favorite coffee shop — in your pocket.
          </p>
        </header>

        {/* View toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-y py-3" style={{ borderColor: '#E2DBCF' }}>
          <div className="text-[13px]" style={{ color: C.muted }}>
            {viewMode === 'device' ? (
              <>
                Viewing <span className="font-semibold" style={{ color: C.ink }}>{active.number}. {active.title}</span> — tap
                through the phone like the real app.
              </>
            ) : (
              <>All {SCREENS.length} screens. Select one to open it in the interactive phone.</>
            )}
          </div>
          <div className="flex rounded-full border bg-white p-1" style={{ borderColor: '#E2DBCF' }} role="tablist">
            <ToggleButton active={viewMode === 'device'} onClick={() => setViewMode('device')} icon={<Smartphone className="h-3.5 w-3.5" />}>
              Interactive
            </ToggleButton>
            <ToggleButton active={viewMode === 'all'} onClick={() => setViewMode('all')} icon={<LayoutGrid className="h-3.5 w-3.5" />}>
              All screens
            </ToggleButton>
          </div>
        </div>

        {viewMode === 'device' ? (
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_auto_1fr]">
            <ScreenIndex activeId={active.id} onSelect={openScreen} />
            <div className="order-first flex justify-center lg:order-none">
              <PhoneFrame>
                <active.Component />
              </PhoneFrame>
            </div>
            <KeyFeatures />
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-10 [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
            {SCREENS.map((def) => (
              <figure key={def.id} className="flex flex-col items-center">
                {/* div, not <button>: the inert screen inside still contains buttons */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => openScreen(def)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openScreen(def);
                    }
                  }}
                  aria-label={`Open ${def.title} in the interactive phone`}
                  className="cursor-pointer rounded-[46px] transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#133E2B]"
                >
                  <PhoneFrame inert>
                    <def.Component />
                  </PhoneFrame>
                </div>
                <Caption def={def} className="mt-4 w-[320px]" />
              </figure>
            ))}
            <div className="flex items-start justify-center">
              <KeyFeatures className="w-[320px]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors"
      style={{ background: active ? C.green : 'transparent', color: active ? '#FFF' : C.muted }}
    >
      {icon}
      {children}
    </button>
  );
}

function PhoneFrame({ children, inert = false }: { children: React.ReactNode; inert?: boolean }) {
  return (
    <div className="relative h-[660px] w-[320px] shrink-0 rounded-[46px] bg-[#16130F] p-[9px] shadow-[0_24px_60px_-20px_rgba(40,28,18,0.45)] ring-1 ring-black/20">
      <div className="pointer-events-none absolute left-1/2 top-[18px] z-30 h-[22px] w-[92px] -translate-x-1/2 rounded-full bg-black" />
      <div className="relative h-full w-full overflow-hidden rounded-[38px] bg-white" inert={inert}>
        {children}
      </div>
    </div>
  );
}

function Caption({ def, className = '' }: { def: ScreenDef; className?: string }) {
  return (
    <figcaption className={className}>
      <div className="text-[14px] font-semibold">
        {def.number}. {def.title}
      </div>
      <p className="mt-0.5 text-[12px] leading-relaxed" style={{ color: C.muted }}>
        {def.caption}
      </p>
    </figcaption>
  );
}

function ScreenIndex({ activeId, onSelect }: { activeId: string; onSelect: (def: ScreenDef) => void }) {
  return (
    <nav aria-label="App screens" className="lg:justify-self-end">
      {/* Phones and tablets: horizontal chips */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:hidden">
        {SCREENS.map((def) => {
          const active = def.id === activeId;
          return (
            <button
              key={def.id}
              onClick={() => onSelect(def)}
              className="whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] font-medium"
              style={{
                background: active ? C.green : '#FFF',
                color: active ? '#FFF' : C.ink,
                borderColor: active ? C.green : '#E2DBCF',
              }}
            >
              {def.number}. {def.title}
            </button>
          );
        })}
      </div>

      {/* Desktop: numbered list with captions */}
      <ol className="hidden w-[300px] space-y-0.5 lg:block">
        {SCREENS.map((def) => {
          const active = def.id === activeId;
          return (
            <li key={def.id}>
              <button
                onClick={() => onSelect(def)}
                aria-current={active ? 'page' : undefined}
                className="w-full rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/70"
                style={{ background: active ? '#FFFFFF' : undefined, boxShadow: active ? '0 1px 2px rgba(0,0,0,0.05)' : undefined }}
              >
                <div className="text-[13px] font-semibold" style={{ color: active ? C.green : C.ink }}>
                  {def.number}. {def.title}
                </div>
                {active && (
                  <p className="mt-0.5 text-[11px] leading-relaxed" style={{ color: C.muted }}>
                    {def.caption}
                  </p>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

const FEATURES = [
  { icon: BookOpen, title: 'Browse Menu', body: 'View drinks, snacks, and seasonal offers.' },
  { icon: SlidersHorizontal, title: 'Customize Orders', body: 'Choose size, milk, and add-ons.' },
  { icon: ShoppingCart, title: 'Easy Checkout', body: 'Secure and simple ordering process.' },
  { icon: Timer, title: 'Real-Time Tracking', body: 'Know when your order is ready.' },
  { icon: Star, title: 'Loyalty Rewards', body: 'Earn points and redeem freebies.' },
  { icon: ClipboardList, title: 'Order History', body: 'Revisit your favorite orders.' },
  { icon: User, title: 'Profile & Settings', body: 'Manage your account and preferences.' },
];

function KeyFeatures({ className = '' }: { className?: string }) {
  return (
    <aside className={`rounded-3xl p-6 lg:max-w-[320px] ${className}`} style={{ background: '#E9E2D7' }}>
      <h2 className="mb-5 text-[16px] font-semibold">Key Features</h2>
      <ul className="space-y-4">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white" style={{ background: C.green }}>
              <Icon className="h-4 w-4" strokeWidth={1.9} />
            </span>
            <div>
              <div className="text-[13px] font-semibold">{title}</div>
              <div className="text-[11px]" style={{ color: C.muted }}>
                {body}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 text-right">
        <p className="ml-auto inline-block -rotate-6 text-[15px] italic leading-snug" style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', color: C.ink }}>
          Great coffee
          <br />
          is always a good idea.
        </p>
        <div className="mt-2 flex justify-end">
          <LeafMark className="h-5 w-5" />
        </div>
      </div>
    </aside>
  );
}
