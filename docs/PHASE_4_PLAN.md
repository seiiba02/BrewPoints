# BrewPoints — Phase 4 Plan (Admin Web Dashboard & Staff Management)

**Phase 4 Goal:** Build the responsive web management portal for shop owners using Next.js 16 App Router, providing program health analytics, staff management, and reward catalog controls.

---

## 1. Stack & Architecture

| Item | Choice |
|---|---|
| Framework | Next.js 16.x (App Router) with React 19 & TypeScript |
| UI & Styling | Tailwind CSS v4 + `shadcn/ui` + Lucide React |
| Data Visualizations | Recharts (AreaChart, BarChart, LineChart) |
| Authentication | **Supabase Auth** (`@supabase/ssr` with httpOnly cookies) |
| Database Queries | Server Components calling Supabase PostgreSQL directly or via `/api/v1/*` |

---

## 2. Web Application Routes

```
src/app/
├── (auth)/
│   └── login/page.tsx               # Role-based login portal
├── dashboard/page.tsx               # Owner Program Health Analytics
├── staff/page.tsx                   # Barista Staff Management CRUD
├── rewards/page.tsx                 # Reward Catalog Manager
├── pos/page.tsx                     # Web-based Staff POS & Scanner Portal
├── wallet/page.tsx                  # Web Customer Loyalty Wallet Preview
└── unauthorized/page.tsx            # 403 Forbidden screen
```

---

## 3. Key Portal Modules

### 3.1 Program Health Analytics (`/dashboard`)
1. **Summary Cards**:
   - Total Points Issued: Lifetime points awarded across all customer transactions.
   - Points Redeemed: Lifetime points burned for rewards.
   - Active Customers: Total non-deleted customers active in the program.
   - Redemption Rate: Percentage of issued points that have been converted into rewards.
2. **Interactive Visualizations**:
   - **Point Velocity Chart** (Recharts `AreaChart`): Daily points issued vs. redeemed over the past 7 days.
   - **Reward Popularity Chart** (Recharts `BarChart`): Top claimed rewards ranked by total redemption count.
   - **Staff Activity Table**: Barista leaderboard displaying point allocation volume and redemptions verified per staff member.
   - **Redemption Growth Chart** (Recharts `LineChart`): Cumulative redemption milestones over time.

### 3.2 Staff Management (`/staff`)
- **Directory Table**: Lists all barista staff members with contact info, status (`Active` / `Inactive`), and total processed transactions.
- **Create Staff Dialog**: Form to register new barista staff (`name`, `email`, `phone`).
- **Edit Staff Dialog**: Modify barista name, email, or contact details.
- **Status Toggle & Deactivation**: Single-click activation/deactivation (`deleted_at = now()` soft-delete).

### 3.3 Reward Catalog Manager (`/rewards`)
- **Catalog Grid**: Visual cards for every reward with title, description, and required point threshold.
- **Create Reward Dialog**: Set name, description, point cost (`1` to `10,000`), and initial active status.
- **Edit Reward Dialog**: Modify point costs or item descriptions.
- **Active Toggle**: Instantly activate or pause rewards from appearing in customer mobile apps.
- **Soft-Delete**: Safely archive outdated rewards without breaking historic transaction audit trails.

---

## 4. Security & Role Guards

- **Proxy Guard (`src/proxy.ts`)**: Next.js 16 route proxy intercepts `/dashboard`, `/staff`, and `/rewards`, verifying that the user has the `owner` role via encrypted session cookies. Non-owners are redirected to `/unauthorized`.
- **Server-Side Data Fetching**: Sensitive financial and program metrics are aggregated inside Server Components using Supabase server clients with Service Role / RLS enforcement.
