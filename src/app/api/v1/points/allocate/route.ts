import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/serverAuth';
import { prisma } from '@/lib/prisma';
import { PointsCalculator } from '@/lib/services/pointsCalculator';
import { TokenService, AllocationTokenClaims } from '@/lib/services/tokenService';
import { checkRateLimit } from '@/lib/services/rateLimit';
import { parseJsonBody, validationErrorResponse } from '@/lib/http/errors';

interface AllocateBody {
  customer_firebase_uid?: unknown;
  qr_payload?: unknown;
  amount?: unknown;
  note?: unknown;
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request, ['staff']);
  if (auth.errorResponse) return auth.errorResponse;

  const staff = auth.user;

  const rateLimitErr = checkRateLimit(`allocate:${staff.id}`);
  if (rateLimitErr) return rateLimitErr;

  const body = await parseJsonBody<AllocateBody>(request);
  const calculator = PointsCalculator.fromConfig();
  const minSpend = calculator.getMinSpend();
  const maxSpend = calculator.getMaxSpend();

  const errors: Record<string, string[]> = {};

  let customerFirebaseUid: string | null = null;

  // Support either dynamic allocation QR payload OR direct customer_firebase_uid
  if (typeof body.qr_payload === 'string' && body.qr_payload.trim().length > 0) {
    const rawToken = TokenService.extractToken(body.qr_payload.trim(), 'allocate');
    if (!rawToken) {
      return NextResponse.json(
        { message: 'Invalid allocation QR payload.' },
        { status: 401 }
      );
    }
    const tokenService = new TokenService();
    const verified = tokenService.verifyWithExpiry<AllocationTokenClaims>(rawToken);
    if (!verified.valid || !verified.claims) {
      if (verified.expired) {
        return NextResponse.json(
          {
            message:
              'Customer QR code has expired. Please ask the customer to refresh their QR code.',
          },
          { status: 410 }
        );
      }
      return NextResponse.json(
        { message: 'Invalid or tampered customer QR code.' },
        { status: 401 }
      );
    }
    customerFirebaseUid = verified.claims.customer_firebase_uid;
  } else if (
    typeof body.customer_firebase_uid === 'string' &&
    body.customer_firebase_uid.trim().length > 0
  ) {
    customerFirebaseUid = body.customer_firebase_uid.trim();
  } else {
    errors.customer_firebase_uid = ['The customer firebase uid field is required.'];
  }

  const rawAmount = body.amount;
  const numericAmount =
    typeof rawAmount === 'number'
      ? rawAmount
      : typeof rawAmount === 'string' && rawAmount.trim() !== ''
      ? Number(rawAmount)
      : NaN;

  if (rawAmount === undefined || rawAmount === null || rawAmount === '') {
    errors.amount = ['The amount field is required.'];
  } else if (!Number.isFinite(numericAmount)) {
    errors.amount = ['The amount field must be a number.'];
  } else if (numericAmount < minSpend || numericAmount > maxSpend) {
    errors.amount = [
      `The amount field must be between ${minSpend} and ${maxSpend}.`,
    ];
  }

  let note: string | null = null;
  if (body.note !== undefined && body.note !== null) {
    if (typeof body.note !== 'string' || body.note.length > 500) {
      errors.note = ['The note field must be a string up to 500 characters.'];
    } else {
      note = body.note.trim() || null;
    }
  }

  if (Object.keys(errors).length > 0) {
    return validationErrorResponse(errors);
  }

  const customer = await prisma.user.findUnique({
    where: { firebase_uid: customerFirebaseUid! },
  });

  if (!customer) {
    return NextResponse.json(
      { message: 'Customer not found.' },
      { status: 404 }
    );
  }

  if (customer.deleted_at !== null) {
    return NextResponse.json(
      { message: 'Customer account is inactive.' },
      { status: 409 }
    );
  }

  const points = calculator.calculate(numericAmount);

  const result = await prisma.$transaction(async (tx) => {
    // Row-level pessimistic lock on loyalty_accounts
    const lockedRows = await tx.$queryRaw<
      Array<{
        id: bigint;
        current_points: number;
        total_points_earned: number;
      }>
    >`SELECT id, current_points, total_points_earned FROM loyalty_accounts WHERE user_id = ${customer.id} FOR UPDATE`;

    let accountId: bigint;
    let currentPoints: number;
    let totalEarned: number;

    if (lockedRows.length === 0) {
      const created = await tx.loyaltyAccount.create({
        data: {
          user_id: customer.id,
          current_points: 0,
          total_points_earned: 0,
          total_points_redeemed: 0,
        },
      });
      accountId = created.id;
      currentPoints = 0;
      totalEarned = 0;
    } else {
      accountId = lockedRows[0].id;
      currentPoints = Number(lockedRows[0].current_points);
      totalEarned = Number(lockedRows[0].total_points_earned);
    }

    const newBalance = currentPoints + points;
    const newTotalEarned = totalEarned + points;

    await tx.loyaltyAccount.update({
      where: { id: accountId },
      data: {
        current_points: newBalance,
        total_points_earned: newTotalEarned,
        last_earned_at: new Date(),
      },
    });

    await tx.transaction.create({
      data: {
        user_id: customer.id,
        type: 'earn',
        points,
        amount: numericAmount,
        staff_id: staff.id,
        note,
      },
    });

    return {
      newBalance,
      newTotalEarned,
    };
  });

  return NextResponse.json({
    data: {
      customer_id: Number(customer.id),
      customer_name: customer.name,
      points_credited: points,
      new_balance: result.newBalance,
      total_earned: result.newTotalEarned,
    },
  });
}
