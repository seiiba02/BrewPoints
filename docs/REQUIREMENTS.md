# BrewPoints - Finalized Requirements & Implementation Plan

## Core Requirements

- **Tenancy**: Single-tenant (designed for a single coffee shop).
- **Points System**: 
    - Points earned based on the total spent amount.
    - Staff manually enter the purchase total into the application to allocate points.
- **Rewards**: 
    - Fixed point cost for each reward (e.g., 100 points = Free Espresso).
- **Authentication & Authorization**:
    - **Authentication**: Firebase used for Authentication and OTP purposes.
    - **Authorization**: Roles (Customer, Staff, Owner) are stored and managed in the MySQL database.
- **Security**:
    - Dynamic QR codes used for both point allocation and reward redemption to prevent fraud (e.g., sharing screenshots).
- **Redemption Workflow**:
    - Customer selects a reward in the mobile app.
    - Customer presents a redemption code/QR to staff.
    - Staff confirms the redemption.
    - Points are deducted from the customer's account **after** staff confirmation.

---

## Implementation Plan

### Phase 1: Backend Foundation (Laravel & MySQL)
- Design and implement the database schema:
    - `users` (with role column)
    - `loyalty_accounts`
    - `rewards`
    - `transactions`
    - `redemptions`
- Integrate Firebase Auth for API authentication.
- Create Point Allocation API for staff to add points based on spend.

### Phase 2: Reward & Redemption Logic
- Implement Reward Management API for the Admin.
- Implement the Redemption Flow:
    - Endpoint to generate a temporary redemption token for a selected reward.
    - Endpoint for staff to verify and confirm the token, triggering the point deduction.

### Phase 3: Mobile App Development (React Native)
- **Customer Interface**:
    - Login/Authentication via Firebase.
    - Generation of dynamic QR codes for points.
    - Reward catalog and redemption trigger.
    - Transaction and reward history.
- **Staff Interface**:
    - QR Scanner for points and redemptions.
    - Manual spend entry form.
    - Redemption confirmation screen.

### Phase 4: Admin Dashboard (Web)
- Management portal for:
    - Creating and editing rewards.
    - Monitoring user activity and total points.
    - Basic analytics on reward usage and customer engagement.

### Phase 5: Testing & Verification
- End-to-end testing of the complete point-to-reward lifecycle.
- Security audit of the dynamic QR implementation to ensure tokens expire correctly.
