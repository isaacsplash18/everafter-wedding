# Product

## Register

brand

(The guest-facing wedding site is the primary surface — design IS the product there. The `/admin` dashboard is a secondary **product**-register surface; commands targeting admin screens should treat it as product.)

## Users

- **Guests** (primary): friends and family opening a link from a text or a QR code on a paper invitation, usually on a phone, in the evening. They want to RSVP in under two minutes without creating an account, and to find the schedule, travel info, and registry without hunting.
- **The couple** (admin): planning a wedding for months, stressed, juggling a caterer who needs exact meal counts and a venue that needs headcounts. They live in the guest-list dashboard.

## Product Purpose

"Everafter" is a wedding website + RSVP app that combines the best of Joy (withjoy.com) and Minted, and fixes both products' documented weaknesses. Success = a guest completes a per-person, per-event RSVP with named plus-ones and structured meal choices in one fluid flow, and the couple sees vendor-ready counts instantly.

Best-of-both synthesis (from research):
- **From Joy**: one unified, per-guest personalized schedule + RSVP (tag-driven event visibility), household party lookup by name, strict name matching, contact collector, zero-fee cash registry framing, guest photo wall, tags as the engine for messaging/visibility.
- **From Minted**: artist-grade design cohesion — the site should feel like a beautiful printed invitation suite brought to life, not a SaaS builder output.
- **Fixes both**: per-person (not per-household) attendance + meal tracking; structured dropdown meals bound to each named attendee; forced naming of plus-ones; no guest-search privacy leak (lookup requires a full name, never lists other parties); vendor-ready counts (meals, allergies) computed live in the dashboard; automated reminder sequence (configured UI); prominent dashboard entry.

## Brand Personality

Engraved, candlelit, unhurried. The feeling of running a thumb over letterpress cotton paper. Celebration expressed through restraint and warmth, not confetti. Emotional goals: anticipation, intimacy, trust.

## Anti-references

- The cream/blush/sage "wedding template" look every builder ships — no beige body backgrounds, no script-font monograms, no gold-foil gradient text.
- SaaS-builder genericism (Zola/The Knot dashboards): identical card grids, eyebrow labels over every section, hero-metric tiles.
- Joy's own weakness: marketing polish over depth — our RSVP flow must be genuinely deeper, not just prettier.

## Design Principles

1. **The invitation come to life** — every guest surface should feel like stationery: typography-led, generous margins, print-grade restraint, with motion as the "opening the envelope" moment.
2. **Never make a guest think** — no accounts, no codes; name in, party found, done. Conditional questions only when relevant.
3. **Per-person truth** — every attendee is a named record with their own attendance, meal, and notes. No anonymous "+1", no household blobs.
4. **The dashboard answers the caterer's phone call** — counts, meals, and allergies are always one glance away, exportable, never needing spreadsheet cleanup.
5. **Motion with intent** — GSAP choreography on the guest site (page load, RSVP step transitions, scroll reveals); calm, instant feedback in admin. Reduced-motion always respected.

## Accessibility & Inclusion

WCAG 2.1 AA. Body text ≥4.5:1; all flows keyboard-navigable; `prefers-reduced-motion` alternatives for every animation; form errors announced with text, not color alone; touch targets ≥44px on the guest flow (phone-first).
