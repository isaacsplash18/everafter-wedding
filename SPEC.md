# Everafter — Build Spec

Read PRODUCT.md and DESIGN.md first. This file defines the data model, routes, features, and file ownership. Do not deviate from file ownership — other agents work in parallel.

## Stack

Vite + React 18 + TS, react-router-dom v6, zustand (with `persist` → localStorage), gsap + @gsap/react. No backend: the store seeded with demo data IS the product demo. Fonts: Marcellus + Karla via Google Fonts `<link>` in index.html.

## Demo fiction

Wedding of **Amara Okafor & James Whitfield** — Saturday, June 12, 2027, at Cedar Ridge Estate, Hudson Valley, NY. Events: Welcome Drinks (Fri, tags: all), Ceremony (Sat), Reception (Sat), Farewell Brunch (Sun, tag: `family` + `wedding-party` only). Meals at reception: Herb-Roasted Chicken / Pan-Seared Salmon / Wild Mushroom Risotto (v). Seed ~10 parties / ~24 guests with varied states: some already RSVP'd, some pending, varied tags (`family`, `friends`, `wedding-party`, `out-of-town`), one party with plusOneAllowance=1, one solo guest, one family of 4 incl. two kids. Include party "The Chen Family", solo "Priya Sharma" (+1 allowed), etc. RSVP deadline May 1, 2027.

## Data model (src/data/types.ts)

```ts
export type ID = string;
export interface WeddingEvent { id: ID; name: string; dateISO: string; startTime: string; endTime?: string; venue: string; address: string; description: string; dressCode?: string; requiresRsvp: boolean; visibleToTags: string[] | 'all'; hasMeal?: boolean }
export interface Party { id: ID; label: string; guestIds: ID[]; plusOneAllowance: number }
export interface Guest { id: ID; partyId: ID; firstName: string; lastName: string; email?: string; isChild?: boolean; isPlusOne?: boolean; invitedEventIds: ID[]; tags: string[] }
export interface MealOption { id: ID; name: string; description: string; vegetarian?: boolean }
export interface CustomQuestion { id: ID; type: 'multiple' | 'text'; prompt: string; options?: string[]; perGuest: boolean; targetTags?: string[] }
export interface AttendanceAnswer { guestId: ID; eventId: ID; attending: boolean }
export interface MealAnswer { guestId: ID; mealId: ID | null; dietaryNotes: string }
export interface CustomAnswer { questionId: ID; guestId?: ID; value: string }
export interface PartyRsvp { partyId: ID; submittedAt: string; attendance: AttendanceAnswer[]; meals: MealAnswer[]; custom: CustomAnswer[]; noteToCouple?: string }
export interface ReminderRule { id: ID; offsetDaysBeforeDeadline: number; channel: 'email' | 'text'; audience: 'pending' | 'all'; enabled: boolean }
export interface WeddingConfig { coupleNames: [string, string]; tagline: string; dateISO: string; city: string; rsvpDeadlineISO: string; strictNameMatching: boolean; heroPhotoUrl: string }
```

## Store (src/lib/store.ts)

Zustand store `useWeddingStore` with persist (key `everafter-store`, version it). State: config, events, parties, guests, meals, questions, rsvps, reminders. Actions: `submitRsvp(rsvp)` (upsert by partyId; adds named plus-one Guests to the party with `isPlusOne: true` before recording), `addGuestToParty`, `updateGuest`, `removeGuest`, `setPartyAllowance`, `toggleReminder`, `resetDemo()` (restore seed). Derived selectors (plain functions taking state): `lookupParty(first, last)` — normalized (case, diacritics, common-nickname map: Jim→James, Katie→Katherine, etc.); returns exactly one party or null; NEVER returns candidate lists (privacy). `eventStats(eventId)` → {invited, attending, declined, pending}. `mealCounts()`, `allergyList()`, `pendingParties()`.

## Routes (App.tsx — owned by Phase 1 agent, frozen afterward)

Guest (GuestLayout with top nav + footer): `/` Home, `/story`, `/schedule`, `/travel`, `/party`, `/registry`, `/faq`, `/photos`, `/rsvp`.
Admin (AdminLayout, left nav): `/admin` Overview, `/admin/guests`, `/admin/settings`.

## Feature requirements

### RSVP flow (`/rsvp`, the showpiece — per-person truth, no privacy leaks)
Multi-step with GSAP step transitions and a thin honey progress rule:
1. **Find invitation**: first + last name. On no match: warm error suggesting the name as printed on the invitation. Never list other guests.
2. **Your party**: greet party by label; list members by full name. If allowance > 0: "Bringing someone?" → required first+last name fields (no anonymous +1s).
3. **Attendance**: for each event the party is invited to (respect per-guest invitedEventIds & visibleToTags): per-person segmented toggle "Joyfully accepts / Regretfully declines". Pre-fill from existing RSVP if re-submitting.
4. **Meals** (only if someone attends a hasMeal event): per attending person, meal dropdown (required) + optional dietary notes field.
5. **Questions**: custom questions (song request text; shuttle multiple-choice), filtered by targetTags; per-guest ones repeat per attendee. Optional note to the couple.
6. **Review & seal**: summary grouped by person; submit → confirmation screen ("Sealed with love" moment, honey rule draws across, names of attendees listed) + "Add to calendar" (.ics download built by src/lib/ics.ts) + edit-response link.
Deadline passed → step 1 shows a gentle closed notice with couple contact.

### Guest pages
- **Home**: full-bleed hero (photo over `--night` wash), names in Marcellus, date + city, countdown (days), CTA to RSVP; below: short story preview, schedule teaser (personalized note: "Find your invitation to see your events"), travel teaser.
- **Schedule**: unified timeline (Joy's best idea) — all events with time/venue/dress code; note which are invitation-only. After a session has looked up their party in the RSVP flow (store the last-matched partyId in the store, non-persisted or persisted is fine), show ONLY their events with a "personalized for you" note and a "not you?" reset.
- **Story**: alternating timeline (how we met → proposal) with scroll reveals.
- **Travel**: hotels with block codes (styled as stationery cards), getting-there, weather note.
- **Party**: wedding party grid, roles, one-line bios.
- **Registry**: aggregator links (external retailers) + zero-fee cash funds (honeymoon, home) with progress bars; "no fees, every dollar reaches us" note.
- **FAQ**: accordion; dress code, kids, parking, hashtag.
- **Photos**: masonry guest photo wall (seeded Unsplash), upload affordance (adds to local store), like buttons.

### Admin
- **Overview**: headline pending-party count + days-to-deadline; per-event attending/declined/pending; meal counts and allergy list (the caterer answer); reminder schedule toggles (email/text drip vs deadline, enabled state — demo UI, no real sending); "reset demo data".
- **Guests**: party-grouped table (party label, members, tags, allowance, per-event status dots, meals); search + tag filter + status filter; row expand for full answers incl. dietary notes & custom answers; add guest/party, edit allowance, CSV export (client-side blob) of per-person rows ready for vendors.
- **Settings**: events list (edit name/time/visibility), meal options, custom questions, strict-name-matching toggle, RSVP deadline.

## Motion & design

Follow DESIGN.md exactly (tokens, fonts, GSAP rules, reduced-motion). Guest = brand register (ambitious, orchestrated); admin = product register (calm, instant).

## File ownership

- **Phase 1 (Opus)**: index.html, src/styles/*, src/data/*, src/lib/*, src/components/ui/*, src/App.tsx, src/pages/guest/rsvp/**, plus create every other page file as a minimal working placeholder (heading only) so routes compile.
- **Phase 2A (Sonnet, guest)**: src/pages/guest/** except rsvp/, src/components/guest/**. Touch nothing else.
- **Phase 2B (Sonnet, admin)**: src/pages/admin/**, src/components/admin/**. Touch nothing else.
- Every phase: `npm run build` must pass before you finish. Commit your own work with a conventional message + "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>".

## Verified imagery (all HTTP 200, use only these IDs)

URL shape: `https://images.unsplash.com/photo-{id}?auto=format&fit=crop&w=1600&q=80` (use w=800 for grid thumbs).

photo-1519741497674-611481863552 · photo-1465495976277-4387d4b0b4c6 · photo-1511285560929-80b456fea0bc · photo-1522673607200-164d1b6ce486 · photo-1520854221256-17451cc331bf · photo-1583939003579-730e3918a45a · photo-1469371670807-013ccf25f16a · photo-1532712938310-34cb3982ef74 · photo-1507504031003-b417219a0fde · photo-1464366400600-7168b8af9bc3 · photo-1523438885200-e635ba2c371e · photo-1525772764200-be829a350797 · photo-1510076857177-7470076d4098 · photo-1498931299472-f7a63a5a1cfa · photo-1529636798458-92182e662485 · photo-1519225421980-715cb0215aed

Pick the hero from the first six after checking fit; write alt text in the brand voice.
