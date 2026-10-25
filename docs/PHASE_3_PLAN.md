# BrewPoints — Phase 3 Plan (Mobile Application: React 19 & Capacitor)

**Phase 3 Goal:** Package and bridge the unified **React 19** application into a native cross-platform iOS and Android mobile app using **Capacitor** (`@capacitor/core`, `@capacitor/cli`), providing dedicated native-feeling experiences for Customers (Loyalty Card & Rewards) and Staff (QR Scanner & Point Allocation) from a single shared codebase and design system.

---

## 1. Stack & Architecture

| Item | Choice |
|---|---|
| Framework | **React 19 + Next.js 16 + Capacitor** (`@capacitor/core` & `@capacitor/cli`) with TypeScript |
| Native Bridge | [`src/lib/capacitor/nativeBridge.ts`](../src/lib/capacitor/nativeBridge.ts) + [`capacitor.config.ts`](../capacitor.config.ts) |
| Navigation & Layout | Responsive App Router routes (`/wallet`, `/pos`, `/login`) with fixed mobile bottom thumb-zone navigation (`AppNavLinks`) |
| State Management | Zustand |
| Authentication | **Supabase Auth** (`@supabase/supabase-js` + `@capacitor/preferences` via `CapacitorAuthStorage`) |
| Native Plugins | `@capacitor/preferences`, `@capacitor/haptics`, `@capacitor/clipboard`, `@capacitor/status-bar`, `@capacitor/app` |
| QR Code Generator & Deep Links | `qrcode.react` (`QRCodeSVG`) + `@capacitor/app` (`appUrlOpen` deep-link listener for `brewpoints://allocate` & `brewpoints://redeem`) |
| Design System | **Kinetic Variable-Type Espresso Foundry** ([`DESIGN.md`](../DESIGN.md) & [`src/lib/design-tokens.ts`](../src/lib/design-tokens.ts)) |

---

## 2. Customer Interface (`/wallet` — React + Capacitor Mobile Shell)

### 2.1 Screen & Tab Structure
```
CustomerWallet (/wallet)
├── Mobile Section Switcher (All | QR Pass | Rewards | History)
├── Loyalty Pass & Variable-Type Specimen Stage
│   ├── Dynamic Fraunces Balance Readout ('wght' 320..900, 'opsz' 24..144)
│   ├── Milestone Progress Bar (Target Reward Tier)
│   ├── Interactive Future-Spend Axis Simulator (+$0 to +$200 USD)
│   └── Dynamic Earn Points QR Code (10m TTL, brewpoints://allocate)
├── Rewards Catalog
│   ├── Ruled Reward Specimen Grid (RWD-01..RWD-03)
│   └── Single-Use Redemption QR Modal (15m TTL, brewpoints://redeem)
└── Transaction Ledger
    └── Paginated Audit History (Earned: Emerald #15803D, Redeemed: Crimson #E02E24)
```

### 2.2 Key Customer Features
1. **Digital Loyalty Card**: Displays customer's virtual card with live variable-weight `Fraunces` balance and milestone progress bar targeting the next unlocked reward.
2. **Dynamic Earn Points QR**: Automatically generates a 10-minute signed JWS code (`brewpoints://allocate?token=...`) with a live `mm:ss` countdown timer, manual rotation button, and native `@capacitor/clipboard` copy support.
3. **Reward Redemption Modal**: Tapping "Generate Redemption QR" checks balance, triggers native success haptics (`@capacitor/haptics`), mints a 15-minute single-use redemption QR (`brewpoints://redeem?token=...`), and displays it with instructions for the barista.
4. **Transaction History**: Displays a scrollable tabular ledger with timestamp, barista name, spend amount, and net point changes.

---

## 3. Staff Interface (`/pos` — React + Capacitor Mobile & Tablet POS)

### 3.1 Screen Structure
```
StaffPosPortal (/pos)
├── QR Scanner & Member Verification Pane
│   ├── Deep-Link & Camera QR Payload Input (brewpoints://allocate | brewpoints://redeem)
│   ├── Native Clipboard Paste (@capacitor/clipboard) & 1-Tap Counter Lookup
│   └── Verified Member Balance & Mode Badge
├── Purchase Spend & Point Calculator (Mode: allocate)
│   ├── 1-Tap Espresso Bar Quick Spend Presets ($4.50 – $42.00 USD)
│   ├── Custom USD Spend Entry ($1.00 – $1,000.00)
│   └── Live Variable-Axis Award Specimen (+19 pts)
└── Redemption Confirmation Pane (Mode: redeem)
    ├── Customer & Reward Summary (-points_required pts)
    └── Atomic Confirmation Button + Receipt Banner
```

### 3.2 Key Staff Features
1. **Unified QR & Deep-Link Scanner**:
   - Reads any customer QR payload (`brewpoints://allocate?token=...` or `brewpoints://redeem?token=...`) via camera scan, native deep-link (`@capacitor/app` `appUrlOpen`), or clipboard paste (`@capacitor/clipboard`).
   - Automatically switches the counter terminal between **Point Allocation** mode and **Redemption Confirmation** mode.
2. **Point Allocation Flow**:
   - Displays customer name and current balance.
   - Quick espresso bar presets (`$4.50`–`$42.00`) or custom numerical entry for purchase total.
   - Live variable-font preview of points earned (`Math.floor(amount * 1 + 0.5)`).
   - Instant confirmation receipt with native `@capacitor/haptics` notification in under 10 seconds.
3. **Redemption Confirmation Flow**:
   - Displays customer name, reward item, points cost, and post-redemption balance.
   - One-tap confirmation button calling `POST /api/v1/staff/redemptions/confirm` with atomic `jti` anti-replay protection.

---

## 4. Capacitor Native Integration (`src/lib/capacitor/nativeBridge.ts`)

- **Capacitor Configuration (`capacitor.config.ts`)**:
  - Configured with `appId: 'com.brewpoints.app'`, `appName: 'BrewPoints'`, `webDir: 'out'`, Carbon Ink status bar (`#111110`), and hybrid server URL support (`CAPACITOR_SERVER_URL`).
- **Native Session Storage (`CapacitorAuthStorage`)**:
  - Uses `@capacitor/preferences` on iOS/Android (with `localStorage` fallback on web) as Supabase Auth's custom storage provider:
    ```ts
    import { createClient } from '@supabase/supabase-js';
    import { CapacitorAuthStorage } from '@/lib/capacitor/nativeBridge';

    export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: CapacitorAuthStorage,
        autoRefreshToken: true,
        persistSession: true,
      },
    });
    ```
- **Native Haptics, Clipboard, StatusBar & Deep Links**:
  - `triggerFoundryHaptic()`: Fires `@capacitor/haptics` impacts and notifications on QR minting, point allocation, and error states.
  - `copyTextWithCapacitor()` / `readTextWithCapacitor()`: Bridges `@capacitor/clipboard` with browser clipboard fallback.
  - `configureFoundryStatusBar()`: Styles the native iOS/Android status bar to match the `#111110` Carbon Ink top bar.
  - `registerBrewPointsDeepLinkListener()`: Listens for `brewpoints://` custom scheme URLs via `@capacitor/app`.
