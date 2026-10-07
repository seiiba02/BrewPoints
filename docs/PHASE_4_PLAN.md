# BrewPoints — Phase 4 Plan: Admin Dashboard (Next.js)

**Phase 4 goal:** Create a privileged web portal for the Owner to manage staff, configure the reward catalog, and monitor the health of the loyalty program via analytics.

---

## 1. Architecture & Access Control

- **Framework**: Next.js (deployed as a web app).
- **Authentication**: Firebase Auth.
- **Authorization**: Strict **Owner-Only** access.
    - Middleware checks for the `role:owner` in the backend.
    - Non-owners are redirected to a "Not Authorized" landing page.
- **API Integration**: Consumes the `/api/v1` Laravel backend.

---

## 2. Staff Management Module

- **Objective**: Provide total control over the employees accessing the system.
- **Features**:
    - **Staff Directory**: A list of all users with the `Staff` role.
    - **Account CRUD**: 
        - **Create**: Add new staff via email.
        - **Update**: Edit staff details.
        - **Deactivate**: Soft-delete or disable staff accounts to revoke app access immediately.

---

## 3. Reward Catalog Manager

- **Objective**: Manage the "menu" of rewards available to customers.
- **UI Pattern**: **Visual Card-based Manager**.
    - Rewards are displayed as cards, mimicking how they appear in the mobile app.
- **Features**:
    - **Create/Edit**: Modal-based forms to set reward name, points cost, and `active` status.
    - **Toggling**: Quick-switch for the `active` flag to pause/resume specific rewards.
    - **Deletion**: Soft-delete functionality to remove rewards from the catalog.

---

## 4. Program Health Dashboard (Analytics)

- **Objective**: Provide a high-level view of program performance and fraud detection.
- **Key Performance Indicators (KPIs)**:
    - **Point Velocity**: A comparison of total points issued vs. total points redeemed (Liability Analysis).
    - **Reward Popularity**: A ranked list/chart of the most claimed rewards.
    - **Staff Activity**: A report showing total points allocated per staff member (Anomaly/Fraud Detection).
    - **Growth Trend**: A time-series chart (daily/weekly) showing the volume of redemptions.

---

## 5. Implementation Order

1. **Setup**: Next.js project initialization and Firebase Auth integration.
2. **Owner Guard**: Implement the `role:owner` check and "Not Authorized" redirection.
3. **Staff Module**: Build the Staff CRUD interface.
4. **Reward Module**: Build the Visual Card-based reward manager.
5. **Analytics Module**: Implement the KPI dashboard and data visualizations.
6. **Verification**: 
    - Verify that Staff/Customers cannot access the dashboard.
    - Verify that reward changes in the dashboard reflect immediately in the mobile app.
    - Verify that staff deactivation immediately blocks their mobile app access.
