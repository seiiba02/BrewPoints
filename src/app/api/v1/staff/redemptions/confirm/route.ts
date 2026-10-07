import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/serverAuth';
import { prisma } from '@/lib/prisma';
import { TokenService, RedemptionTokenClaims } from '@/lib/services/tokenService';
import {
  HttpError,
  parseJsonBody,
  validationErrorResponse,
} from '@/lib/http/errors';

interface ConfirmRedemptionBody {
  qr_payload?: unknown;
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request, ['staff']);
  if (auth.errorResponse) return auth.errorResponse;

  const staff = auth.user;
  const body = await parseJsonBody<ConfirmRedemptionBody>(request);

  if (typeof body.qr_payload !== 'string' || body.qr_payload.trim().length === 0) {
    return validationErrorResponse({
      qr_payload: ['The qr payload field is required.'],
    });
  }

  const qrPayload = body.qr_payload.trim();
  const token = TokenService.extractToken(qrPayload, 'redeem');

  if (!token) {
    return NextResponse.json(
      { message: 'Invalid QR payload.' },
      { status: 401 }
    );
  }

  const tokenService = new TokenService();
  const verified = tokenService.verifyWithExpiry<RedemptionTokenClaims>(token);

  if (!verified.valid || !verified.claims) {
    if (verified.expired) {
      return NextResponse.json(
        {
          message:
            'QR code has expired. Please ask the customer to generate a new one.',
        },
        { status: 410 }
      );
    }
    return NextResponse.json(
      { message: 'Invalid or tampered QR code.' },
      { status: 401 }
    );
  }

  const claims = verified.claims;

  try {
    const responseData = await prisma.$transaction(async (tx) => {
      const customer = await tx.user.findUnique({
        where: { id: BigInt(claims.customer_id) },
      });

      if (!customer || customer.deleted_at !== null) {
        throw new HttpError(409, 'Customer account is inactive.');
      }

      const reward = await tx.reward.findFirst({
        where: {
          id: BigInt(claims.reward_id),
          deleted_at: null,
          active: true,
        },
      });

      if (!reward) {
        throw new HttpError(409, 'Reward is no longer available.');
      }

      // Row-level pessimistic lock on loyalty_accounts
      const lockedAccounts = await tx.$queryRaw<
        Array<{
          id: bigint;
          current_points: number;
          total_points_redeemed: number;
        }>
      >`SELECT id, current_points, total_points_redeemed FROM loyalty_accounts WHERE user_id = ${customer.id} FOR UPDATE`;

      if (lockedAccounts.length === 0) {
        throw new HttpError(422, 'Customer no longer has sufficient points.');
      }

      const lockedAccount = lockedAccounts[0];
      const currentPoints = Number(lockedAccount.current_points);
      const totalRedeemed = Number(lockedAccount.total_points_redeemed);

      // Anti-replay: check jti uniqueness under lock
      const existingRedemption = await tx.redemption.findUnique({
        where: { jti: claims.jti },
      });

      if (existingRedemption) {
        throw new HttpError(409, 'This QR code has already been redeemed.');
      }

      // Verify points under lock
      if (currentPoints < reward.points_required) {
        throw new HttpError(422, 'Customer no longer has sufficient points.');
      }

      const redemption = await tx.redemption.create({
        data: {
          jti: claims.jti,
          customer_id: customer.id,
          reward_id: reward.id,
          points_cost: reward.points_required,
          confirmed_by_staff_id: staff.id,
          confirmed_at: new Date(),
        },
      });

      const newBalance = currentPoints - reward.points_required;
      const newTotalRedeemed = totalRedeemed + reward.points_required;

      await tx.loyaltyAccount.update({
        where: { id: lockedAccount.id },
        data: {
          current_points: newBalance,
          total_points_redeemed: newTotalRedeemed,
        },
      });

      await tx.transaction.create({
        data: {
          user_id: customer.id,
          type: 'redeem',
          points: reward.points_required,
          staff_id: staff.id,
          redemption_id: redemption.id,
        },
      });

      return {
        customer_name: customer.name,
        reward_name: reward.name,
        points_deducted: reward.points_required,
        new_balance: newBalance,
      };
    });

    return NextResponse.json({ data: responseData });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json(
        { message: err.message, ...(err.errors ? { errors: err.errors } : {}) },
        { status: err.status }
      );
    }
    throw err;
  }
}
