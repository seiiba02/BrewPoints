# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

1. **Coffee Shop Customers (Mobile-First Ordering Users)**: Patrons browsing the menu on mobile or desktop, customizing espresso, cold brew, and bakery items, selecting an in-store pickup schedule, and tracking ticket progress in real-time.
2. **Barista / Kitchen Staff (Kitchen Display System Operators)**: Café staff working the espresso machine and counter during busy morning rushes. They manage incoming tickets across a 4-column operational board (`Incoming`, `In Preparation`, `Ready on Counter`, `Completed`), bumping statuses in 1 tap and toggling 86'd inventory.
3. **Shop Owner (Store Operations & Telemetry Admin)**: Independent café owner monitoring gross sales, ticket volume, average order value (AOV), best-selling items, auditing customer order logs, and updating menu prices or adding new seasonal drinks.

## Product Purpose

BrewFlow is a mobile-first coffee shop ordering and pickup platform that eliminates queues and counter friction for single independent shops. Customers customize and order drinks ahead for in-store counter pickup; kitchen staff fulfill tickets through a high-velocity Kitchen Display System; and the owner has real-time visibility into sales metrics and catalog control.

## Positioning

Unlike complex multi-vendor marketplace delivery apps (Foodpanda/DoorDash) or static web menus, BrewFlow provides an integrated single-shop ordering experience with a **client-side reactive simulation engine** (`BroadcastChannel` + `localStorage`). Customers and staff communicate across browser tabs with zero latency, zero cloud downtime, and zero database setup required for portfolio evaluation.

## Operating Context

- Used by coffee drinkers on mobile phones (`390px` viewports) with thumb-zone navigation, bottom customization sheets, and floating sticky cart bars.
- Used on barista tablets or landscape counter monitors (`1024px–1440px`) behind the espresso bar for instant ticket progression.
- Denominated in **USD ($)**, supporting pay-at-counter fulfillment and integrated loyalty rewards ($1.00 = 1 PT, with 50 points redeemable for a $5.00 discount).

## Capabilities and Architecture

- **Clean Architecture Boundary**: Strict separation between UI components and domain service interfaces (`IOrderService`, `IMenuService`, `ILoyaltyService`, `IStoreService`).
- **Reactive Simulation Engine (`LocalStorageBroadcastAdapter`)**:
  - Live cross-tab event propagation via `BroadcastChannel('brewflow-realtime-sync')`.
  - Audio chime synthesizer via Web Audio API on incoming tickets.
  - Persistent mutations in browser `localStorage`.
- **Surfaces**:
  - **Customer Ordering Surface (`/`)**: Category tabs, product cards with stock status, Drink Customizer modal with live variable pricing, Cart Checkout sheet, and Live Order Tracker.
  - **Kitchen Display System (`/queue`)**: 4-column operational queue, 1-tap status bumps, and 86 / stock availability toggles.
  - **Owner Admin Portal (`/dashboard`)**: KPI metrics, sales telemetry, order audit log, and live menu pricing CRUD.
  - **Customer Loyalty Wallet (`/wallet`)**: Digital loyalty pass, balance ledger, and reward specimens.

## Brand Commitments

- **Brand Name**: BrewFlow.
- **Visual Aesthetic**: Kinetic Variable-Type Espresso Foundry (`Fraunces` variable display serif, `Plus Jakarta Sans`, `JetBrains Mono` tabular figures, carbon ink `#111110`, unbleached paper `#F8F6F0`, signal crimson `#E02E24`, verified emerald `#15803D`).
- **Voice & Tone**: High-craft specialty coffee hospitality meets clinical kitchen precision.
