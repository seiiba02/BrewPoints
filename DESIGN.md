---
name: BrewPoints
description: Single-tenant specialty coffee loyalty platform, sub-10-second barista POS, and dynamic JWS QR wallet
colors:
  signal-crimson: "#E02E24"
  signal-crimson-hover: "#B82219"
  verified-emerald: "#15803D"
  verified-emerald-soft: "#DCFCE7"
  foundry-paper: "#F8F6F0"
  elevated-sheet: "#FFFFFF"
  recessed-well: "#EFECE3"
  carbon-ink: "#111110"
  warm-graphite: "#4A4843"
  hairline-rule: "#D4D0C5"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(3.25rem, 6vw, 5.25rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.06em"
rounded:
  none: "0px"
  sm: "2px"
  md: "4px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.signal-crimson}"
    textColor: "{colors.foundry-paper}"
    rounded: "{rounded.none}"
    padding: "14px 24px"
  button-primary-hover:
    backgroundColor: "{colors.signal-crimson-hover}"
  button-secondary:
    backgroundColor: "{colors.elevated-sheet}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.none}"
    padding: "10px 16px"
  button-carbon:
    backgroundColor: "{colors.carbon-ink}"
    textColor: "{colors.foundry-paper}"
    rounded: "{rounded.none}"
    padding: "12px 20px"
---

# Design System: BrewPoints

## Overview

**Creative North Star: "Kinetic Variable-Type Espresso Foundry"**

BrewPoints replaces generic SaaS loyalty cards with the tactile discipline of an interactive type foundry specimen (`variable-font-specimen`) tailored for a high-velocity specialty coffee bar. Set on unbleached foundry paper (`#F8F6F0`) and divided by architectural carbon-ink rules (`#111110`), the interface uses live variable typography (`Fraunces` axes `'wght'` `320..900` and `'opsz'` `24..144`) to dramatize customer point balances and barista USD spend calculations in real time.

Every surface is engineered for operational clarity across both desktop (`1440px` Owner Telemetry & Counter POS) and mobile (`390px` Customer Loyalty Pass & Barista Scanner). When a barista enters `$18.50 USD` at the counter or a customer scrubs their loyalty tier axis, the giant display numerals physically thicken and expand in optical size while `JetBrains Mono` telemetry strips report the exact axis coordinates, conversion math (`$1.00 = 1 PT`, half-up rounding), and JWS anti-replay countdowns.

**Key Characteristics:**
- **Live Variable-Font Numerals:** Point balances, spend awards (`+19 pts`), and reward tier thresholds scale dynamically across `'wght'` (`320` to `900`) and `'opsz'` (`24` to `144`) via CSS custom properties.
- **Ruled Foundry Grid:** Surfaces divide by 1px and 2px solid carbon-ink and warm stone rules rather than nested cards or soft drop shadows.
- **High-Contrast Counter Telemetry:** `JetBrains Mono` (`tabular-nums`) handles all currency (`$ USD`), serial catalog codes (`RWD-01`, `TX-0042`, `STF-01`), JWS URIs, and live TTL timers.
- **Dual-Viewport Ergonomics:** Top structural carbon-ink bar on desktop paired with a fixed bottom thumb-zone bar on mobile (`390px`).

## Colors

The palette pairs warm unbleached paper and roasted carbon ink with two high-conviction operational signals: Foundry Signal Crimson for primary actions and Verified Emerald for confirmed ledger events.

### Primary
- **Foundry Signal Crimson** (`#E02E24`): Reserved for primary counter actions (allocating points, minting redemption QR passes, publishing rewards) and active route underlines. Hover shifts to Deep Signal Crimson (`#B82219`).

### Secondary
- **Verified Emerald** (`#15803D`): Used for confirmed point allocations (`+19 PTS`), verified JWS nonces, active operator statuses, and single-use redemption confirmation triggers. Paired with Soft Emerald Tint (`#DCFCE7`) for atomic receipt banners.

### Neutral
- **Unbleached Foundry Paper** (`#F8F6F0`): Primary page ground across all routes, preventing harsh white glare under café lighting.
- **Elevated Specimen Sheet** (`#FFFFFF`): Active work panes, QR code wells, and tabular ledger surfaces.
- **Recessed Foundry Well** (`#EFECE3`): Secondary operational wells, scanner standby zones, and table headers.
- **Carbon Ink** (`#111110`): Primary typography, top/bottom structural navigation bars, and 2px outer structural frames (17.5:1 contrast on `#F8F6F0`).
- **Warm Graphite** (`#4A4843`): Secondary prose, axis coordinate readouts, and timestamps (7.8:1 contrast on `#F8F6F0`, exceeding WCAG AAA for normal text).
- **Foundry Hairline Rule** (`#D4D0C5`): Internal cell dividers, slider tracks, and table row borders.

### Named Rules
**The Action-Signal Rule.** Foundry Signal Crimson (`#E02E24`) and Verified Emerald (`#15803D`) appear only where an operator can act or where a ledger state has changed. Static chrome stays strictly Carbon Ink on Foundry Paper.

**The Tinted-Secondary Rule.** Secondary text is always Warm Graphite (`#4A4843`) or Warm Stone (`#D4D0C5` on dark carbon rails)—never neutral gray.

## Typography

**Display Font:** `Fraunces` variable serif (`opsz` `9..144`, `wght` `300..900`), fallback `Georgia, serif`
**Body Font:** `Plus Jakarta Sans` (`400`, `500`, `600`, `700`), fallback `system-ui, sans-serif`
**Label/Mono Font:** `JetBrains Mono` (`400`, `500`, `600`, `700`), fallback `ui-monospace, monospace`

**Character:** Expressive variable old-style serif numerals at monumental scale anchored by clinical monospace telemetry and a clean humanist sans for effortless counter reading.

### Hierarchy
- **Display** (`wght 320..900`, `clamp(3.25rem, 6vw, 5.25rem)`, `line-height: 0.92`, `letter-spacing: -0.035em`): Live customer point balances, counter POS point awards (`+19 pts`), and reward tier specimens.
- **Headline** (`700`, `2.25rem`, `line-height: 1.1`, `letter-spacing: -0.025em`): Primary page titles (`Barista Counter POS & QR Scanner`, `Program Health & Telemetry`).
- **Title** (`700`, `1.5rem`, `line-height: 1.2`, `letter-spacing: -0.02em`): Work pane headings and modal titles.
- **Body** (`400–600`, `0.9375rem`, `line-height: 1.55`, max `70ch`): Operational instructions, reward tasting notes, and empty states.
- **Label** (`600`, `0.75rem`, `letter-spacing: 0.06em`, uppercase `JetBrains Mono` with `tabular-nums`): Serial codes (`RWD-01`, `TX-0042`), JWS TTL countdowns, USD spend equivalents, and variable-font axis readouts.

### Named Rules
**The Live-Axis Specimen Rule.** Every primary point balance or spend calculation binds its CSS `--specimen-wght` (`320..900`) and `--specimen-opsz` (`24..144`) to the underlying numeric value via `computeSpecimenAxes()`, so the letterforms themselves communicate magnitude.

**The No-Kicker Rule.** Headings (`h1`, `h2`, `h3`) never wear an uppercase eyebrow or kicker above them. Metadata and serial codes sit beside the heading or in a ruled footer strip beneath the specimen.

## Layout

All workspaces center within a `1440px` maximum structural container (`px-4 md:px-8`) organized as a 12-column CSS Grid bordered by `2px solid #111110` outer frames and `1px solid #111110` or `#D4D0C5` internal cell dividers.

- **Counter POS (`/pos`) & Wallet (`/wallet`):** Split `7:5` (`lg:grid-cols-12` with `lg:col-span-7` and `lg:col-span-5`) so the primary variable-type specimen and the QR scanner/pass share the first viewport without scrolling on desktop.
- **Mobile (`390px`):** Collapses cleanly to a single vertical column with a 4-tab section switcher (`All`, `QR Pass`, `Rewards`, `History`) and a fixed bottom thumb-zone navigation bar (`md:hidden`).

## Elevation & Depth

BrewPoints uses **flat architectural layering** with zero ambient drop shadows on page containers. Depth and hierarchy are established by contrasting paper stocks (`#FFFFFF` elevated sheet vs. `#F8F6F0` page ground vs. `#EFECE3` recessed well) separated by crisp `1px` and `2px` solid Carbon Ink (`#111110`) borders.

### Named Rules
**The Zero-Nested-Card Rule.** Containers never nest inside rounded cards. Multi-part sections divide a single bordered plane with hairline rules (`divide-x`, `divide-y`, `border-b`).

## Shapes

Sharp architectural specimen geometry (`0px` radius on structural panes, buttons, inputs, and tables) paired with `2px solid #111110` structural borders and `1px solid #D4D0C5` internal hairlines.

## Components

### Buttons
- **Shape:** Sharp architectural corners (`0px` radius), uppercase `JetBrains Mono` (`0.75rem`, `font-weight: 700`, `letter-spacing: 0.06em`).
- **Primary:** Foundry Signal Crimson (`#E02E24`) background with `#F8F6F0` text (`padding: 14px 24px`), shifting to `#B82219` on hover.
- **Secondary / Outline:** `#FFFFFF` background with `1px solid #111110` border and `#111110` text, shifting to `#EFECE3` on hover.
- **Hover / Focus:** `2px solid #E02E24` focus-visible outline with `2px` offset.

### Chips
- **Style:** Sharp rectangular badges (`0px` radius) in `JetBrains Mono` (`11px`, uppercase).
- **State:** Active/Verified uses `#DCFCE7` background with `1px solid #15803D` border and `#15803D` text; catalog serial codes (`RWD-01`, `STF-01`) use `#F8F6F0` with `1px solid #111110`.

### Cards / Containers
- **Corner Style:** `0px` architectural specimen corners.
- **Background:** `#FFFFFF` for primary work panes, `#EFECE3` for secondary scanner/QR wells.
- **Shadow Strategy:** Flat (`box-shadow: none`).
- **Border:** `2px solid #111110` outer frame with `1px solid #111110` or `#D4D0C5` internal dividers.
- **Internal Padding:** `24px` (`p-6`) to `32px` (`md:p-8`).

### Inputs / Fields
- **Style:** `2px solid #111110` border on `#FFFFFF` or `#F8F6F0` ground, `0px` radius, `caret-color: #E02E24`.
- **Focus:** `2px solid #E02E24` outline with `2px` offset.

### Navigation
- **Style:** Top `64px` Carbon Ink (`#111110`) header bar with `#F8F6F0` type, `2px solid #E02E24` active bottom bar, and a live `RATE: $1.00 = 1 PT · JWS HS256` telemetry badge. On mobile viewports (`<768px`), a fixed bottom thumb bar provides one-tap switching across role routes.

### Kinetic Variable-Font Specimen Stage
- **Behavior:** Combines a `.font-specimen` numeral (`Fraunces` driven by `--specimen-wght` and `--specimen-opsz`), a `JetBrains Mono` coordinate readout (`'wght' 850 · 'opsz' 144`), and a `.foundry-slider` range input (`#D4D0C5` track with `18px` `#E02E24` square thumb bordered in `#111110`).

## Do's and Don'ts

### Do:
- **Do** bind display numerals for point balances, spend awards, and reward costs to `computeSpecimenAxes()` (`wght 320..900`, `opsz 24..144`).
- **Do** pair every headline KPI figure immediately with its underlying proof (`$ USD` verified spend, per-member average, or JWS verification protocol) in a ruled footer row.
- **Do** use `JetBrains Mono` with `tabular-nums` for all dollar amounts (`$18.50`), point deltas (`+19 PTS`), serial codes (`RWD-01`, `TX-0042`), and countdown timers.
- **Do** maintain at least `4.5:1` contrast on all body and secondary text using Warm Graphite (`#4A4843`) on light paper grounds.

### Don't:
- **Don't** place kickers or eyebrow labels above `h1`, `h2`, or `h3` headings.
- **Don't** nest cards inside cards or use generic 3-up rounded icon-card grids.
- **Don't** use colored `border-left` or `border-right` stripes thicker than `1px` on callouts or list items.
- **Don't** use hard zero-blur offset shadows (`4px 4px 0`) or decorative glassmorphism.
