import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/serverAuth';
import { prisma } from '@/lib/prisma';
import { parseJsonBody, validationErrorResponse } from '@/lib/http/errors';
import { formatStaffUser } from '@/app/api/v1/staff/route';

interface UpdateStaffBody {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  active?: unknown;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request, ['owner']);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const staffId = Number(id);
  if (!Number.isInteger(staffId) || staffId < 1) {
    return NextResponse.json({ message: 'Staff member not found.' }, { status: 404 });
  }

  const existing = await prisma.user.findFirst({
    where: {
      id: BigInt(staffId),
      role: 'staff',
    },
  });

  if (!existing) {
    return NextResponse.json({ message: 'Staff member not found.' }, { status: 404 });
  }

  const body = await parseJsonBody<UpdateStaffBody>(request);
  const errors: Record<string, string[]> = {};
  const updateData: {
    name?: string;
    email?: string;
    phone?: string | null;
    deleted_at?: Date | null;
  } = {};

  if (body.name !== undefined) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name || name.length > 120) {
      errors.name = ['The name field must be between 1 and 120 characters.'];
    } else {
      updateData.name = name;
    }
  }

  if (body.email !== undefined) {
    const email =
      typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 190) {
      errors.email = ['The email field must be a valid email address.'];
    } else {
      const duplicate = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: existing.id },
        },
      });
      if (duplicate) {
        errors.email = ['The email has already been taken.'];
      } else {
        updateData.email = email;
      }
    }
  }

  if (body.phone !== undefined) {
    if (body.phone === null || body.phone === '') {
      updateData.phone = null;
    } else if (typeof body.phone !== 'string' || body.phone.length > 32) {
      errors.phone = ['The phone field must not be greater than 32 characters.'];
    } else {
      updateData.phone = body.phone.trim();
    }
  }

  if (body.active !== undefined) {
    if (typeof body.active !== 'boolean') {
      errors.active = ['The active field must be true or false.'];
    } else {
      updateData.deleted_at = body.active ? null : new Date();
    }
  }

  if (Object.keys(errors).length > 0) {
    return validationErrorResponse(errors);
  }

  const updated = await prisma.user.update({
    where: { id: existing.id },
    data: updateData,
    include: {
      _count: {
        select: {
          staffTransactions: true,
          confirmedRedemptions: true,
        },
      },
    },
  });

  return NextResponse.json({ data: formatStaffUser(updated) });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request, ['owner']);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const staffId = Number(id);
  if (!Number.isInteger(staffId) || staffId < 1) {
    return NextResponse.json({ message: 'Staff member not found.' }, { status: 404 });
  }

  const existing = await prisma.user.findFirst({
    where: {
      id: BigInt(staffId),
      role: 'staff',
    },
  });

  if (!existing) {
    return NextResponse.json({ message: 'Staff member not found.' }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: existing.id },
    data: { deleted_at: new Date() },
  });

  return NextResponse.json({ message: 'Staff member deactivated.' });
}
