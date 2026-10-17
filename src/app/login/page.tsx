'use client';

import { useState, useTransition } from 'react';
import { Coffee, ShieldCheck, QrCode, Wallet, ArrowRight } from 'lucide-react';
import { login } from '@/actions/auth';
import { computeSpecimenAxes } from '@/lib/design-tokens';

const SPECIMEN_TIERS = [
  { code: 'RWD-01', name: 'House Espresso Shot', points: 60, wght: 490, opsz: 60 },
  { code: 'RWD-02', name: 'Single-Origin Cortado', points: 100, wght: 610, opsz: 88 },
  { code: 'RWD-03', name: 'Geisha Hand Pour-Over', points: 200, wght: 900, opsz: 144 },
];

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [activeRole, setActiveRole] = useState<'owner' | 'staff' | 'customer' | null>(null);
  const [sampleSpend, setSampleSpend] = useState<number>(18.5);

  const samplePoints = Math.floor(sampleSpend + 0.5);
  const specimen = computeSpecimenAxes(samplePoints, 50);

  const handleLogin = (role: 'customer' | 'staff' | 'owner') => {
    setActiveRole(role);
    startTransition(async () => {
      await login(role);
    });
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F8F6F0] text-[#111110] flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-[#111110] bg-[#111110] text-[#F8F6F0]">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 md:px-8">
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="flex h-8 w-8 items-center justify-center bg-[#E02E24] text-[#F8F6F0]">
              <Coffee className="h-4 w-4" />
            </span>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
            >
              BrewPoints
            </span>
          </div>
          <div className="font-mono text-[11px] sm:text-xs text-[#D4D0C5] tabular-nums truncate">
            <span className="hidden sm:inline">USD $1.00 = 1 PT · HALF-UP · </span>
            <span>$1 = 1 PT · JWS HS256</span>
          </div>
        </div>
      </header>

      {/* Main Split Specimen Plane */}
      <main className="mx-auto w-full max-w-[1440px] flex-1 grid grid-cols-1 lg:grid-cols-12 border-x border-[#D4D0C5]">
        {/* Left Column: Interactive Variable-Font Specimen */}
        <section className="lg:col-span-7 p-5 sm:p-8 md:p-10 flex flex-col justify-between gap-6 border-b lg:border-b-0 lg:border-r border-[#111110] bg-[#F8F6F0]">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#111110]">
              Specialty Coffee Loyalty &amp; Counter Terminal
            </h1>
            <p className="text-sm sm:text-base text-[#4A4843]">
              Single-tenant digital loyalty card, dynamic anti-replay QR passes,
              and sub-10-second barista point allocation. Drag the spend axis
              below to inspect how live balances scale across variable font
              weights.
            </p>
          </div>

          {/* Interactive Variable-Axis Specimen Stage */}
          <div className="border-2 border-[#111110] bg-[#FFFFFF] divide-y divide-[#111110]">
            <div className="p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div
                  className="font-specimen text-5xl sm:text-7xl md:text-[84px] leading-none text-[#111110] select-none"
                  style={{
                    ['--specimen-wght' as string]: specimen.wght,
                    ['--specimen-opsz' as string]: specimen.opsz,
                  }}
                >
                  +{samplePoints}
                  <span className="ml-2 text-xl sm:text-2xl md:text-3xl font-normal tracking-normal text-[#4A4843]">
                    pts
                  </span>
                </div>

                <div className="font-mono text-xs text-[#4A4843] space-y-1 tabular-nums">
                  <div className="text-sm font-semibold text-[#111110]">
                    SPEND: ${sampleSpend.toFixed(2)} USD
                  </div>
                  <div>
                    AXIS: &apos;wght&apos; {specimen.wght} · &apos;opsz&apos;{' '}
                    {specimen.opsz}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] sm:text-xs text-[#4A4843] tabular-nums">
                  <label htmlFor="specimen-spend-slider">
                    SCRUB PURCHASE ($1.00 – $50.00 USD)
                  </label>
                  <span className="text-[#E02E24] font-semibold">
                    {specimen.ratio}% AXIS WEIGHT
                  </span>
                </div>
                <input
                  id="specimen-spend-slider"
                  type="range"
                  min={1}
                  max={50}
                  step={0.5}
                  value={sampleSpend}
                  onChange={(e) => setSampleSpend(Number(e.target.value))}
                  className="foundry-slider"
                />
              </div>
            </div>

            {/* Foundry Reward Tier Weight Specimen Scale */}
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#D4D0C5] bg-[#EFECE3]/60">
              {SPECIMEN_TIERS.map((tier) => (
                <div key={tier.code} className="p-4 flex sm:flex-col justify-between items-baseline gap-2">
                  <div>
                    <div className="font-mono text-[11px] text-[#4A4843]">
                      {tier.code} · &apos;wght&apos; {tier.wght}
                    </div>
                    <div className="text-xs font-semibold text-[#111110] mt-0.5">
                      {tier.name}
                    </div>
                  </div>
                  <div
                    className="font-specimen text-2xl sm:text-3xl text-[#111110] sm:mt-2"
                    style={{
                      ['--specimen-wght' as string]: tier.wght,
                      ['--specimen-opsz' as string]: tier.opsz,
                    }}
                  >
                    {tier.points}{' '}
                    <span className="text-xs font-normal text-[#4A4843]">pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2 font-mono text-xs text-[#4A4843] tabular-nums">
            <div className="border-t border-[#111110] pt-2 flex sm:block justify-between">
              <div className="font-semibold text-[#111110]">ALLOCATION QR</div>
              <div>10m Dynamic JWS</div>
            </div>
            <div className="border-t border-[#111110] pt-2 flex sm:block justify-between">
              <div className="font-semibold text-[#111110]">REDEMPTION QR</div>
              <div>15m Single-Use JTI</div>
            </div>
            <div className="border-t border-[#111110] pt-2 flex sm:block justify-between">
              <div className="font-semibold text-[#111110]">COUNTER TARGET</div>
              <div>&lt;10.0s Barista Scan</div>
            </div>
          </div>
        </section>

        {/* Right Column: Role Terminal Selector */}
        <section className="lg:col-span-5 p-5 sm:p-8 md:p-10 flex flex-col justify-between gap-6 bg-[#EFECE3]">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <h2 className="text-2xl md:text-3xl font-bold text-[#111110]">
                Select Role Terminal
              </h2>
              <p className="text-sm text-[#4A4843]">
                Choose a pre-seeded role session to launch the corresponding
                workspace.
              </p>
            </div>

            <div className="divide-y divide-[#111110] border-2 border-[#111110] bg-[#FFFFFF]">
              {/* Owner Terminal */}
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleLogin('owner')}
                className="w-full p-4 sm:p-5 text-left transition-colors hover:bg-[#F8F6F0] disabled:opacity-60 flex items-start justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center bg-[#111110] text-[#F8F6F0] group-hover:bg-[#E02E24] transition-colors">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div className="space-y-1">
                    <div className="font-semibold text-base text-[#111110] flex flex-wrap items-center gap-2">
                      <span>Shop Owner</span>
                      <span className="font-mono text-[11px] px-1.5 py-0.5 bg-[#EFECE3] text-[#111110]">
                        ADMIN
                      </span>
                    </div>
                    <p className="text-xs text-[#4A4843]">
                      Program health telemetry, point velocity, reward catalog
                      CRUD, and barista roster management.
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#4A4843] group-hover:text-[#E02E24] group-hover:translate-x-0.5 transition-all mt-1" />
              </button>

              {/* Barista / Staff Terminal */}
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleLogin('staff')}
                className="w-full p-4 sm:p-5 text-left transition-colors hover:bg-[#F8F6F0] disabled:opacity-60 flex items-start justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center bg-[#111110] text-[#F8F6F0] group-hover:bg-[#E02E24] transition-colors">
                    <QrCode className="h-4 w-4" />
                  </span>
                  <div className="space-y-1">
                    <div className="font-semibold text-base text-[#111110] flex flex-wrap items-center gap-2">
                      <span>Barista / Staff</span>
                      <span className="font-mono text-[11px] px-1.5 py-0.5 bg-[#EFECE3] text-[#111110]">
                        POS
                      </span>
                    </div>
                    <p className="text-xs text-[#4A4843]">
                      Sub-10-second QR scanner, USD spend calculator, and
                      single-use reward redemption confirmation.
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#4A4843] group-hover:text-[#E02E24] group-hover:translate-x-0.5 transition-all mt-1" />
              </button>

              {/* Customer Wallet */}
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleLogin('customer')}
                className="w-full p-4 sm:p-5 text-left transition-colors hover:bg-[#F8F6F0] disabled:opacity-60 flex items-start justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center bg-[#E02E24] text-[#F8F6F0] transition-colors">
                    <Wallet className="h-4 w-4" />
                  </span>
                  <div className="space-y-1">
                    <div className="font-semibold text-base text-[#111110] flex flex-wrap items-center gap-2">
                      <span>Customer Wallet</span>
                      <span className="font-mono text-[11px] px-1.5 py-0.5 bg-[#E02E24] text-[#F8F6F0]">
                        MOBILE PWA
                      </span>
                    </div>
                    <p className="text-xs text-[#4A4843]">
                      Live variable-weight point balance, auto-rotating 10m earn
                      QR, reward catalog, and ledger history.
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#E02E24] group-hover:translate-x-0.5 transition-all mt-1" />
              </button>
            </div>

            {isPending && (
              <div className="border border-[#111110] bg-[#111110] text-[#F8F6F0] px-4 py-3 font-mono text-xs">
                AUTHENTICATING {activeRole?.toUpperCase()} SESSION...
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#D4D0C5] font-mono text-xs text-[#4A4843]">
            Dual-Mode Auth: Cookie Session (Web) &amp; Firebase Bearer Token
            (Mobile API)
          </div>
        </section>
      </main>
    </div>
  );
}
