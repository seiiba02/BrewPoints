import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { User } from '@prisma/client';
import { authenticateRequest } from '@/lib/auth/serverAuth';
import { prisma } from '@/lib/prisma';
import { parseJsonBody, validationErrorResponse } from '@/lib/http/errors';

export function formatStaffUser(
  u: User & {
    _count?: {
      staffTransactions?: number;
      confirmedRedemptions?: number;
    };
  }
) {
  return {
    id: Number(u.id),
    name: u.name,
    email: u.email,
    phone: u.phone,
    firebase_uid: u.firebase_uid,
    role: u.role,
    active: u.deleted_at === null,
    transactions_processed: u._count?.staffTransactions ?? 0,
    redemptions_confirmed: u._count?.confirmedRedemptions ?? 0,
    created_at: u.created_at ? u.created_at.toISOString() : new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request, ['owner']);
  if (auth.errorResponse) return auth.errorResponse;

  const staffList = await prisma.user.findMany({
    where: {
      role: 'staff',
    },
    include: {
      _count: {
        select: {
          staffTransactions: true,
          confirmedRedemptions: true,
        },
      },
    },
    orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
  });

  return NextResponse.json({
    data: staffList.map(formatStaffUser),
  });
}

interface StoreStaffBody {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  firebase_uid?: unknown;
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request, ['owner']);
  if (auth.errorResponse) return auth.errorResponse;

  const body = await parseJsonBody<StoreStaffBody>(request);
  const errors: Record<string, string[]> = {};

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) {
    errors.name = ['The name field is required.'];
  } else if (name.length > 120) {
    errors.name = ['The name field must not be greater than 120 characters.'];
  }

  const email =
    typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email) {
    errors.email = ['The email field is required.'];
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 190) {
    errors.email = ['The email field must be a valid email address.'];
  } else {
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      errors.email = ['The email has already been taken.'];
    }
  }

  let phone: string | null = null;
  if (body.phone !== undefined && body.phone !== null && body.phone !== '') {
    if (typeof body.phone !== 'string' || body.phone.length > 32) {
      errors.phone = ['The phone field must not be greater than 32 characters.'];
    } else {
      phone = body.phone.trim();
    }
  }

  const firebaseUid =
    typeof body.firebase_uid === 'string' && body.firebase_uid.trim() !== ''
      ? body.firebase_uid.trim()
      : `staff-uid-${crypto.randomUUID().slice(0, 8)}`;

  const existingUid = await prisma.user.findUnique({
    where: { firebase_uid: firebaseUid },
  });
  if (existingUid) {
    errors.firebase_uid = ['The firebase uid has already been taken.'];
  }

  if (Object.keys(errors).length > 0) {
    return validationErrorResponse(errors);
  }

  const created = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        phone,
        firebase_uid: firebaseUid,
        role: 'staff',
      },
      include: {
        _count: {
          select: {
            staffTransactions: true,
            confirmedRedemptions: true,
          },
        },
      },
    });

    await tx.loyaltyAccount.create({
      data: {
        user_id: user.id,
        current_points: 0,
        total_points_earned: 0,
        total_points_redeemed: 0,
      },
    });

    return user;
  });

  return NextResponse.json({ data: formatStaffUser(created) }, { status: 201 });
}
