# BrewPoints — Digital Loyalty Platform (Next.js 16 + React 19 + Prisma + MySQL)

BrewPoints is a unified full-stack digital loyalty card web application for coffee shops, built with **Next.js 16 (App Router)**, **React 19**, **Prisma ORM**, and **MySQL/MariaDB**.

---

## Architecture Overview

- **Frontend (React 19 + Tailwind CSS v4 + `shadcn/ui`)**:
  - **Customer Wallet Portal (`/wallet`)**: Digital Loyalty Card, Milestone Progress Tracker, Dynamic 10-minute Point Allocation QR (`brewpoints://allocate?token=<jws>`), Rewards Catalog with 15-minute Redemption QR Modal (`brewpoints://redeem?token=<jws>`), and Paginated Transaction History.
  - **Staff POS & Scanner Portal (`/pos`)**: Unified QR Scanner supporting both dynamic allocation and redemption JWS QR codes (plus quick customer lookup), Purchase Spend Point Allocation (`1 pt / $1.00`, half-up rounding), and Atomic Reward Redemption Confirmation.
  - **Owner Admin Portal (`/dashboard`, `/staff`, `/rewards`)**: Live Program Health Analytics (Point Velocity, Reward Popularity, Staff Activity, Redemption Growth), Staff Management CRUD, and Reward Catalog CRUD.
- **Backend (`src/app/api/v1/*` Route Handlers & `src/lib/*` Services)**:
  - **Prisma ORM (`prisma/schema.prisma`)**: Manages the 5 MySQL tables (`users`, `loyalty_accounts`, `rewards`, `redemptions`, `transactions`).
  - **Concurrency & Anti-Replay Security**: Uses interactive database transactions (`prisma.$transaction`) with pessimistic row-level locks (`SELECT ... FOR UPDATE` on `loyalty_accounts`) and unique `jti` UUID v4 enforcement on `redemptions`.
  - **Dual-Mode Authentication (`src/lib/auth/serverAuth.ts`)**: Supports both instant role/UID login (`FIREBASE_REAL=false`) and real Firebase ID token verification (`FIREBASE_REAL=true`), accepting either `Authorization: Bearer <token>` headers or `httpOnly` session cookies.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Push Prisma schema to MySQL (brewpoints) and seed default users & rewards
npm run db:push
npm run db:seed

# 3. Run the development server
npm run dev

# 4. Run the automated Vitest integration test suite
npm test
```

Open `http://localhost:3000` in your browser and select **Shop Owner**, **Barista / Staff**, or **Customer** on `/login`.
