import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/serverAuth';
import { prisma } from '@/lib/prisma';

export async function getProgramAnalytics() {
  const [
    loyaltyTotals,
    activeCustomersCount,
    totalRedemptionsCount,
    rewardsWithCounts,
    staffUsers,
    recentTransactions,
  ] = await Promise.all([
    prisma.loyaltyAccount.aggregate({
      _sum: {
        total_points_earned: true,
        total_points_redeemed: true,
        current_points: true,
      },
    }),
    prisma.user.count({
      where: {
        role: 'customer',
        deleted_at: null,
      },
    }),
    prisma.redemption.count(),
    prisma.reward.findMany({
      where: { deleted_at: null },
      include: {
        _count: {
          select: { redemptions: true },
        },
      },
      orderBy: { points_required: 'asc' },
    }),
    prisma.user.findMany({
      where: {
        role: { in: ['staff', 'owner'] },
        deleted_at: null,
      },
      include: {
        staffTransactions: {
          select: {
            type: true,
            points: true,
          },
        },
      },
    }),
    prisma.transaction.findMany({
      orderBy: { created_at: 'asc' },
      take: 250,
    }),
  ]);

  const totalPointsIssued = loyaltyTotals._sum.total_points_earned ?? 0;
  const totalPointsRedeemed = loyaltyTotals._sum.total_points_redeemed ?? 0;
  const redemptionRate =
    totalPointsIssued > 0
      ? Number(((totalPointsRedeemed / totalPointsIssued) * 100).toFixed(1))
      : 0;

  // Build 7-day point velocity & redemption growth series
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  const velocityMap = new Map<string, { issued: number; redeemed: number }>();
  const growthMap = new Map<string, number>();
  for (const day of days) {
    velocityMap.set(day, { issued: 0, redeemed: 0 });
    growthMap.set(day, 0);
  }

  for (const tx of recentTransactions) {
    const dayKey = (tx.created_at ?? new Date()).toISOString().slice(0, 10);
    if (velocityMap.has(dayKey)) {
      const bucket = velocityMap.get(dayKey)!;
      if (tx.type === 'earn') {
        bucket.issued += tx.points;
      } else if (tx.type === 'redeem') {
        bucket.redeemed += tx.points;
        growthMap.set(dayKey, (growthMap.get(dayKey) ?? 0) + 1);
      }
    }
  }

  const velocity = days.map((date) => {
    const label = new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const entry = velocityMap.get(date)!;
    return {
      date: label,
      issued: entry.issued,
      redeemed: entry.redeemed,
    };
  });

  let cumulativeRedemptions = 0;
  const growth = days.map((date) => {
    const label = new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    cumulativeRedemptions += growthMap.get(date) ?? 0;
    return {
      period: label,
      redemptions: cumulativeRedemptions,
    };
  });

  const popularity = rewardsWithCounts
    .map((r) => ({
      name: r.name,
      redemptions: r._count.redemptions,
      points_required: r.points_required,
    }))
    .sort((a, b) => b.redemptions - a.redemptions);

  const staffActivity = staffUsers.map((s) => {
    let allocations = 0;
    let redemptions = 0;
    let totalPointsProcessed = 0;
    for (const tx of s.staffTransactions) {
      totalPointsProcessed += tx.points;
      if (tx.type === 'earn') allocations++;
      if (tx.type === 'redeem') redemptions++;
    }
    return {
      id: String(s.id),
      name: s.name,
      role: s.role,
      allocations,
      redemptions,
      totalPointsProcessed,
    };
  });

  return {
    summary: {
      totalPointsIssued,
      totalPointsRedeemed,
      activeCustomers: activeCustomersCount,
      redemptionRate,
      totalRedemptions: totalRedemptionsCount,
    },
    velocity,
    popularity,
    staffActivity,
    growth,
  };
}

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request, ['owner']);
  if (auth.errorResponse) return auth.errorResponse;

  const data = await getProgramAnalytics();
  return NextResponse.json({ data });
}
