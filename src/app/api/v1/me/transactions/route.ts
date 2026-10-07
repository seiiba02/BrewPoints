import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/serverAuth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  const pageParam = Number(request.nextUrl.searchParams.get('page') ?? '1');
  const currentPage = Number.isFinite(pageParam) && pageParam >= 1 ? Math.floor(pageParam) : 1;
  const perPage = 20;
  const skip = (currentPage - 1) * perPage;

  const [total, items] = await Promise.all([
    prisma.transaction.count({
      where: { user_id: auth.user.id },
    }),
    prisma.transaction.findMany({
      where: { user_id: auth.user.id },
      include: {
        staff: {
          select: { id: true, name: true },
        },
        redemption: {
          include: {
            reward: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      skip,
      take: perPage,
    }),
  ]);

  const lastPage = Math.max(1, Math.ceil(total / perPage));

  return NextResponse.json({
    data: items.map((t) => ({
      id: Number(t.id),
      type: t.type,
      points: t.points,
      amount: t.amount !== null ? t.amount.toFixed(2) : null,
      note: t.note,
      staff: t.staff
        ? { id: Number(t.staff.id), name: t.staff.name }
        : null,
      reward: t.redemption?.reward
        ? {
            id: Number(t.redemption.reward.id),
            name: t.redemption.reward.name,
          }
        : null,
      created_at: t.created_at ? t.created_at.toISOString() : new Date().toISOString(),
    })),
    meta: {
      current_page: currentPage,
      last_page: lastPage,
      per_page: perPage,
      total,
    },
  });
}
