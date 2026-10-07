import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/serverAuth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  const account = await prisma.loyaltyAccount.findUnique({
    where: { user_id: auth.user.id },
  });

  if (!account) {
    return NextResponse.json({
      data: {
        current_points: 0,
        total_points_earned: 0,
        total_points_redeemed: 0,
        last_earned_at: null,
      },
    });
  }

  return NextResponse.json({
    data: {
      current_points: account.current_points,
      total_points_earned: account.total_points_earned,
      total_points_redeemed: account.total_points_redeemed,
      last_earned_at: account.last_earned_at
        ? account.last_earned_at.toISOString()
        : null,
    },
  });
}
