import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/serverAuth';
import { prisma } from '@/lib/prisma';
import { getLoyaltyConfig } from '@/lib/config/loyalty';
import { parseJsonBody, validationErrorResponse } from '@/lib/http/errors';
import { formatReward } from '@/app/api/v1/rewards/route';

interface UpdateRewardBody {
  name?: unknown;
  description?: unknown;
  points_required?: unknown;
  active?: unknown;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request, ['owner']);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const rewardId = Number(id);
  if (!Number.isInteger(rewardId) || rewardId < 1) {
    return NextResponse.json({ message: 'Reward not found.' }, { status: 404 });
  }

  const existing = await prisma.reward.findFirst({
    where: {
      id: BigInt(rewardId),
      deleted_at: null,
    },
  });

  if (!existing) {
    return NextResponse.json({ message: 'Reward not found.' }, { status: 404 });
  }

  const body = await parseJsonBody<UpdateRewardBody>(request);
  const cfg = getLoyaltyConfig();
  const errors: Record<string, string[]> = {};
  const updateData: {
    name?: string;
    description?: string | null;
    points_required?: number;
    active?: boolean;
  } = {};

  if (body.name !== undefined) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) {
      errors.name = ['The name field must be a non-empty string.'];
    } else if (name.length > 120) {
      errors.name = ['The name field must not be greater than 120 characters.'];
    } else {
      const duplicate = await prisma.reward.findFirst({
        where: {
          name,
          deleted_at: null,
          NOT: { id: existing.id },
        },
      });
      if (duplicate) {
        errors.name = ['The name has already been taken.'];
      } else {
        updateData.name = name;
      }
    }
  }

  if (body.description !== undefined) {
    if (body.description === null) {
      updateData.description = null;
    } else if (
      typeof body.description !== 'string' ||
      body.description.length > 500
    ) {
      errors.description = [
        'The description field must not be greater than 500 characters.',
      ];
    } else {
      updateData.description = body.description.trim() || null;
    }
  }

  if (body.points_required !== undefined) {
    const rawPoints = body.points_required;
    const pointsRequired =
      typeof rawPoints === 'number'
        ? rawPoints
        : typeof rawPoints === 'string' && rawPoints.trim() !== ''
        ? Number(rawPoints)
        : NaN;

    if (
      !Number.isInteger(pointsRequired) ||
      pointsRequired < 1 ||
      pointsRequired > cfg.maxRewardCost
    ) {
      errors.points_required = [
        `The points required field must be an integer between 1 and ${cfg.maxRewardCost}.`,
      ];
    } else {
      updateData.points_required = pointsRequired;
    }
  }

  if (body.active !== undefined) {
    if (typeof body.active !== 'boolean') {
      errors.active = ['The active field must be true or false.'];
    } else {
      updateData.active = body.active;
    }
  }

  if (Object.keys(errors).length > 0) {
    return validationErrorResponse(errors);
  }

  const updated = await prisma.reward.update({
    where: { id: existing.id },
    data: updateData,
  });

  return NextResponse.json({ data: formatReward(updated) });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request, ['owner']);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const rewardId = Number(id);
  if (!Number.isInteger(rewardId) || rewardId < 1) {
    return NextResponse.json({ message: 'Reward not found.' }, { status: 404 });
  }

  const existing = await prisma.reward.findFirst({
    where: {
      id: BigInt(rewardId),
      deleted_at: null,
    },
  });

  if (!existing) {
    return NextResponse.json({ message: 'Reward not found.' }, { status: 404 });
  }

  await prisma.reward.update({
    where: { id: existing.id },
    data: { deleted_at: new Date() },
  });

  return NextResponse.json({ message: 'Reward deleted.' });
}
