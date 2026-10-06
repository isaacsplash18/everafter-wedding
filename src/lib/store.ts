/**
 * Everafter — the whole product's state.
 *
 * There is no backend. The seed IS the demo, so every mutation lands here and
 * persists to localStorage. Selectors are plain functions that take state, so
 * they can be used inside `useWeddingStore(...)` or against a snapshot.
 */

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import {
  seedConfig,
  seedEvents,
  seedGuests,
  seedMeals,
  seedParties,
  seedPhotos,
  seedQuestions,
  seedReminders,
  seedRsvps,
  type GuestPhoto,
} from '../data/seed'
import type {
  CustomQuestion,
  Guest,
  ID,
  MealOption,
  Party,
  PartyRsvp,
  ReminderRule,
  RsvpSubmission,
  VendorRow,
  WeddingConfig,
  WeddingEvent,
} from '../data/types'

/* -------------------------------------------------------------------------- */
/* Name normalization — the privacy-safe front door                            */
/* -------------------------------------------------------------------------- */

/**
 * Nickname -> the name most likely printed on the invitation. Deliberately
 * conservative: a wrong collapse is worse than a near miss, because a near miss
 * shows a warm "check the invitation" note rather than someone else's party.
 */
export const NICKNAMES: Record<string, string> = {
  jim: 'james',
  jimmy: 'james',
  jamie: 'james',
  jas: 'james',
  katie: 'katherine',
  kate: 'katherine',
  kathy: 'katherine',
  kat: 'katherine',
  cathy: 'catherine',
  bob: 'robert',
  bobby: 'robert',
  rob: 'robert',
  robbie: 'robert',
  bill: 'william',
  billy: 'william',
  will: 'william',
  liam: 'william',
  dick: 'richard',
  rick: 'richard',
  richie: 'richard',
  dave: 'david',
  davey: 'david',
  mike: 'michael',
  mikey: 'michael',
  chris: 'christopher',
  topher: 'christopher',
  nick: 'nicholas',
  nate: 'nathaniel',
  nathan: 'nathaniel',
  tony: 'anthony',
  ted: 'edward',
  teddy: 'edward',
  ned: 'edward',
  eddie: 'edward',
  tom: 'thomas',
  tommy: 'thomas',
  joe: 'joseph',
  joey: 'joseph',
  dan: 'daniel',
  danny: 'daniel',
  ben: 'benjamin',
  benny: 'benjamin',
  sam: 'samuel',
  matt: 'matthew',
  greg: 'gregory',
  jeff: 'jeffrey',
  steve: 'stephen',
  steven: 'stephen',
  andy: 'andrew',
  drew: 'andrew',
  charlie: 'charles',
  chuck: 'charles',
  frank: 'francis',
  hank: 'henry',
  harry: 'henry',
  jack: 'john',
  johnny: 'john',
  jon: 'jonathan',
  alex: 'alexander',
  xander: 'alexander',
  sandy: 'alexandra',
  liz: 'elizabeth',
  lizzy: 'elizabeth',
  beth: 'elizabeth',
  betsy: 'elizabeth',
  eliza: 'elizabeth',
  meg: 'margaret',
  maggie: 'margaret',
  peggy: 'margaret',
  greta: 'margaret',
  sue: 'susan',
  susie: 'susan',
  jenny: 'jennifer',
  jen: 'jennifer',
  becky: 'rebecca',
  becca: 'rebecca',
  abby: 'abigail',
  gabby: 'gabrielle',
  ellie: 'eleanor',
  nell: 'eleanor',
  nora: 'eleanor',
  vicky: 'victoria',
  tori: 'victoria',
  patty: 'patricia',
  trish: 'patricia',
  cindy: 'cynthia',
  debbie: 'deborah',
  jess: 'jessica',
  mandy: 'amanda',
  sandra: 'alexandra',
  tasha: 'natasha',
  dee: 'deirdre',
  addie: 'adaeze',
  ada: 'adaeze',
  priya: 'priya',
  fred: 'frederick',
  freddie: 'frederick',
  gus: 'augustus',
  lou: 'louis',
  marty: 'martin',
  ray: 'raymond',
  ron: 'ronald',
  russ: 'russell',
  sal: 'salvatore',
  vince: 'vincent',
  walt: 'walter',
  cam: 'camila',
  cammy: 'camila',
  mo: 'maureen',
  molly: 'mary',
  polly: 'mary',
  kwesi: 'kwame',
}

/** Lowercase, strip diacritics, collapse whitespace, drop punctuation. */
export function normalizeName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Comparison key: normalized with apostrophes and hyphens removed. */
function nameKey(value: string): string {
  return normalizeName(value).replace(/['-]/g, '')
}

/** Resolve a first name to its canonical form via the nickname map. */
export function canonicalFirstName(value: string): string {
  const normalized = normalizeName(value)
  const canonical = NICKNAMES[normalized] ?? normalized
  return canonical.replace(/['-]/g, '')
}

/* -------------------------------------------------------------------------- */
/* Store                                                                       */
/* -------------------------------------------------------------------------- */

export interface WeddingData {
  config: WeddingConfig
  events: WeddingEvent[]
  parties: Party[]
  guests: Guest[]
  meals: MealOption[]
  questions: CustomQuestion[]
  rsvps: PartyRsvp[]
  reminders: ReminderRule[]
  photos: GuestPhoto[]
  /**
   * The party matched in the RSVP flow this session. Powers the personalized
   * schedule ("these are your events") and the "not you?" reset.
   */
  lastMatchedPartyId: ID | null
}

export interface WeddingActions {
  submitRsvp: (submission: RsvpSubmission) => void
  rememberParty: (partyId: ID | null) => void

  addGuestToParty: (partyId: ID, guest: Partial<Guest> & { firstName: string; lastName: string }) => void
  updateGuest: (guestId: ID, patch: Partial<Omit<Guest, 'id' | 'partyId'>>) => void
  removeGuest: (guestId: ID) => void
  addParty: (label: string, plusOneAllowance?: number) => ID
  updateParty: (partyId: ID, patch: Partial<Omit<Party, 'id' | 'guestIds'>>) => void
  removeParty: (partyId: ID) => void
  setPartyAllowance: (partyId: ID, allowance: number) => void

  toggleReminder: (reminderId: ID) => void
  updateReminder: (reminderId: ID, patch: Partial<Omit<ReminderRule, 'id'>>) => void

  updateConfig: (patch: Partial<WeddingConfig>) => void
  updateEvent: (eventId: ID, patch: Partial<Omit<WeddingEvent, 'id'>>) => void
  addMeal: (meal: Omit<MealOption, 'id'>) => void
  updateMeal: (mealId: ID, patch: Partial<Omit<MealOption, 'id'>>) => void
  removeMeal: (mealId: ID) => void
  addQuestion: (question: Omit<CustomQuestion, 'id'>) => void
  updateQuestion: (questionId: ID, patch: Partial<Omit<CustomQuestion, 'id'>>) => void
  removeQuestion: (questionId: ID) => void

  addPhoto: (photo: Omit<GuestPhoto, 'id' | 'likes'> & { likes?: number }) => void
  toggleLikePhoto: (photoId: ID, liked: boolean) => void

  resetDemo: () => void
}

export type WeddingState = WeddingData & WeddingActions

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T

function freshData(): WeddingData {
  return {
    config: clone(seedConfig),
    events: clone(seedEvents),
    parties: clone(seedParties),
    guests: clone(seedGuests),
    meals: clone(seedMeals),
    questions: clone(seedQuestions),
    rsvps: clone(seedRsvps),
    reminders: clone(seedReminders),
    photos: clone(seedPhotos),
    lastMatchedPartyId: null,
  }
}

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

export const useWeddingStore = create<WeddingState>()(
  persist(
    (set) => ({
      ...freshData(),

      /* ---- the RSVP write path ------------------------------------------ */

      submitRsvp: (submission) =>
        set((state) => {
          const party = state.parties.find((p) => p.id === submission.partyId)
          if (!party) return {}

          // Plus-ones inherit the invitation of whoever they are attending with.
          const host = state.guests.find((g) => g.partyId === party.id && !g.isPlusOne)
          const inheritedEvents = host ? [...host.invitedEventIds] : []
          const inheritedTags = host ? [...host.tags] : []

          const keyMap = new Map<ID, ID>()
          const created: Guest[] = []
          const kept = new Set<ID>()
          const renamed = new Map<ID, { firstName: string; lastName: string }>()

          submission.plusOnes.forEach((input, index) => {
            const firstName = input.firstName.trim()
            const lastName = input.lastName.trim()
            if (!firstName || !lastName) return

            const existing = state.guests.find(
              (g) => g.id === input.key && g.partyId === party.id,
            )
            if (existing) {
              keyMap.set(input.key, existing.id)
              kept.add(existing.id)
              renamed.set(existing.id, { firstName, lastName })
              return
            }

            const id = `g-plus-${Date.now().toString(36)}-${index}-${Math.random()
              .toString(36)
              .slice(2, 6)}`
            keyMap.set(input.key, id)
            kept.add(id)
            created.push({
              id,
              partyId: party.id,
              firstName,
              lastName,
              isPlusOne: true,
              invitedEventIds: inheritedEvents,
              tags: inheritedTags,
            })
          })

          // A plus-one the guest removed on this pass stops existing.
          const dropped = new Set(
            state.guests
              .filter((g) => g.partyId === party.id && g.isPlusOne && !kept.has(g.id))
              .map((g) => g.id),
          )

          const guests: Guest[] = state.guests
            .filter((g) => !dropped.has(g.id))
            .map((g) => {
              const rename = renamed.get(g.id)
              return rename ? { ...g, ...rename } : g
            })
            .concat(created)

          const resolve = (id: ID): ID => keyMap.get(id) ?? id
          const live = new Set(guests.map((g) => g.id))

          const rsvp: PartyRsvp = {
            partyId: party.id,
            submittedAt: new Date().toISOString(),
            attendance: submission.attendance
              .map((a) => ({ ...a, guestId: resolve(a.guestId) }))
              .filter((a) => live.has(a.guestId)),
            meals: submission.meals
              .map((m) => ({
                ...m,
                guestId: resolve(m.guestId),
                dietaryNotes: m.dietaryNotes.trim(),
              }))
              .filter((m) => live.has(m.guestId)),
            custom: submission.custom
              .map((c) => ({
                ...c,
                guestId: c.guestId ? resolve(c.guestId) : undefined,
                value: c.value.trim(),
              }))
              .filter((c) => (c.guestId ? live.has(c.guestId) : true))
              .filter((c) => c.value !== ''),
            noteToCouple: submission.noteToCouple?.trim() || undefined,
          }

          const parties = state.parties.map((p) =>
            p.id === party.id
              ? { ...p, guestIds: guests.filter((g) => g.partyId === p.id).map((g) => g.id) }
              : p,
          )

          const exists = state.rsvps.some((r) => r.partyId === party.id)
          const rsvps = exists
            ? state.rsvps.map((r) => (r.partyId === party.id ? rsvp : r))
            : [...state.rsvps, rsvp]

          return { guests, parties, rsvps, lastMatchedPartyId: party.id }
        }),

      rememberParty: (partyId) => set({ lastMatchedPartyId: partyId }),

      /* ---- guests & parties --------------------------------------------- */

      addGuestToParty: (partyId, guest) =>
        set((state) => {
          const party = state.parties.find((p) => p.id === partyId)
          if (!party) return {}
          const sibling = state.guests.find((g) => g.partyId === partyId && !g.isPlusOne)
          const id = uid('g')
          const next: Guest = {
            id,
            partyId,
            firstName: guest.firstName.trim(),
            lastName: guest.lastName.trim(),
            email: guest.email,
            isChild: guest.isChild,
            isPlusOne: guest.isPlusOne,
            invitedEventIds:
              guest.invitedEventIds ?? sibling?.invitedEventIds ?? state.events.map((e) => e.id),
            tags: guest.tags ?? sibling?.tags ?? [],
          }
          return {
            guests: [...state.guests, next],
            parties: state.parties.map((p) =>
              p.id === partyId ? { ...p, guestIds: [...p.guestIds, id] } : p,
            ),
          }
        }),

      updateGuest: (guestId, patch) =>
        set((state) => ({
          guests: state.guests.map((g) => (g.id === guestId ? { ...g, ...patch } : g)),
        })),

      removeGuest: (guestId) =>
        set((state) => ({
          guests: state.guests.filter((g) => g.id !== guestId),
          parties: state.parties.map((p) => ({
            ...p,
            guestIds: p.guestIds.filter((id) => id !== guestId),
          })),
          rsvps: state.rsvps.map((r) => ({
            ...r,
            attendance: r.attendance.filter((a) => a.guestId !== guestId),
            meals: r.meals.filter((m) => m.guestId !== guestId),
            custom: r.custom.filter((c) => c.guestId !== guestId),
          })),
        })),

      addParty: (label, plusOneAllowance = 0) => {
        const id = uid('party')
        set((state) => ({
          parties: [...state.parties, { id, label: label.trim(), guestIds: [], plusOneAllowance }],
        }))
        return id
      },

      updateParty: (partyId, patch) =>
        set((state) => ({
          parties: state.parties.map((p) => (p.id === partyId ? { ...p, ...patch } : p)),
        })),

      removeParty: (partyId) =>
        set((state) => ({
          parties: state.parties.filter((p) => p.id !== partyId),
          guests: state.guests.filter((g) => g.partyId !== partyId),
          rsvps: state.rsvps.filter((r) => r.partyId !== partyId),
          lastMatchedPartyId:
            state.lastMatchedPartyId === partyId ? null : state.lastMatchedPartyId,
        })),

      setPartyAllowance: (partyId, allowance) =>
        set((state) => ({
          parties: state.parties.map((p) =>
            p.id === partyId ? { ...p, plusOneAllowance: Math.max(0, Math.trunc(allowance)) } : p,
          ),
        })),

      /* ---- reminders ----------------------------------------------------- */

      toggleReminder: (reminderId) =>
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === reminderId ? { ...r, enabled: !r.enabled } : r,
          ),
        })),

      updateReminder: (reminderId, patch) =>
        set((state) => ({
          reminders: state.reminders.map((r) => (r.id === reminderId ? { ...r, ...patch } : r)),
        })),

      /* ---- settings ------------------------------------------------------ */

      updateConfig: (patch) => set((state) => ({ config: { ...state.config, ...patch } })),

      updateEvent: (eventId, patch) =>
        set((state) => ({
          events: state.events.map((e) => (e.id === eventId ? { ...e, ...patch } : e)),
        })),

      addMeal: (meal) =>
        set((state) => ({ meals: [...state.meals, { ...meal, id: uid('meal') }] })),

      updateMeal: (mealId, patch) =>
        set((state) => ({
          meals: state.meals.map((m) => (m.id === mealId ? { ...m, ...patch } : m)),
        })),

      removeMeal: (mealId) =>
        set((state) => ({
          meals: state.meals.filter((m) => m.id !== mealId),
          rsvps: state.rsvps.map((r) => ({
            ...r,
            meals: r.meals.map((m) => (m.mealId === mealId ? { ...m, mealId: null } : m)),
          })),
        })),

      addQuestion: (question) =>
        set((state) => ({
          questions: [...state.questions, { ...question, id: uid('q') }],
        })),

      updateQuestion: (questionId, patch) =>
        set((state) => ({
          questions: state.questions.map((q) => (q.id === questionId ? { ...q, ...patch } : q)),
        })),

      removeQuestion: (questionId) =>
        set((state) => ({
          questions: state.questions.filter((q) => q.id !== questionId),
          rsvps: state.rsvps.map((r) => ({
            ...r,
            custom: r.custom.filter((c) => c.questionId !== questionId),
          })),
        })),

      /* ---- photo wall ---------------------------------------------------- */

      addPhoto: (photo) =>
        set((state) => ({
          photos: [
            { ...photo, id: uid('photo'), likes: photo.likes ?? 0, userAdded: true },
            ...state.photos,
          ],
        })),

      toggleLikePhoto: (photoId, liked) =>
        set((state) => ({
          photos: state.photos.map((p) =>
            p.id === photoId ? { ...p, likes: Math.max(0, p.likes + (liked ? 1 : -1)) } : p,
          ),
        })),

      /* ---- demo ----------------------------------------------------------- */

      resetDemo: () => set(freshData()),
    }),
    {
      name: 'everafter-store',
      // 3: real couple photography replaces the stock hero and photo wall.
      version: 3,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): WeddingData => ({
        config: state.config,
        events: state.events,
        parties: state.parties,
        guests: state.guests,
        meals: state.meals,
        questions: state.questions,
        rsvps: state.rsvps,
        reminders: state.reminders,
        photos: state.photos,
        lastMatchedPartyId: state.lastMatchedPartyId,
      }),
      // Any older shape is thrown away in favour of the current seed — this is
      // a demo, not a migration surface.
      migrate: () => freshData(),
    },
  ),
)

/* -------------------------------------------------------------------------- */
/* Shared predicates                                                           */
/* -------------------------------------------------------------------------- */

export function guestFullName(guest: Pick<Guest, 'firstName' | 'lastName'>): string {
  return `${guest.firstName} ${guest.lastName}`.trim()
}

/** True when the event's tag gate lets this guest see it. */
export function isEventVisibleToGuest(event: WeddingEvent, guest: Guest): boolean {
  if (event.visibleToTags === 'all') return true
  return event.visibleToTags.some((tag) => guest.tags.includes(tag))
}

/** True when the guest is on the list for this event *and* can see it. */
export function isGuestInvitedTo(event: WeddingEvent, guest: Guest): boolean {
  return guest.invitedEventIds.includes(event.id) && isEventVisibleToGuest(event, guest)
}

export function guestsOfParty(state: WeddingData, partyId: ID): Guest[] {
  return state.guests.filter((g) => g.partyId === partyId)
}

export function partyOfGuest(state: WeddingData, guestId: ID): Party | null {
  const guest = state.guests.find((g) => g.id === guestId)
  if (!guest) return null
  return state.parties.find((p) => p.id === guest.partyId) ?? null
}

/** Every event this guest is actually invited to, in schedule order. */
export function eventsForGuest(state: WeddingData, guest: Guest): WeddingEvent[] {
  return sortEvents(state.events.filter((e) => isGuestInvitedTo(e, guest)))
}

/** The union of events anyone in the party is invited to. */
export function eventsForParty(state: WeddingData, partyId: ID): WeddingEvent[] {
  const members = guestsOfParty(state, partyId)
  return sortEvents(state.events.filter((e) => members.some((g) => isGuestInvitedTo(e, g))))
}

/** Events the RSVP flow must ask about for this party. */
export function rsvpEventsForParty(state: WeddingData, partyId: ID): WeddingEvent[] {
  return eventsForParty(state, partyId).filter((e) => e.requiresRsvp)
}

export function sortEvents(events: WeddingEvent[]): WeddingEvent[] {
  return [...events].sort((a, b) =>
    `${a.dateISO}T${a.startTime}`.localeCompare(`${b.dateISO}T${b.startTime}`),
  )
}

export function rsvpForParty(state: WeddingData, partyId: ID): PartyRsvp | null {
  return state.rsvps.find((r) => r.partyId === partyId) ?? null
}

/* -------------------------------------------------------------------------- */
/* Selectors                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Find a household by the name printed on the invitation.
 *
 * Privacy rule, non-negotiable: this returns exactly one party or null. It
 * never returns a candidate list, never partial-matches a bare surname, and
 * never leaks the existence of any other guest. If the input is ambiguous
 * across parties, the answer is null and the guest sees the warm retry copy.
 */
export function lookupParty(state: WeddingData, first: string, last: string): Party | null {
  const firstCanonical = canonicalFirstName(first)
  const lastCanonical = nameKey(last)
  if (!firstCanonical || !lastCanonical) return null

  const strict = state.config.strictNameMatching

  const matches = state.guests.filter((guest) => {
    if (nameKey(guest.lastName) !== lastCanonical) return false
    const guestFirst = canonicalFirstName(guest.firstName)
    if (guestFirst === firstCanonical) return true
    if (strict) return false
    // Relaxed matching still requires the surname; it only forgives a first
    // name typed as an initial or a shortened form of the same name.
    return (
      guestFirst.startsWith(firstCanonical) ||
      firstCanonical.startsWith(guestFirst) ||
      guestFirst.charAt(0) === firstCanonical.charAt(0)
    )
  })

  if (matches.length === 0) return null

  const partyIds = new Set(matches.map((g) => g.partyId))
  if (partyIds.size !== 1) return null

  const [partyId] = [...partyIds]
  return state.parties.find((p) => p.id === partyId) ?? null
}

export interface EventStats {
  invited: number
  attending: number
  declined: number
  pending: number
}

export function eventStats(state: WeddingData, eventId: ID): EventStats {
  const event = state.events.find((e) => e.id === eventId)
  if (!event) return { invited: 0, attending: 0, declined: 0, pending: 0 }

  const invited = state.guests.filter((g) => isGuestInvitedTo(event, g))
  let attending = 0
  let declined = 0

  for (const guest of invited) {
    const rsvp = state.rsvps.find((r) => r.partyId === guest.partyId)
    const answer = rsvp?.attendance.find((a) => a.guestId === guest.id && a.eventId === eventId)
    if (!answer) continue
    if (answer.attending) attending += 1
    else declined += 1
  }

  return {
    invited: invited.length,
    attending,
    declined,
    pending: invited.length - attending - declined,
  }
}

/** True when this guest is down as attending at least one meal-bearing event. */
export function guestAttendsAMeal(state: WeddingData, guestId: ID): boolean {
  const guest = state.guests.find((g) => g.id === guestId)
  if (!guest) return false
  const rsvp = rsvpForParty(state, guest.partyId)
  if (!rsvp) return false
  return state.events.some(
    (e) =>
      e.hasMeal &&
      rsvp.attendance.some((a) => a.guestId === guestId && a.eventId === e.id && a.attending),
  )
}

export interface MealCounts {
  rows: { meal: MealOption; count: number }[]
  /** Attending guests with no meal recorded — the caterer's loose ends. */
  unselected: number
  total: number
}

export function mealCounts(state: WeddingData): MealCounts {
  const counts = new Map<ID, number>(state.meals.map((m) => [m.id, 0]))
  let unselected = 0
  let total = 0

  for (const guest of state.guests) {
    if (!guestAttendsAMeal(state, guest.id)) continue
    total += 1
    const rsvp = rsvpForParty(state, guest.partyId)
    const answer = rsvp?.meals.find((m) => m.guestId === guest.id)
    if (answer?.mealId && counts.has(answer.mealId)) {
      counts.set(answer.mealId, (counts.get(answer.mealId) ?? 0) + 1)
    } else {
      unselected += 1
    }
  }

  return {
    rows: state.meals.map((meal) => ({ meal, count: counts.get(meal.id) ?? 0 })),
    unselected,
    total,
  }
}

export interface AllergyEntry {
  guestId: ID
  name: string
  partyLabel: string
  meal: string
  notes: string
}

/** Every dietary note attached to someone who is actually coming to dinner. */
export function allergyList(state: WeddingData): AllergyEntry[] {
  const entries: AllergyEntry[] = []

  for (const rsvp of state.rsvps) {
    const party = state.parties.find((p) => p.id === rsvp.partyId)
    for (const answer of rsvp.meals) {
      const notes = answer.dietaryNotes.trim()
      if (!notes) continue
      const guest = state.guests.find((g) => g.id === answer.guestId)
      if (!guest) continue
      if (!guestAttendsAMeal(state, guest.id)) continue
      entries.push({
        guestId: guest.id,
        name: guestFullName(guest),
        partyLabel: party?.label ?? '',
        meal: state.meals.find((m) => m.id === answer.mealId)?.name ?? 'No meal chosen',
        notes,
      })
    }
  }

  return entries.sort((a, b) => a.name.localeCompare(b.name))
}

/** Parties who have not replied at all. */
export function pendingParties(state: WeddingData): Party[] {
  const replied = new Set(state.rsvps.map((r) => r.partyId))
  return state.parties.filter((p) => {
    if (replied.has(p.id)) return false
    return rsvpEventsForParty(state, p.id).length > 0
  })
}

/** Parties who replied but left an invited person unanswered on some event. */
export function incompleteParties(state: WeddingData): Party[] {
  return state.parties.filter((party) => {
    const rsvp = rsvpForParty(state, party.id)
    if (!rsvp) return false
    return guestsOfParty(state, party.id).some((guest) =>
      state.events.some(
        (event) =>
          event.requiresRsvp &&
          isGuestInvitedTo(event, guest) &&
          !rsvp.attendance.some((a) => a.guestId === guest.id && a.eventId === event.id),
      ),
    )
  })
}

/** One flat row per person, ready to hand a vendor. */
export function vendorRows(state: WeddingData): VendorRow[] {
  const orderedEvents = sortEvents(state.events)

  return state.guests.map((guest) => {
    const party = state.parties.find((p) => p.id === guest.partyId)
    const rsvp = rsvpForParty(state, guest.partyId)
    const mealAnswer = rsvp?.meals.find((m) => m.guestId === guest.id)

    const events: Record<string, string> = {}
    for (const event of orderedEvents) {
      if (!isGuestInvitedTo(event, guest)) {
        events[event.name] = '—'
        continue
      }
      const answer = rsvp?.attendance.find(
        (a) => a.guestId === guest.id && a.eventId === event.id,
      )
      events[event.name] = !answer ? 'Pending' : answer.attending ? 'Attending' : 'Declined'
    }

    return {
      partyLabel: party?.label ?? '',
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email ?? '',
      tags: guest.tags.join(' | '),
      isChild: Boolean(guest.isChild),
      isPlusOne: Boolean(guest.isPlusOne),
      events,
      meal: state.meals.find((m) => m.id === mealAnswer?.mealId)?.name ?? '',
      dietaryNotes: mealAnswer?.dietaryNotes ?? '',
      respondedOn: rsvp?.submittedAt ?? '',
    }
  })
}

/** Whole-wedding headline numbers. */
export function overallStats(state: WeddingData) {
  const totalParties = state.parties.length
  const pending = pendingParties(state).length
  return {
    totalParties,
    totalGuests: state.guests.length,
    repliedParties: totalParties - pending,
    pendingParties: pending,
  }
}
