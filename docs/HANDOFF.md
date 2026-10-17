# BrewFlow — Project Handoff Document

**Date:** October 17, 2026  
**Repository:** [https://github.com/seiiba02/BrewPoints](https://github.com/seiiba02/BrewPoints) (Branch: `main`)  
**Architecture:** Next.js 16 (App Router) + Clean Domain Service Architecture + Client-Side Reactive Simulation Engine (`LocalStorageBroadcastAdapter` via `BroadcastChannel` & `localStorage`)  
**Design System:** **Kinetic Variable-Type Espresso Foundry** (`Fraunces` variable display serif, `Plus Jakarta Sans`, `JetBrains Mono` tabular telemetry)

---

## 1. Executive Summary

BrewFlow is a mobile-first coffee shop online ordering and pickup platform engineered for zero-maintenance, zero-downtime portfolio evaluation.

Following the revised client brief ([`docs/revised_client_request.md`](revised_client_request.md)) and technology stack specification ([`docs/TECH_STACK.md`](TECH_STACK.md)), the platform has been fully transitioned from a standalone QR loyalty utility to an **end-to-end coffee shop ordering and kitchen operations system**:

1. **Client-Side Reactive Simulation Engine**: Uses the browser's native `BroadcastChannel('brewflow-realtime-sync')` and `localStorage` to deliver zero-latency multi-tab synchronization. Reviewers can open `http://localhost:3000/` (Customer) and `http://localhost:3000/queue` (Kitchen KDS) in side-by-side tabs and watch incoming tickets pop onto the barista's screen in real time with an audio chime, with zero external database dependencies.
2. **Clean Domain Service Layer**: UI components strictly consume formal TypeScript interfaces (`IOrderService`, `IMenuService`, `ILoyaltyService`, `IStoreService`), providing a clear boundary for swapping between the default `LocalStorageBroadcastAdapter` and a production `SupabaseAdapter`.
3. **Kinetic Variable-Type Espresso Foundry Aesthetic**: Anchored by [`DESIGN.md`](../DESIGN.md) and [`.impeccable/design.json`](../.impeccable/design.json), with high-contrast display typography (`Fraunces` variable weights `320..900`), unbleached paper ground (`#F8F6F0`), carbon ink (`#111110`), signal crimson (`#E02E24`), and verified emerald (`#15803D`).

---

## 2. Completed Surfaces & Architecture

### 2.1 Customer Mobile-First Ordering Surface (`/`)
* **Category Navigation**: Horizontal sticky category rail (`All Items`, `Hot Coffee`, `Cold Brew & Iced`, `Espresso Classics`, `Signature Drinks`, `Artisanal Bakery`).
* **Catalog Grid**: High-contrast product specimen cards displaying name, origin tasting notes, base price, popularity tag, and live availability badge (`In Stock` / `86'd Sold Out`).
* **Drink Customization Bottom Sheet** ([`DrinkCustomizerModal.tsx`](../src/components/ordering/DrinkCustomizerModal.tsx)):
  * Interactive option selectors for Cup Size, Milk Selection (Oat, Almond, Whole, Black), Sweetness (0%, 50%, 100%), and Add-ons (Extra Shot, Salted Cold Foam, Vanilla Bean).
  * Real-time price recalculation with dynamic `Fraunces` variable-weight numerals.
  * Special barista instructions textarea and quantity stepper.
* **Slide-Over Checkout Drawer** ([`CartCheckoutSheet.tsx`](../src/components/ordering/CartCheckoutSheet.tsx)):
  * Line item customization chips and delete action.
  * Pickup schedule selector (`Next available 10–15 min`, `In 25–30 min`, `In 45 min`).
  * Customer contact coordinates (Name & Mobile Phone).
  * Counter settlement notice: transparently clarifies that payment is made at pickup (Cash / Card / Tap).
  * Supporting loyalty perk toggle: Redeem 50 points for a `$5.00 discount`.
* **In-Place Live Order Tracker** ([`OrderLiveTracker.tsx`](../src/components/ordering/OrderLiveTracker.tsx)):
  * Active ticket header (`#ORD-XXXX`) with pickup slot and pulsing status beacon.
  * 5-stage animated stepper: `Ticket Received` $\rightarrow$ `Accepted by Barista` $\rightarrow$ `Brewing & Crafting` $\rightarrow$ `Ready on Counter` $\rightarrow$ `Order Completed`.
  * Real-time cross-tab reactivity: When staff bumps the ticket in the kitchen queue, this tracker updates automatically.

### 2.2 Kitchen Display System / Barista Queue (`/queue`)
* **4-Column Operations Board** ([`BaristaQueuePortal.tsx`](../src/components/queue/BaristaQueuePortal.tsx)):
  1. `Incoming Tickets`: Pending customer orders awaiting acceptance or rejection.
  2. `In Preparation`: Accepted orders actively being crafted at the espresso bar.
  3. `Ready on Counter`: Finished drinks staged for customer collection.
  4. `Completed`: Audit trail of settled tickets.
* **Web Audio Notification Chime**: Synthesized two-tone pleasant chime on incoming tickets.
* **1-Tap Status Bump**: One click transitions tickets through the fulfillment cycle.
* **Quick 86 / Stock Manager**: Instant modal allowing staff to mark any menu item out-of-stock; changes immediately propagate to customer menu cards across open tabs.

### 2.3 Owner Admin Dashboard (`/dashboard`)
* **Sales Telemetry & KPIs** ([`BrewFlowOwnerDashboard.tsx`](../src/components/dashboard/BrewFlowOwnerDashboard.tsx)):
  * Gross Sales ($), Total Volume, Average Order Value (AOV), and In-Flight Queue counts.
  * Best-Selling Products leaderboard ranked by quantity and revenue.
* **Orders Audit Log**: Searchable and filterable table (`All`, `Pending`, `Accepted`, `Preparing`, `Ready`, `Completed`, `Cancelled`) with complete customer details and settlement status.
* **Live Catalog & Pricing CRUD**:
  * Inline price editor: Edit base price and see it update immediately on the customer menu.
  * Stock availability switches.
  * Add Product modal with category assignment.
* **Portfolio Reset Utility**: 1-click `Reset Demo Seed` button restoring baseline demo orders, inventory, and loyalty points.

### 2.4 Navigation & App Shell
* **Global Navigation** ([`AppNav.tsx`](../src/components/layout/AppNav.tsx) & [`AppNavLinks.tsx`](../src/components/layout/AppNavLinks.tsx)):
  * Top carbon-ink header on Desktop (`1440px`) with live status telemetry badge (`STORE SYNC: BROADCAST BUS · $1 = 1 PT`).
  * Fixed bottom thumb-zone bar on Mobile (`390px`) linking `Order Menu`, `Kitchen Queue`, `Owner Admin`, and `Loyalty Pass`.

---

## 3. Verification & Quality Gates

* **TypeScript Compilation**: `npx tsc --noEmit` $\rightarrow$ **0 errors**.
* **Vitest Domain Suite**: `npx vitest run src/__tests__/brewflow.test.ts` $\rightarrow$ **10/10 passed** (9ms execution time).
* **Impeccable Design Audit**: `.agents\skills\impeccable\scripts\impeccable.cmd detect --json` $\rightarrow$ **0 violations** (`[]`) across all 8 UI files.
* **Dual-Viewport Layout**: Verified responsive design at `390px` mobile (thumb-zone navigation, bottom sheets, sticky cart pill) and `1440px` desktop (side-by-side grids, high-density KDS).

---

## 4. How to Demonstrate in a Portfolio Review

1. Start the development server: `npm run dev`.
2. Open **Window 1** at `http://localhost:3000/` (Customer Ordering).
3. Open **Window 2** at `http://localhost:3000/queue` (Kitchen Display System).
4. In Window 1, select a drink (e.g., *Sea Salt Vermont Maple Latte*), customize size and oat milk, and submit the order.
5. In Window 2, listen to the audio chime and watch the new ticket (`#ORD-XXXX`) appear under `Incoming Tickets`.
6. In Window 2, tap `Accept Ticket` $\rightarrow$ `Mark Ready on Counter`.
7. Notice Window 1's live tracker immediately progresses to green with the banner *"Your order is freshly staged at the counter pickup shelf!"*.
8. In Window 2, open `86 / Stock Manager`, toggle an item to `86'd`, and watch it instantly disable in Window 1.
9. Visit `http://localhost:3000/dashboard` to inspect the updated revenue, order volume, and AOV.
