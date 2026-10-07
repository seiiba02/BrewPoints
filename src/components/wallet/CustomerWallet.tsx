'use client';

import { useCallback, useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Coffee,
  Gift,
  History,
  QrCode,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
      setError('Failed to load wallet data.');
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
      // Ignore transient error
    }
  }, []);

  useEffect(() => {
    fetchWalletData(1);
    refreshAllocationQr();
  }, [fetchWalletData, refreshAllocationQr]);

  // Dynamic milestone calculation: target the cheapest unaffordable active reward
  const sortedRewards = [...rewards].sort(
    (a, b) => a.points_required - b.points_required
  );
  const nextMilestoneReward =
    sortedRewards.find((r) => r.points_required > balance.current_points) ??
    sortedRewards[sortedRewards.length - 1] ??
    null;

  const progressPercent = nextMilestoneReward
    ? Math.min(
        100,
        Math.round(
          (balance.current_points / nextMilestoneReward.points_required) * 100
        )
      )
    : 100;
  const pointsRemaining = nextMilestoneReward
    ? Math.max(0, nextMilestoneReward.points_required - balance.current_points)
    : 0;

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
        setError(json.message ?? 'Could not generate redemption QR.');
        return;
      }
      setRedemptionModal(json.data);
    } catch {
      setError('Could not generate redemption QR.');
    } finally {
      setMintingRewardId(null);
    }
  };

  const copyText = async (text: string, type: 'alloc' | 'redeem') => {
    await navigator.clipboard.writeText(text);
    if (type === 'alloc') {
      setCopiedAlloc(true);
      setTimeout(() => setCopiedAlloc(false), 2000);
    } else {
      setCopiedRedeem(true);
      setTimeout(() => setCopiedRedeem(false), 2000);
    }
  };

  const totalRedemptionsCount = transactions.filter(
    (t) => t.type === 'redeem'
  ).length;

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Top Row: Loyalty Card + Dynamic Allocation QR */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3 bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 text-amber-50 border-0 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardDescription className="text-amber-200/80 uppercase tracking-wider text-xs font-semibold">
                BrewPoints Digital Loyalty Card
              </CardDescription>
              <CardTitle className="text-2xl mt-1 text-white">
                {userName}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fetchWalletData(page)}
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Sync
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-amber-200/80">
                Available Balance
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl font-extrabold tracking-tight text-white">
                  {balance.current_points.toLocaleString()}
                </span>
                <span className="text-lg font-medium text-amber-200">
                  points
                </span>
              </div>
            </div>

            {nextMilestoneReward && (
              <div className="space-y-2 rounded-lg bg-black/25 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 font-medium text-amber-100">
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    {pointsRemaining > 0
                      ? `Next Milestone: ${nextMilestoneReward.name}`
                      : `All Rewards Unlocked! (${nextMilestoneReward.name})`}
                  </span>
                  <span className="text-xs font-semibold text-amber-200">
                    {balance.current_points} /{' '}
                    {nextMilestoneReward.points_required} pts ({progressPercent}%)
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-amber-200/90">
                  {pointsRemaining > 0
                    ? `${pointsRemaining} more points needed to unlock ${nextMilestoneReward.name}.`
                    : 'You have enough points to redeem any reward in the catalog!'}
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-white/10 text-sm">
              <div>
                <p className="text-amber-200/70 text-xs">Lifetime Earned</p>
                <p className="font-bold text-lg text-white">
                  {balance.total_points_earned.toLocaleString()} pts
                </p>
              </div>
              <div>
                <p className="text-amber-200/70 text-xs">Lifetime Redeemed</p>
                <p className="font-bold text-lg text-white">
                  {balance.total_points_redeemed.toLocaleString()} pts
                </p>
              </div>
              <div>
                <p className="text-amber-200/70 text-xs">Rewards Claimed</p>
                <p className="font-bold text-lg text-white">
                  {totalRedemptionsCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Customer Allocation QR Card */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <QrCode className="h-5 w-5 text-amber-700" />
                Earn Points QR
              </CardTitle>
              <Badge variant="outline">10m Dynamic JWS</Badge>
            </div>
            <CardDescription>
              Show this QR code to the barista at checkout to earn 1 point per
              $1.00 spent.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center justify-center space-y-3 py-2">
            {allocationQr ? (
              <>
                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <QRCodeSVG value={allocationQr.qr_payload} size={168} />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Valid until{' '}
                  {new Date(allocationQr.expires_at * 1000).toLocaleTimeString()}
                </p>
              </>
            ) : (
              <div className="h-44 flex items-center justify-center text-sm text-muted-foreground">
                Generating dynamic QR...
              </div>
            )}
          </CardContent>

          <CardFooter className="flex gap-2 justify-center border-t pt-4">
            <Button variant="outline" size="sm" onClick={refreshAllocationQr}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Refresh QR
            </Button>
            {allocationQr && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => copyText(allocationQr.qr_payload, 'alloc')}
              >
                {copiedAlloc ? (
                  <>
                    <Check className="mr-1.5 h-3.5 w-3.5 text-green-600" />
                    Copied Payload
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                    Copy QR Payload
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Rewards Catalog */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Gift className="h-6 w-6 text-amber-700" />
              Available Rewards
            </h2>
            <p className="text-sm text-muted-foreground">
              Redeem your points for handcrafted drinks and pastries. Points are
              only deducted once staff scans your QR code.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedRewards.map((reward) => {
            const canAfford = balance.current_points >= reward.points_required;
            return (
              <Card
                key={reward.id}
                className="flex flex-col justify-between transition-shadow hover:shadow-md"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Coffee className="h-4 w-4 text-amber-700 shrink-0" />
                      {reward.name}
                    </CardTitle>
                    <Badge variant={canAfford ? 'default' : 'secondary'}>
                      {reward.points_required} pts
                    </Badge>
                  </div>
                  <CardDescription>
                    {reward.description || 'Redeemable in-store at the counter.'}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="border-t pt-4">
                  <Button
                    className="w-full"
                    disabled={!canAfford || mintingRewardId === reward.id}
                    onClick={() => handleMintRedemption(reward.id)}
                  >
                    {mintingRewardId === reward.id
                      ? 'Generating QR...'
                      : canAfford
                      ? 'Redeem Reward'
                      : `Need ${
                          reward.points_required - balance.current_points
                        } more pts`}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Transaction History */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <History className="h-6 w-6 text-amber-700" />
            Transaction History ({totalTx})
          </h2>
        </div>

        <Card>
          <CardContent className="divide-y p-0">
            {transactions.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No loyalty transactions yet. Scan your Earn Points QR at the
                counter to start earning!
              </div>
            ) : (
              transactions.map((tx) => {
                const isEarn = tx.type === 'earn';
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full ${
                          isEarn
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isEarn ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {isEarn
                            ? `Purchase Point Allocation${
                                tx.amount ? ` ($${tx.amount})` : ''
                              }`
                            : `Reward Redeemed: ${
                                tx.reward?.name ?? 'Catalog Reward'
                              }`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.created_at).toLocaleString()}
                          {tx.staff ? ` • Verified by ${tx.staff.name}` : ''}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`text-sm font-bold ${
                        isEarn ? 'text-green-600' : 'text-amber-700'
                      }`}
                    >
                      {isEarn ? '+' : '-'}
                      {tx.points} pts
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
          {lastPage > 1 && (
            <CardFooter className="flex items-center justify-between border-t py-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => fetchWalletData(page - 1)}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page} of {lastPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= lastPage}
                onClick={() => fetchWalletData(page + 1)}
              >
                Next
              </Button>
            </CardFooter>
          )}
        </Card>
      </section>

      {/* Redemption QR Dialog */}
      <Dialog
        open={Boolean(redemptionModal)}
        onOpenChange={(open) => {
          if (!open) setRedemptionModal(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Redeem: {redemptionModal?.reward.name}
            </DialogTitle>
            <DialogDescription>
              Present this dynamic QR code to the barista.{' '}
              <strong>
                {redemptionModal?.reward.points_required} points
              </strong>{' '}
              will only be deducted once the barista scans and confirms it.
            </DialogDescription>
          </DialogHeader>

          {redemptionModal && (
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <QRCodeSVG value={redemptionModal.qr_payload} size={200} />
              </div>
              <p className="text-xs text-muted-foreground">
                Expires at{' '}
                {new Date(
                  redemptionModal.expires_at * 1000
                ).toLocaleTimeString()}{' '}
                (Single-use JWS anti-replay protected)
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  copyText(redemptionModal.qr_payload, 'redeem')
                }
              >
                {copiedRedeem ? (
                  <>
                    <Check className="mr-1.5 h-4 w-4 text-green-600" />
                    Copied QR Payload for Staff POS
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 h-4 w-4" />
                    Copy QR Payload (for Staff POS testing)
                  </>
                )}
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRedemptionModal(null);
                fetchWalletData(page);
              }}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
