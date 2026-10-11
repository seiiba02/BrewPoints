# BrewPoints — Implementation Roadmap & Remaining Tasks

This checklist tracks the implementation of BrewPoints rebuilt from scratch on **Supabase** (PostgreSQL + Auth), **Next.js 16 (App Router)**, and **React Native (Expo)**.

---

## 1. Supabase Foundation (Database & Authentication)
- [ ] Initialize Supabase project (Supabase Cloud or local `supabase init`).
- [ ] Run PostgreSQL schema migrations:
  - [ ] `profiles` table (1:1 with `auth.users(id)` with `role: 'customer' | 'staff' | 'owner'`).
  - [ ] `loyalty_accounts` table (1:1 with `profiles.id` with `CHECK (current_points >= 0)`).
  - [ ] `rewards` table with point thresholds and soft deletes.
  - [ ] `redemptions` table with unique `jti` (UUID v4 anti-replay key).
  - [ ] `transactions` table (append-only ledger).
- [ ] Configure Row Level Security (RLS) policies for all tables.
- [ ] Implement atomic PostgreSQL stored procedures / RPC functions:
  - [ ] `allocate_points_atomic(p_customer_id, p_staff_id, p_amount, p_points, p_note)`
  - [ ] `confirm_redemption_atomic(p_jti, p_customer_id, p_reward_id, p_staff_id)`
- [ ] Seed default accounts and rewards:
  - [ ] Shop Owner (`owner@brewpoints.local`)
  - [ ] Barista Staff (`staff@brewpoints.local`)
  - [ ] Jane Customer (`customer@brewpoints.local`)
  - [ ] Starter rewards: Free Espresso (100 pts), Free Pastry (150 pts), 10% Voucher (200 pts).

---

## 2. Next.js 16 Backend & API Layer (`/api/v1/*`)
- [ ] Configure Supabase clients (`@supabase/supabase-js` and `@supabase/ssr`).
- [ ] Implement dual auth resolver supporting Supabase Bearer JWTs and SSR session cookies.
- [ ] Implement `src/proxy.ts` role guard for protected web routes.
- [ ] Implement core domain services:
  - [ ] `PointsCalculator`: Half-up rounding, $1.00–$1,000.00 bounds.
  - [ ] `TokenService`: HS256 JWS token minting and verification for allocation (10m) and redemption (15m).
- [ ] Build REST API Route Handlers:
  - [ ] `GET /api/v1/me`
  - [ ] `GET /api/v1/me/balance`
  - [ ] `GET /api/v1/me/transactions` (cursor/page pagination)
  - [ ] `POST /api/v1/me/allocation-token` (dynamic customer QR)
  - [ ] `POST /api/v1/points/allocate` (with atomic row locking)
  - [ ] `GET`, `POST`, `PATCH`, `DELETE /api/v1/rewards`
  - [ ] `POST /api/v1/redemptions` (mints 15m JWS token)
  - [ ] `POST /api/v1/staff/redemptions/confirm` (atomic confirmation + anti-replay)
  - [ ] `POST /api/v1/staff/scan-preview` (QR decoder & validator)
  - [ ] `GET`, `POST`, `PATCH`, `DELETE /api/v1/staff` (Owner Staff CRUD)
  - [ ] `GET /api/v1/analytics` (Live program health metrics)

---

## 3. Owner Web Admin Portal (Next.js 16 + React 19)
- [ ] Shared responsive layout (`AppNav`) with user role badge and logout action.
- [ ] **Program Health Analytics (`/dashboard`)**:
  - [ ] KPI cards: Total Points Issued, Points Redeemed, Active Customers, Redemption Rate.
  - [ ] Point Velocity Chart (AreaChart).
  - [ ] Reward Popularity Chart (BarChart).
  - [ ] Staff Activity Leaderboard (Table).
  - [ ] Redemption Growth Trend (LineChart).
- [ ] **Staff Management (`/staff`)**:
  - [ ] Staff directory table with transaction stats.
  - [ ] Create staff modal, edit modal, and status toggles.
- [ ] **Reward Catalog Manager (`/rewards`)**:
  - [ ] Visual reward cards with active/inactive badges.
  - [ ] Create reward modal and edit dialogs.

---

## 4. Mobile Application (React Native & Expo)
- [ ] Scaffold Expo app with TypeScript and React Navigation.
- [ ] Configure Supabase Auth with `expo-secure-store`.
- [ ] **Customer Interface**:
  - [ ] Digital Loyalty Card with live balance and milestone progress bar.
  - [ ] Dynamic Earn Points QR generator (`brewpoints://allocate?token=...` with countdown timer).
  - [ ] Reward catalog with point eligibility badges.
  - [ ] Dynamic Redemption QR modal (`brewpoints://redeem?token=...`).
  - [ ] Paginated transaction history screen.
- [ ] **Staff Interface**:
  - [ ] Camera QR scanner viewfinder (`expo-camera`).
  - [ ] Purchase spend allocation form with live points calculation.
  - [ ] Redemption confirmation receipt screen.

---

## 5. Testing & Verification
- [ ] Unit tests for `PointsCalculator` (rounding and spend boundaries).
- [ ] Unit tests for `TokenService` (expiry, tampering, signature verification).
- [ ] Integration tests for all `/api/v1/*` routes against Supabase.
- [ ] Replay attack test: verify that duplicate `jti` tokens return `409 Conflict`.
- [ ] Expiry test: verify that expired tokens return `410 Gone`.
- [ ] Production build verification (`npm run build` with zero TypeScript/lint errors).
