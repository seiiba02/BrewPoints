---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/app/login/page.tsx","src/app/wallet/page.tsx","src/app/pos/page.tsx","src/app/dashboard/page.tsx","src/app/rewards/page.tsx","src/app/staff/page.tsx"]
---

## THESIS
BrewPoints operates as a **Kinetic Variable-Type Espresso Foundry** (`variable-font-specimen`): an unbleached foundry-paper (`#F8F6F0`) and carbon-ink (`#111110`) operational surface with signal crimson (`#E02E24`) and verified emerald (`#15803D`), where live loyalty balances and counter spend calculations are set in giant variable display numerals (`Fraunces` up to `6rem`) whose CSS `font-variation-settings` (`wght` `300..900`, `opsz` `9..144`) dynamically thicken and expand in real time alongside `JetBrains Mono` tabular telemetry.

## OWN-WORLD
- **Palette & Material**: Unbleached foundry paper ground (`#F8F6F0`), elevated warm sheet (`#FFFFFF`), recessed specimen well (`#EFECE3`), carbon ink (`#111110`), warm graphite secondary ink (`#4A4843`, contrast > 7:1 on `#F8F6F0`), hairline rule (`#D4D0C5`), foundry signal crimson (`#E02E24`), and confirmation emerald (`#15803D`). Flat architectural surfaces divided by 1px solid carbon and stone hairlines—no nested cards, no glassmorphism, and no decorative shadows.
- **Typography**: `Fraunces` variable display serif (`wght` `300..900`, `opsz` `9..144`, max `5.5rem`, tracking `-0.035em`) for live point balances, spend outputs, and page titles; `Plus Jakarta Sans` (`400..700`) for crisp UI labels and body copy (`65ch` measure); `JetBrains Mono` (`400..700`, `tabular-nums`) strictly for currency (`$18.50`), JWS token URIs, countdown timers, and axis readouts.
- **Signature Move**: Live CSS `--specimen-wght` and `--specimen-opsz` custom properties bound directly to the customer's point progress (`0..200+ pts` → `wght 320..900`) and the barista's live USD spend entry (`$0.00..$50.00+` → `wght 320..900`), paired with an interactive axis coordinate readout bar.

## STORY
1. **Immediate Role Orientation**: Whether entering on Desktop (`1440px` Owner Analytics & Counter POS) or Mobile (`390px` Customer Loyalty Wallet & Barista Scanner), the carbon-ink navigation shell (`AppNav`) and unbleached foundry work plane orient the operator in under one second.
2. **Sub-10-Second Counter Execution (`/pos`)**: The barista scans or previews a `brewpoints://allocate` or `brewpoints://redeem` JWS token, enters or taps quick-spend USD presets (`$4.50`, `$6.00`, `$12.50`, `$18.50`), watches the variable-weight point award (`+19 PTS`) thicken in real time, and commits in one keystroke or tap.
3. **Tactile Mobile Loyalty Pass (`/wallet`)**: The customer sees their live variable-weight point balance, interactive reward tier axis, auto-rotating 10-minute allocation QR pass, 15-minute single-use redemption QR generator, and full tabular ledger history with thumb-zone navigation.
4. **Operational Proof (`/dashboard`, `/rewards`, `/staff`)**: The shop owner reads live point velocity, redemption growth, reward popularity, and staff activity across a ruled foundry specimen grid without nested card clutter.

## FIRST VIEWPORT
- **Navigation Shell**: Carbon-ink (`#111110`) structural rail/header with high-contrast role switching, active route indicator, and live store conversion rate (`$1.00 = 1 PT`).
- **Primary Work Plane**: Ruled 1px carbon-bordered specimen grid on `#F8F6F0` displaying the primary task first—the variable-weight balance & QR pass on `/wallet`, the two-column Scan + Spend calculator on `/pos`, and the 4-column ruled KPI + Velocity ledger on `/dashboard`.
- **Signature Specimen Readout**: Giant variable `Fraunces` numerals (`<= 5.5rem`) with live `wght`/`opsz` coordinate bar and tabular monospace proof immediately beneath.

## FORM
- **Seed Key**: `7a208bfe` (re-roll 1 `--register bolder` from initial seed `d3793cbf`; chosen challenger: `variable-font-specimen`).
- **Mode**: `operate` (Web Admin, Counter POS, and Mobile PWA Wallet; code-led build).
- **Controls & States**: Standard semantic HTML controls (`button`, `input`, `select`, `table`, `dialog`) styled with crisp 1px borders, full hover/focus-visible/disabled/loading/error/empty states, and `prefers-reduced-motion` support that snaps variable font axes cleanly without continuous interpolation.

## FINISH
- Theme all browser surfaces in `src/app/globals.css`: `::selection` (`#E02E24` with `#F8F6F0` text), `caret-color: #E02E24`, `:focus-visible` (`2px solid #E02E24` with `2px` offset), custom scrollbar thumb (`#ACA79B` on `#EFECE3`), `text-underline-offset: 0.22em`, and `font-variant-numeric: tabular-nums` on all numeric data.
- Refuse all `craft-floor.md` bans: zero kickers/eyebrows above headings, zero decorative section numbers, zero nested cards, zero `>1px` colored left/right borders, and zero system display fonts.
