# Everafter

A wedding website with a real RSVP flow, built for guests on their phones and for a couple who need exact headcounts.

> **Portfolio copy.** Built for a real wedding; the couple, the wedding party and every guest here are fictional, and the couple's photos are replaced with scenery.

## Guest side

- **Home, Story, Schedule, Travel, Wedding Party, Registry, FAQ, Photos.** Everything a guest looks for, without hunting.
- **RSVP in under two minutes, no account.** Find your invitation by name, then confirm who's coming per event, add plus-ones, pick meals and note dietary needs, answer custom questions, review and send.
- **Per-event invitations.** Guests only see the events their party is invited to (welcome dinner, ceremony, reception, brunch).
- **Add to calendar** via generated `.ics` files, with a countdown to the day.

## Couple side (`/admin`)

- **Overview** of RSVP progress and meal counts for the caterer.
- **Guest list** with search, tag and status filters, party allowances and plus-ones.
- **Settings** for events, meals, custom questions and reminder rules, which update the guest site live.

## Stack

React 18 · TypeScript · Vite · client-side store with seeded demo data (no backend needed to run it) · Vercel

## Run it

```bash
npm install
npm run dev
```

Built by [Isaac Ho](https://github.com/isaacsplash18).
