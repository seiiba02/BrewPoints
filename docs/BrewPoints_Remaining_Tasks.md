# BrewPoints Implementation Status (Next.js Full-Stack Refactor)

## Completed Refactoring Milestones

### 1. Backend Migration (Laravel 12 -> Next.js 16 App Router + Prisma ORM)
- [x] Promoted Next.js 16 application to repository root and retired legacy Laravel and `mobile/` folders.
- [x] Created `prisma/schema.prisma` matching the 5 MySQL tables (`users`, `loyalty_accounts`, `rewards`, `redemptions`, `transactions`) and `prisma/seed.ts`.
- [x] Ported `PointsCalculator` (`src/lib/services/pointsCalculator.ts`) and `TokenService` (`src/lib/services/tokenService.ts`) with HS256 JWS support for both 15m Redemption tokens and 10m Allocation tokens.
- [x] Implemented dual-mode authentication & role guard (`src/lib/auth/serverAuth.ts` and `src/proxy.ts`).
- [x] Ported all Phase 1 & Phase 2 REST endpoints (`GET /api/v1/me`, `GET /api/v1/me/balance`, `GET /api/v1/me/transactions`, `POST /api/v1/me/allocation-token`, `POST /api/v1/points/allocate`, `GET|POST|PATCH|DELETE /api/v1/rewards`, `POST /api/v1/redemptions`, `POST /api/v1/staff/redemptions/confirm`, `POST /api/v1/staff/scan-preview`).
- [x] Implemented Phase 4 Admin endpoints (`GET|POST|PATCH|DELETE /api/v1/staff` and `GET /api/v1/analytics`).
- [x] Added Vitest integration test suite (`src/__tests__/api.test.ts` — 10/10 passing).

### 2. Unified React 19 Web Portals
- [x] **Owner Portal (`/dashboard`, `/staff`, `/rewards`)**: Wired to live MySQL analytics, Staff CRUD, and Reward Catalog CRUD with shared `AppNav` header.
- [x] **Customer Wallet Portal (`/wallet`)**: Digital Loyalty Card, Milestone Progress Bar, Dynamic 10m Allocation QR, Rewards Catalog + 15m Redemption QR Modal, and Paginated Transaction History.
- [x] **Staff POS Portal (`/pos`)**: Unified QR Scanner, Point Allocation flow, and Atomic Reward Redemption Confirmation flow.
