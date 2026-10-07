import { NextRequest, NextResponse } from 'next/server';
import { Reward } from '@prisma/client';
import { authenticateRequest } from '@/lib/auth/serverAuth';
import { prisma } from '@/lib/prisma';
import { getLoyaltyConfig } from '@/lib/config/loyalty';
import { parseJsonBody, validationErrorResponse } from '@/lib/http/errors';

export function formatReward(r: Reward) {
  return {
    id: Number(r.id),
    name: r.name,
    description: r.description,
    points_required: r.points_required,
    active: r.active,
    created_at: r.created_at ? r.created_at.toISOString() : new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  const includeInactive =
    request.nextUrl.searchParams.get('include_inactive') === '1' &&
    auth.user.role === 'owner';

  const rewards = await prisma.reward.findMany({
    where: {
      deleted_at: null,
      ...(includeInactive ? {} : { active: true }),
    },
    orderBy: [{ points_required: 'asc' }, { id: 'asc' }],
  });

  return NextResponse.json({
    data: rewards.map(formatReward),
  });
}

interface StoreRewardBody {
  name?: unknown;
  description?: unknown;
  points_required?: unknown;
  active?: unknown;
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request, ['owner']);
  if (auth.errorResponse) return auth.errorResponse;

  const body = await parseJsonBody<StoreRewardBody>(request);
  const cfg = getLoyaltyConfig();
  const errors: Record<string, string[]> = {};

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) {
    errors.name = ['The name field is required.'];
  } else if (name.length > 120) {
    errors.name = ['The name field must not be greater than 120 characters.'];
  } else {
    const duplicate = await prisma.reward.findFirst({
      where: {
        name,
        deleted_at: null,
      },
    });
    if (duplicate) {
      errors.name = ['The name has already been taken.'];
    }
  }

  let description: string | null = null;
  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== 'string' || body.description.length > 500) {
      errors.description = [
        'The description field must not be greater than 500 characters.',
      ];
    } else {
      description = body.description.trim() || null;
    }
  }

  const rawPoints = body.points_required;
  const pointsRequired =
    typeof rawPoints === 'number'
      ? rawPoints
      : typeof rawPoints === 'string' && rawPoints.trim() !== ''
      ? Number(rawPoints)
      : NaN;

  if (rawPoints === undefined || rawPoints === null || rawPoints === '') {
    errors.points_required = ['The points required field is required.'];
  } else if (
    !Number.isInteger(pointsRequired) ||
    pointsRequired < 1 ||
    pointsRequired > cfg.maxRewardCost
  ) {
    errors.points_required = [
      `The points required field must be an integer between 1 and ${cfg.maxRewardCost}.`,
    ];
  }

  let active = true;
  if (body.active !== undefined) {
    if (typeof body.active !== 'boolean') {
      errors.active = ['The active field must be true or false.'];
    } else {
      active = body.active;
    }
  }

  if (Object.keys(errors).length > 0) {
    return validationErrorResponse(errors);
  }

  const reward = await prisma.reward.create({
    data: {
      name,
      description,
      points_required: pointsRequired,
      active,
    },
  });

  return NextResponse.json({ data: formatReward(reward) }, { status: 201 });
}
