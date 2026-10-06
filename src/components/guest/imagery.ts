/**
 * Everafter — imagery for the guest pages.
 *
 * Two sources now:
 *
 * 1. Couple photographs — removed from this portfolio copy. The production
 *    site serves the couple's own photos from /public/couple.
 *
 * 2. `unsplashUrl(...)` — scenery only. Personal moments are never stock, and
 *    stock is never captioned as if it were them. Anything showing an
 *    identifiable couple was dropped: on a page full of real faces, a stranger
 *    in wedding clothes reads as the bride and groom.
 *
 * Every id below was fetched and looked at before shipping.
 */

export function unsplashUrl(id: string, width = 1600): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`
}


export const GUEST_IMAGERY = {
  /** Scenery only — the couple's own photos never go on the travel band. */
  travel: 'photo-1573790387438-4da905039392',
  /** A tropical river under palms; the middle beat of the story timeline. */
  storyTrip: 'photo-1552733407-5d5c46c3bb3b',
  /** A Balinese split gateway mirrored in still water. */
  baliGate: 'photo-1537953773345-d172ccf13cf1',
  /** A carved "Mr & Mrs" sign against a bright sky. No faces. */
  signage: 'photo-1507504031003-b417219a0fde',
  /** An empty reception hall the morning before. No faces. */
  emptyRoom: 'photo-1519741497674-611481863552',
  party: 'photo-1498931299472-f7a63a5a1cfa',
  registry: 'photo-1529636798458-92182e662485',
} as const
