# BrewPoints — Project Handoff Document

**Date:** October 11, 2026  
**Repository:** [https://github.com/seiiba02/BrewPoints](https://github.com/seiiba02/BrewPoints) (Branch: `main`)  
**Target Architecture:** **Supabase (PostgreSQL + Supabase Auth)** + **Next.js 16 (App Router)** + **React Native (Expo)**

---

## 1. Executive Summary

This handoff document captures the current state, recent transitions, and exact next steps for continuing the **BrewPoints** digital loyalty platform on another machine or in a fresh session.

In the previous session, the project was successfully transitioned from a legacy Laravel 12 backend to a unified full-stack **Next.js 16 (App Router)** application with all domain logic, REST API route handlers (`/api/v1/*`), and web portals (Owner, Staff, Customer). 

Subsequently, the architectural decision was made to **rebuild the project from scratch using Supabase** as the database (PostgreSQL with Row Level Security) and authentication provider (Supabase Auth). The entire documentation suite in `docs/` has been refactored and pushed to GitHub to define this target architecture.

---

## 2. What Has Been Completed

### 2.1 Full-Stack Next.js 16 REST API & Portals
- **Domain Services**:
  - `src/lib/services/pointsCalculator.ts`: Half-up rounding, $1.00 = 1 point, $1.00–$1,000.00 spend bounds.
  - `src/lib/services/tokenService.ts`: HS256 JWS tokens for dynamic 10m Customer Allocation QR (`brewpoints://allocate?token=...`) and single-use 15m Redemption QR (`brewpoints://redeem?token=...` with UUID v4 `jti`).
- **REST Endpoints (`/api/v1/*`)**:
  - `GET /api/v1/me`, `GET /api/v1/me/balance`, `GET /api/v1/me/transactions`, `POST /api/v1/me/allocation-token`
  - `POST /api/v1/points/allocate` (atomic row locking)
  - `GET`, `POST`, `PATCH`, `DELETE /api/v1/rewards`
  - `POST /api/v1/redemptions`, `POST /api/v1/staff/redemptions/confirm`, `POST /api/v1/staff/scan-preview`
  - `GET`, `POST`, `PATCH`, `DELETE /api/v1/staff`
  - `GET /api/v1/analytics`
- **Route Guarding**: Next.js 16 `src/proxy.ts` protecting `/dashboard`, `/staff`, `/rewards`, `/pos`, and `/wallet`.
- **Web Portals**:
  - Owner Admin (`/dashboard`, `/staff`, `/rewards`): Live analytics charts (Recharts), Staff CRUD, Reward CRUD.
  - Customer Wallet (`/wallet`): Digital Loyalty Card, Milestone Progress Bar, Dynamic Allocation QR, Rewards Catalog & Redemption QR Modal, Transaction History.
  - Staff POS (`/pos`): Unified QR Scanner, Point Allocation Form, Redemption Confirmation Flow.
- **Git & GitHub**: Repository created and pushed to `https://github.com/seiiba02/BrewPoints`.

### 2.2 Complete Documentation Refactor (`docs/`)
All 8 project specification documents were rewritten to specify the new Supabase + Next.js + React Native stack:
- [`docs/client.md`](client.md): Client background, business goals, and updated technical requirements.
- [`docs/REQUIREMENTS.md`](REQUIREMENTS.md): Core business rules and Supabase architectural stack.
- [`docs/COMBINED_IMPLEMENTATION_PLAN.md`](COMBINED_IMPLEMENTATION_PLAN.md): Single source of truth containing PostgreSQL schema, RLS policies, atomic RPC functions, and API specifications.
- [`docs/PHASE_1_PLAN.md`](PHASE_1_PLAN.md): Supabase foundation, PostgreSQL schema, and Phase 1 API endpoints.
- [`docs/PHASE_2_PLAN.md`](PHASE_2_PLAN.md): Reward management and atomic JWS redemption engine.
- [`docs/PHASE_3_PLAN.md`](PHASE_3_PLAN.md): React Native (Expo) customer and staff interfaces with Supabase Auth.
- [`docs/PHASE_4_PLAN.md`](PHASE_4_PLAN.md): Owner web portal and analytics specifications.
- [`docs/BrewPoints_Remaining_Tasks.md`](BrewPoints_Remaining_Tasks.md): Active implementation checklist for the build from scratch.

---

## 3. Immediate Next Steps for the Next Session

When resuming on the new device:

1. **Pull Latest Code**:
   ```bash
   git clone https://github.com/seiiba02/BrewPoints.git
   cd BrewPoints
   npm install
   ```

2. **Supabase Database & Auth Setup**:
   - Create a project on [supabase.com](https://supabase.com) (or initialize locally via `npx supabase init` and `npx supabase start`).
   - Run the PostgreSQL schema migrations defined in [`docs/COMBINED_IMPLEMENTATION_PLAN.md`](COMBINED_IMPLEMENTATION_PLAN.md#2-database-schema--supabase-configuration):
     - `public.profiles` (linked to `auth.users.id`)
     - `public.loyalty_accounts`
     - `public.rewards`
     - `public.redemptions`
     - `public.transactions`
     - Configure Row Level Security (RLS) policies and atomic stored functions (`allocate_points_atomic`, `confirm_redemption_atomic`).

3. **Configure Environment Variables (`.env`)**:
   - Set Supabase credentials:
     ```env
     NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
     NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
     SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
     REDEMPTION_TOKEN_SECRET="your-jws-secret"
     ```

4. **Wire Next.js to Supabase**:
   - Install `@supabase/supabase-js` and `@supabase/ssr`.
   - Update `src/lib/auth/serverAuth.ts` and Route Handlers to use Supabase client / SSR sessions.
   - Run Vitest tests (`npm test`) to verify all `/api/v1/*` routes against Supabase.

5. **Scaffold React Native (Expo) Mobile App**:
   - Follow [`docs/PHASE_3_PLAN.md`](PHASE_3_PLAN.md) to set up the Expo app for Customer Wallet and Staff POS Scanner using `expo-camera`, `react-native-qrcode-svg`, and `expo-secure-store`.

---

## 4. Key Reference Documents
- **Master Plan:** [`docs/COMBINED_IMPLEMENTATION_PLAN.md`](COMBINED_IMPLEMENTATION_PLAN.md)
- **Checklist:** [`docs/BrewPoints_Remaining_Tasks.md`](BrewPoints_Remaining_Tasks.md)
- **Database Schema:** [`docs/COMBINED_IMPLEMENTATION_PLAN.md`](COMBINED_IMPLEMENTATION_PLAN.md#2-database-schema--supabase-configuration)
- **Mobile Spec:** [`docs/PHASE_3_PLAN.md`](PHASE_3_PLAN.md)

---

## 5. Suggested Skills for Next Agent
- **`tdd`**: Test-driven development for the Supabase SQL migrations and Next.js Route Handlers.
- **`review`**: Two-axis spec & standards review against [`docs/COMBINED_IMPLEMENTATION_PLAN.md`](COMBINED_IMPLEMENTATION_PLAN.md).
- **`impeccable`**: Design and visual polish for the Next.js Web Admin Portal and React Native mobile screens.
