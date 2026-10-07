# BrewPoints — Phase 3 Plan: Mobile App (React Native)

**Phase 3 goal:** Develop a cross-role mobile application using React Native (Expo) that allows customers to manage their points/rewards and staff to allocate points and confirm redemptions.

---

## 1. Architecture & Tech Stack

- **Framework**: React Native with Expo (Managed Workflow).
- **State Management**: Context API or Zustand for user session and role management.
- **Authentication**: Firebase Auth (Phone/OTP and Email/Password).
- **Navigation**: React Navigation (Stack and Tab navigation).
- **QR Handling**: `expo-barcode-scanner` for staff; `react-native-qrcode-svg` for customers.

---

## 2. Authentication & Authorization

- **Onboarding**: Users can register/login via both Email and Phone Number.
- **Role Discovery**: Immediately after Firebase token validation, the app calls `GET /api/v1/me` to retrieve the user's role (`Customer`, `Staff`, or `Owner`) from the MySQL database.
- **UI Routing**: The app dynamically loads the **Customer Dashboard** or **Staff Dashboard** based on the returned role.

---

## 3. Customer Interface

### 3.1 Point Allocation QR
- **Dynamic Generation**: The app generates a JWS token signed by the backend with a **10-minute TTL**.
- **Auto-Refresh**: The QR code automatically refreshes periodically to prevent screenshot fraud.
- **Payload**: `brewpoints://allocate?token=<jws>`.

### 3.2 Reward Catalog & Redemption
- **Catalog**: List of active rewards.
- **Detail View**: A dedicated screen for each reward showing points cost and description.
- **Redeem Action**: A "Redeem" button that:
    1. Warns the user: "Points will be deducted once staff scans this QR."
    2. Calls `POST /api/v1/redemptions` to mint a redemption token.
    3. Displays the redemption QR (`brewpoints://redeem?token=<jws>`).

### 3.3 Engagement & History
- **Milestone Visualization**: A progress indicator targeting the **cheapest reward** the user cannot yet afford, motivating them to reach the next "freebie."
- **Transaction History**: 
    - A paginated list of points earned/spent.
    - A "Rewards Summary" section at the top showing total value saved or total rewards claimed.

---

## 4. Staff Interface

### 4.1 The Unified Scanner
- A single scanner that parses the URL scheme:
    - `brewpoints://allocate` $\rightarrow$ Routes to **Allocation Flow**.
    - `brewpoints://redeem` $\rightarrow$ Routes to **Redemption Flow**.

### 4.2 Allocation Flow
1. **Scan**: Capture "Points QR."
2. **Identification**: Display the **Customer's Name** and **Current Balance**.
3. **Entry**: Staff enters the purchase total (USD).
4. **Confirmation**: A summary screen (e.g., "Spend: $15 $\rightarrow$ Earn: 15 pts") to prevent typos.
5. **Submission**: Call `POST /api/v1/points/allocate`.

### 4.3 Redemption Flow
1. **Scan**: Capture "Redemption QR."
2. **Verification**: Display a summary screen containing:
    - Customer Name.
    - Reward Name (e.g., "Free Espresso").
    - Points Cost.
    - Customer's Current Balance.
3. **Confirmation**: Staff hits "Confirm" $\rightarrow$ Call `POST /api/v1/staff/redemptions/confirm`.

---

## 5. Resilience & Edge Cases

- **Connectivity**: The app implements a "fail-fast" strategy. If the API is unreachable, it displays a clear **"Connection Error"** and requires a retry to prevent double-spending/offline sync issues.
- **Session Expiry**: Handles Firebase token expiration by redirecting to the login screen.
