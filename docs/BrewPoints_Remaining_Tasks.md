# BrewPoints — Implementation Roadmap & Remaining Tasks

This checklist tracks the implementation of BrewPoints on **Supabase** (PostgreSQL + Auth), **Next.js 16 (App Router)**, and **React 19 + Capacitor (iOS & Android)**, anchored by the **Kinetic Variable-Type Espresso Foundry** (`variable-font-specimen`) design system.

---

## 1. Design System & Web/Mobile UI Redesign (`/impeccable`)
- [x] Establish canonical design system in [`DESIGN.md`](../DESIGN.md) and [`.impeccable/design.json`](../.impeccable/design.json) (`seed: 7a208bfe`).
- [x] Author cross-platform token module [`src/lib/design-tokens.ts`](../src/lib/design-tokens.ts) (`BREWPOINTS_TOKENS` + `computeSpecimenAxes`) for Next.js Web and React 19 + Capacitor Mobile.
- [x] Configure variable `Fraunces` (`'wght'` `320..900`, `'opsz'` `24..144`), `Plus Jakarta Sans`, and `JetBrains Mono` in [`src/app/layout.tsx`](../src/app/layout.tsx) & [`src/app/globals.css`](../src/app/globals.css).
- [x] Redesign responsive app shell ([`AppNav.tsx`](../src/components/layout/AppNav.tsx) + [`AppNavLinks.tsx`](../src/components/layout/AppNavLinks.tsx)) with desktop structural header and fixed mobile thumb-zone navigation bar.
- [x] Redesign Entry Terminal (`/login`, `/unauthorized`), Customer Loyalty Pass (`/wallet`), Barista `<10s` Counter Terminal (`/pos`), and Shop Owner Foundry Ledger (`/dashboard`, `/rewards`, `/staff`).
- [x] Pass `impeccable detect --json` (`0` violations), `npx tsc --noEmit` (`0` errors), and `npm test` (`10/10` integration tests).

---

## 2. Mobile Application (React 19 & Capacitor)
- [x] Remove all React Native / Expo plans and dependencies in favor of a unified **React 19 + Capacitor** architecture.
- [x] Install `@capacitor/core`, `@capacitor/cli`, `@capacitor/preferences`, `@capacitor/haptics`, `@capacitor/clipboard`, `@capacitor/status-bar`, and `@capacitor/app`.
- [x] Create [`capacitor.config.ts`](../capacitor.config.ts) (`appId: 'com.brewpoints.app'`, `appName: 'BrewPoints'`, Carbon Ink `#111110` status bar, Unbleached Foundry Paper `#F8F6F0` background).
- [x] Implement [`src/lib/capacitor/nativeBridge.ts`](../src/lib/capacitor/nativeBridge.ts):
  - [x] `CapacitorAuthStorage` (`@capacitor/preferences` adapter for Supabase Auth with `localStorage` web fallback).
  - [x] `triggerFoundryHaptic` (`@capacitor/haptics` tactile feedback on spend presets, QR minting, and point allocation).
  - [x] `copyTextWithCapacitor` & `readTextWithCapacitor` (`@capacitor/clipboard` integration).
  - [x] `configureFoundryStatusBar` (`@capacitor/status-bar` `#111110` styling).
  - [x] `registerBrewPointsDeepLinkListener` (`@capacitor/app` `appUrlOpen` listener for `brewpoints://allocate` and `brewpoints://redeem`).
- [x] Wire Capacitor native bridge into [`CustomerWallet.tsx`](../src/components/wallet/CustomerWallet.tsx) and [`StaffPosPortal.tsx`](../src/components/pos/StaffPosPortal.tsx).
- [ ] Run `npm run cap:add:android` / `npm run cap:add:ios` when generating native Android Studio / Xcode platform folders on target build machine.

---

## 3. Supabase Foundation (Database & Authentication)
- [x] Provision Supabase Cloud project: **`BrewPoint`** (`xcpxtkqurrbtvskripts`, region `ap-northeast-1`, Postgres 17).
- [x] Apply PostgreSQL schema migrations ([`supabase/migrations/20261024061300_brewpoints_foundation_schema_rls_rpc.sql`](../supabase/migrations/20261024061300_brewpoints_foundation_schema_rls_rpc.sql)):
  - [x] `profiles` table (1:1 with `auth.users(id)` with `role: 'customer' | 'staff' | 'owner'` and auto-provisioning `on_auth_user_created` trigger).
  - [x] `loyalty_accounts` table (1:1 with `profiles.id` with `CHECK (current_points >= 0)`).
  - [x] `rewards` table with point thresholds and soft deletes.
  - [x] `redemptions` table with unique `jti` (UUID v4 anti-replay key).
  - [x] `transactions` table (append-only ledger) + foreign key indexes.
- [x] Configure Row Level Security (RLS) policies for all tables using non-recursive `private.get_my_role()` helper and `(SELECT auth.uid())` initPlan caching.
- [x] Implement atomic PostgreSQL stored procedures / RPC functions (`SECURITY INVOKER` + RLS verified):
  - [x] `allocate_points_atomic(p_customer_id, p_staff_id, p_amount, p_points, p_note)`
  - [x] `confirm_redemption_atomic(p_jti, p_customer_id, p_reward_id, p_staff_id)`
- [x] Seed default accounts and rewards in Supabase ([`supabase/seed.sql`](../supabase/seed.sql)):
  - [x] Shop Owner (`owner@brewpoints.local` · `00000000-0000-4000-8000-000000000001`)
  - [x] Barista Staff (`staff@brewpoints.local` · `00000000-0000-4000-8000-000000000002`)
  - [x] Jane Customer (`customer@brewpoints.local` · `00000000-0000-4000-8000-000000000003` · `145` pts balance)
  - [x] Starter rewards: Free Espresso (`100 pts`), Free Pastry (`150 pts`), 10% Discount Voucher (`200 pts`).
- [x] Generate TypeScript types ([`src/lib/supabase/database.types.ts`](../src/lib/supabase/database.types.ts)) and configure `@supabase/supabase-js` & `@supabase/ssr` clients ([`src/lib/supabase/client.ts`](../src/lib/supabase/client.ts) and [`src/lib/supabase/server.ts`](../src/lib/supabase/server.ts)).

---

## 4. Next.js 16 Backend & API Layer (`/api/v1/*`)
- [x] Configure Supabase clients (`@supabase/supabase-js` and `@supabase/ssr`) with `CapacitorAuthStorage` ([`src/lib/supabase/client.ts`](../src/lib/supabase/client.ts), [`src/lib/supabase/server.ts`](../src/lib/supabase/server.ts)).
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

## 5. Owner Web Admin Portal & React + Capacitor Interfaces (Next.js 16 + React 19)
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
- [x] **Customer Loyalty Wallet (`/wallet` — React + Capacitor)**:
  - [x] Variable-weight Loyalty Pass, future-spend simulator, 10m Allocation QR with live `mm:ss` countdown, 15m Redemption QR modal, 4-tab mobile section switcher, and Capacitor clipboard/haptics integration ([`CustomerWallet.tsx`](../src/components/wallet/CustomerWallet.tsx)).
- [x] **Barista Counter POS (`/pos` — React + Capacitor)**:
  - [x] Two-column `<10s` Counter Terminal with quick spend presets, live variable-weight points readout, deep-link/clipboard JWS scanner, haptics, and atomic receipt banner ([`StaffPosPortal.tsx`](../src/components/pos/StaffPosPortal.tsx)).

---

## 6. Testing & Verification
- [x] Unit & integration tests for `PointsCalculator`, `TokenService`, and `/api/v1/*` routes (`10/10` passing via `npm test`).
- [x] Replay attack test: verify that duplicate `jti` tokens return `409 Conflict`.
- [x] Expiry test: verify that expired tokens return `410 Gone`.
- [x] TypeScript verification (`npx tsc --noEmit` with zero errors).
- [x] Full test suite passing across all 3 test files (`npm run test:all` -> `24/24` passed).

---

## 7. Official BrewFlow Showcase Redesign ([`docs/BrewFlow Coffee Platform Showcase.png`](BrewFlow%20Coffee%20Platform%20Showcase.png))
- [x] Generated 9 high-resolution product photography assets in [`public/images/`](../public/images) (`hero-coffee.jpg`, `iced-latte.jpg`, `spanish-latte.jpg`, `matcha-latte.jpg`, `americano.jpg`, `caramel-macchiato.jpg`, `cappuccino.jpg`, `mocha.jpg`, `blueberry-muffin.jpg`).
- [x] Created official vector SVG emblem in [`src/components/ui/BrewFlowLogo.tsx`](../src/components/ui/BrewFlowLogo.tsx).
- [x] Updated brand tokens in [`src/lib/design-tokens.ts`](../src/lib/design-tokens.ts) and [`src/app/globals.css`](../src/app/globals.css) (Forest green `#133E2B`, warm cream `#F8F6F0`, pure white card `#FFFFFF`, Philippine Peso `P`, rounded-2xl/rounded-3xl radii).
- [x] Implemented Customer Storefront ([`CustomerOrderingApp.tsx`](../src/components/ordering/CustomerOrderingApp.tsx)):
  - [x] Dark espresso hero banner *"Good Coffee Better Days — Freshly brewed. Made for you."* with white pill `Order Now` button.
  - [x] 3-card feature strip (`Order`, `Pickup`, `Earn Points`).
  - [x] Popular Picks catalog grid with circular `(+)` buttons.
  - [x] Menu Browsing category pill sidebar and item list rows.
  - [x] Drink Customizer modal ([`DrinkCustomizerModal.tsx`](../src/components/ordering/DrinkCustomizerModal.tsx)) with size, milk, and add-on selectors.
  - [x] Cart & Checkout sheet ([`CartCheckoutSheet.tsx`](../src/components/ordering/CartCheckoutSheet.tsx)) with subtotal, service fee, and total.
- [x] Implemented Staff Interface ([`StaffPosPortal.tsx`](../src/components/pos/StaffPosPortal.tsx)):
  - [x] Dark charcoal sidebar with barista profile (`Jan Santos`).
  - [x] Order Queue table (`Active (5)`, `Completed`, `All`) with `#1024`, `#1023`, `#1022`, `#1021`, `#1020` and status badges (`Preparing`, `Pending`, `Ready`).
  - [x] Order detail & status advancement modal (`Pending` → `Preparing` → `Ready` → `Completed`).
  - [x] Scan Customer QR panel with corner viewfinder brackets and camera/lookup trigger.
- [x] Implemented Owner Dashboard ([`BrewFlowOwnerDashboard.tsx`](../src/components/dashboard/BrewFlowOwnerDashboard.tsx)):
  - [x] Dark sidebar with owner profile (`Maria Santos`).
  - [x] 4 KPI cards (Total Sales P12,480, Total Orders 186, Active Customers 142, Loyalty Redemptions 32).
  - [x] 7-day dual-series Recharts line chart (Sales & Orders).
  - [x] Top Selling Items leaderboard with thumbnails (`Iced Latte`, `Spanish Latte`, `Matcha Latte`, `Caramel Macchiato`, `Blueberry Muffin`).
- [x] Implemented Mobile App Showcase ([`MobileShowcasePortal.tsx`](../src/components/mobile/MobileShowcasePortal.tsx) at `/mobile`):
  - [x] Interactive device frame shell supporting all 7 showcase screens (`Splash`, `Home`, `Menu`, `Customization`, `Cart`, `Order Tracking`, `Rewards`).
- [x] Supabase security & performance advisor verification (`0` schema/RLS/RPC security warnings).
