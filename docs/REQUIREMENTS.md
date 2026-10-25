# BrewPoints — Core Requirements & System Architecture

## 1. Core Requirements

- **Tenancy**: Single-tenant (designed for a single coffee shop).
- **Points System**:
  - Points earned based on total purchase spend ($1.00 spent = 1 point, half-up rounding).
  - Staff enters purchase amount at checkout to allocate points.
- **Rewards**:
  - Fixed point cost for each reward item (e.g., 100 points = Free Espresso).
  - Owners configure and manage rewards via web admin portal.
- **Authentication & Authorization**:
  - **Authentication**: Managed via **Supabase Auth** (Email/Password, Magic Link / OTP, Google OAuth).
  - **Authorization**: User roles (`customer`, `staff`, `owner`) stored in PostgreSQL `profiles` table linked 1:1 with `auth.users.id`.
- **Security & Fraud Prevention**:
  - Dynamic JWS tokens encoded in QR codes (`brewpoints://allocate` and `brewpoints://redeem`).
  - Strict expiration TTLs (10m allocation, 15m redemption) and UUID v4 `jti` anti-replay enforcement.
- **Redemption Workflow**:
  - Customer selects eligible reward $\rightarrow$ app generates dynamic redemption QR $\rightarrow$ staff scans QR $\rightarrow$ staff confirms $\rightarrow$ points deducted atomically in a PostgreSQL transaction.

---

## 2. Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Database** | **Supabase (PostgreSQL)** | Hosted PostgreSQL with Row Level Security (RLS), ACID transactions, and atomic RPC functions |
| **Auth Provider** | **Supabase Auth** | Built-in JWT issuance, secure session management, OAuth, and OTP |
| **Backend API** | **Next.js 16 (App Router)** | Route Handlers (`/api/v1/*`) with Bearer token authentication and `@supabase/ssr` / `@supabase/supabase-js` |
| **Admin Portal** | **Next.js 16 + React 19** | Server Components, Tailwind CSS v4, `shadcn/ui`, and Recharts for live analytics |
| **Mobile App** | **React 19 + Capacitor** | Native iOS & Android wrapper (`@capacitor/core`, `@capacitor/cli`, `@capacitor/preferences`, `@capacitor/haptics`, `@capacitor/clipboard`) sharing the unified React UI and design system |

---

## 3. High-Level Implementation Phases

### Phase 1: Supabase Database Setup & Next.js Backend Foundation
- Supabase PostgreSQL schema: `profiles`, `loyalty_accounts`, `rewards`, `transactions`, `redemptions`.
- Supabase Auth integration: JWT validation for REST requests (`Authorization: Bearer <jwt>`) and session cookies for web portal.
- Phase 1 API endpoints: `GET /api/v1/me`, `GET /api/v1/me/balance`, `GET /api/v1/me/transactions`, and `POST /api/v1/points/allocate`.

### Phase 2: Reward Catalog & Atomic JWS Redemption Engine
- Reward management API for shop owners (`GET|POST|PATCH|DELETE /api/v1/rewards`).
- Dynamic QR token generation (HS256 JWS with `jti` and TTL).
- Atomic redemption confirmation with row-level locking (`SELECT ... FOR UPDATE` or Supabase RPC function) and anti-replay protection.

### Phase 3: Mobile Application Development (React 19 & Capacitor)
- **Native Capacitor Shell (`capacitor.config.ts` & `src/lib/capacitor/nativeBridge.ts`)**: Shared React 19 codebase packaged for iOS and Android with `@capacitor/preferences` auth storage, `@capacitor/haptics`, `@capacitor/clipboard`, `@capacitor/status-bar`, and `@capacitor/app` deep-link handling.
- **Customer Interface (`/wallet`)**: Digital loyalty card with live variable-weight `Fraunces` numerals, dynamic allocation QR, reward catalog, redemption QR modal, and transaction history.
- **Staff Interface (`/pos`)**: QR & deep-link scanner, quick counter lookup, purchase spend allocation form, and redemption confirmation receipt.

### Phase 4: Owner Admin Dashboard (Next.js Web Portal)
- Live program health analytics (point velocity, redemption growth, reward popularity, staff activity).
- Staff directory CRUD (create, update, activate/deactivate barista accounts).
- Reward catalog manager with active/inactive toggles.

### Phase 5: Verification & End-to-End Testing
- Automated integration test suite covering points calculation, token expiration, replay attack prevention, and concurrent redemptions.
