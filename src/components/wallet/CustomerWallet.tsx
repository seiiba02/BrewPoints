'use client';

import { useCallback, useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  RefreshCw,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { computeSpecimenAxes } from '@/lib/design-tokens';
import {
  configureFoundryStatusBar,
  copyTextWithCapacitor,
  getCapacitorPlatform,
  triggerFoundryHaptic,
} from '@/lib/capacitor/nativeBridge';

interface BalanceData {
  current_points: number;
  total_points_earned: number;
  total_points_redeemed: number;
  last_earned_at: string | null;
}

interface RewardItem {
  id: number;
  name: string;
  description: string | null;
  points_required: number;
  active: boolean;
}

interface TransactionItem {
  id: number;
  type: 'earn' | 'redeem' | 'adjust';
  points: number;
  amount: string | null;
  note: string | null;
  staff: { id: number; name: string } | null;
  reward: { id: number; name: string } | null;
  created_at: string;
}

interface RedemptionModalData {
  qr_payload: string;
  expires_at: number;
  reward: {
    id: number;
    name: string;
    points_required: number;
  };
  current_balance: number;
}

function formatCountdown(expiresAtUnix: number, nowMs: number): string {
  const remainingSec = Math.max(0, Math.floor(expiresAtUnix - nowMs / 1000));
  const mins = Math.floor(remainingSec / 60);
  const secs = remainingSec % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function CustomerWallet({ userName }: { userName: string }) {
  const [balance, setBalance] = useState<BalanceData>({
    current_points: 0,
    total_points_earned: 0,
    total_points_redeemed: 0,
    last_earned_at: null,
  });
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalTx, setTotalTx] = useState(0);

  const [allocationQr, setAllocationQr] = useState<{
    qr_payload: string;
    expires_at: number;
  } | null>(null);
  const [copiedAlloc, setCopiedAlloc] = useState(false);

  const [redemptionModal, setRedemptionModal] =
    useState<RedemptionModalData | null>(null);
  const [copiedRedeem, setCopiedRedeem] = useState(false);
  const [mintingRewardId, setMintingRewardId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Interactive variable-font axis preview offset (+0 to +200 simulated points)
  const [simulatedBonusPts, setSimulatedBonusPts] = useState<number>(0);
  const [mobileSection, setMobileSection] = useState<
    'all' | 'pass' | 'rewards' | 'ledger'
  >('all');
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchWalletData = useCallback(async (txPage = 1) => {
    setError(null);
    try {
      const [balRes, rewRes, txRes] = await Promise.all([
        fetch('/api/v1/me/balance'),
        fetch('/api/v1/rewards'),
        fetch(`/api/v1/me/transactions?page=${txPage}`),
      ]);

      if (balRes.ok) {
        const balJson = await balRes.json();
        setBalance(balJson.data);
      }
      if (rewRes.ok) {
        const rewJson = await rewRes.json();
        setRewards(rewJson.data ?? []);
      }
      if (txRes.ok) {
        const txJson = await txRes.json();
        setTransactions(txJson.data ?? []);
        setPage(txJson.meta?.current_page ?? 1);
        setLastPage(txJson.meta?.last_page ?? 1);
        setTotalTx(txJson.meta?.total ?? 0);
      }
    } catch {
      setError('Unable to sync wallet balance. Check connection and retry.');
    }
  }, []);

  const refreshAllocationQr = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/me/allocation-token', {
        method: 'POST',
      });
      if (res.ok) {
        const json = await res.json();
        setAllocationQr({
          qr_payload: json.data.qr_payload,
          expires_at: json.data.expires_at,
        });
      }
    } catch {
      // Ignore transient refresh error
    }
  }, []);

  useEffect(() => {
    void configureFoundryStatusBar();
    fetchWalletData(1);
    refreshAllocationQr();
  }, [fetchWalletData, refreshAllocationQr]);

  const sortedRewards = [...rewards].sort(
    (a, b) => a.points_required - b.points_required
  );
  const effectivePoints = balance.current_points + simulatedBonusPts;
  const maxCatalogPoints =
    sortedRewards[sortedRewards.length - 1]?.points_required ?? 200;

  const nextMilestoneReward =
    sortedRewards.find((r) => r.points_required > effectivePoints) ??
    sortedRewards[sortedRewards.length - 1] ??
    null;

  const progressPercent = nextMilestoneReward
    ? Math.min(
        100,
        Math.round((effectivePoints / nextMilestoneReward.points_required) * 100)
      )
    : 100;
  const pointsRemaining = nextMilestoneReward
    ? Math.max(0, nextMilestoneReward.points_required - effectivePoints)
    : 0;

  const specimen = computeSpecimenAxes(effectivePoints, maxCatalogPoints);

  const handleMintRedemption = async (rewardId: number) => {
    setMintingRewardId(rewardId);
    setError(null);
    try {
      const res = await fetch('/api/v1/redemptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reward_id: rewardId }),
      });
      const json = await res.json();
      if (!res.ok) {
        await triggerFoundryHaptic('error');
        setError(json.message ?? 'Could not generate redemption QR.');
        return;
      }
      await triggerFoundryHaptic('success');
      setRedemptionModal(json.data);
    } catch {
      await triggerFoundryHaptic('error');
      setError('Could not generate redemption QR.');
    } finally {
      setMintingRewardId(null);
    }
  };

  const copyText = async (text: string, type: 'alloc' | 'redeem') => {
    await copyTextWithCapacitor(text);
    if (type === 'alloc') {
      setCopiedAlloc(true);
      setTimeout(() => setCopiedAlloc(false), 2000);
    } else {
      setCopiedRedeem(true);
      setTimeout(() => setCopiedRedeem(false), 2000);
    }
  };

  const runtimePlatform = getCapacitorPlatform();

  const totalRedemptionsCount = transactions.filter(
    (t) => t.type === 'redeem'
  ).length;

  return (
    <div className="space-y-8">
      {/* Header Row */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-[#111110] pb-5">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#111110]">
            {userName}&apos;s Loyalty Pass
          </h1>
          <p className="mt-1 text-sm text-[#4A4843]">
            Present your dynamic QR pass at the espresso bar to earn 1 point per
            $1.00 USD spent.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="border border-[#111110] bg-[#EFECE3] px-2.5 py-2 font-mono text-[11px] font-semibold uppercase text-[#111110]">
            CAPACITOR · {runtimePlatform.toUpperCase()}
          </span>
          <button
            type="button"
            onClick={() => {
              void triggerFoundryHaptic('light');
              fetchWalletData(page);
            }}
            className="inline-flex items-center gap-1.5 border border-[#111110] bg-[#FFFFFF] px-3.5 py-2 font-mono text-xs font-semibold uppercase text-[#111110] hover:bg-[#EFECE3] transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sync Ledger</span>
          </button>
        </div>
      </div>

      {/* Mobile Viewport Filter Strip */}
      <div
        role="tablist"
        aria-label="Wallet Sections"
        className="grid grid-cols-4 md:hidden border border-[#111110] bg-[#FFFFFF] font-mono text-xs"
      >
        {(
          [
            { id: 'all', label: 'All' },
            { id: 'pass', label: 'QR Pass' },
            { id: 'rewards', label: 'Rewards' },
            { id: 'ledger', label: 'History' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={mobileSection === tab.id}
            type="button"
            onClick={() => setMobileSection(tab.id)}
            className={`py-2.5 font-semibold uppercase transition-colors ${
              mobileSection === tab.id
                ? 'bg-[#111110] text-[#F8F6F0]'
                : 'text-[#4A4843] hover:text-[#111110]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div
          role="alert"
          className="border border-[#B91C1C] bg-[#FEF2F2] p-4 font-mono text-xs text-[#B91C1C]"
        >
          ERROR: {error}
        </div>
      )}

      {/* Primary First-Viewport Grid: Variable Balance Specimen + Dynamic Allocation QR */}
      {(mobileSection === 'all' || mobileSection === 'pass') && (
        <section className="grid grid-cols-1 lg:grid-cols-12 border-2 border-[#111110] bg-[#FFFFFF]">
          {/* Left 7 Columns: Kinetic Variable-Type Balance Specimen */}
          <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#111110]">
            <div className="space-y-6">
              <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#D4D0C5] pb-6">
                <div>
                  <div
                    className="font-specimen text-6xl sm:text-7xl md:text-[84px] leading-none text-[#111110]"
                    style={{
                      ['--specimen-wght' as string]: specimen.wght,
                      ['--specimen-opsz' as string]: specimen.opsz,
                    }}
                  >
                    {effectivePoints.toLocaleString()}
                    <span className="ml-2 text-2xl md:text-3xl font-normal tracking-normal text-[#4A4843]">
                      pts
                    </span>
                  </div>
                  {simulatedBonusPts > 0 && (
                    <p className="mt-2 font-mono text-xs text-[#E02E24]">
                      PREVIEWING +{simulatedBonusPts} PTS (+$
                      {simulatedBonusPts.toFixed(2)} SIMULATED SPEND) · ACTUAL
                      BALANCE: {balance.current_points} PTS
                    </p>
                  )}
                </div>

                <div className="font-mono text-xs text-[#4A4843] text-left sm:text-right space-y-1 tabular-nums">
                  <div className="text-[#111110] font-semibold">
                    SPECIMEN AXIS TELEMETRY
                  </div>
                  <div>
                    &apos;wght&apos; {specimen.wght} · &apos;opsz&apos;{' '}
                    {specimen.opsz}
                  </div>
                  <div>SCALE: {specimen.ratio}% OF CATALOG MAX</div>
                </div>
              </div>

              {/* Milestone Progress Bar */}
              {nextMilestoneReward && (
                <div className="space-y-2.5 bg-[#F8F6F0] p-4 border border-[#D4D0C5]">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-semibold text-[#111110]">
                      {pointsRemaining > 0
                        ? `Target Tier: ${nextMilestoneReward.name}`
                        : `Unlocked: ${nextMilestoneReward.name}`}
                    </span>
                    <span className="font-mono text-xs font-semibold text-[#111110] tabular-nums">
                      {effectivePoints} / {nextMilestoneReward.points_required}{' '}
                      PTS ({progressPercent}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-[#D4D0C5]">
                    <div
                      className="h-full bg-[#E02E24] transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="font-mono text-xs text-[#4A4843]">
                    {pointsRemaining > 0
                      ? `${pointsRemaining} MORE POINTS ($${pointsRemaining.toFixed(
                          2
                        )} SPEND) TO UNLOCK THIS REWARD`
                      : 'ALL CATALOG TIERS UNLOCKED AT THIS BALANCE'}
                  </p>
                </div>
              )}

              {/* Interactive Foundry Axis Simulator */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between font-mono text-xs text-[#4A4843]">
                  <label htmlFor="wallet-axis-slider">
                    SIMULATE FUTURE SPEND AXIS (+$0 TO +$200 USD)
                  </label>
                  {simulatedBonusPts > 0 ? (
                    <button
                      type="button"
                      onClick={() => setSimulatedBonusPts(0)}
                      className="text-[#E02E24] underline cursor-pointer font-semibold"
                    >
                      RESET TO LIVE ({balance.current_points} PTS)
                    </button>
                  ) : (
                    <span>LIVE BALANCE LOCKED</span>
                  )}
                </div>
                <input
                  id="wallet-axis-slider"
                  type="range"
                  min={0}
                  max={200}
                  step={5}
                  value={simulatedBonusPts}
                  onChange={(e) => setSimulatedBonusPts(Number(e.target.value))}
                  className="foundry-slider"
                />
              </div>
            </div>

            {/* Lifetime Ledger Summary Strip */}
            <div className="mt-8 grid grid-cols-3 border-t border-[#111110] pt-4 font-mono text-xs tabular-nums">
              <div className="pr-3 border-r border-[#D4D0C5]">
                <div className="text-[#4A4843]">LIFETIME EARNED</div>
                <div className="mt-1 text-base font-bold text-[#111110]">
                  {balance.total_points_earned.toLocaleString()} pts
                </div>
              </div>
              <div className="px-3 border-r border-[#D4D0C5]">
                <div className="text-[#4A4843]">LIFETIME REDEEMED</div>
                <div className="mt-1 text-base font-bold text-[#111110]">
                  {balance.total_points_redeemed.toLocaleString()} pts
                </div>
              </div>
              <div className="pl-3">
                <div className="text-[#4A4843]">REWARDS CLAIMED</div>
                <div className="mt-1 text-base font-bold text-[#15803D]">
                  {totalRedemptionsCount}
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Dynamic 10-Minute Allocation QR Well */}
          <div className="lg:col-span-5 p-6 md:p-8 bg-[#EFECE3] flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2 border-b border-[#111110] pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#111110]">
                  Counter Allocation QR Pass
                </h2>
                <p className="text-xs text-[#4A4843] mt-0.5">
                  Barista scans at checkout · Auto-rotates every 10 minutes
                </p>
              </div>
              {allocationQr && (
                <span className="shrink-0 bg-[#111110] px-2.5 py-1 font-mono text-xs font-semibold text-[#F8F6F0] tabular-nums">
                  TTL {formatCountdown(allocationQr.expires_at, nowMs)}
                </span>
              )}
            </div>

            <div className="my-6 flex flex-col items-center justify-center">
              {allocationQr ? (
                <div className="border-2 border-[#111110] bg-[#FFFFFF] p-4">
                  <QRCodeSVG
                    value={allocationQr.qr_payload}
                    size={176}
                    bgColor="#FFFFFF"
                    fgColor="#111110"
                  />
                </div>
              ) : (
                <div className="flex h-48 w-48 items-center justify-center border-2 border-dashed border-[#111110] bg-[#FFFFFF] font-mono text-xs text-[#4A4843]">
                  MINTING JWS PASS...
                </div>
              )}
              <p className="mt-3 font-mono text-[11px] text-[#4A4843] text-center break-all max-w-xs">
                {allocationQr
                  ? `${allocationQr.qr_payload.slice(0, 42)}...`
                  : 'brewpoints://allocate?token=...'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#D4D0C5]">
              <button
                type="button"
                onClick={refreshAllocationQr}
                className="flex items-center justify-center gap-1.5 border border-[#111110] bg-[#FFFFFF] py-2.5 px-3 font-mono text-xs font-semibold uppercase text-[#111110] hover:bg-[#F8F6F0] transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Rotate Token</span>
              </button>
              {allocationQr && (
                <button
                  type="button"
                  onClick={() => copyText(allocationQr.qr_payload, 'alloc')}
                  className="flex items-center justify-center gap-1.5 bg-[#111110] py-2.5 px-3 font-mono text-xs font-semibold uppercase text-[#F8F6F0] hover:bg-[#E02E24] transition-colors cursor-pointer"
                >
                  {copiedAlloc ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Copied URI</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy QR URI</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Available Rewards Specimen Catalog */}
      {(mobileSection === 'all' || mobileSection === 'rewards') && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#111110] pb-3">
            <div>
              <h2 className="text-2xl font-bold text-[#111110]">
                Reward Specimen Catalog
              </h2>
              <p className="text-sm text-[#4A4843]">
                Points are deducted only after the barista scans and confirms
                your 15-minute redemption QR.
              </p>
            </div>
            <span className="font-mono text-xs text-[#4A4843] tabular-nums">
              {sortedRewards.filter((r) => balance.current_points >= r.points_required).length}{' '}
              OF {sortedRewards.length} UNLOCKED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-[#111110] bg-[#FFFFFF]">
            {sortedRewards.map((reward, idx) => {
              const canAfford = balance.current_points >= reward.points_required;
              const rewardAxis = computeSpecimenAxes(
                reward.points_required,
                maxCatalogPoints
              );
              const catalogCode = `RWD-${String(idx + 1).padStart(2, '0')}`;

              return (
                <div
                  key={reward.id}
                  className="flex flex-col justify-between border-r border-b border-[#111110] p-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xl font-bold text-[#111110]">
                        {reward.name}
                      </h3>
                      <span
                        className={`shrink-0 px-2 py-0.5 font-mono text-xs font-semibold ${
                          canAfford
                            ? 'bg-[#DCFCE7] text-[#15803D] border border-[#15803D]'
                            : 'bg-[#EFECE3] text-[#4A4843] border border-[#D4D0C5]'
                        }`}
                      >
                        {catalogCode}
                      </span>
                    </div>

                    <p className="text-sm text-[#4A4843]">
                      {reward.description ||
                        'Handcrafted specialty house beverage or roastery item.'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#D4D0C5] space-y-4">
                    <div className="flex items-baseline justify-between">
                      <span
                        className="font-specimen text-3xl text-[#111110]"
                        style={{
                          ['--specimen-wght' as string]: rewardAxis.wght,
                          ['--specimen-opsz' as string]: rewardAxis.opsz,
                        }}
                      >
                        {reward.points_required.toLocaleString()}{' '}
                        <span className="text-sm font-normal text-[#4A4843]">
                          pts
                        </span>
                      </span>
                      <span className="font-mono text-[11px] text-[#4A4843] tabular-nums">
                        ${reward.points_required.toFixed(2)} SPEND EQUIV
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={!canAfford || mintingRewardId === reward.id}
                      onClick={() => handleMintRedemption(reward.id)}
                      className={`w-full py-3 px-4 font-mono text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                        canAfford
                          ? 'bg-[#E02E24] text-[#F8F6F0] hover:bg-[#B82219]'
                          : 'bg-[#EFECE3] text-[#4A4843] border border-[#D4D0C5] cursor-not-allowed'
                      }`}
                    >
                      {mintingRewardId === reward.id
                        ? 'MINTING REDEMPTION QR...'
                        : canAfford
                        ? 'Generate Redemption QR'
                        : `Need ${
                            reward.points_required - balance.current_points
                          } More Pts`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Transaction History Ledger */}
      {(mobileSection === 'all' || mobileSection === 'ledger') && (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-[#111110] pb-3">
            <h2 className="text-2xl font-bold text-[#111110]">
              Account Transaction Ledger
            </h2>
            <span className="font-mono text-xs text-[#4A4843] tabular-nums">
              TOTAL RECORDS: {totalTx}
            </span>
          </div>

          <div className="border-2 border-[#111110] bg-[#FFFFFF]">
            {transactions.length === 0 ? (
              <div className="p-10 text-center font-mono text-xs text-[#4A4843]">
                NO TRANSACTIONS RECORDED YET. PRESENT YOUR QR PASS AT THE
                COUNTER TO EARN POINTS.
              </div>
            ) : (
              <div className="divide-y divide-[#D4D0C5]">
                {transactions.map((tx) => {
                  const isEarn = tx.type === 'earn';
                  const serialCode = `TX-${String(tx.id).padStart(4, '0')}`;
                  return (
                    <div
                      key={tx.id}
                      className="flex flex-wrap items-center justify-between gap-4 p-4 md:px-6 hover:bg-[#F8F6F0] transition-colors"
                    >
                      <div className="flex items-start gap-3.5">
                        <span
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border ${
                            isEarn
                              ? 'border-[#15803D] bg-[#DCFCE7] text-[#15803D]'
                              : 'border-[#E02E24] bg-[#FEF2F2] text-[#E02E24]'
                          }`}
                        >
                          {isEarn ? (
                            <ArrowDownLeft className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-[#4A4843]">
                              {serialCode}
                            </span>
                            <span className="font-semibold text-sm text-[#111110]">
                              {isEarn
                                ? `Purchase Point Allocation${
                                    tx.amount ? ` ($${tx.amount} USD)` : ''
                                  }`
                                : `Reward Redeemed: ${
                                    tx.reward?.name ?? 'Catalog Item'
                                  }`}
                            </span>
                          </div>
                          <p className="mt-0.5 font-mono text-xs text-[#4A4843] tabular-nums">
                            {new Date(tx.created_at).toLocaleString()}
                            {tx.staff
                              ? ` · BARISTA: ${tx.staff.name.toUpperCase()}`
                              : ''}
                            {tx.note ? ` · "${tx.note}"` : ''}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`font-mono text-base font-bold tabular-nums ${
                          isEarn ? 'text-[#15803D]' : 'text-[#E02E24]'
                        }`}
                      >
                        {isEarn ? '+' : '-'}
                        {tx.points} PTS
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {lastPage > 1 && (
              <div className="flex items-center justify-between border-t border-[#111110] bg-[#EFECE3] px-4 py-3 font-mono text-xs">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => fetchWalletData(page - 1)}
                  className="border border-[#111110] bg-[#FFFFFF] px-3 py-1.5 font-semibold uppercase disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <span className="text-[#111110] tabular-nums">
                  PAGE {page} OF {lastPage}
                </span>
                <button
                  type="button"
                  disabled={page >= lastPage}
                  onClick={() => fetchWalletData(page + 1)}
                  className="border border-[#111110] bg-[#FFFFFF] px-3 py-1.5 font-semibold uppercase disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Single-Use Redemption QR Modal */}
      <Dialog
        open={Boolean(redemptionModal)}
        onOpenChange={(open) => {
          if (!open) setRedemptionModal(null);
        }}
      >
        <DialogContent className="border-2 border-[#111110] bg-[#F8F6F0] text-[#111110] rounded-none sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#111110]">
              Redeem: {redemptionModal?.reward.name}
            </DialogTitle>
            <DialogDescription className="text-sm text-[#4A4843]">
              Present this single-use QR pass to the barista.{' '}
              <strong className="text-[#111110]">
                {redemptionModal?.reward.points_required} points
              </strong>{' '}
              are deducted only upon barista scan confirmation.
            </DialogDescription>
          </DialogHeader>

          {redemptionModal && (
            <div className="flex flex-col items-center space-y-4 py-4 border-y border-[#111110] bg-[#FFFFFF]">
              <div className="border-2 border-[#111110] bg-[#FFFFFF] p-4">
                <QRCodeSVG
                  value={redemptionModal.qr_payload}
                  size={196}
                  bgColor="#FFFFFF"
                  fgColor="#111110"
                />
              </div>
              <div className="font-mono text-xs text-[#E02E24] font-semibold tabular-nums">
                SINGLE-USE JWS · EXPIRES IN{' '}
                {formatCountdown(redemptionModal.expires_at, nowMs)}
              </div>
              <button
                type="button"
                onClick={() => copyText(redemptionModal.qr_payload, 'redeem')}
                className="inline-flex items-center gap-2 bg-[#111110] px-4 py-2.5 font-mono text-xs font-semibold uppercase text-[#F8F6F0] hover:bg-[#E02E24] transition-colors cursor-pointer"
              >
                {copiedRedeem ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Copied Payload for Counter POS</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy QR URI (for POS Testing)</span>
                  </>
                )}
              </button>
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setRedemptionModal(null);
                fetchWalletData(page);
              }}
              className="w-full sm:w-auto border border-[#111110] bg-[#FFFFFF] px-5 py-2.5 font-mono text-xs font-semibold uppercase text-[#111110] hover:bg-[#EFECE3] cursor-pointer"
            >
              Close Pass
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
