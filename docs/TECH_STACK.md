# BrewFlow — Technology Stack

## 1. Overview

BrewFlow is a mobile-first coffee shop ordering and pickup platform for a single independent coffee shop. The initial release brings customer ordering, staff order handling, and owner administration together in one web application.

**Architecture principle:** Keep the MVP in one Next.js application backed by Supabase. Avoid separate mobile apps, microservices, and integrations that are not necessary for the core ordering workflow.

## 2. Core Technology Stack

| Area | Technology | Responsibility |
|---|---|---|
| Web application | Next.js, React, TypeScript | Customer ordering, staff interface, owner dashboard, and server-side application logic |
| Styling and components | Tailwind CSS, shadcn/ui | Responsive styling and reusable, accessible UI components |
| Database | Supabase PostgreSQL | Products, product options, orders, order items, profiles, staff roles, and optional loyalty records |
| Authentication | Supabase Auth | Sign-in and session management |
| Data access security | PostgreSQL Row Level Security (RLS) | Restrict database access according to the authenticated user and their permissions |
| Backend operations | Next.js Server Actions and Route Handlers | Validate requests, calculate prices on the server, create orders, and enforce permitted order-status changes |
| Deployment | Vercel and Supabase Cloud | Host the Next.js application and managed database/authentication services |

## 3. Supporting Libraries

These libraries are recommended where they provide a clear benefit; they are not all required to begin development.

| Purpose | Library | Usage |
|---|---|---|
| Forms and validation | React Hook Form + Zod | Manage forms and validate user input |
| Icons | Lucide React | Consistent interface icons |
| Charts | Recharts | Sales and order analytics in the owner dashboard |
| Date and time utilities | date-fns | Format dates and handle date-related display logic |
| Toast notifications | Sonner | Show success, error, and status feedback |
| Unit/component testing | Vitest + React Testing Library | Test utilities and UI behavior |
| End-to-end testing | Playwright | Test important workflows in a browser |
| Code quality | ESLint + Prettier | Lint code and maintain consistent formatting |

## 4. High-Level Architecture

```text
Customer / Staff / Owner
          |
          v
Next.js Web Application
  - Customer ordering
  - Staff order queue
  - Owner dashboard
          |
          v
Server Actions / Route Handlers
  - Validate inputs and permissions
  - Calculate prices from trusted product data
  - Create orders and order items safely
  - Enforce order-status transitions
          |
          v
Supabase
  - PostgreSQL database
  - Supabase Auth
  - Row Level Security policies
```

All important prices, permissions, and order state changes must be validated on the server. Do not trust prices or role claims supplied by the browser. Apply RLS policies to protect customer records and restrict staff and owner operations. Use database transactions or appropriate database-side logic where multiple writes must succeed or fail together.

## 5. MVP Scope

The first release should focus on:

- Mobile-friendly menu browsing and product details.
- Product customization and a shopping cart.
- Checkout and pickup-order submission.
- Order status visibility for customers.
- A staff queue to accept, prepare, and complete orders.
- Owner management of menu items, availability, and order oversight.
- Basic sales and order summaries.
- Cash or payment at pickup, with payment status recorded in the system.

## 6. Features Deferred Until Later

Do not include these in the initial build unless the simulated client requirements change:

- Native iOS or Android application.
- Third-party delivery network, rider dispatch, or multi-vendor marketplace.
- Online payment gateway integration.
- Advanced loyalty tiers, dynamic QR codes, and anti-replay infrastructure.
- Microservices or a separate backend service.
- Complex real-time analytics beyond what the MVP needs.

Loyalty can be added later as a supporting feature integrated with customer orders. It should not delay the core menu-to-order-to-pickup workflow.

## 7. Implementation Guidelines

1. Build the customer ordering journey first: menu → customization → cart → checkout → order confirmation.
2. Add staff order handling and clear, validated status transitions.
3. Add owner menu management and basic sales reporting.
4. Define database constraints and RLS policies alongside the relevant features, not as a final cleanup step.
5. Keep secrets and privileged Supabase keys on the server; never expose them in client-side code.
6. Add tests for order totals, authorization rules, order creation, and status transitions.
7. Add optional integrations only when the core workflow is reliable.

## 8. Stack Summary

**Core:** Next.js + React + TypeScript · Tailwind CSS + shadcn/ui · Supabase PostgreSQL + Supabase Auth + RLS · Next.js Server Actions and Route Handlers · Vercel.

**Supporting:** React Hook Form, Zod, Lucide React, Recharts, date-fns, Sonner, Vitest, React Testing Library, Playwright, ESLint, and Prettier.
