# Project Brief: BrewPoints – Digital Loyalty Card for Coffee Shops

## Client Background

We own a small independent coffee shop and currently use paper loyalty cards where customers receive a stamp for every purchase. Customers frequently lose their cards, and we have no way to track customer engagement or reward redemption.

We would like a simple digital loyalty system that allows customers to earn points and redeem rewards using their mobile phones.

---

## Project Objective

Develop a mobile-first loyalty platform that allows customers to collect points, view rewards, and redeem them digitally.

The system should be simple enough for a small business while providing useful customer insights.

---

## Target Users

### Customers
- Register an account
- Earn points from purchases
- Redeem rewards
- View reward history

### Shop Staff
- Verify customer purchases
- Add loyalty points
- Redeem rewards

### Shop Owner
- Monitor customer activity
- Create rewards
- View basic analytics

---

## Core Features

### 1. User Registration
- Email registration and login
- Google Sign-In
- Profile management

### 2. Digital Loyalty Card
- Virtual point balance
- Progress tracker toward rewards
- Loyalty status display

### 3. QR Code Scanning
- Unique QR code for each customer
- Staff can scan customer QR codes
- Automatic point allocation

### 4. Rewards System
Examples:
- Free Espresso
- Free Pastry
- 10% Discount Voucher
- Buy 10 Drinks, Get 1 Free

Features:
- Reward catalog
- Point redemption
- Reward eligibility tracking

### 5. Transaction History
- Points earned
- Rewards redeemed
- Purchase history
- Loyalty activity log

### 6. Admin Dashboard
- Customer statistics
- Reward management
- Redemption history
- Activity monitoring

---

## Technical Requirements

### Frontend
- React Native (Mobile Application)

### Backend
- Laravel REST API

### Database
- MySQL

### Authentication
- Firebase Authentication

### QR Code Processing
- React Native QR Scanner
- QR Code Generator

---

## Deliverables

### Mobile Application
- Customer-facing mobile app
- Staff-facing mobile interface

### Admin Dashboard
- Web-based management portal

### Documentation
- Database ERD
- API Documentation
- User Manual
- Installation Guide

---

## Nice-to-Have Features

### Push Notifications
Notify users when:
- They earn points
- Rewards become available
- Special promotions are launched

### Referral Program
- Invite friends
- Earn bonus points

### Birthday Rewards
- Automatic birthday coupons

### Customer Leaderboard
- Top customers of the month
- Gamified experience

---

## Success Criteria

The platform should allow:

- Customers to collect and redeem points digitally.
- Staff to add points in less than 10 seconds.
- Owners to track customer engagement and reward usage.
- Rewards to be redeemed quickly and reliably.

---

## Suggested Database Entities

### Users
- id
- name
- email
- role

### LoyaltyAccounts
- id
- user_id
- current_points
- total_points_earned

### Rewards
- id
- name
- description
- points_required

### Transactions
- id
- user_id
- points_added
- points_redeemed
- transaction_type

### Redemptions
- id
- user_id
- reward_id
- redeemed_at

---

## Estimated Timeline

| Phase | Duration |
|---------|----------|
| Planning & Design | 1 Week |
| Backend Development | 1 Week |
| Mobile Development | 2 Weeks |
| Dashboard Development | 1 Week |
| Testing & Documentation | 1 Week |

**Total Estimated Duration:** 6 Weeks

---

## Expected Outcome

The completed system should replace traditional paper loyalty cards with a digital solution that improves customer retention, simplifies reward management, and provides actionable business insights for the coffee shop owner.