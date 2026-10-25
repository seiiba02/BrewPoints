-- BrewPoints Supabase Seed Script
-- Seeds Shop Owner, Barista Staff, Jane Customer, and Starter Rewards

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'owner@brewpoints.local',
    extensions.crypt('BrewPoints!2026', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"],"role":"owner"}'::jsonb,
    '{"name":"Shop Owner","external_uid":"owner-dummy-uid-001","phone":"+1-555-0101"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'staff@brewpoints.local',
    extensions.crypt('BrewPoints!2026', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"],"role":"staff"}'::jsonb,
    '{"name":"Barista Staff","external_uid":"staff-dummy-uid-001","phone":"+1-555-0102"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-4000-8000-000000000003',
    'authenticated',
    'authenticated',
    'customer@brewpoints.local',
    extensions.crypt('BrewPoints!2026', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"],"role":"customer"}'::jsonb,
    '{"name":"Jane Customer","external_uid":"customer-dummy-uid-001","phone":"+1-555-0103"}'::jsonb,
    now(),
    now()
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rewards (id, name, description, points_required, active)
OVERRIDING SYSTEM VALUE
VALUES
  (1, 'Free Espresso', 'Single-origin house espresso shot pulled to order.', 100, true),
  (2, 'Free Pastry', 'Freshly baked butter croissant or seasonal morning pastry.', 150, true),
  (3, '10% Discount Voucher', '10% off any whole bean bag or specialty pour-over order.', 200, true)
ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      points_required = EXCLUDED.points_required,
      active = EXCLUDED.active,
      updated_at = now();

SELECT setval(pg_get_serial_sequence('public.rewards', 'id'), (SELECT COALESCE(MAX(id), 1) FROM public.rewards));

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.transactions WHERE user_id = '00000000-0000-4000-8000-000000000003') THEN
    PERFORM public.allocate_points_atomic(
      '00000000-0000-4000-8000-000000000003'::uuid,
      '00000000-0000-4000-8000-000000000002'::uuid,
      145.00,
      145,
      'Starter loyalty balance & specialty coffee purchases'
    );
    PERFORM public.allocate_points_atomic(
      '00000000-0000-4000-8000-000000000003'::uuid,
      '00000000-0000-4000-8000-000000000002'::uuid,
      100.00,
      100,
      'Whole bean Geisha reserve bag'
    );
    PERFORM public.confirm_redemption_atomic(
      '11111111-1111-4111-8111-111111111111'::uuid,
      '00000000-0000-4000-8000-000000000003'::uuid,
      1,
      '00000000-0000-4000-8000-000000000002'::uuid
    );
  END IF;
END;
$$;
