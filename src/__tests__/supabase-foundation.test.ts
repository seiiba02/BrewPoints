import { describe, expect, it } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import {
  CapacitorAuthStorage,
  getCapacitorPlatform,
  isCapacitorNative,
} from '@/lib/capacitor/nativeBridge';
import { computeSpecimenAxes } from '@/lib/design-tokens';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  'https://xcpxtkqurrbtvskripts.supabase.co';
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  'sb_publishable_2WAcVQFvLeN0e_wkF-jlDA_rBlD0YhE';

describe('BrewPoints Live Supabase Foundation & React + Capacitor Bridge Suite', () => {
  it('validates React + Capacitor runtime bridge and variable-font axis tokens', async () => {
    expect(isCapacitorNative()).toBe(false);
    expect(getCapacitorPlatform()).toBe('web');

    await CapacitorAuthStorage.setItem('bp_test_key', 'test_session_token');
    const stored = await CapacitorAuthStorage.getItem('bp_test_key');
    expect(stored).toBe('test_session_token');
    await CapacitorAuthStorage.removeItem('bp_test_key');

    const axes = computeSpecimenAxes(145, 200);
    expect(axes.wght).toBeGreaterThanOrEqual(320);
    expect(axes.wght).toBeLessThanOrEqual(900);
    expect(axes.opsz).toBeGreaterThanOrEqual(24);
    expect(axes.opsz).toBeLessThanOrEqual(144);
  });

  it('reads active starter rewards from live Supabase via public Data API + RLS', async () => {
    const anonClient = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await anonClient
      .from('rewards')
      .select('id, name, points_required, active')
      .order('points_required', { ascending: true });

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.length).toBeGreaterThanOrEqual(3);
    expect(data!.some((r) => r.name === 'Free Espresso')).toBe(true);
  });

  it('authenticates Jane Customer and enforces RLS row isolation on profiles and loyalty_accounts', async () => {
    const customerClient = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: signInData, error: signInErr } =
      await customerClient.auth.signInWithPassword({
        email: 'customer@brewpoints.local',
        password: 'BrewPoints!2026',
      });

    expect(signInErr).toBeNull();
    expect(signInData.user?.email).toBe('customer@brewpoints.local');

    // Customer can read only their own profile (1 row) due to RLS
    const { data: visibleProfiles, error: profErr } = await customerClient
      .from('profiles')
      .select('id, email, role');
    expect(profErr).toBeNull();
    expect(visibleProfiles).toHaveLength(1);
    expect(visibleProfiles![0].email).toBe('customer@brewpoints.local');

    // Customer cannot call staff-only allocate_points_atomic RPC
    const { error: rpcErr } = await customerClient.rpc(
      'allocate_points_atomic',
      {
        p_customer_id: signInData.user!.id,
        p_staff_id: signInData.user!.id,
        p_amount: 10,
        p_points: 10,
      }
    );
    expect(rpcErr).not.toBeNull();
  });

  it('authenticates Barista Staff and executes atomic point allocation and anti-replay redemption RPCs', async () => {
    const staffClient = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: staffAuth, error: staffErr } =
      await staffClient.auth.signInWithPassword({
        email: 'staff@brewpoints.local',
        password: 'BrewPoints!2026',
      });

    expect(staffErr).toBeNull();
    const staffId = staffAuth.user!.id;
    const customerId = '00000000-0000-4000-8000-000000000003';

    // Staff can read all profiles (owner, staff, customer)
    const { data: allProfiles } = await staffClient
      .from('profiles')
      .select('id, role');
    expect(allProfiles!.length).toBeGreaterThanOrEqual(3);

    // Get customer's current balance before test allocation
    const { data: beforeAcc } = await staffClient
      .from('loyalty_accounts')
      .select('current_points')
      .eq('user_id', customerId)
      .single();
    const beforePts = beforeAcc!.current_points;

    // 1. Allocate +100 points atomically
    const { data: allocRes, error: allocErr } = await staffClient.rpc(
      'allocate_points_atomic',
      {
        p_customer_id: customerId,
        p_staff_id: staffId,
        p_amount: 100.0,
        p_points: 100,
        p_note: 'Vitest live RPC allocation verification',
      }
    );
    expect(allocErr).toBeNull();
    const allocObj = allocRes as {
      points_credited: number;
      new_balance: number;
    };
    expect(allocObj.points_credited).toBe(100);
    expect(allocObj.new_balance).toBe(beforePts + 100);

    // 2. Confirm 100-point reward #1 (Free Espresso) atomically with a fresh UUID jti
    const uniqueJti = crypto.randomUUID();
    const { data: redeemRes, error: redeemErr } = await staffClient.rpc(
      'confirm_redemption_atomic',
      {
        p_jti: uniqueJti,
        p_customer_id: customerId,
        p_reward_id: 1,
        p_staff_id: staffId,
      }
    );
    expect(redeemErr).toBeNull();
    const redeemObj = redeemRes as {
      points_deducted: number;
      new_balance: number;
    };
    expect(redeemObj.points_deducted).toBe(100);
    expect(redeemObj.new_balance).toBe(beforePts);

    // 3. Replaying the exact same JTI must fail with unique constraint / anti-replay error (23505)
    const { error: replayErr } = await staffClient.rpc(
      'confirm_redemption_atomic',
      {
        p_jti: uniqueJti,
        p_customer_id: customerId,
        p_reward_id: 1,
        p_staff_id: staffId,
      }
    );
    expect(replayErr).not.toBeNull();
    expect(replayErr?.code).toBe('23505');
  });
});
