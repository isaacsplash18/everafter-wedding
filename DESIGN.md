# Design

Visual system for Everafter. All colors OKLCH. Brand seed: `oklch(0.764 0.120 77.1)` (honey/ochre, hue 77°).

## Mood

"Letterpress invitation under late-afternoon light" — pure white cotton-paper surface, deep warm ink, one committed honey-gold that does the brand work, a deep ink-blue for editorial contrast. Color strategy: **Committed** on the guest site (honey carries identity moments — hero rules, RSVP progress, buttons), **Restrained** in admin.

## Color Tokens

```css
:root {
  /* surfaces */
  --bg: oklch(1 0 0);                    /* pure white — paper */
  --surface: oklch(0.965 0.004 77);      /* cards/panels, barely-there warm */
  --surface-2: oklch(0.93 0.008 77);     /* pressed/hover panel */

  /* ink */
  --ink: oklch(0.24 0.02 60);            /* warm near-black body text, ≥7:1 on bg */
  --ink-muted: oklch(0.45 0.02 60);      /* secondary text, ≥4.5:1 on bg */

  /* brand */
  --honey: oklch(0.72 0.125 77);         /* brand — rules, progress, large decorative fills only */
  --honey-deep: oklch(0.52 0.115 72);    /* primary button fill + small text (≥4.5:1 on bg and wash) */
  --honey-pressed: oklch(0.44 0.11 70);  /* hover/active step down */
  --honey-wash: oklch(0.95 0.025 80);    /* tint fill for selected states */

  /* accent */
  --indigo: oklch(0.32 0.06 265);        /* deep ink-blue — links, editorial rules, admin nav */
  --indigo-bright: oklch(0.45 0.09 265); /* interactive accent on white */

  /* status (admin) */
  --ok: oklch(0.52 0.10 155);
  --warn: oklch(0.62 0.13 70);
  --danger: oklch(0.50 0.14 25);

  /* dark section (guest site full-bleed moments) */
  --night: oklch(0.21 0.025 265);        /* deep indigo-black section bg */
  --night-ink: oklch(0.93 0.01 77);      /* text on night */
}
```

Rules: white text on `--honey` and `--indigo` fills (Helmholtz-Kohlrausch). `--honey` never used for body text on white (contrast too low) — use `--honey-deep` for small text. No gradients on text. No cream page backgrounds — warmth lives in honey + type, the paper stays white.

## Typography

- **Display: "Marcellus"** (Google Fonts, single weight 400) — engraved Trajan-like caps; the letterpress voice. Used for names, page titles, event names. Letter-spacing up to +0.06em on caps lines, never negative beyond -0.01em.
- **Body/UI: "Karla"** (Google Fonts, 400/500/700) — humanist grotesque, warm but plain-spoken. All body, forms, admin UI.
- Scale (fluid): display `clamp(2.5rem, 7vw, 5.5rem)`; h2 `clamp(1.8rem, 4vw, 3rem)`; h3 1.35rem; body 1.0625rem/1.65; small 0.875rem. `text-wrap: balance` on headings.
- Numerals in admin tables: `font-variant-numeric: tabular-nums`.

## Motion (GSAP)

- Library: gsap + @gsap/react (`useGSAP`). Register ScrollTrigger once in a shared module.
- **Guest site**: one orchestrated hero load timeline (rule lines draw in via scaleX, names rise with 0.06s stagger, date fades last); scroll reveals per section (y: 24→0, opacity, ease `power3.out`, 0.7s) — each section's reveal styled to its content, not a uniform reflex; RSVP step transitions (outgoing step x: -24 fade, incoming x: 24→0) driven by a timeline, ~0.45s total.
- **Admin**: no entrance choreography; 150–200ms ease-out transitions on state changes only.
- Every tween gated behind `gsap.matchMedia()` with a `(prefers-reduced-motion: reduce)` context that swaps to instant sets/crossfades. Content must be visible by default — never gate visibility on animation having run (use `from` tweens or set initial states in JS, not CSS-hidden).

## Layout

- Guest site: single column, max-width 68ch for prose, full-bleed moments for hero and photo wall; generous `clamp(4rem, 10vh, 8rem)` section spacing; thin `--indigo` horizontal rules as the recurring stationery motif (1px, partial width).
- Admin: left nav (icon + label, `--night` bg, `--night-ink` text), content area on `--bg`; tables full-width with sticky header.
- z-index scale: `--z-dropdown: 10; --z-sticky: 20; --z-backdrop: 30; --z-modal: 40; --z-toast: 50`.

## Components

- **Button**: primary = `--honey-deep` fill, white text (AA-verified), hover `--honey-pressed`, 10px radius, subtle y-translate press; secondary = 1px `--ink` border, transparent; quiet = text-only `--indigo-bright`. Bright `--honey` is never a text-bearing fill.
- **Input/Select**: 1px `--ink-muted` border, 12px radius, focus ring 2px `--honey`; labels above, 0.875rem 500.
- **Attendance toggle**: segmented control (Joyfully accepts / Regretfully declines), selected = `--honey-wash` fill + `--honey-deep` text + 1px `--honey` border.
- **Tag chip**: admin-only, `--indigo` at 10% fill, `--indigo` text, 999px radius.
- **Cards**: use sparingly; `--surface` fill, 16px radius, no borders, no shadows heavier than `0 1px 2px oklch(0 0 0 / 0.06)`. Never nested.

## Imagery

Guest site is image-led where it matters: one decisive hero photo treatment (duotone/soft-light over `--night` is acceptable), a photo wall. Use verified Unsplash URLs (`https://images.unsplash.com/photo-{id}?auto=format&fit=crop&w=1600&q=80`) — verify each resolves before shipping; fewer confident photos beat many guesses. Alt text written in the brand voice.
