# Hostel Snack Store Design System

**Version:** 1.0  
**Status:** Active  
**Last updated:** 18 July 2026

---

## Purpose

This document is the visual source of truth for Hostel Snack Store. It adapts the supplied Shopify-inspired design language to a focused hostel-shop operations dashboard.

It changes visual expression only. The information architecture, page structure, user flows, data hierarchy, responsive behavior, and existing animation/transition behavior defined in the project documentation must remain unchanged. This file does not introduce new pages, controls, journeys, or motion.

---

## Design direction

The interface is a calm, high-contrast operations tool: cinematic black for the live shop and order-taking surfaces; near-white for management, comparison, forms, and analytics. Large thin display type gives the product a confident editorial voice, while compact UI type keeps night-time tasks quick to scan.

The design should feel deliberate and quiet—not playful, glossy, or dashboard-generic. Use negative space and clean typography before adding borders, cards, shadows, gradients, or decoration.

### Core principles

- Preserve the current header, desktop sidebar, page sections, forms, card/group ordering, and workflows.
- Preserve all existing animations, transition durations, easing, trigger conditions, loading states, and responsive navigation behavior. New decorative animation is not permitted.
- Separate the two canvas tracks. A page is either cinematic dark or transactional light; never blend both tracks within the same primary page surface.
- Use a single primary action per task area. Pill buttons are the only button shape.
- Make operating status, order status, and low-stock state immediately scannable without relying on color alone.
- Optimize for quick, one-handed use late at night: strong contrast, clear focus states, and 44px minimum touch targets.

---

## Design tokens

### Color

| Token | Value | Use |
| --- | --- | --- |
| `canvas-night` | `#000000` | Store status, live orders, dark navigation, dark footer/shell |
| `canvas-night-elevated` | `#0A0A0A` | Dark task cards and contained live-order rows |
| `surface-elevated-dark` | `#1E2C31` | Rare dark elevated state; do not use as a general page background |
| `canvas-light` | `#FFFFFF` | Product management, settings, forms, tables, standard cards |
| `canvas-cream` | `#FBFBF5` | Analytics page background and transactional page banding |
| `aloe-10` | `#C1FBD4` | Featured/positive light-surface state; primary "Open store" action on light surfaces |
| `pistachio-10` | `#D4F9E0` | Light-track emphasis band and selected/filter state |
| `ink` | `#000000` | Text and filled controls on light surfaces |
| `on-primary` | `#FFFFFF` | Text and strokes on dark surfaces |
| `hairline-light` | `#E4E4E7` | Light-surface dividers and input borders |
| `hairline-dark` | `#1E2C31` | Dark-surface dividers |
| `shade-30` | `#D4D4D8` | Neutral chips and muted borders |
| `shade-40` | `#A1A1AA` | Tertiary light text / secondary dark text |
| `shade-50` | `#71717A` | Secondary text on light surfaces |
| `shade-60` | `#52525B` | Quiet supporting text |
| `shade-70` | `#3F3F46` | Pressed black-pill state |

### Semantic state mapping

| State | Surface treatment | Label treatment |
| --- | --- | --- |
| Store open | `aloe-10` pill on light, white-outline pill on dark | Explicit “Open” text |
| Store closed | Light surface with `ink` border, or dark outlined surface | Explicit “Closed” text |
| Order placed / preparing | Neutral outlined pill | Status text remains visible |
| Order delivered | `pistachio-10` pill on light | Explicit “Delivered” text |
| Low stock | `ink` outline / high-emphasis text, never red-only | Include count and “Low stock” text |
| Destructive action | Black outlined pill with clear destructive wording and confirmation | Never a color-only affordance |

Greens are reserved for the light track. Do not use them as text color on white or black backgrounds; they are surface fills only.

### Typography

Use **Neue Haas Grotesk Display** for display headings at thin weights. When unavailable, use `Inter`, `Helvetica`, then `Arial`, at a light weight—never substitute a heavy display face. Use **Inter Variable** for UI text. Apply `font-feature-settings: "ss03"` globally. Use `ui-monospace` only for IDs, timestamps where helpful, or technical values.

| Token | Size / line-height | Weight | Use |
| --- | --- | --- | --- |
| `display-xxl` | 96px / 1 | 330 | Existing hero-scale heading only |
| `display-xl` | 70px / 1 | 330 | Primary page opener on dark surfaces |
| `display-lg` | 55px / 1.16 | 330 | Main page title on light surfaces |
| `display-md` | 48px / 1.14 | 330 | Metric value or major section title |
| `heading-xl` | 28px / 1.28 | 500 | Task/card title |
| `heading-lg` | 24px / 1.14 | 400 | Compact section title |
| `heading-md` | 20px / 1.4 | 500 | Subsection heading |
| `heading-sm` | 18px / 1.25 | 500 | Control group label |
| `body-lg` | 18px / 1.56 | 550 | Key status or explanatory lead |
| `body-md` | 16px / 1.5 | 420 | Default UI text and button label |
| `body-strong` | 16px / 1.5 | 550 | Emphasized operational detail |
| `caption` | 14px / 1.49 | 500 | Helper copy and metadata |
| `micro` | 13px / 1.5 | 500 | Fine print and compact table details |
| `eyebrow-cap` | 12px / 1.2 | 400 | All-caps page eyebrow |

Only `display-xxl` uses `2.4px` letter spacing. All display text below it uses normal tracking. On mobile, preserve the existing layout and scale display headings down through 64px, 55px, 48px, then 36px as needed.

### Spacing and shape

- Base spacing unit: 8px. Use 2, 4, 8, 12, 16, 24, 32, and 64px increments.
- Retain the current page and component spacing relationships; apply these tokens without moving or regrouping content.
- Dark operational pages may use 64–128px section air; transactional pages use 48–64px.
- Radii: 4px for tags, 8px for inputs, 12px for cards, 20px for media frames, and `9999px` for every button and pill.
- Buttons must always be pill-shaped. Card corners must not be substituted for button corners.

---

## Layout application

### Global shell

Keep the documented layout unchanged:

```
+--------------------------------------------------------------+
| Header                                                       |
+------------+-------------------------------------------------+
| Sidebar    | Page content                                    |
|            |                                                 |
+------------+-------------------------------------------------+
```

- The header and sidebar retain their current contents, placement, responsive collapse behavior, and active-page behavior.
- On dark operational pages, use `canvas-night` for the shell with white type and restrained dark hairlines.
- On light management pages, use `canvas-light` for the shell with black type and `hairline-light` separators.
- Do not add a dashboard hero, alter column counts, introduce a new navigation destination, or rearrange page content.

### Page track assignment

| Existing page | Track | Visual application |
| --- | --- | --- |
| Store Status / Operations | Cinematic dark | Black canvas, thin display title, white-outline actions; current status remains the visual focal point |
| Orders | Cinematic dark | Black canvas; contained order cards use `canvas-night-elevated` with a subtle inset top highlight |
| Products / Inventory | Transactional light | White canvas, black pill actions, hairline dividers, product cards at 12px radius |
| Analytics | Transactional light | `canvas-cream` background, white KPI/card surfaces, soft stacked-shadow elevation for existing cards only |
| Settings | Transactional light | White canvas with quiet dividers; inputs use 8px radius and hairline-light borders |
| Login and checkout surfaces | Transactional light | Light canvas, black primary pills, aloe reserved for the featured positive action only |

### Responsive behavior

Keep the current desktop, tablet, and mobile layout strategy exactly as documented: fixed/collapsible sidebar on larger screens, navigation drawer on mobile, single-column content when currently specified, and existing product-grid collapse behavior. This design system only changes colors, type, borders, and component finish at those breakpoints.

---

## Components

### Buttons

| Component | Treatment |
| --- | --- |
| Primary pill | `ink` background, `on-primary` label, 12px × 24px padding, full pill radius |
| Primary pill—pressed | `shade-70` background; retain existing press motion |
| Outline pill on dark | Transparent/black background, 2px white border, white label |
| Outline pill on light | White background, 1px black border, black label |
| Aloe pill | `aloe-10` background, black label; only for a featured positive action on light surfaces |

All button labels remain on one line. Maintain existing hover, focus, disabled, and animation behavior; do not add new effects. Every action must meet 44×44px minimum touch size and AA contrast.

### Cards and grouped content

- Existing product, order, status, and KPI cards retain their current role, content, and placement.
- Light cards: white background, `hairline-light` border, 12px radius. Analytics cards may use the stacked light shadow: `0 8px 8px rgba(0,0,0,.1), 0 4px 4px rgba(0,0,0,.1), 0 2px 2px rgba(0,0,0,.1), 0 0 0 1px rgba(0,0,0,.1)`.
- Dark cards: `canvas-night-elevated`, 12px radius, no external drop shadow; optional `0 1px 2px rgba(255,255,255,.05), inset 0 1px 0 rgba(255,255,255,.04)` sheen.
- Use dividers and spacing rather than adding cards where the current layout does not have one.

### Forms, filters, and search

- Inputs: white background, black text, 16px UI type, 10px × 12px padding, 8px radius, `hairline-light` border.
- Existing search, category filter, status filter, toggle, modal, validation message, confirmation dialog, skeleton, empty state, and toast remain structurally unchanged.
- Apply visible keyboard focus with a high-contrast black outline on light surfaces and white outline on dark surfaces.
- Inline errors must state the problem in text. Do not rely on a color change alone.

### Status pills and badges

All status badges use full-pill geometry. Their label is always explicit, so the state remains understandable in monochrome or by screen reader. Keep current status workflow and transitions intact.

### Navigation

- Keep logo/name, store-status indicator, profile menu, all sidebar items, and active page logic unchanged.
- Use the appropriate canvas polarity per page. Active navigation is indicated by contrast and type weight in addition to any existing visual cue.
- Mobile navigation preserves its existing drawer and animation behavior.

---

## Imagery, elevation, and motion

No new photography, illustration, gradients, glass effects, or decorative motion should be added to the dashboard. If product imagery already exists, it remains within the existing product card/image placement and uses 5px small-image or 12px card-container radius as currently appropriate.

Animation is intentionally locked. Preserve current animation names, keyframes, durations, delays, easing, reduced-motion handling, and triggers. Where a new component has no prior animation, it must remain static. Pressed-state styling can change color but must retain—not replace—the existing interaction movement.

---

## Accessibility and quality checks

- Verify every text/control pair meets WCAG AA contrast: 4.5:1 for standard body text and 3:1 for large text.
- Retain keyboard navigation, visible focus, labels, loading skeletons, empty states, inline errors, confirmation dialogs, and toast semantics already specified.
- Never use color as the sole signal for store, order, stock, validation, or destructive states.
- Do not use generic gradients, rounded-rectangle buttons, heavy display weights, warm beige/brass palettes, or mixed canvas polarity on one primary page.
- Before implementation, confirm that page order, sidebar entries, section order, component count, and all animation behavior match the existing documentation.

---

## Implementation checklist

1. Apply tokens globally before changing individual components.
2. Map each existing page to its assigned canvas track without moving content.
3. Update shared buttons, inputs, cards, badges, and navigation in place.
4. Audit all existing motion to confirm values and triggers did not change.
5. Test the documented desktop, tablet, and mobile layouts plus keyboard-only navigation and reduced-motion behavior.
