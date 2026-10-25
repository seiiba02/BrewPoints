# BrewFlow (BrewPoints) — Project Handoff

**Updated:** October 25, 2026
**Repository:** [github.com/seiiba02/BrewPoints](https://github.com/seiiba02/BrewPoints), branch `main`, latest commit `3d944bb`
**Stack:** Next.js 16.2.9 (App Router) · React 19 · Tailwind CSS 4 · Capacitor (iOS / Android) · Supabase (Postgres, RLS, Auth)

> **Before writing Next.js code:** this Next.js version has breaking changes (see [`AGENTS.md`](../AGENTS.md)). Read the relevant guide in `node_modules/next/dist/docs/` first.

---

## 1. Where things are documented

This handoff covers current status and next steps only. For everything else:

| Topic | Document |
| :--- | :--- |
| Requirements and client brief | [`REQUIREMENTS.md`](REQUIREMENTS.md), [`client.md`](client.md), [`revised_client_request.md`](revised_client_request.md) |
| Stack choices | [`TECH_STACK.md`](TECH_STACK.md) |
| Implementation plans | [`COMBINED_IMPLEMENTATION_PLAN.md`](COMBINED_IMPLEMENTATION_PLAN.md), `PHASE_1_PLAN.md` to `PHASE_4_PLAN.md` |
| Detailed task checklist | [`BrewPoints_Remaining_Tasks.md`](BrewPoints_Remaining_Tasks.md) |
| Web UI design reference | [`BrewFlow Coffee Platform Showcase.png`](BrewFlow%20Coffee%20Platform%20Showcase.png) |
| Mobile UI design reference | [`Mobile.png`](Mobile.png) |
| Database schema, RLS, RPCs | [`supabase/migrations/`](../supabase/migrations) |

---

## 2. Current status

### 2.1 Web app (all four surfaces built to the showcase design)

| Surface | Route | Main component |
| :--- | :--- | :--- |
| Customer storefront (menu, drink customizer, cart drawer) | `/` | [`CustomerOrderingApp.tsx`](../src/components/ordering/CustomerOrderingApp.tsx) |
| Staff POS (order queue, status changes, QR scan panel) | `/pos` | [`StaffPosPortal.tsx`](../src/components/pos/StaffPosPortal.tsx) |
| Owner dashboard (KPI cards, sales chart, top sellers) | `/admin`, `/dashboard` | [`BrewFlowOwnerDashboard.tsx`](../src/components/dashboard/BrewFlowOwnerDashboard.tsx) |
| Customer wallet pass | `/wallet` | [`CustomerWallet.tsx`](../src/components/wallet/CustomerWallet.tsx) |

Other routes: `/login`, `/unauthorized`, `/queue`, `/rewards`, `/staff`, plus API handlers under `src/app/api/`.

### 2.2 Mobile app showcase: redesigned this session (`/mobile`, commit `3d944bb`)

Rebuilt to match [`Mobile.png`](Mobile.png). It now has 13 screens instead of 7:

1. Splash
2. Sign Up / Log In
3. Home
4. Menu Browsing (search and category filter)
5. Product Details
6. Customization (edits an item already in the cart)
7. Cart (not on the reference board; added to fill the gap at number 7)
8. Checkout
9. Order Tracking
10. Order Completed
11. Rewards & Loyalty (redeeming creates a voucher code)
12. Order History
13. Profile

The page has two views, toggled at the top:
- **Interactive:** one phone you can tap through. A placed order moves itself to "Ready" after about 6 seconds, then the app shows Order Completed and credits the points.
- **All screens:** a gallery of all 13 phones. Clicking one opens it in the interactive view.

Files are all in [`src/components/mobile/`](../src/components/mobile):

| File | Contents |
| :--- | :--- |
| `MobileShowcasePortal.tsx` | Page shell |
| `MobileScreens.tsx` | The 13 screens and the `SCREENS` list |
| `MobileUI.tsx` | Shared pieces: palette, status bar, bottom nav, buttons |
| `MobileAppContext.tsx` | State: cart, orders, points, vouchers |
| `mobileData.ts` | Mock menu, rewards, history and pricing helpers |

**Important:** the mobile showcase runs on mock data only. It is not connected to Supabase.

### 2.3 Supabase

- **Project:** `xcpxtkqurrbtvskripts` (region `ap-northeast-1`). Get the URL and publishable key from the Supabase dashboard or the project's env file. They are not repeated here.
- **Schema:** schema, RLS policies and atomic RPCs are applied (`allocate_points_atomic`, and `confirm_redemption_atomic`, which blocks duplicate receipts).
- **Code:** typed client and server adapters live in [`src/lib/supabase/`](../src/lib/supabase).
- **Seed data:** customer, staff and owner accounts (`*@brewpoints.local`), plus starter rewards.
- **Security:** the seed accounts share a single password. Ask the project owner for it rather than writing it into docs, and **rotate it before any real use**. An earlier version of this file contained it in plain text, so it is in git history.

### 2.4 Native bridge

Capacitor plugins are configured: preferences, haptics, clipboard, status bar and app. See [`capacitor.config.ts`](../capacitor.config.ts) and [`src/lib/capacitor/nativeBridge.ts`](../src/lib/capacitor/nativeBridge.ts). The Android and iOS platform folders have not been generated yet.

### 2.5 Verification

| Check | Result on Oct 25, 2026 |
| :--- | :--- |
| `npx tsc --noEmit` | **No errors in source.** There are 11 errors, all in dev-server-generated files under `.next/dev/types/`. To fix: stop the dev server, delete `.next/`, and restart. |
| `npx eslint src/components/mobile` | Clean |
| `/mobile` | Returns `200`. All 13 screens visually checked with headless Edge screenshots. |
| `npm run test:all` | **Not re-run this session.** Last reported result was 24 of 24 passing. Note that `supabase-foundation.test.ts` runs RPCs against the **live** project. |

No tests cover the new mobile components yet.

---

## 3. Running the app

```bash
npm run dev:turbo        # or: npm run dev  (webpack)
npm run test:all
npx tsc --noEmit
npm run build && npm run cap:sync && npm run cap:open:android   # native build
```

---

## 4. Next steps (in suggested order)

1. **Connect the mobile showcase to Supabase.** That means real menu data, Supabase Auth on the Sign Up / Log In screen, and points and redemptions through the existing RPCs.
2. **Supabase Realtime for orders.** Orders currently reach the staff queue through in-memory state and `BroadcastChannel`, so they don't sync across devices. Stream order changes with Realtime instead. This also lets Order Tracking on mobile show real status instead of the 6-second auto-advance.
3. **Tests for mobile logic.** Cover `unitPrice` in `mobileData.ts` and the cart and order actions in `MobileAppContext.tsx`.
4. **Fill mobile gaps.**
   - The Tea category has no products.
   - Free Pastry and Free Muffin reuse the same photo.
   - Profile rows (Payment Methods, Notifications, Help, Settings) don't go anywhere.
5. **Native device testing.** Run `npx cap add android` / `npx cap sync android`, then test haptics, status bar and offline storage on a device.
6. **Device camera scanning.** Add `@capacitor-mlkit/barcode-scanning` for scanning on physical devices.
7. **Handoff skill cost cut (proposed, not applied).**
   - Add `model: sonnet` to `.agents/skills/handoff/SKILL.md`.
   - Have it write with a single tool call, without re-reading files.
   - Save to `docs/handoff-YYYY-MM-DD-<topic>.md`, never overwriting this file.

---

## 5. Suggested skills for the next agent

| Skill | Use it for |
| :--- | :--- |
| `supabase:supabase` | Auth wiring, Realtime channels, RPC calls, debugging RLS |
| `supabase:supabase-postgres-best-practices` | Before any schema, RLS, migration or SQL change |
| `tdd` | Tests for mobile pricing and cart logic, and for new route handlers |
| `run` | Launching the app and taking screenshots to confirm UI changes |
| `code-review` | Reviewing a diff before committing |
