# Project Brief: BrewFlow – Coffee Shop Ordering & Pickup Platform

> **Project context:** This is a simulated client brief created for product design and software development practice. The business and client requirements are fictional.

## 1. Client Background

We operate a small independent coffee shop. Customers currently need to order in person or contact the shop directly to ask about the menu and place orders. During busy periods, this can create queues, repeated questions about product availability, and confusion when several orders arrive at once.

We want a convenient online ordering experience that lets customers browse our menu, customize their drinks, and place orders ahead of time. Our staff need a simple way to manage incoming orders, while the owner needs tools to update the menu and review sales performance.

We are also interested in encouraging repeat purchases. Rather than building a standalone digital loyalty card, we would prefer loyalty points to be a supporting feature within the ordering experience.

## 2. Project Objective

Build a mobile-first coffee shop ordering platform that allows customers to place orders online and choose in-store pickup. Provide a staff interface for handling orders and an owner dashboard for managing menu items and viewing basic business metrics.

The first version should focus on a reliable end-to-end ordering workflow. It should be simple enough for a single independent shop to operate and should not attempt to replicate a multi-vendor food delivery marketplace.

## 3. Target Users

### Customers
- Browse the shop's menu by category.
- View product descriptions, prices, images, and availability.
- Customize drinks using available options, such as size, milk choice, sweetness, and add-ons.
- Add items to a cart, review the order, and submit it.
- Choose an available pickup time or the shop's next available pickup slot.
- View order status and previous orders.
- Create an account or continue as a guest if guest checkout is enabled.
- Optionally earn and redeem loyalty points when eligible.

### Shop Staff
- View new and active orders in one order queue.
- Accept or reject an order when necessary.
- Update order status: `Pending`, `Accepted`, `Preparing`, `Ready for Pickup`, `Completed`, or `Cancelled`.
- View order items, customizations, notes, and payment status.
- Mark items as temporarily unavailable when authorized.

### Shop Owner / Manager
- Add, edit, archive, and manage menu items and categories.
- Set prices, customization options, and product availability.
- View and manage incoming orders.
- Review basic sales summaries, order volume, best-selling items, and order status totals.
- Manage staff access and roles.
- Configure simple promotions or loyalty rules if the loyalty feature is included in the release.

## 4. Core Features

### 4.1 Customer Menu and Product Customization
- Mobile-first menu with categories and product details.
- Product availability indicators.
- Support for configurable options such as drink size, milk choice, sweetness level, and add-ons.
- Price updates when paid customizations are selected.
- Clear cart summary with item quantities, customizations, subtotal, and total.

### 4.2 Cart and Checkout
- Add, update, and remove cart items.
- Validate product availability and prices before order submission.
- Collect customer name and contact details needed to fulfill the order.
- Support pickup as the initial fulfillment method.
- Allow customers to select an available pickup time or the next available slot.
- Generate a unique order number and confirmation screen after successful submission.
- Prevent duplicate order submission caused by repeated taps or network retries.

### 4.3 Order Status and Customer Order History
- Display the current status of an active order.
- Provide clear status updates as staff progress the order.
- Let signed-in customers view previous orders and order details.
- Provide a way to contact the shop about an order using the shop's configured contact details.

### 4.4 Staff Order Management
- Present new orders prominently in a queue designed for quick use during busy periods.
- Show order number, time, items, customizations, customer notes, and payment method.
- Allow authorized staff to update order status.
- Record key order events and which staff member performed the update.
- Clearly distinguish active, completed, and cancelled orders.

### 4.5 Owner Admin Dashboard
- Secure role-based access for owners, managers, and staff.
- Menu and category management.
- Product availability controls.
- Order search and filtering by status or date.
- Basic dashboard metrics, including total orders, gross order sales, average order value, and best-selling items for a selected period.
- Staff account management for authorized owners or managers.

### 4.6 Optional Loyalty and Promotions
- Allow signed-in customers to earn points from eligible completed orders.
- Show available points and a simple reward catalog.
- Allow eligible points to be redeemed during checkout or through a controlled staff-assisted flow.
- Record point earnings and redemptions so balances can be audited.
- Let the owner configure basic earning and redemption rules.

Loyalty is a supporting feature, not a dependency for placing an order. The first release may defer it until the core ordering workflow is stable.

## 5. Payment and Fulfillment Scope

### First Release
- Pickup orders only.
- Payment at pickup, such as cash or an in-store payment method selected by the shop.
- Store the payment method and payment status on the order.
- Clearly show customers the amount due and the payment instructions.

### Possible Later Enhancements
- Integration with one supported online payment provider, subject to the client's account and provider requirements.
- Shop-managed local delivery with a defined service area and delivery fee.
- Promotions, discount codes, scheduled orders, and more advanced loyalty rules.
- Notifications through email, SMS, or push, depending on the selected service.

Third-party courier dispatch, live rider tracking, multi-vendor listings, and marketplace commissions are outside the first-release scope.

## 6. Technical Direction

The implementation should favor a small, maintainable architecture suitable for a single-shop business.

- **Customer application:** Next.js, TypeScript, and a responsive mobile-first interface. It should behave well on mobile browsers and can be made installable as a progressive web app if useful.
- **Staff and owner portal:** Next.js using role-aware screens for order management and administration.
- **Database and authentication:** Supabase PostgreSQL and Supabase Auth, with Row Level Security (RLS) where appropriate.
- **Server-side operations:** Server Actions and/or API routes for validated order submission, price calculations, status transitions, and other privileged operations.
- **UI:** Tailwind CSS and a reusable accessible component system.

The frontend must never be trusted to determine final prices, authorize privileged actions, or enforce inventory and order-state rules. Important validations must happen on the server. Database constraints and transactions should be used where they help preserve order and payment consistency.

A separate React Native customer app is not required for the first release. It can be considered later if there is a clear business reason for a native app.

## 7. Key Data Areas

The data model will likely include:

- User profiles and roles.
- Menu categories and products.
- Product customization groups and options.
- Orders and order items, including snapshots of names and prices at purchase time.
- Order status events or audit records.
- Payment method and payment status.
- Optional loyalty accounts, point ledger entries, and rewards.

The implementation should prevent customers from viewing or changing other customers' private order data and prevent staff from performing owner-only actions.

## 8. Deliverables

1. **Customer ordering experience:** Responsive menu, product customization, cart, checkout, confirmation, order status, and order history.
2. **Staff order interface:** An order queue and controls for processing orders.
3. **Owner admin portal:** Menu management, order oversight, staff access management, and basic sales metrics.
4. **Backend and database:** Supabase schema, authentication, access policies, and secure server-side order operations.
5. **Documentation:** Setup instructions, architecture overview, database schema and RLS notes, and a concise guide for shop staff and owners.

## 9. Success Criteria

- A customer can place a complete pickup order on a phone without needing staff assistance.
- The system accurately preserves product customizations, quantities, prices, and the submitted order total.
- Staff can find an incoming order quickly and update its status with minimal steps.
- Customers see clear order confirmation and status information.
- Owners can update menu availability and prices without editing code.
- The owner can review useful basic sales and order data.
- Role-based access protects customer information and administrative functions.
- The core ordering workflow remains usable on common mobile screen sizes and slower connections.
- Loyalty, if included, is recorded accurately and does not block customers from ordering.

## 10. Out of Scope for the First Release

- A multi-vendor marketplace like Foodpanda.
- Rider accounts, delivery dispatching, route optimization, and live GPS tracking.
- A separate native Android/iOS app.
- Complex CRM, customer segmentation, and automated marketing journeys.
- Multiple branches with branch-specific inventory and reporting.
- Advanced loyalty tiers, dynamic anti-screenshot QR codes, and elaborate fraud-prevention workflows.
- Online payment integration before the provider, business account, and payment flow are selected and verified.

## 11. Suggested Implementation Priority

1. **Foundation:** Database schema, roles, access policies, menu management, and product customization.
2. **Ordering:** Cart, server-side price validation, checkout, order creation, and confirmation.
3. **Operations:** Staff order queue, status transitions, and customer order status.
4. **Administration:** Sales summaries, filtering, staff management, and usability refinements.
5. **Optional enhancements:** Loyalty, online payments, notifications, and shop-managed delivery.
