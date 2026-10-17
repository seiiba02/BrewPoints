# BrewFlow — Project Handoff Document

**Date:** October 17, 2026  
**Repository:** [https://github.com/seiiba02/BrewPoints](https://github.com/seiiba02/BrewPoints) (Branch: `main`)  
**Current Architecture:** Next.js 16 (App Router, Webpack dev mode) + Clean Domain Service Architecture + Client-Side Reactive Simulation Engine (`BroadcastChannel` + `localStorage`)  
**Design Tokens:** [`src/lib/design-tokens.ts`](../src/lib/design-tokens.ts) / [`DESIGN.md`](../DESIGN.md)

---

## 1. Executive Summary & Session Progress

In this session, the project transitioned from a standalone QR-code loyalty platform (`BrewPoints`) to a **mobile-first coffee shop online ordering and pickup platform (`BrewFlow`)** based on the revised client specification ([`docs/revised_client_request.md`](revised_client_request.md)) and technology stack ([`docs/TECH_STACK.md`](TECH_STACK.md)):

1. **Clean Domain Service Layer**:
   - [`src/lib/domain/types.ts`](../src/lib/domain/types.ts): Strongly typed models for `MenuItem`, `CustomizationGroup`, `CartItem`, `Order`, `OrderStatus`, `LoyaltyAccount`, and `StoreMetrics`.
   - [`src/lib/domain/interfaces.ts`](../src/lib/domain/interfaces.ts): Service contracts for `IOrderService`, `IMenuService`, `ILoyaltyService`, and `IStoreService`.
   - [`src/lib/services/brewflowService.ts`](../src/lib/services/brewflowService.ts): Facade exposing domain methods to React surfaces.

2. **Client-Side Reactive Simulation Engine**:
   - [`src/lib/storage/localStorageAdapter.ts`](../src/lib/storage/localStorageAdapter.ts): Uses browser-native `BroadcastChannel('brewflow-realtime-sync')` and `localStorage` to provide instant, zero-downtime multi-tab reactivity without requiring an external database.
   - Pre-populated with authentic seed data ([`src/lib/storage/seedData.ts`](../src/lib/storage/seedData.ts)) including 11 specialty coffee & pastry items across 5 categories, 4 active orders in various states, and a loyalty ledger.

3. **Core Surfaces Operational**:
   - **Customer Ordering Surface (`/`)**: Category tabs, product cards, drink customization bottom sheet ([`DrinkCustomizerModal.tsx`](../src/components/ordering/DrinkCustomizerModal.tsx)), slide-over cart checkout with scheduled pickup time and counter payment ([`CartCheckoutSheet.tsx`](../src/components/ordering/CartCheckoutSheet.tsx)), and an animated in-place live ticket stepper ([`OrderLiveTracker.tsx`](../src/components/ordering/OrderLiveTracker.tsx)).
   - **Kitchen Display System (`/queue`)**: 4-column operations board (`Incoming`, `In Prep`, `Ready`, `Completed`) with synthesized Web Audio chime on ticket arrival, 1-tap status bumping, and quick 86 / stock manager ([`BaristaQueuePortal.tsx`](../src/components/queue/BaristaQueuePortal.tsx)).
   - **Owner Administration (`/dashboard`)**: Telemetry KPIs, Top-Selling items, filterable order audit log, live menu pricing CRUD, and a 1-click `Reset Demo Seed` utility ([`BrewFlowOwnerDashboard.tsx`](../src/components/dashboard/BrewFlowOwnerDashboard.tsx)).
   - **Customer Loyalty Pass (`/wallet`)**: Digital wallet pass and transaction ledger ([`CustomerWallet.tsx`](../src/components/wallet/CustomerWallet.tsx)).

4. **Development Server & Performance Fix**:
   - Resolved the Next.js 16 Turbopack file-watcher CPU lockup on Windows by updating `package.json` to `"dev": "next dev --webpack"` and streamlining [`next.config.ts`](../next.config.ts).
   - Cold compiles reduced from indefinite hang to ~4.6s, with subsequent warm page loads responding in ~128ms.

5. **Quality Gates Passed**:
   - `npx tsc --noEmit`: 0 errors.
   - `npm test` (`vitest run src/__tests__/brewflow.test.ts`): 10/10 tests passing in ~10ms.
   - `impeccable detect`: 0 violations (`[]`) across all UI files.
   - `npm run build`: Production build succeeds.

---

## 2. Next Session Objective: Full Consumer-Facing Visual Redesign

### The Problem to Solve
The current interface is functional and clean, but it feels like a **"generic web app / typographic specimen"** rather than an engaging, appetising, public-facing coffee ordering experience (such as Starbucks, Blank Street, Blue Bottle, or Toast Web). 

### Scope for the Next Agent
Redesign the customer ordering experience (`/`), item customizer, and checkout sheet to feel like a high-converting, polished commercial ordering product:
1. **Visual Appetite & Imagery**:
   - Incorporate rich coffee/pastry visual placeholders or styled illustration tiles for each drink category and product.
   - Rich tags for temperature (`Hot` / `Iced`), caffeine level, milk alternatives, and signature badges.
2. **Consumer Ordering Ergonomics**:
   - Horizontal category pill carousel with category icons.
   - High-contrast "Add +" buttons and floating action trays.
   - Drink customization interface with visual cup size silhouettes (Small 8oz, Regular 12oz, Large 16oz), tactile milk selection chips with icons, and sweetness level meter.
   - Engaging order tracker screen with animated barista illustration / coffee cup brewing states.
3. **Preserve the Underlying Engine**:
   - Keep the clean architecture: all new visual components must continue to bind to `brewflowService` (`createOrder`, `getMenuItems`, `subscribe`).
   - Retain the `BroadcastChannel` synchronization so multi-tab order flow between Customer and Kitchen continues to work out of the box.

---

## 3. Key Reference Documents

- **Client Specification:** [`docs/revised_client_request.md`](revised_client_request.md)
- **Tech Stack Specification:** [`docs/TECH_STACK.md`](TECH_STACK.md)
- **Product Context:** [`PRODUCT.md`](../PRODUCT.md)
- **Current Design System:** [`DESIGN.md`](../DESIGN.md) & [`.impeccable/design.json`](../.impeccable/design.json)
- **Design Tokens:** [`src/lib/design-tokens.ts`](../src/lib/design-tokens.ts)
- **Domain Services:** [`src/lib/services/brewflowService.ts`](../src/lib/services/brewflowService.ts) & [`src/lib/storage/localStorageAdapter.ts`](../src/lib/storage/localStorageAdapter.ts)

---

## 4. Suggested Skills for the Next Agent

- **`impeccable`** ([`.agents/skills/impeccable/SKILL.md`](../.agents/skills/impeccable/SKILL.md)):
  - Run `.agents/skills/impeccable/scripts/impeccable.cmd context` to reload design context.
  - Use `shape` or `new-work` to establish a vibrant, consumer-grade coffee shop visual language (appetite appeal, tactile pills, product photography/illustrations, and smooth bottom sheets).
  - Use `impeccable detect` to verify 0 token violations after redesigning.
- **`tdd`** ([`.agents/skills/tdd/SKILL.md`](../.agents/skills/tdd/SKILL.md)):
  - Run `npm test` (`vitest run src/__tests__/brewflow.test.ts`) to ensure order pricing and customization logic remains tested throughout UI refactoring.
