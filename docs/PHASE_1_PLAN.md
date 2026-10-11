# BrewPoints — Phase 1 Plan (Supabase Database & Next.js Backend Foundation)

**Phase 1 Goal:** Establish the Supabase PostgreSQL database foundation and Next.js 16 REST API layer that all downstream clients (mobile app, admin web dashboard, and redemption engine) build upon.

---

## 1. Stack & Layout

| Item | Choice |
|---|---|
| Framework | Next.js 16.x (App Router) with React 19 & TypeScript |
| Runtime | Node.js (v20+) |
| Database | **Supabase (PostgreSQL)** |
| Database Client | `@supabase/supabase-js` & `@supabase/ssr` (or Prisma with Supabase connection string) |
| API Prefix | `/api/v1` |
| Auth Provider | **Supabase Auth** (`auth.users`) |
| Role Storage | PostgreSQL `public.profiles.role` (`customer`, `staff`, `owner`) |

---

## 2. Database Schema (Phase 1)

Phase 1 establishes the core identity, loyalty balance, and reward entities in Supabase PostgreSQL.

### 2.1 `profiles`
Extends Supabase `auth.users` with application profile data and authorization roles.
```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) UNIQUE NOT NULL,
    phone VARCHAR(32),
    role TEXT NOT NULL CHECK (role IN ('customer', 'staff', 'owner')) DEFAULT 'customer',
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.2 `loyalty_accounts`
Maintains customer points balances with strict non-negative constraints. 1:1 with `profiles.id`.
```sql
CREATE TABLE public.loyalty_accounts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_points INT NOT NULL DEFAULT 0 CHECK (current_points >= 0),
    total_points_earned INT NOT NULL DEFAULT 0,
    total_points_redeemed INT NOT NULL DEFAULT 0,
    last_earned_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.3 `rewards`
Reward catalog containing item definitions and point thresholds.
```sql
CREATE TABLE public.rewards (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(500),
    points_required INT NOT NULL CHECK (points_required > 0),
    active BOOLEAN NOT NULL DEFAULT true,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 3. Authentication & Authorization

### 3.1 Supabase Auth Token Resolution
- Every request to `/api/v1/*` accepts an `Authorization: Bearer <supabase_jwt>` header or an authenticated `httpOnly` session cookie created via `@supabase/ssr`.
- The Next.js auth resolver verifies the token against Supabase Auth (`supabase.auth.getUser()`) and queries `public.profiles` where `deleted_at IS NULL`.

### 3.2 Role Guard Middleware
- Route Handlers enforce role-based access controls:
  - `customer`: Can view own profile, balance, and mint allocation tokens.
  - `staff`: Can scan customer QR codes and allocate points.
  - `owner`: Implicitly passes all role checks; manages rewards, staff, and analytics.

---

## 4. Phase 1 API Endpoints

### 4.1 Profile & Balance Endpoints
- `GET /api/v1/me`: Returns profile details for the authenticated user.
  - Response: `{ data: { id, name, email, phone, role } }`
- `GET /api/v1/me/balance`: Returns loyalty point balance.
  - Response: `{ data: { current_points, total_points_earned, total_points_redeemed, last_earned_at } }`

### 4.2 Dynamic Customer Allocation QR Endpoint
- `POST /api/v1/me/allocation-token`: Mints a dynamic 10-minute HS256 JWS QR payload (`brewpoints://allocate?token=<jws>`).
  - Response: `{ data: { qr_payload, expires_at, customer: { id, name } } }`

### 4.3 Points Allocation Endpoint
- `POST /api/v1/points/allocate`: Staff/Owner credits points based on spend.
  - Request: `{ customer_id?: string, qr_payload?: string, amount: number, note?: string }`
  - Formula: `points = Math.floor(amount * 1 + 0.5)` (half-up rounding).
  - Validation: `$1.00 <= amount <= $1,000.00`.
  - Concurrency: Atomic row lock (`SELECT ... FOR UPDATE` on `loyalty_accounts`).
  - Response: `{ data: { customer_id, customer_name, points_credited, new_balance, total_earned } }`

---

## 5. Seed Data

Supabase seed script provides three default accounts and three starter rewards:
1. **Shop Owner**: `owner@brewpoints.local` (Role: `owner`)
2. **Barista Staff**: `staff@brewpoints.local` (Role: `staff`)
3. **Jane Customer**: `customer@brewpoints.local` (Role: `customer`)
4. **Starter Rewards**:
   - *Free Espresso* (100 points)
   - *Free Pastry* (150 points)
   - *10% Discount Voucher* (200 points)
