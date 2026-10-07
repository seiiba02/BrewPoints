# BrewPoints — Phase 1 Plan

**Phase 1 goal:** Stand up the Laravel 12 + MySQL backend foundation that all later phases (mobile app, admin dashboard, reward redemption) build on.

---

## 1. Stack & Layout

| Item | Choice |
|---|---|
| Framework | Laravel 12.x (PHP 8.3+) |
| Install method | `composer create-project laravel/laravel .` at repo root |
| Web server | XAMPP Apache (PHP bundled) |
| Database | XAMPP MariaDB 10.x, `localhost:3306` |
| DB name | `brewpoints` |
| DB user | `root` |
| DB password | (empty) |
| API prefix | `/api/v1` |
| Auth provider | Firebase Authentication |
| Role storage | MySQL `users.role` (not Firebase custom claims) |

Existing repo files (`REQUIREMENTS.md`, `client.md`, `skills-lock.json`, `.agents/`) move into `docs/` so Laravel can install at the root.

---

## 2. Database Schema (Phase 1)

Three tables are created in Phase 1. `transactions` and the full `redemptions` flow are deferred to Phase 2.

### 2.1 `users`

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT UNSIGNED PK | auto-increment |
| `name` | VARCHAR(120) | required |
| `email` | VARCHAR(190) UNIQUE | primary identifier (per Q) |
| `phone` | VARCHAR(32) NULL | optional |
| `firebase_uid` | VARCHAR(128) UNIQUE | auth key, never null |
| `role` | ENUM('customer','staff','owner') | default `'customer'` |
| `deleted_at` | TIMESTAMP NULL | soft deletes |
| `created_at`, `updated_at` | TIMESTAMP | |

### 2.2 `loyalty_accounts`

One loyalty account per user, 1:1 via UNIQUE foreign key.

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT UNSIGNED PK | auto-increment |
| `user_id` | BIGINT UNSIGNED UNIQUE FK → `users.id` | ON DELETE CASCADE |
| `current_points` | INT UNSIGNED | default `0` |
| `total_points_earned` | INT UNSIGNED | default `0` |
| `total_points_redeemed` | INT UNSIGNED | default `0` |
| `last_earned_at` | TIMESTAMP NULL | updated on every allocation |
| `deleted_at` | TIMESTAMP NULL | soft deletes |
| `created_at`, `updated_at` | TIMESTAMP | |

### 2.3 `rewards`

Created in Phase 1 but no endpoints ship until Phase 4. Seeded with 2 demo rows.

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT UNSIGNED PK | auto-increment |
| `name` | VARCHAR(120) | required |
| `description` | VARCHAR(500) NULL | |
| `points_required` | INT UNSIGNED | required |
| `active` | BOOLEAN | default `true` |
| `deleted_at` | TIMESTAMP NULL | soft deletes |
| `created_at`, `updated_at` | TIMESTAMP | |

### 2.4 Deferred to Phase 2

- `transactions` (per-allocation and per-redemption audit log)
- `redemptions` (QR-tokenized reward claims)

---

## 3. Authentication & Authorization

### 3.1 Firebase ID token verification

- Every request to `/api/v1/*` must carry `Authorization: Bearer <firebase_id_token>`.
- Middleware verifies the JWT signature against Google's JWKS (cached in memory), checks `iss`, `aud` (your Firebase project ID), and `exp`.
- On success, the token's `sub` claim (Firebase UID) is used to look up the matching row in `users`.
- If the row is missing, the request is rejected with `401`.
- A `FirebaseTokenFake` test helper bypasses JWKS for offline feature tests.

### 3.2 Role middleware

A reusable custom middleware `role:staff|owner` reads the resolved user's `role` column. Applied to staff-only endpoints. Owners implicitly pass all role checks.

### 3.3 Errors (auth-specific)

| Code | Meaning |
|---|---|
| 401 | Missing / malformed / expired token, or `sub` not in `users` |
| 403 | Token valid but role does not match the endpoint requirement |

---

## 4. Business Rules — Points

All knobs live in `config/loyalty.php`, overridable via `.env`.

### 4.1 `config/loyalty.php` keys

| Key | Example value | Purpose |
|---|---|---|
| `points_per_currency_unit` | `1` | Points awarded per 1.00 of purchase |
| `min_spend_amount` | `1.00` | Reject allocations below this |
| `max_spend_amount` | `1000.00` | Reject allocations above this |

### 4.2 Calculation

- Purchase amount arrives as `DECIMAL(10,2)`.
- `points = (int) round(amount * points_per_currency_unit, 0, PHP_ROUND_HALF_UP)`.
- Result is an `INT` written to `loyalty_accounts.current_points` and `total_points_earned`.
- `last_earned_at` is set to `now()`.

### 4.3 Validation outcomes

| Condition | Response |
|---|---|
| `amount` missing or non-numeric | `422` |
| `amount` < `min_spend_amount` | `422` |
| `amount` > `max_spend_amount` | `422` |
| `customer_firebase_uid` not in `users` | `404` |
| Customer `users.deleted_at` is set | `409` (inactive customer) |
| Happy path | `200` with updated balance |

---

## 5. API Surface (Phase 1)

All endpoints under `/api/v1`. All require a valid Firebase bearer token.

### 5.1 `GET /me`

Returns the caller's profile and role.

```json
{
  "data": {
    "id": 7,
    "name": "Jane Owner",
    "email": "owner@brewpoints.local",
    "phone": null,
    "role": "owner"
  }
}
```

### 5.2 `GET /me/balance`

Returns the caller's loyalty balance.

```json
{
  "data": {
    "current_points": 0,
    "total_points_earned": 0,
    "total_points_redeemed": 0,
    "last_earned_at": null
  }
}
```

### 5.3 `GET /me/transactions`

Returns an empty list in Phase 1 (the `transactions` table arrives in Phase 2).

```json
{ "data": [] }
```

### 5.4 `POST /points/allocate` — staff/owner only

Request:

```json
{
  "customer_firebase_uid": "AbC123...",
  "amount": "12.50"
}
```

Success response (200):

```json
{
  "data": {
    "customer_id": 42,
    "points_credited": 13,
    "new_balance": 13,
    "total_earned": 13
  }
}
```

### 5.5 Error envelope (all endpoints)

```json
{
  "message": "The amount must be at least 1.00.",
  "errors": {
    "amount": ["The amount must be at least 1.00."]
  }
}
```

| HTTP code | Used for |
|---|---|
| 401 | Missing / invalid token |
| 403 | Role mismatch |
| 404 | Customer not found |
| 409 | Conflict (e.g., inactive customer) |
| 422 | Validation failure |
| 500 | Unexpected error (generic message; full details in logs) |

---

## 6. Provisioning — Owner & Staff Seeder

A Laravel database seeder inserts two accounts on `php artisan db:seed`:

| Email | Role | Firebase UID source |
|---|---|---|
| `owner@brewpoints.local` | `owner` | read from `.env` `SEED_OWNER_FIREBASE_UID` |
| `staff@brewpoints.local` | `staff` | read from `.env` `SEED_STAFF_FIREBASE_UID` |

Each user gets a corresponding `loyalty_accounts` row with `current_points = 0`. The seeder is idempotent (re-running upserts by `email`).

---

## 7. Testing Posture

Phase 1 ships one piece of test infrastructure and nothing else:

- `FirebaseTokenFake` — a test helper that mints ID tokens signed with a dev-only key and is recognised by the auth middleware in the `testing` environment.
- Feature tests that exercise endpoints can be added later (Phase 2 onward) once redemption logic arrives.

No unit tests, no full HTTP test coverage, no CI configuration in Phase 1.

---

## 8. Repository Conventions

- Git: **not** initialized by the agent; user can do it manually.
- Commit style: Conventional Commits (`feat:`, `chore:`, `test:`, `docs:`, `fix:`).
- The agent does **not** commit unless explicitly asked.
- `.gitignore` uses Laravel's default plus `.env`, `/storage/*.key`, and `/public/build`.

---

## 9. Documentation Deliverables

Two files at repo root:

### 9.1 `README.md`
- Project summary
- Prereqs (PHP 8.3+, Composer, XAMPP with MariaDB)
- First-time setup: clone, `composer install`, copy `.env.example` to `.env`, fill Firebase + DB values, `php artisan key:generate`
- DB bring-up: create `brewpoints` in phpMyAdmin, `php artisan migrate --seed`
- How to create a Firebase project and paste credentials
- How to run: `php artisan serve` and a `curl` example hitting `GET /api/v1/me`
- Troubleshooting (common XAMPP pitfalls)

### 9.2 `CONTRIBUTING.md`
- Branching model (single `main`, feature branches optional)
- Conventional Commits format with examples
- Migration naming: `YYYY_MM_DD_HHMMSS_create_table_name`
- Test command: `php artisan test`
- Style: Laravel Pint defaults

---

## 10. Build Order

1. Move `REQUIREMENTS.md`, `client.md`, `skills-lock.json`, `.agents/` into `docs/` (preserve the `.agents/` subpath).
2. `composer create-project laravel/laravel .` at the repo root.
3. Configure `.env` with MariaDB creds, Firebase project ID, and seed UIDs.
4. Create migrations in this order: `users`, `loyalty_accounts`, `rewards`.
5. Create Eloquent models with `SoftDeletes` and relationships.
6. Create `FirebaseTokenVerifier` service + `AuthenticateFirebase` middleware.
7. Create `RequireRole` middleware.
8. Create `PointsCalculator` value object.
9. Implement controllers and form requests for the four Phase 1 endpoints.
10. Wire `routes/api.php` under the `/v1` prefix.
11. Create the Owner/Staff seeder.
12. Add `FirebaseTokenFake` and a single happy-path test exercising `POST /points/allocate`.
13. Write `README.md` and `CONTRIBUTING.md`.
14. Hand back for review.

---

## 11. Out of Scope (Phase 1)

- Reward CRUD endpoints (Phase 4 admin)
- Redemption / dynamic QR token flow (Phase 2)
- Mobile app (Phase 3)
- Admin web dashboard (Phase 4)
- Analytics, reporting, exports
- Rate limiting beyond Laravel defaults
- Caching layer
- Queues / background jobs
- CI / CD
- Docker / production deployment
- i18n / l10n
