# BrewPoints — Implementation Roadmap & Remaining Tasks

This checklist tracks the implementation of BrewPoints on **Supabase** (PostgreSQL + Auth), **Next.js 16 (App Router)**, and **React Native (Expo)**, anchored by the **Kinetic Variable-Type Espresso Foundry** (`variable-font-specimen`) design system.

---

## 1. Design System & Web/Mobile UI Redesign (`/impeccable`)
- [x] Establish canonical design system in [`DESIGN.md`](../DESIGN.md) and [`.impeccable/design.json`](../.impeccable/design.json) (`seed: 7a208bfe`).
- [x] Author cross-platform token module [`src/lib/design-tokens.ts`](../src/lib/design-tokens.ts) (`BREWPOINTS_TOKENS` + `computeSpecimenAxes`) for Next.js Web and React Native (Expo) Mobile.
- [x] Configure variable `Fraunces` (`'wght'` `320..900`, `'opsz'` `24..144`), `Plus Jakarta Sans`, and `JetBrains Mono` in [`src/app/layout.tsx`](../src/app/layout.tsx) & [`src/app/globals.css`](../src/app/globals.css).
- [x] Redesign responsive app shell ([`AppNav.tsx`](../src/components/layout/AppNav.tsx) + [`AppNavLinks.tsx`](../src/components/layout/AppNavLinks.tsx)) with desktop structural header and fixed mobile thumb-zone navigation bar.
- [x] Redesign Entry Terminal (`/login`, `/unauthorized`), Customer Loyalty Pass (`/wallet`), Barista `<10s` Counter Terminal (`/pos`), and Shop Owner Foundry Ledger (`/dashboard`, `/rewards`, `/staff`).
- [x] Pass `impeccable detect --json` (`0` violations), `npx tsc --noEmit` (`0` errors), and `npm test` (`10/10` integration tests).

---

## 2. Supabase Foundation (Database & Authentication)
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
- [ ] Seed default accounts and rewards in Supabase:
  - [ ] Shop Owner (`owner@brewpoints.local`)
  - [ ] Barista Staff (`staff@brewpoints.local`)
  - [ ] Jane Customer (`customer@brewpoints.local`)
  - [ ] Starter rewards: Free Espresso (100 pts), Free Pastry (150 pts), 10% Voucher (200 pts).

---

## 3. Next.js 16 Backend & API Layer (`/api/v1/*`)
- [ ] Configure Supabase clients (`@supabase/supabase-js` and `@supabase/ssr`) to replace local Prisma SQLite adapter when Supabase credentials are provisioned.
- [x] Implement dual auth resolver supporting Bearer JWTs and SSR session cookies ([`src/lib/auth/serverAuth.ts`](../src/lib/auth/serverAuth.ts)).
- [x] Implement [`src/proxy.ts`](../src/proxy.ts) role guard for protected web routes.
- [x] Implement core domain services:
  - [x] [`PointsCalculator`](../src/lib/services/pointsCalculator.ts): Half-up rounding, `$1.00–$1,000.00` bounds.
  - [x] [`TokenService`](../src/lib/services/tokenService.ts): `HS256` JWS token minting and verification for allocation (`10m`) and redemption (`15m`).
- [x] Build REST API Route Handlers:
  - [x] `GET /api/v1/me`
  - [x] `GET /api/v1/me/balance`
  - [x] `GET /api/v1/me/transactions` (cursor/page pagination)
  - [x] `POST /api/v1/me/allocation-token` (dynamic customer QR)
  - [x] `POST /api/v1/points/allocate` (with atomic row locking)
  - [x] `GET`, `POST`, `PATCH`, `DELETE /api/v1/rewards`
  - [x] `POST /api/v1/redemptions` (mints 15m JWS token)
  - [x] `POST /api/v1/staff/redemptions/confirm` (atomic confirmation + anti-replay)
  - [x] `POST /api/v1/staff/scan-preview` (QR decoder & validator)
  - [x] `GET`, `POST`, `PATCH`, `DELETE /api/v1/staff` (Owner Staff CRUD)
  - [x] `GET /api/v1/analytics` (Live program health metrics)

---

## 4. Owner Web Admin Portal & Web PWA Interfaces (Next.js 16 + React 19)
- [x] Shared responsive layout ([`AppNav.tsx`](../src/components/layout/AppNav.tsx)) with user role badge, desktop header, and mobile thumb-zone bar.
- [x] **Program Health Analytics (`/dashboard`)**:
  - [x] KPI specimen cards: Total Points Issued, Points Redeemed, Active Customers, Redemption Rate.
  - [x] Point Velocity Chart ([`PointVelocityChart.tsx`](../src/components/dashboard/PointVelocityChart.tsx)).
  - [x] Reward Popularity Chart ([`RewardPopularityChart.tsx`](../src/components/dashboard/RewardPopularityChart.tsx)).
  - [x] Staff Activity Leaderboard ([`StaffActivityTable.tsx`](../src/components/dashboard/StaffActivityTable.tsx)).
  - [x] Redemption Growth Trend ([`RedemptionGrowthChart.tsx`](../src/components/dashboard/RedemptionGrowthChart.tsx)).
- [x] **Staff Management (`/staff`)**:
  - [x] Staff directory table with transaction stats ([`StaffManagement.tsx`](../src/components/dashboard/StaffManagement.tsx)).
  - [x] Create staff modal, edit modal, and status toggles.
- [x] **Reward Catalog Manager (`/rewards`)**:
  - [x] Visual reward specimen cards with variable-weight point thresholds and active/inactive badges ([`RewardCatalog.tsx`](../src/components/dashboard/RewardCatalog.tsx)).
  - [x] Create reward modal and inline edit dialogs.
- [x] **Customer Mobile PWA Wallet (`/wallet`)**:
  - [x] Variable-weight Loyalty Pass, future-spend simulator, 10m Allocation QR with live `mm:ss` countdown, 15m Redemption QR modal, and 4-tab mobile section switcher ([`CustomerWallet.tsx`](../src/components/wallet/CustomerWallet.tsx)).
- [x] **Barista Counter POS (`/pos`)**:
  - [x] Two-column `<10s` Counter Terminal with quick spend presets, live variable-weight points readout, camera/clipboard JWS scanner, and atomic receipt banner ([`StaffPosPortal.tsx`](../src/components/pos/StaffPosPortal.tsx)).

---

## 5. Native Mobile Application (React Native & Expo)
- [ ] Scaffold Expo app with TypeScript and React Navigation consuming [`src/lib/design-tokens.ts`](../src/lib/design-tokens.ts).
- [ ] Configure Supabase Auth with `expo-secure-store`.
- [ ] **Customer Native Interface**:
  - [ ] Digital Loyalty Card with variable-weight `Fraunces` balance and milestone progress bar.
  - [ ] Dynamic Earn Points QR generator (`brewpoints://allocate?token=...` with countdown timer).
  - [ ] Reward catalog with point eligibility badges.
  - [ ] Dynamic Redemption QR modal (`brewpoints://redeem?token=...`).
  - [ ] Paginated transaction history screen.
- [ ] **Staff Native Interface**:
  - [ ] Camera QR scanner viewfinder (`expo-camera`).
  - [ ] Purchase spend allocation form with live points calculation.
  - [ ] Redemption confirmation receipt screen.

---

## 6. Testing & Verification
- [x] Unit & integration tests for `PointsCalculator`, `TokenService`, and `/api/v1/*` routes (`10/10` passing via `npm test`).
- [x] Replay attack test: verify that duplicate `jti` tokens return `409 Conflict`.
- [x] Expiry test: verify that expired tokens return `410 Gone`.
- [x] TypeScript verification (`npx tsc --noEmit` with zero errors).
- [ ] Integration tests against live Supabase PostgreSQL + RLS instance once provisioned.
