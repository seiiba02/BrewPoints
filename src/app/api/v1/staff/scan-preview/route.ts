import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/serverAuth';
import { prisma } from '@/lib/prisma';
import {
  TokenService,
  AllocationTokenClaims,
  RedemptionTokenClaims,
} from '@/lib/services/tokenService';
import { parseJsonBody, validationErrorResponse } from '@/lib/http/errors';

interface ScanPreviewBody {
  qr_payload?: unknown;
}

/**
 * POST /api/v1/staff/scan-preview
 * Decodes and validates a scanned QR code (`brewpoints://allocate?token=...`,
 * `brewpoints://redeem?token=...`, or a direct customer `firebase_uid`) so the
 * Staff POS interface can preview the customer's name, current balance, and
 * reward details before executing point allocation or redemption confirmation.
 */
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request, ['staff']);
  if (auth.errorResponse) return auth.errorResponse;

  const body = await parseJsonBody<ScanPreviewBody>(request);
  if (typeof body.qr_payload !== 'string' || body.qr_payload.trim().length === 0) {
    return validationErrorResponse({
      qr_payload: ['The qr payload field is required.'],
    });
  }

  const qrPayload = body.qr_payload.trim();
  const tokenService = new TokenService();

  // Case 1: Redemption QR (`brewpoints://redeem?token=...`)
  if (qrPayload.startsWith('brewpoints://redeem?token=')) {
    const token = TokenService.extractToken(qrPayload, 'redeem');
    if (!token) {
      return NextResponse.json({ message: 'Invalid QR payload.' }, { status: 401 });
    }

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

    const { customer_id, reward_id, jti, exp } = verified.claims;

    const existingRedemption = await prisma.redemption.findUnique({
      where: { jti },
    });
    if (existingRedemption) {
      return NextResponse.json(
        { message: 'This QR code has already been redeemed.' },
        { status: 409 }
      );
    }

    const [customer, reward] = await Promise.all([
      prisma.user.findUnique({
        where: { id: BigInt(customer_id) },
        include: { loyaltyAccount: true },
      }),
      prisma.reward.findFirst({
        where: {
          id: BigInt(reward_id),
          deleted_at: null,
          active: true,
        },
      }),
    ]);

    if (!customer || customer.deleted_at !== null) {
      return NextResponse.json(
        { message: 'Customer account is inactive.' },
        { status: 409 }
      );
    }

    if (!reward) {
      return NextResponse.json(
        { message: 'Reward is no longer available.' },
        { status: 409 }
      );
    }

    return NextResponse.json({
      data: {
        mode: 'redeem' as const,
        qr_payload: qrPayload,
        expires_at: exp,
        customer: {
          id: Number(customer.id),
          name: customer.name,
          email: customer.email,
          firebase_uid: customer.firebase_uid,
          current_points: customer.loyaltyAccount?.current_points ?? 0,
        },
        reward: {
          id: Number(reward.id),
          name: reward.name,
          description: reward.description,
          points_required: reward.points_required,
        },
      },
    });
  }

  // Case 2: Dynamic Customer Allocation QR (`brewpoints://allocate?token=...`)
  if (qrPayload.startsWith('brewpoints://allocate?token=')) {
    const token = TokenService.extractToken(qrPayload, 'allocate');
    if (!token) {
      return NextResponse.json({ message: 'Invalid QR payload.' }, { status: 401 });
    }

    const verified = tokenService.verifyWithExpiry<AllocationTokenClaims>(token);
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

    const customer = await prisma.user.findUnique({
      where: { firebase_uid: verified.claims.customer_firebase_uid },
      include: { loyaltyAccount: true },
    });

    if (!customer) {
      return NextResponse.json({ message: 'Customer not found.' }, { status: 404 });
    }

    if (customer.deleted_at !== null) {
      return NextResponse.json(
        { message: 'Customer account is inactive.' },
        { status: 409 }
      );
    }

    return NextResponse.json({
      data: {
        mode: 'allocate' as const,
        qr_payload: qrPayload,
        expires_at: verified.claims.exp,
        customer: {
          id: Number(customer.id),
          name: customer.name,
          email: customer.email,
          firebase_uid: customer.firebase_uid,
          current_points: customer.loyaltyAccount?.current_points ?? 0,
        },
      },
    });
  }

  // Case 3: Direct customer firebase_uid or email lookup (fallback for manual entry)
  const customer = await prisma.user.findFirst({
    where: {
      OR: [{ firebase_uid: qrPayload }, { email: qrPayload }],
    },
    include: { loyaltyAccount: true },
  });

  if (!customer) {
    return NextResponse.json(
      { message: 'Unrecognized QR code or customer identifier.' },
      { status: 404 }
    );
  }

  if (customer.deleted_at !== null) {
    return NextResponse.json(
      { message: 'Customer account is inactive.' },
      { status: 409 }
    );
  }

  return NextResponse.json({
    data: {
      mode: 'allocate' as const,
      qr_payload: customer.firebase_uid,
      customer: {
        id: Number(customer.id),
        name: customer.name,
        email: customer.email,
        firebase_uid: customer.firebase_uid,
        current_points: customer.loyaltyAccount?.current_points ?? 0,
      },
    },
  });
}
