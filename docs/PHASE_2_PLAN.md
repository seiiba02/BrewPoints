# BrewPoints — Phase 2 Plan

**Phase 2 goal:** Implement the Reward Management API and the complete Reward Redemption flow, including the audit ledger.

---

## 1. Data Model Extensions

Two new core tables are added.

### 1.1 `redemptions`

An immutable log of confirmed reward claims.

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT UNSIGNED PK | auto-increment |
| `jti` | CHAR(36) UNIQUE NOT NULL | The unique ID from the JWS token (UUID v4) |
| `customer_id` | BIGINT UNSIGNED FK → `users.id` | The redeemer |
| `reward_id` | BIGINT UNSIGNED FK → `rewards.id` | The reward claimed |
| `points_cost` | INT UNSIGNED | Snapshotted current `points_required` at confirm-time |
| `confirmed_by_staff_id` | BIGINT UNSIGNED FK → `users.id` | The staff member who verified the QR |
| `confirmed_at` | TIMESTAMP | Time of confirmation |
| `created_at`, `updated_at` | TIMESTAMP | |

**Constraint:** No soft deletes. Once a redemption is confirmed, the row is permanent.

### 1.2 `transactions`

The append-only financial ledger for all points movements.

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT UNSIGNED PK | auto-increment |
| `user_id` | BIGINT UNSIGNED FK → `users.id` | Whose balance changed |
| `type` | ENUM('earn','redeem','adjust') | Type of movement |
| `points` | INT UNSIGNED | Number of points involved |
| `amount` | DECIMAL(10,2) NULL | The purchase total (only for `earn` types) |
| `staff_id` | BIGINT UNSIGNED FK → `users.id` NULL | Staff who triggered the action |
| `redemption_id` | BIGINT UNSIGNED FK → `redemptions.id` NULL | Link to the redemption row (only for `redeem`) |
| `note` | VARCHAR(500) NULL | For manual adjustments or audit notes |
| `created_at`, `updated_at` | TIMESTAMP | |

---

## 2. Reward Management (Admin API)

Allows the Owner to manage the catalog of available rewards.

### 2.1 Endpoints

| Method | Endpoint | Auth | Action |
|---|---|---|---|
| `GET` | `/api/v1/rewards` | Authed | Returns only `active=true` and non-deleted rewards. |
| `POST` | `/api/v1/rewards` | `role:owner` | Create a new reward. |
| `PATCH` | `/api/v1/rewards/{id}` | `role:owner` | Partially update reward details. |
| `DELETE` | `/api/v1/rewards/{id}` | `role:owner` | Soft-delete reward (`deleted_at`). |

### 2.2 Validation & Semantics
- **Naming**: `name` must be unique among rewards that are not soft-deleted.
- **Cost Guard**: `points_required` must be between 1 and `config('loyalty.max_reward_cost')`.
- **Active Flag**: `active` boolean allows the owner to "pause" a reward without deleting it from the system.

---

## 3. Redemption Flow

The mechanism for a customer to claim a reward using a dynamic QR code.

### 3.1 Minting the Token (`POST /api/v1/redemptions`)

1. **Auth**: Requires a valid customer/staff/owner bearer token.
2. **Validation**:
   - Check if `reward_id` exists, is `active=true`, and is not soft-deleted.
   - Check if `customer.current_points >= reward.points_required`.
   - Return `422` if insufficient points.
3. **Token Generation**:
   - Mints a **JWS HS256** compact token.
   - **Claims**: `{ "customer_id": X, "reward_id": Y, "jti": "uuid-v4", "iat": now, "exp": now + 15m }`.
   - Token secret is stored in `.env`.
4. **Response**:
   - Returns the token as a deep-link URL: `brewpoints://redeem?token=<jws>`.
   - Includes current balance and the reward object for UI convenience.

### 3.2 Confirming the Token (`POST /api/v1/staff/redemptions/confirm`)

1. **Auth**: Requires `role:staff|owner` bearer token.
2. **Payload**: `{ "qr_payload": "brewpoints://redeem?token=..." }`.
3. **Process (Atomic Transaction)**:
   - **Extract**: Parse URL and verify JWS signature + expiry (`exp`).
   - **Lock**: `SELECT ... FOR UPDATE` on the customer's `loyalty_accounts` row.
   - **Verify**:
     - Reward is still `active` and not deleted.
     - Customer still has enough points.
   - **Commit**:
     - Insert `redemptions` row. Fail with `409 Conflict` if `jti` already exists (anti-replay).
     - Deduct `points_required` from `loyalty_accounts.current_points`.
     - Increment `loyalty_accounts.total_points_redeemed`.
     - Insert `transactions` row (type: `redeem`).
4. **Response**:
   - Returns new balance.
   - Errors: `401` (bad token), `410 Gone` (expired), `409` (already redeemed or inactive), `422` (insufficient points).

---

## 4. API Enhancements

### 4.1 Transaction History (`GET /api/v1/me/transactions`)
- Now implemented as a real query to the `transactions` table.
- Returns paginated results, ordered by `created_at DESC`.
- accessible to any authenticated user for their own records.

### 4.2 Throttling
- Apply `throttle:10,1` (10 requests per minute) to:
  - `POST /api/v1/redemptions` (Prevent token spam)
  - `POST /api/v1/points/allocate` (Prevent allocation spam)

### 4.3 Phase 1 Backport
- Upgrade the `POST /api/v1/points/allocate` endpoint to write a `transactions` row (type: `earn`) in the same transaction as the balance update.

---

## 5. Build Order

1. **Migrations**: `transactions` $\rightarrow$ `redemptions`.
2. **Models**: Update `User` and `LoyaltyAccount` with `transactions()` and `redemptions()` relationships.
3. **Config**: Add `max_reward_cost` and `redemption_token_ttl` to `config/loyalty.php`.
4. **Reward Management**: Implement Owner CRUD endpoints.
5. **Redemption Minting**: Implement `POST /api/v1/redemptions` + JWS logic.
6. **Redemption Confirmation**: Implement `POST /api/v1/staff/redemptions/confirm` with DB locking.
7. **Audit Log**: Implement `GET /api/v1/me/transactions`.
8. **Hardening**: Apply `throttle` middleware and upgrade Phase 1 allocate endpoint.
9. **Verification**:
   - Test reward creation $\rightarrow$ listing $\rightarrow$ deletion.
   - Test token mint $\rightarrow$ confirm $\rightarrow$ verify points deducted and transaction written.
   - Test replay attack (same QR twice) $\rightarrow$ `409 Conflict`.
   - Test expired token $\rightarrow$ `410 Gone`.
   - Test insufficient points $\rightarrow$ `422` at mint.

---

## 6. Out of Scope (Phase 2)

- Mobile App UI (Phase 3)
- Admin Web Dashboard (Phase 4)
- Reward Category/Tiering
- Partial redemptions (e.g., "use 50 points for a discount")
- Transaction reversals (Refunds)
