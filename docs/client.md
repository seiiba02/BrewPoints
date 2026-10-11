# Project Brief: BrewPoints – Digital Loyalty Card for Coffee Shops

## Client Background

We own a small independent coffee shop and currently use paper loyalty cards where customers receive a stamp for every purchase. Customers frequently lose their cards, and we have no way to track customer engagement or reward redemption.

We would like a simple digital loyalty system that allows customers to earn points and redeem rewards using their mobile phones.

---

## Project Objective

Develop a modern, mobile-first loyalty platform that allows customers to collect points, view rewards, and redeem them digitally.

The system should be simple enough for a small business while providing useful customer insights, robust fraud prevention (anti-screenshot dynamic QR codes), and lightning-fast staff interactions (<10 seconds per scan).

---

## Target Users

### Customers
- Register and authenticate seamlessly via Email OTP / Magic Link or Google Sign-In.
- View digital loyalty card, live point balance, and milestone progress.
- Generate dynamic single-use QR codes to earn points at checkout.
- Browse reward catalog and generate dynamic redemption QR codes.
- View full transaction and redemption history.

### Shop Staff
- Scan customer dynamic QR codes with a unified camera scanner.
- Allocate points based on purchase amount ($1.00 spent = 1 point earned).
- Confirm reward redemptions with atomic point deduction in under 10 seconds.

### Shop Owner
- Monitor program health, point velocity, and customer engagement via web dashboard.
- Create, edit, activate, or archive rewards in the reward catalog.
- Manage staff accounts and track barista activity.

---

## Core Features

### 1. User Authentication & Profile
- Powered by **Supabase Auth**.
- Email & password, Magic Link / OTP, and Google OAuth.
- Role-based profile management (`customer`, `staff`, `owner`).

### 2. Digital Loyalty Card
- Virtual point balance with lifetime statistics.
- Dynamic milestone progress tracker targeting the next available reward.
- Loyalty tier status display.

### 3. Dynamic QR Code Scanning & Fraud Prevention
- Time-limited, signed HS256 JWS QR codes (`brewpoints://allocate?token=...` with 10-minute TTL).
- Single-use redemption QR codes (`brewpoints://redeem?token=...` with 15-minute TTL and UUID v4 `jti` anti-replay key).
- Screenshot prevention: static screenshots expire and duplicate submissions are rejected with HTTP 409 Conflict.

### 4. Rewards System
- Fixed point cost per reward (e.g., 100 points = Free Espresso, 150 points = Free Pastry).
- Dynamic reward eligibility display.
- Atomic point deduction: points are deducted from the customer's balance **only after** staff scans and confirms redemption.

### 5. Transaction History & Audit Ledger
- Immutable append-only ledger for all point earnings, redemptions, and adjustments.
- Detailed audit logs capturing timestamp, staff verifier, and purchase amount.

### 6. Owner Web Admin Portal
- Real-time business analytics (point velocity, redemption growth, reward popularity).
- Full Reward Catalog CRUD.
- Staff Member Management CRUD.

---

## Technical Stack

### Database & Authentication: Supabase
- **Database**: Supabase PostgreSQL with Row Level Security (RLS) and atomic SQL procedures.
- **Authentication**: Supabase Auth (`auth.users`) with JWT Bearer tokens and SSR session cookies.

### Backend & Web Portal: Next.js
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript.
- **Architecture**: REST API (`/api/v1/*`), Server Actions, and Owner Admin Portal.
- **Styling**: Tailwind CSS v4 + `shadcn/ui` + Recharts.

### Mobile Application: React Native (Expo)
- **Framework**: React Native with Expo SDK + TypeScript.
- **Navigation**: React Navigation (Stack + Bottom Tabs).
- **Scanner & QR**: Camera barcode scanner + SVG QR generator.

---

## Deliverables

1. **Mobile Application**: React Native (Expo) app providing Customer Wallet and Staff Scanner interfaces.
2. **Admin Web Dashboard**: Responsive Next.js web application for coffee shop owners.
3. **Backend API**: Next.js REST API (`/api/v1/*`) integrated with Supabase PostgreSQL and Supabase Auth.
4. **Documentation**: Architectural specification, Supabase schema & RLS policies, and API documentation.

---

## Success Criteria

- Customers collect and redeem points digitally with zero friction.
- Staff complete point allocation or redemption in under 10 seconds.
- Zero fraud: screenshots and replayed QR codes are automatically blocked.
- Owners gain real-time visibility into customer retention and reward usage.