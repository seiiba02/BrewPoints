'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getLoyaltyConfig } from '@/lib/config/loyalty';

export async function login(role: 'customer' | 'staff' | 'owner') {
  const cfg = getLoyaltyConfig();

  const uidByRole = {
    owner: cfg.seedOwnerFirebaseUid,
    staff: cfg.seedStaffFirebaseUid,
    customer: cfg.seedCustomerFirebaseUid,
  } as const;

  const targetUid = uidByRole[role];

  // Find or upsert the seeded user in MySQL so local login always resolves a real DB user
  let dbUser = await prisma.user.findFirst({
    where: {
      OR: [{ firebase_uid: targetUid }, { role, deleted_at: null }],
    },
  });

  if (!dbUser) {
    const defaultMeta = {
      owner: {
        name: 'Shop Owner',
        email: 'owner@brewpoints.local',
        phone: '+639000000001',
      },
      staff: {
        name: 'Barista Staff',
        email: 'staff@brewpoints.local',
        phone: '+639000000002',
      },
      customer: {
        name: 'Jane Customer',
        email: 'customer@brewpoints.local',
        phone: '+639000000003',
      },
    }[role];

    dbUser = await prisma.user.create({
      data: {
        name: defaultMeta.name,
        email: defaultMeta.email,
        phone: defaultMeta.phone,
        firebase_uid: targetUid,
        role,
      },
    });

    await prisma.loyaltyAccount.upsert({
      where: { user_id: dbUser.id },
      update: {},
      create: {
        user_id: dbUser.id,
        current_points: 0,
        total_points_earned: 0,
        total_points_redeemed: 0,
      },
    });
  }

  const sessionPayload = {
    id: Number(dbUser.id),
    firebase_uid: dbUser.firebase_uid,
    role: dbUser.role,
    name: dbUser.name,
    email: dbUser.email,
  };

  const cookieStore = await cookies();
  cookieStore.set('auth_user', JSON.stringify(sessionPayload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  if (dbUser.role === 'owner') {
    redirect('/dashboard');
  } else if (dbUser.role === 'staff') {
    redirect('/pos');
  } else {
    redirect('/wallet');
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_user');
  redirect('/login');
}
