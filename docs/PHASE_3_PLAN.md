# BrewPoints — Phase 3 Plan (Mobile Application: React Native & Expo)

**Phase 3 Goal:** Build the cross-platform mobile application using React Native and Expo, providing dedicated experiences for Customers (Loyalty Card & Rewards) and Staff (QR Scanner & Point Allocation).

---

## 1. Stack & Architecture

| Item | Choice |
|---|---|
| Framework | React Native (Expo SDK 52+) with TypeScript |
| Navigation | React Navigation (Stack Navigator + Bottom Tabs) |
| State Management | Zustand |
| Authentication | **Supabase Auth** (`@supabase/supabase-js` + `expo-secure-store`) |
| QR Code Scanner | `expo-camera` / `expo-barcode-scanner` |
| QR Code Generator | `react-native-qrcode-svg` |
| HTTP Client | Axios or Fetch with Bearer token interceptor |

---

## 2. Customer Interface

### 2.1 Screen Structure
```
CustomerTabs (Bottom Tabs)
├── Home (HomeScreen)
│   ├── Digital Loyalty Card (Current Balance & Lifetime Stats)
│   ├── Dynamic Milestone Progress Tracker (Next Reward Goal)
│   └── Dynamic Earn Points QR Code (10m TTL, brewpoints://allocate)
├── Rewards (RewardsScreen)
│   ├── Reward Catalog Grid
│   └── Dynamic Redemption QR Modal (15m TTL, brewpoints://redeem)
└── History (HistoryScreen)
    └── Paginated Transaction Ledger (Earned: Green, Redeemed: Amber)
```

### 2.2 Key Customer Features
1. **Digital Loyalty Card**: Displays customer's virtual card with live balance and milestone progress bar targeting the cheapest unaffordable reward.
2. **Dynamic Earn Points QR**: Automatically generates a 10-minute signed JWS code (`brewpoints://allocate?token=...`) with a live countdown timer and manual refresh button to prevent screenshot sharing.
3. **Reward Redemption Modal**: Tapping "Redeem" checks balance, mints a 15-minute single-use redemption QR (`brewpoints://redeem?token=...`), and displays it with instructions for the barista.
4. **Transaction History**: Displays a scrollable ledger with timestamp, barista name, spend amount, and net point changes.

---

## 3. Staff Interface

### 3.1 Screen Structure
```
StaffStack (Stack Navigator)
├── Dashboard (StaffDashboardScreen)
│   └── Summary & Quick Scan Action
├── Scanner (ScannerScreen)
│   └── Unified Camera Barcode Scanner
├── Point Allocation (AllocationScreen)
│   ├── Customer Identity & Balance Preview
│   ├── Purchase Spend Entry ($1.00 – $1,000.00)
│   └── Calculated Points Preview
└── Redemption Confirmation (RedemptionConfirmationScreen)
    ├── Customer & Reward Summary
    └── Atomic Confirmation Button
```

### 3.2 Key Staff Features
1. **Unified Camera Scanner**:
   - Single camera viewfinder that reads any customer QR code.
   - Automatically routes `brewpoints://allocate` to the Point Allocation screen and `brewpoints://redeem` to the Redemption Confirmation screen.
2. **Point Allocation Flow**:
   - Displays customer name and current balance.
   - Numerical keypad entry for purchase total.
   - Live preview of points earned (`Math.floor(amount * 1 + 0.5)`).
   - Instant confirmation receipt in under 10 seconds.
3. **Redemption Confirmation Flow**:
   - Displays customer name, reward item, points cost, and post-redemption balance.
   - One-tap confirmation button calling `POST /api/v1/staff/redemptions/confirm`.

---

## 4. Mobile Supabase Integration

- **Secure Session Storage**: Uses `expo-secure-store` as Supabase Auth's custom storage provider:
  ```ts
  import { createClient } from '@supabase/supabase-js';
  import * as SecureStore from 'expo-secure-store';

  export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: {
        getItem: (key) => SecureStore.getItemAsync(key),
        setItem: (key, val) => SecureStore.setItemAsync(key, val),
        removeItem: (key) => SecureStore.deleteItemAsync(key),
      },
      autoRefreshToken: true,
      persistSession: true,
    },
  });
  ```
- **API Request Interceptor**: Automatically attaches `Authorization: Bearer <session.access_token>` to all HTTP requests sent to the Next.js `/api/v1/*` backend.
