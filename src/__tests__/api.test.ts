import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PointsCalculator } from '@/lib/services/pointsCalculator';
import { TokenService } from '@/lib/services/tokenService';
import { resetRateLimits } from '@/lib/services/rateLimit';

import { GET as getMe } from '@/app/api/v1/me/route';
import { GET as getBalance } from '@/app/api/v1/me/balance/route';
import { GET as getTransactions } from '@/app/api/v1/me/transactions/route';
import { POST as postAllocationToken } from '@/app/api/v1/me/allocation-token/route';
import { POST as postAllocatePoints } from '@/app/api/v1/points/allocate/route';
import {
  GET as getRewards,
  POST as postReward,
} from '@/app/api/v1/rewards/route';
import {
  PATCH as patchReward,
  DELETE as deleteReward,
} from '@/app/api/v1/rewards/[id]/route';
import { POST as postMintRedemption } from '@/app/api/v1/redemptions/route';
import { POST as postConfirmRedemption } from '@/app/api/v1/staff/redemptions/confirm/route';
import {
  GET as getStaff,
  POST as postStaff,
} from '@/app/api/v1/staff/route';
import { GET as getAnalytics } from '@/app/api/v1/analytics/route';

function makeRequest(
  url: string,
  options: {
    method?: string;
    token?: string;
    body?: unknown;
  } = {}
): NextRequest {
  const headers = new Headers();
  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
}

describe('BrewPoints Next.js Backend API & Domain Suite', () => {
  const OWNER_UID = 'test-owner-uid';
  const STAFF_UID = 'test-staff-uid';
  const CUSTOMER_UID = 'test-customer-uid';

  let customerId: bigint;
  let rewardId: bigint;

  beforeAll(async () => {
    process.env.FIREBASE_REAL = 'false';
    process.env.REDEMPTION_TOKEN_SECRET = 'test-secret-key';
  });

  beforeEach(async () => {
    resetRateLimits();

    // Clean test records and reset baseline accounts
    await prisma.transaction.deleteMany({});
    await prisma.redemption.deleteMany({});
    await prisma.loyaltyAccount.deleteMany({});
    await prisma.reward.deleteMany({});
    await prisma.user.deleteMany({});

    const owner = await prisma.user.create({
      data: {
        name: 'Test Owner',
        email: 'owner@brewpoints.local',
        firebase_uid: OWNER_UID,
        role: 'owner',
      },
    });

    const staff = await prisma.user.create({
      data: {
        name: 'Test Staff',
        email: 'staff@brewpoints.local',
        firebase_uid: STAFF_UID,
        role: 'staff',
      },
    });

    const customer = await prisma.user.create({
      data: {
        name: 'Test Customer',
        email: 'customer@brewpoints.local',
        firebase_uid: CUSTOMER_UID,
        role: 'customer',
      },
    });
    customerId = customer.id;

    for (const u of [owner, staff, customer]) {
      await prisma.loyaltyAccount.create({
        data: {
          user_id: u.id,
          current_points: 0,
          total_points_earned: 0,
          total_points_redeemed: 0,
        },
      });
    }

    const reward = await prisma.reward.create({
      data: {
        name: 'Free Espresso',
        description: 'Single-shot espresso',
        points_required: 100,
        active: true,
      },
    });
    rewardId = reward.id;
  });

  afterAll(async () => {
    // Re-seed baseline data after tests complete
    const { execSync } = await import('child_process');
    execSync('npx tsx prisma/seed.ts', { stdio: 'ignore' });
    await prisma.$disconnect();
  });

  describe('Domain Services (PointsCalculator & TokenService)', () => {
    it('calculates points using PHP_ROUND_HALF_UP semantics', () => {
      const calc = new PointsCalculator(1, 1, 1000);
      expect(calc.calculate(125.5)).toBe(126);
      expect(calc.calculate(125.49)).toBe(125);
      expect(calc.calculate(1.0)).toBe(1);
    });

    it('mints and verifies JWS tokens and detects tampering and expiration', () => {
      const svc = new TokenService('secret-123', 900, 600);
      const minted = svc.mintRedemption(42, 7, 1000);

      const validRes = svc.verifyWithExpiry(minted.token, 1500);
      expect(validRes.valid).toBe(true);
      expect(validRes.expired).toBe(false);
      expect(validRes.claims?.customer_id).toBe(42);

      const expiredRes = svc.verifyWithExpiry(minted.token, 2000);
      expect(expiredRes.valid).toBe(false);
      expect(expiredRes.expired).toBe(true);

      const tamperedRes = svc.verifyWithExpiry(
        `${minted.token}tampered`,
        1500
      );
      expect(tamperedRes.valid).toBe(false);
      expect(tamperedRes.expired).toBe(false);
    });
  });

  describe('Phase 1: Profile & Points Allocation (/api/v1/me & /api/v1/points/allocate)', () => {
    it('returns 401 when unauthenticated and 200 for valid Bearer token on GET /api/v1/me', async () => {
      const unauthRes = await getMe(makeRequest('/api/v1/me'));
      expect(unauthRes.status).toBe(401);

      const authRes = await getMe(
        makeRequest('/api/v1/me', { token: CUSTOMER_UID })
      );
      expect(authRes.status).toBe(200);
      const body = await authRes.json();
      expect(body.data.email).toBe('customer@brewpoints.local');
      expect(body.data.role).toBe('customer');
    });

    it('allows staff to allocate points and updates balance and transaction ledger', async () => {
      const res = await postAllocatePoints(
        makeRequest('/api/v1/points/allocate', {
          method: 'POST',
          token: STAFF_UID,
          body: {
            customer_firebase_uid: CUSTOMER_UID,
            amount: 125.5,
          },
        })
      );

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toEqual({
        customer_id: Number(customerId),
        customer_name: 'Test Customer',
        points_credited: 126,
        new_balance: 126,
        total_earned: 126,
      });

      const balRes = await getBalance(
        makeRequest('/api/v1/me/balance', { token: CUSTOMER_UID })
      );
      const balJson = await balRes.json();
      expect(balJson.data.current_points).toBe(126);
    });

    it('supports allocating points via dynamic customer QR payload (brewpoints://allocate?token=...)', async () => {
      const qrRes = await postAllocationToken(
        makeRequest('/api/v1/me/allocation-token', {
          method: 'POST',
          token: CUSTOMER_UID,
        })
      );
      expect(qrRes.status).toBe(200);
      const qrJson = await qrRes.json();

      const allocRes = await postAllocatePoints(
        makeRequest('/api/v1/points/allocate', {
          method: 'POST',
          token: STAFF_UID,
          body: {
            qr_payload: qrJson.data.qr_payload,
            amount: 50,
          },
        })
      );
      expect(allocRes.status).toBe(200);
      const allocJson = await allocRes.json();
      expect(allocJson.data.points_credited).toBe(50);
      expect(allocJson.data.new_balance).toBe(50);
    });

    it('forbids customer from allocating points (403) and validates spend bounds (422)', async () => {
      const forbiddenRes = await postAllocatePoints(
        makeRequest('/api/v1/points/allocate', {
          method: 'POST',
          token: CUSTOMER_UID,
          body: {
            customer_firebase_uid: CUSTOMER_UID,
            amount: 50,
          },
        })
      );
      expect(forbiddenRes.status).toBe(403);

      const lowRes = await postAllocatePoints(
        makeRequest('/api/v1/points/allocate', {
          method: 'POST',
          token: STAFF_UID,
          body: {
            customer_firebase_uid: CUSTOMER_UID,
            amount: 0.5,
          },
        })
      );
      expect(lowRes.status).toBe(422);

      const highRes = await postAllocatePoints(
        makeRequest('/api/v1/points/allocate', {
          method: 'POST',
          token: STAFF_UID,
          body: {
            customer_firebase_uid: CUSTOMER_UID,
            amount: 5000,
          },
        })
      );
      expect(highRes.status).toBe(422);
    });

    it('returns 404 for unknown customer and 409 for soft-deleted customer', async () => {
      const notFoundRes = await postAllocatePoints(
        makeRequest('/api/v1/points/allocate', {
          method: 'POST',
          token: STAFF_UID,
          body: {
            customer_firebase_uid: 'unknown-uid-999',
            amount: 25,
          },
        })
      );
      expect(notFoundRes.status).toBe(404);

      await prisma.user.update({
        where: { id: customerId },
        data: { deleted_at: new Date() },
      });

      const deletedRes = await postAllocatePoints(
        makeRequest('/api/v1/points/allocate', {
          method: 'POST',
          token: STAFF_UID,
          body: {
            customer_firebase_uid: CUSTOMER_UID,
            amount: 25,
          },
        })
      );
      expect(deletedRes.status).toBe(409);
    });
  });

  describe('Phase 2: Rewards CRUD & Atomic JWS Redemption Flow', () => {
    it('enforces owner role for reward creation, update, and soft-deletion', async () => {
      const staffCreate = await postReward(
        makeRequest('/api/v1/rewards', {
          method: 'POST',
          token: STAFF_UID,
          body: { name: 'Latte', points_required: 120 },
        })
      );
      expect(staffCreate.status).toBe(403);

      const ownerCreate = await postReward(
        makeRequest('/api/v1/rewards', {
          method: 'POST',
          token: OWNER_UID,
          body: {
            name: 'Free Matcha Latte',
            description: 'Hot or iced matcha',
            points_required: 180,
          },
        })
      );
      expect(ownerCreate.status).toBe(201);
      const created = (await ownerCreate.json()).data;

      const patchRes = await patchReward(
        makeRequest(`/api/v1/rewards/${created.id}`, {
          method: 'PATCH',
          token: OWNER_UID,
          body: { points_required: 160 },
        }),
        { params: Promise.resolve({ id: String(created.id) }) }
      );
      expect(patchRes.status).toBe(200);
      expect((await patchRes.json()).data.points_required).toBe(160);

      const delRes = await deleteReward(
        makeRequest(`/api/v1/rewards/${created.id}`, {
          method: 'DELETE',
          token: OWNER_UID,
        }),
        { params: Promise.resolve({ id: String(created.id) }) }
      );
      expect(delRes.status).toBe(200);

      const listRes = await getRewards(
        makeRequest('/api/v1/rewards', { token: CUSTOMER_UID })
      );
      const rewards = (await listRes.json()).data;
      expect(rewards.some((r: { id: number }) => r.id === created.id)).toBe(
        false
      );
    });

    it('rejects redemption minting when points are insufficient (422) and succeeds + confirms atomically when sufficient', async () => {
      // Insufficient points (0 < 100)
      const failMint = await postMintRedemption(
        makeRequest('/api/v1/redemptions', {
          method: 'POST',
          token: CUSTOMER_UID,
          body: { reward_id: Number(rewardId) },
        })
      );
      expect(failMint.status).toBe(422);

      // Allocate 150 points
      await postAllocatePoints(
        makeRequest('/api/v1/points/allocate', {
          method: 'POST',
          token: STAFF_UID,
          body: {
            customer_firebase_uid: CUSTOMER_UID,
            amount: 150,
          },
        })
      );

      // Mint redemption token
      const mintRes = await postMintRedemption(
        makeRequest('/api/v1/redemptions', {
          method: 'POST',
          token: CUSTOMER_UID,
          body: { reward_id: Number(rewardId) },
        })
      );
      expect(mintRes.status).toBe(200);
      const mintJson = await mintRes.json();
      expect(mintJson.data.qr_payload).toMatch(/^brewpoints:\/\/redeem\?token=/);

      // Confirm redemption as staff
      const confirmRes = await postConfirmRedemption(
        makeRequest('/api/v1/staff/redemptions/confirm', {
          method: 'POST',
          token: STAFF_UID,
          body: { qr_payload: mintJson.data.qr_payload },
        })
      );
      expect(confirmRes.status).toBe(200);
      const confirmJson = await confirmRes.json();
      expect(confirmJson.data).toEqual({
        customer_name: 'Test Customer',
        reward_name: 'Free Espresso',
        points_deducted: 100,
        new_balance: 50,
      });

      // Replay attack with identical QR token must fail with 409 Conflict
      const replayRes = await postConfirmRedemption(
        makeRequest('/api/v1/staff/redemptions/confirm', {
          method: 'POST',
          token: STAFF_UID,
          body: { qr_payload: mintJson.data.qr_payload },
        })
      );
      expect(replayRes.status).toBe(409);

      // Expired QR token must fail with 410 Gone
      const tokenService = new TokenService();
      const expiredMint = tokenService.mintRedemption(
        Number(customerId),
        Number(rewardId),
        Math.floor(Date.now() / 1000) - 2000
      );
      const expiredRes = await postConfirmRedemption(
        makeRequest('/api/v1/staff/redemptions/confirm', {
          method: 'POST',
          token: STAFF_UID,
          body: {
            qr_payload: `brewpoints://redeem?token=${expiredMint.token}`,
          },
        })
      );
      expect(expiredRes.status).toBe(410);

      // Verify transaction history contains both earn and redeem entries
      const txRes = await getTransactions(
        makeRequest('/api/v1/me/transactions', { token: CUSTOMER_UID })
      );
      expect(txRes.status).toBe(200);
      const txJson = await txRes.json();
      expect(txJson.meta.total).toBe(2);
      expect(txJson.data.map((t: { type: string }) => t.type).sort()).toEqual([
        'earn',
        'redeem',
      ]);
    });
  });

  describe('Phase 4: Owner Staff Management & Program Analytics (/api/v1/staff & /api/v1/analytics)', () => {
    it('allows owner to create and list staff and fetch live analytics', async () => {
      const createStaffRes = await postStaff(
        makeRequest('/api/v1/staff', {
          method: 'POST',
          token: OWNER_UID,
          body: {
            name: 'New Barista',
            email: 'newbarista@brewpoints.local',
            phone: '+639123456789',
          },
        })
      );
      expect(createStaffRes.status).toBe(201);

      const listStaffRes = await getStaff(
        makeRequest('/api/v1/staff', { token: OWNER_UID })
      );
      expect(listStaffRes.status).toBe(200);
      const staffJson = await listStaffRes.json();
      expect(staffJson.data.length).toBe(2);

      const analyticsRes = await getAnalytics(
        makeRequest('/api/v1/analytics', { token: OWNER_UID })
      );
      expect(analyticsRes.status).toBe(200);
      const analyticsJson = await analyticsRes.json();
      expect(analyticsJson.data.summary).toBeDefined();
      expect(Array.isArray(analyticsJson.data.velocity)).toBe(true);
    });
  });
});
