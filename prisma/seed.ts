import { UserRole } from '@prisma/client';
import { prisma } from '../src/lib/prisma';

async function main() {
  const users: Array<{
    name: string;
    email: string;
    phone: string;
    firebase_uid: string;
    role: UserRole;
  }> = [
    {
      name: 'Shop Owner',
      email: 'owner@brewpoints.local',
      phone: '+639000000001',
      firebase_uid: process.env.SEED_OWNER_FIREBASE_UID ?? 'owner-dummy-uid-001',
      role: 'owner',
    },
    {
      name: 'Barista Staff',
      email: 'staff@brewpoints.local',
      phone: '+639000000002',
      firebase_uid: process.env.SEED_STAFF_FIREBASE_UID ?? 'staff-dummy-uid-001',
      role: 'staff',
    },
    {
      name: 'Jane Customer',
      email: 'customer@brewpoints.local',
      phone: '+639000000003',
      firebase_uid:
        process.env.SEED_CUSTOMER_FIREBASE_UID ?? 'customer-dummy-uid-001',
      role: 'customer',
    },
  ];

  for (const data of users) {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {
        name: data.name,
        phone: data.phone,
        firebase_uid: data.firebase_uid,
        role: data.role,
        deleted_at: null,
      },
      create: data,
    });

    await prisma.loyaltyAccount.upsert({
      where: { user_id: user.id },
      update: { deleted_at: null },
      create: {
        user_id: user.id,
        current_points: 0,
        total_points_earned: 0,
        total_points_redeemed: 0,
      },
    });
  }

  const rewards = [
    {
      name: 'Free Espresso',
      description: 'Redeem for one complimentary single-shot espresso.',
      points_required: 100,
      active: true,
    },
    {
      name: 'Free Pastry',
      description: 'Redeem for any freshly baked pastry of your choice.',
      points_required: 150,
      active: true,
    },
    {
      name: '10% Discount Voucher',
      description: 'Enjoy 10% off your next single-receipt order.',
      points_required: 200,
      active: true,
    },
  ];

  for (const r of rewards) {
    const existing = await prisma.reward.findFirst({
      where: { name: r.name },
    });
    if (existing) {
      await prisma.reward.update({
        where: { id: existing.id },
        data: {
          description: r.description,
          points_required: r.points_required,
          active: r.active,
          deleted_at: null,
        },
      });
    } else {
      await prisma.reward.create({ data: r });
    }
  }

  console.log('Seeded BrewPoints users, loyalty accounts, and rewards.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
