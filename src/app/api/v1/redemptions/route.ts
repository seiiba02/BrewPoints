import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/serverAuth';
import { prisma } from '@/lib/prisma';
import { TokenService } from '@/lib/services/tokenService';
import { checkRateLimit } from '@/lib/services/rateLimit';
import { parseJsonBody, validationErrorResponse } from '@/lib/http/errors';

interface MintRedemptionBody {
  reward_id?: unknown;
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  const customer = auth.user;

  const rateLimitErr = checkRateLimit(`redeem-mint:${customer.id}`);
  if (rateLimitErr) return rateLimitErr;

  const body = await parseJsonBody<MintRedemptionBody>(request);
  const rawRewardId = body.reward_id;
  const rewardId =
    typeof rawRewardId === 'number'
      ? rawRewardId
      : typeof rawRewardId === 'string' && rawRewardId.trim() !== ''
      ? Number(rawRewardId)
      : NaN;

  if (
    rawRewardId === undefined ||
    rawRewardId === null ||
    rawRewardId === '' ||
    !Number.isInteger(rewardId) ||
    rewardId < 1
  ) {
    return validationErrorResponse({
      reward_id: ['The reward id field is required.'],
    });
  }

  const reward = await prisma.reward.findFirst({
    where: {
      id: BigInt(rewardId),
      deleted_at: null,
      active: true,
    },
  });

  if (!reward) {
    return NextResponse.json(
      { message: 'Reward not found or not available.' },
      { status: 404 }
    );
  }

  const account = await prisma.loyaltyAccount.findUnique({
    where: { user_id: customer.id },
  });

  const currentPoints = account?.current_points ?? 0;

  if (currentPoints < reward.points_required) {
    return validationErrorResponse(
      {
        points: [
          `You need ${reward.points_required} points but only have ${currentPoints}.`,
        ],
      },
      'Insufficient points.'
    );
  }

  const tokenService = new TokenService();
  const minted = tokenService.mintRedemption(
    Number(customer.id),
    Number(reward.id)
  );
  const qrPayload = `brewpoints://redeem?token=${minted.token}`;

  return NextResponse.json({
    data: {
      qr_payload: qrPayload,
      expires_at: minted.expires_at,
      reward: {
        id: Number(reward.id),
        name: reward.name,
        points_required: reward.points_required,
      },
      current_balance: currentPoints,
    },
  });
}
