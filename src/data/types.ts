/**
 * Everafter — data model.
 *
 * Everything is per-person. A `Party` is only a mailing envelope; the truth
 * (attendance, meal, notes) always hangs off a named `Guest`.
 */

export type ID = string

/** Canonical guest tags used across seed data, event visibility and questions. */
export type GuestTag = 'family' | 'friends' | 'wedding-party' | 'out-of-town'

export interface WeddingEvent {
  id: ID
  name: string
  /** Calendar date, `YYYY-MM-DD`. */
  dateISO: string
  /** 24-hour local wall time, `HH:mm`. */
  startTime: string
  /** 24-hour local wall time, `HH:mm`. May roll past midnight (e.g. `00:00`). */
  endTime?: string
  venue: string
  address: string
  description: string
  dressCode?: string
  /** Whether this event appears in the RSVP flow's attendance step. */
  requiresRsvp: boolean
  /** `'all'` = everyone invited; otherwise only guests holding one of these tags. */
  visibleToTags: string[] | 'all'
  /** Attendees of this event must choose a meal. */
  hasMeal?: boolean
}

export interface Party {
  id: ID
  /** How the envelope is addressed, e.g. "The Chen Family". */
  label: string
  guestIds: ID[]
  /** How many additional named guests this party may bring. Never anonymous. */
  plusOneAllowance: number
}

export interface Guest {
  id: ID
  partyId: ID
  firstName: string
  lastName: string
  email?: string
  isChild?: boolean
  /** Created by a guest during the RSVP flow; always named. */
  isPlusOne?: boolean
  invitedEventIds: ID[]
  tags: string[]
}

export interface MealOption {
  id: ID
  name: string
  description: string
  vegetarian?: boolean
}

export interface CustomQuestion {
  id: ID
  type: 'multiple' | 'text'
  prompt: string
  options?: string[]
  /** Asked once per attending person rather than once per party. */
  perGuest: boolean
  /** Only asked when the party (or guest) holds one of these tags. */
  targetTags?: string[]
}

export interface AttendanceAnswer {
  guestId: ID
  eventId: ID
  attending: boolean
}

export interface MealAnswer {
  guestId: ID
  mealId: ID | null
  dietaryNotes: string
}

export interface CustomAnswer {
  questionId: ID
  /** Present only for `perGuest` questions. */
  guestId?: ID
  value: string
}

export interface PartyRsvp {
  partyId: ID
  /** ISO timestamp. */
  submittedAt: string
  attendance: AttendanceAnswer[]
  meals: MealAnswer[]
  custom: CustomAnswer[]
  noteToCouple?: string
}

export interface ReminderRule {
  id: ID
  offsetDaysBeforeDeadline: number
  channel: 'email' | 'text'
  audience: 'pending' | 'all'
  enabled: boolean
}

export interface WeddingConfig {
  coupleNames: [string, string]
  tagline: string
  /** Wedding day, `YYYY-MM-DD`. */
  dateISO: string
  city: string
  /** Replies close at the end of this day, `YYYY-MM-DD`. */
  rsvpDeadlineISO: string
  /** When true, a guest's first *and* last name must match to find a party. */
  strictNameMatching: boolean
  heroPhotoUrl: string
  /** Shown when a guest cannot find themselves, or after the deadline passes. */
  contactEmail: string
  /** IANA zone for the venue — used when building .ics files. */
  timeZone: string
  hashtag: string
}

/* -------------------------------------------------------------------------- */
/* RSVP submission payload                                                     */
/* -------------------------------------------------------------------------- */

/**
 * A plus-one as entered in the RSVP flow. `key` is either an existing Guest id
 * (editing a previously named plus-one) or a temporary key prefixed `tmp:`.
 * `submitRsvp` materializes temporary keys into real Guest records before
 * recording answers, and remaps every answer that references them.
 */
export interface PlusOneInput {
  key: ID
  firstName: string
  lastName: string
}

export interface RsvpSubmission {
  partyId: ID
  plusOnes: PlusOneInput[]
  attendance: AttendanceAnswer[]
  meals: MealAnswer[]
  custom: CustomAnswer[]
  noteToCouple?: string
}

/** One flat, vendor-ready row per person — the shape the caterer wants. */
export interface VendorRow {
  partyLabel: string
  firstName: string
  lastName: string
  email: string
  tags: string
  isChild: boolean
  isPlusOne: boolean
  /** Event name -> 'Attending' | 'Declined' | 'Pending' | '—' (not invited). */
  events: Record<string, string>
  meal: string
  dietaryNotes: string
  respondedOn: string
}
