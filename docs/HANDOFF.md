# BrewFlow (BrewPoints) — Project Handoff Document

**Date:** October 25, 2026  
**Repository:** [https://github.com/seiiba02/BrewPoints](https://github.com/seiiba02/BrewPoints) (Branch: `main`)  
**Target Architecture:** **Supabase (PostgreSQL + RLS + Supabase Auth)** + **Next.js 16 (App Router)** + **React 19 & Capacitor (iOS / Android)**  
**Official UI Design:** **BrewFlow Specialty Coffee Platform** (faithfully matching [`docs/BrewFlow Coffee Platform Showcase.png`](BrewFlow%20Coffee%20Platform%20Showcase.png))

---

## 1. Executive Summary

This handoff document captures the current development state, completed architecture, official UI redesign, and next steps for the **BrewFlow** digital coffeehouse ordering, kitchen queue, and loyalty platform.

1. **Official UI Redesign Completed**: Built out the entire official UI matching [`docs/BrewFlow Coffee Platform Showcase.png`](BrewFlow%20Coffee%20Platform%20Showcase.png) across all 4 platform surfaces:
   - **Customer Experience (Web App)**: Hero showcase banner, 3-card feature strip, Popular Picks grid, Menu Browsing category sidebar, Drink Customizer modal, and Cart & Checkout drawer.
   - **Staff Interface (Web App)**: Dark charcoal/forest green sidebar with barista profile (Jan Santos), Order Queue with active/completed filters, order detail & status advancement modal, and live Customer QR scanner panel.
   - **Owner Dashboard (Web App)**: 4 KPI metric cards (Total Sales, Total Orders, Active Customers, Loyalty Redemptions), 7-day dual-series Recharts line chart (Sales & Orders), and Top Selling Items leaderboard with thumbnails.
   - **Mobile App (Customer View)**: Interactive mobile device frame featuring all 7 showcase screens (Splash, Home, Menu, Customization, Cart, Order Tracking #1024, Rewards catalog).
2. **Commercial Beverage & Bakery Assets Generated**: Produced 9 high-resolution product photography assets stored in [`public/images/`](../public/images) (`hero-coffee.jpg`, `iced-latte.jpg`, `spanish-latte.jpg`, `matcha-latte.jpg`, `americano.jpg`, `caramel-macchiato.jpg`, `cappuccino.jpg`, `mocha.jpg`, `blueberry-muffin.jpg`) and a vector SVG emblem [`src/components/ui/BrewFlowLogo.tsx`](../src/components/ui/BrewFlowLogo.tsx).
3. **Supabase Foundation Deployed on Live Project (`xcpxtkqurrbtvskripts`)**:
   - PostgreSQL schema, strict RLS row isolation, and atomic RPC functions (`allocate_points_atomic`, `confirm_redemption_atomic` with `23505` duplicate receipt anti-replay protection).
   - Generated TypeScript database types in [`src/lib/supabase/database.types.ts`](../src/lib/supabase/database.types.ts) and client/server adapters in [`src/lib/supabase/client.ts`](../src/lib/supabase/client.ts) and [`src/lib/supabase/server.ts`](../src/lib/supabase/server.ts).
4. **React 19 + Capacitor Native Bridge**: Replaced Expo with Capacitor (`@capacitor/core`, `@capacitor/cli`, `@capacitor/preferences`, `@capacitor/haptics`, `@capacitor/clipboard`, `@capacitor/status-bar`, `@capacitor/app`) in [`capacitor.config.ts`](../capacitor.config.ts) and [`src/lib/capacitor/nativeBridge.ts`](../src/lib/capacitor/nativeBridge.ts).
5. **100% Passing Test Suite & TypeScript Clean**: **24 / 24 tests passing** across 3 test suites (`brewflow.test.ts`, `api.test.ts`, `supabase-foundation.test.ts`), 0 TypeScript errors on `npx tsc --noEmit`, and `200 OK` responses on all routes.

---

## 2. What Has Been Completed

### 2.1 Official UI Implementation ([`docs/BrewFlow Coffee Platform Showcase.png`](BrewFlow%20Coffee%20Platform%20Showcase.png))

#### A. Customer Storefront ([`src/components/ordering/CustomerOrderingApp.tsx`](../src/components/ordering/CustomerOrderingApp.tsx))
- **Hero Banner**: High-impact espresso dark container (`#1C1815`) featuring bold typography *"Good Coffee Better Days — Freshly brewed. Made for you."*, white pill `Order Now` button, and the clear plastic iced latte cup product photo.
- **3-Pill Feature Strip**: Clean cards with forest green icons for `Order` (Your Favorites), `Pickup` (At Your Convenience), and `Earn Points` (With Every Purchase).
- **Popular Picks**: 4-card catalog grid for `Iced Latte` (P120), `Spanish Latte` (P140), `Matcha Latte` (P130), and `Americano` (P100) with circular dark green `(+)` action buttons.
- **Menu Browsing**: Category pill sidebar (`All`, `Coffee`, `Non-Coffee`, `Frappé`, `Tea`, `Pastries`) paired with clean row item cards showing drink thumbnails, descriptions, prices, and circular `(+)` buttons.
- **Drink Customizer Modal ([`DrinkCustomizerModal.tsx`](../src/components/ordering/DrinkCustomizerModal.tsx))**:
  - Modal card with drink thumbnail, name, base price, and description.
  - Segmented size pills: `Small (P120)`, `Medium (P140)` (selected), `Large (P160)`.
  - Milk selection: `Whole Milk`, `Oat Milk` (selected), `Almond Milk`.
  - Add-on checkboxes: `Extra Shot (+P20)`, `Vanilla Syrup (+P15)`, `Caramel Drizzle (+P15)`.
  - Pill counter `[-] 1 [+]` and `Add to Cart P140` primary button.
- **Cart & Checkout Drawer ([`CartCheckoutSheet.tsx`](../src/components/ordering/CartCheckoutSheet.tsx))**:
  - Item rows with customization summary (`Medium • Oat Milk • Vanilla Syrup`), price, quantity stepper, and delete button.
  - Calculation: Subtotal (P240), Service Fee (P0), Total (P240).
  - Actions: `Proceed to Checkout` (forest green `#133E2B`) and `Continue Shopping`.

#### B. Staff Interface ([`src/components/pos/StaffPosPortal.tsx`](../src/components/pos/StaffPosPortal.tsx))
- **Left Navigation**: Dark charcoal sidebar with `Orders`, `Scan`, `Menu`, `Settings`, and bottom staff profile card for `Jan Santos` (`Staff Barista`).
- **Order Queue**: Filter tabs (`Active (5)`, `Completed`, `All`) with live tickets:
  - `#1024` (2 items · P260 · 8 min ago · `Preparing` orange badge)
  - `#1023` (1 item · P140 · 12 min ago · `Pending` amber badge)
  - `#1022` (3 items · P420 · 15 min ago · `Preparing` orange badge)
  - `#1021` (1 item · P120 · 18 min ago · `Ready` green badge)
  - `#1020` (2 items · P300 · 22 min ago · `Ready` green badge)
  - `View` action modal displaying item breakdown and enabling status bumping (`Pending` → `Preparing` → `Ready` → `Completed`).
- **Scan Customer QR Panel**: Viewfinder with corner brackets `[  ]`, animated QR icon, manual payload input fallback, and `Open Camera` button.

#### C. Owner Dashboard ([`src/components/dashboard/BrewFlowOwnerDashboard.tsx`](../src/components/dashboard/BrewFlowOwnerDashboard.tsx))
- **Sidebar**: Dark sidebar with `Dashboard`, `Orders`, `Menu`, `Customers`, `Loyalty`, `Staff`, `Settings`, and owner card for `Maria Santos` (`Owner`).
- **Header & Metric KPI Cards**: `Last 7 days` filter dropdown with 4 metric cards:
  - `Total Sales`: **P12,480** (↑ 12% vs last week)
  - `Total Orders`: **186** (↑ 18% vs last week)
  - `Active Customers`: **142** (↑ 25% vs last week)
  - `Loyalty Redemptions`: **32** (↑ 45% vs last week)
- **Charts & Widgets**:
  - **Sales Overview**: Dual-series Recharts line chart (Sales in cyan `#06B6D4`, Orders in emerald `#10B981`) across dates `Apr 21` to `Apr 27`.
  - **Top Selling Items**: 1 to 5 leaderboard with product photos (`Iced Latte` 42, `Spanish Latte` 28, `Matcha Latte` 24, `Caramel Macchiato` 18, `Blueberry Muffin` 16).

#### D. Mobile App Showcase ([`src/components/mobile/MobileShowcasePortal.tsx`](../src/components/mobile/MobileShowcasePortal.tsx))
- Route: [`/mobile`](http://localhost:3000/mobile)
- Interactive phone frame shell supporting all 7 showcase screens:
  1. `Splash`: Curved bottom sheet over coffee background with `Get Started` & `Log In`.
  2. `Home`: Alex's loyalty points card (120 pts, progress bar to 200 pts), Quick actions (`Order`, `Rewards`, `History`), and horizontal `Popular Picks`.
  3. `Menu`: Category chips (`Coffee`, `Non-Coffee`, `Frappé`, `Tea`) with quick-add cards.
  4. `Customization`: Size, milk, add-ons selector, and `Add to Cart P140` button.
  5. `Cart`: Order breakdown with stepper and checkout button.
  6. `Tracking`: Live ticket `#1024` with `Preparing` badge and status indicator.
  7. `Rewards`: 120 points balance, `Available` vs. `My Vouchers` tabs, and redeem buttons (`Free Espresso` 100 pts, `Free Pastry` 150 pts, `Free Latte` 200 pts).

---

### 2.2 Live Supabase Integration (`xcpxtkqurrbtvskripts`)

- **Project URL:** `https://xcpxtkqurrbtvskripts.supabase.co`
- **Publishable Key:** `sb_publishable_2WAcVQFvLeN0e_wkF-jlDA_rBlD0YhE`
- **Applied Migrations**:
  - `brewpoints_foundation_schema_rls_rpc`
  - `harden_rpc_security_invoker_and_rls`
  - `fix_private_schema_usage_and_anon_rewards_rls` (mirrored in [`supabase/migrations/20261024061300_brewpoints_foundation_schema_rls_rpc.sql`](../supabase/migrations/20261024061300_brewpoints_foundation_schema_rls_rpc.sql)).
- **Seeded Default Accounts (Password for all: `BrewPoints!2026`)**:
  - Customer: `customer@brewpoints.local`
  - Staff: `staff@brewpoints.local`
  - Owner: `owner@brewpoints.local`
- **Seeded Starter Rewards**: `Free Espresso` (100 pts), `Free Pastry` (150 pts), `10% Discount Voucher` (200 pts).

---

### 2.3 Automated Testing & Verification

Command: `npm run test:all`

| Test Suite | Result | Highlights |
| :--- | :---: | :--- |
| [`src/__tests__/brewflow.test.ts`](../src/__tests__/brewflow.test.ts) | **10 / 10** | Menu category loading (`coffee`, `non-coffee`, `frappe`, `tea`, `pastries`), 86-ing stock toggling, price persistence, order calculations, discount clamping, and realtime events. |
| [`src/__tests__/api.test.ts`](../src/__tests__/api.test.ts) | **10 / 10** | Unauthenticated guards (401), customer RBAC prevention (403), point allocation, voucher generation, and confirmation. |
| [`src/__tests__/supabase-foundation.test.ts`](../src/__tests__/supabase-foundation.test.ts) | **4 / 4** | Live Supabase Data API, Auth signInWithPassword, RLS row isolation, atomic RPCs (`allocate_points_atomic`, `confirm_redemption_atomic`), and `CapacitorAuthStorage`. |

- **Total Tests:** **24 passed (24)**
- **TypeScript:** `npx tsc --noEmit` exits with **0 errors**.
- **Smoke Test:** All routes (`/`, `/pos`, `/dashboard`, `/admin`, `/mobile`, `/images/*`) tested and returning `200 OK`.

---

## 3. Quick Reference: Running the Application

### Dev Server
```bash
npm run dev:turbo
```
- Customer Storefront: [http://localhost:3000](http://localhost:3000)
- Staff POS Portal: [http://localhost:3000/pos](http://localhost:3000/pos)
- Owner Dashboard: [http://localhost:3000/admin](http://localhost:3000/admin) (or `/dashboard`)
- Mobile App Showcase: [http://localhost:3000/mobile](http://localhost:3000/mobile)
- Customer Wallet Pass: [http://localhost:3000/wallet](http://localhost:3000/wallet)

### Testing
```bash
npm run test:all
npx tsc --noEmit
```

### Native Mobile Builds (Capacitor)
```bash
npm run build
npm run cap:sync
npm run cap:open:android  # Open Android Studio
npm run cap:open:ios      # Open Xcode
```

---

## 4. Immediate Next Steps for the Next Session

1. **Native Mobile Testing**:
   - Run `npx cap sync android` and test running on an Android emulator or device to verify native haptics, status bar styling, and offline storage.
2. **Camera Barcode/QR Scanner on Device**:
   - Install `@capacitor-community/barcode-scanner` or `@capacitor-mlkit/barcode-scanning` if camera scanning is needed on physical mobile devices in addition to the web camera API.
3. **Connect Web Order Queue to Live Supabase Realtime**:
   - Currently, orders in `CustomerOrderingApp` and `StaffPosPortal` sync via in-memory and `BroadcastChannel`. Wire Supabase Realtime Postgres Changes to stream new customer orders directly to the staff queue in multi-device setups.

---

## 5. Suggested Skills for Next Agent

- **`supabase`** ([`.agents/skills/supabase/SKILL.md`](../.agents/skills/supabase/SKILL.md)): Use for Supabase Realtime channels, edge functions, or database schema additions.
- **`impeccable`** ([`.agents/skills/impeccable/SKILL.md`](../.agents/skills/impeccable/SKILL.md)): Use when polishing micro-interactions or adapting layouts for specialized tablet/POS displays.
- **`tdd`** ([`.agents/skills/tdd/SKILL.md`](../.agents/skills/tdd/SKILL.md)): Use for test-driven development on any new route handlers or RPC functions.
