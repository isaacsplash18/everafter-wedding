/**
 * RSVP flow — pure model.
 *
 * The flow never talks to the store directly except to read a snapshot and to
 * submit. Everything between is derived here so each step component can stay
 * a thin renderer.
 *
 * Central idea: a *member* is a person in the flow, whether they already exist
 * as a Guest or are a plus-one the guest is naming right now. Every answer is
 * keyed by member, never by household.
 */

import type {
  CustomQuestion,
  Guest,
  ID,
  MealOption,
  PartyRsvp,
  RsvpSubmission,
  WeddingEvent,
} from '../../../data/types'
import { sortEvents, type WeddingData } from '../../../lib/store'

export type StepId = 'find' | 'party' | 'attendance' | 'meals' | 'questions' | 'review'

export const STEP_TITLES: Record<StepId, string> = {
  find: 'Find your invitation',
  party: 'Your party',
  attendance: 'Will you be there?',
  meals: 'At the table',
  questions: 'A few last things',
  review: 'Review & seal',
}

/** A person in the flow. `key` is a Guest id, or `tmp:n` for a new plus-one. */
export interface Member {
  key: string
  /** null until a plus-one has been written into the store. */
  guestId: ID | null
  firstName: string
  lastName: string
  fullName: string
  isChild: boolean
  isPlusOne: boolean
  tags: string[]
  invitedEventIds: ID[]
}

export interface PlusOneDraft {
  key: string
  firstName: string
  lastName: string
}

export interface RsvpDraft {
  plusOnes: PlusOneDraft[]
  /** `${memberKey}::${eventId}` -> attending */
  attendance: Record<string, boolean>
  /** `${memberKey}` -> meal choice + notes */
  meals: Record<string, { mealId: string; dietaryNotes: string }>
  /** `${questionId}` or `${questionId}::${memberKey}` -> answer */
  custom: Record<string, string>
  note: string
}

export const emptyDraft = (): RsvpDraft => ({
  plusOnes: [],
  attendance: {},
  meals: {},
  custom: {},
  note: '',
})

export const attendanceKey = (memberKey: string, eventId: ID) => `${memberKey}::${eventId}`
export const questionKey = (questionId: ID, memberKey?: string) =>
  memberKey ? `${questionId}::${memberKey}` : questionId

export const newPlusOneKey = (index: number) => `tmp:${index}:${Math.random().toString(36).slice(2, 7)}`

/* -------------------------------------------------------------------------- */
/* Members                                                                     */
/* -------------------------------------------------------------------------- */

function memberFromGuest(guest: Guest): Member {
  return {
    key: guest.id,
    guestId: guest.id,
    firstName: guest.firstName,
    lastName: guest.lastName,
    fullName: `${guest.firstName} ${guest.lastName}`.trim(),
    isChild: Boolean(guest.isChild),
    isPlusOne: Boolean(guest.isPlusOne),
    tags: guest.tags,
    invitedEventIds: guest.invitedEventIds,
  }
}

/**
 * Existing guests first, then any plus-one being named in this session.
 * A plus-one inherits the invitation of the person they are coming with.
 */
export function buildMembers(
  state: WeddingData,
  partyId: ID,
  plusOnes: PlusOneDraft[],
): Member[] {
  const guests = state.guests.filter((g) => g.partyId === partyId)
  const host = guests.find((g) => !g.isPlusOne)

  // A plus-one already on file can be renamed in this session; the draft wins.
  const existing = guests.map((guest) => {
    const member = memberFromGuest(guest)
    const edited = plusOnes.find((p) => p.key === guest.id)
    if (!edited) return member
    return {
      ...member,
      firstName: edited.firstName,
      lastName: edited.lastName,
      fullName: `${edited.firstName} ${edited.lastName}`.trim() || member.fullName,
    }
  })

  const drafted = plusOnes
    .filter((p) => !guests.some((g) => g.id === p.key))
    .map<Member>((p) => ({
      key: p.key,
      guestId: null,
      firstName: p.firstName,
      lastName: p.lastName,
      fullName: `${p.firstName} ${p.lastName}`.trim() || 'Your guest',
      isChild: false,
      isPlusOne: true,
      tags: host?.tags ?? [],
      invitedEventIds: host?.invitedEventIds ?? [],
    }))

  return [...existing, ...drafted]
}

/** Members already stored as plus-ones — editable, removable, not duplicated. */
export function existingPlusOnes(state: WeddingData, partyId: ID): PlusOneDraft[] {
  return state.guests
    .filter((g) => g.partyId === partyId && g.isPlusOne)
    .map((g) => ({ key: g.id, firstName: g.firstName, lastName: g.lastName }))
}

/** How many more people this party may name. */
export function remainingAllowance(
  state: WeddingData,
  partyId: ID,
  plusOnes: PlusOneDraft[],
): number {
  const party = state.parties.find((p) => p.id === partyId)
  if (!party) return 0
  return Math.max(0, party.plusOneAllowance - plusOnes.length)
}

/* -------------------------------------------------------------------------- */
/* Events                                                                      */
/* -------------------------------------------------------------------------- */

/** On the list for this event, and allowed to see it. */
export function isMemberInvitedTo(event: WeddingEvent, member: Member): boolean {
  if (!member.invitedEventIds.includes(event.id)) return false
  if (event.visibleToTags === 'all') return true
  return event.visibleToTags.some((tag) => member.tags.includes(tag))
}

/** Events that need an answer from this specific person. */
export function rsvpEventsForMember(events: WeddingEvent[], member: Member): WeddingEvent[] {
  return sortEvents(events.filter((e) => e.requiresRsvp && isMemberInvitedTo(e, member)))
}

/** Every event anyone in the party must answer for, in schedule order. */
export function rsvpEventsForMembers(
  events: WeddingEvent[],
  members: Member[],
): WeddingEvent[] {
  const ids = new Set<ID>()
  for (const member of members) {
    for (const event of rsvpEventsForMember(events, member)) ids.add(event.id)
  }
  return sortEvents(events.filter((e) => ids.has(e.id)))
}

/** Members who accepted at least one event. */
export function attendingMembers(
  members: Member[],
  events: WeddingEvent[],
  draft: RsvpDraft,
): Member[] {
  return members.filter((member) =>
    rsvpEventsForMember(events, member).some(
      (event) => draft.attendance[attendanceKey(member.key, event.id)] === true,
    ),
  )
}

/** Members who must choose a dish. */
export function mealMembers(
  members: Member[],
  events: WeddingEvent[],
  draft: RsvpDraft,
): Member[] {
  const mealEvents = events.filter((e) => e.hasMeal)
  if (mealEvents.length === 0) return []
  return members.filter((member) =>
    mealEvents.some((event) => draft.attendance[attendanceKey(member.key, event.id)] === true),
  )
}

/* -------------------------------------------------------------------------- */
/* Questions                                                                   */
/* -------------------------------------------------------------------------- */

export interface QuestionInstance {
  key: string
  question: CustomQuestion
  /** Present for per-guest questions. */
  member: Member | null
}

function memberMatchesTags(member: Member, targetTags?: string[]): boolean {
  if (!targetTags || targetTags.length === 0) return true
  return targetTags.some((tag) => member.tags.includes(tag))
}

/**
 * Only ask what is relevant: questions are filtered by tag, and per-guest ones
 * repeat for each attending person who carries the tag.
 */
export function questionInstances(
  questions: CustomQuestion[],
  members: Member[],
  events: WeddingEvent[],
  draft: RsvpDraft,
): QuestionInstance[] {
  const coming = attendingMembers(members, events, draft)
  if (coming.length === 0) return []

  const instances: QuestionInstance[] = []

  for (const question of questions) {
    const eligible = coming.filter((member) => memberMatchesTags(member, question.targetTags))
    if (eligible.length === 0) continue

    if (question.perGuest) {
      for (const member of eligible) {
        instances.push({ key: questionKey(question.id, member.key), question, member })
      }
    } else {
      instances.push({ key: questionKey(question.id), question, member: null })
    }
  }

  return instances
}

/* -------------------------------------------------------------------------- */
/* Steps                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * The meals step disappears when nobody is eating; the questions step always
 * stays, because it also carries the note to the couple.
 */
export function activeSteps(hasMealStep: boolean): StepId[] {
  const steps: StepId[] = ['find', 'party', 'attendance']
  if (hasMealStep) steps.push('meals')
  steps.push('questions', 'review')
  return steps
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                  */
/* -------------------------------------------------------------------------- */

export interface StepErrors {
  /** Keyed by field/member/event so each control can show its own message. */
  fields: Record<string, string>
  /** One sentence summarising what is missing, for the live region. */
  summary: string
}

const ok: StepErrors = { fields: {}, summary: '' }

export function validateParty(plusOnes: PlusOneDraft[]): StepErrors {
  const fields: Record<string, string> = {}
  for (const plusOne of plusOnes) {
    if (!plusOne.firstName.trim()) fields[`${plusOne.key}:first`] = 'Please add a first name.'
    if (!plusOne.lastName.trim()) fields[`${plusOne.key}:last`] = 'Please add a last name.'
  }
  const count = Object.keys(fields).length
  return count === 0
    ? ok
    : {
        fields,
        summary:
          'We need the full name of everyone you are bringing — no anonymous plus-ones on the place cards.',
      }
}

export function validateAttendance(
  members: Member[],
  events: WeddingEvent[],
  draft: RsvpDraft,
): StepErrors {
  const fields: Record<string, string> = {}
  for (const member of members) {
    for (const event of rsvpEventsForMember(events, member)) {
      const key = attendanceKey(member.key, event.id)
      if (draft.attendance[key] === undefined) {
        fields[key] = 'Please choose one.'
      }
    }
  }
  const missing = Object.keys(fields).length
  return missing === 0
    ? ok
    : {
        fields,
        summary:
          missing === 1
            ? 'One answer is still missing — please reply for every person and every event.'
            : `${missing} answers are still missing — please reply for every person and every event.`,
      }
}

export function validateMeals(
  members: Member[],
  events: WeddingEvent[],
  draft: RsvpDraft,
): StepErrors {
  const fields: Record<string, string> = {}
  for (const member of mealMembers(members, events, draft)) {
    if (!draft.meals[member.key]?.mealId) {
      fields[member.key] = 'Please choose a dish.'
    }
  }
  const missing = Object.keys(fields).length
  return missing === 0
    ? ok
    : {
        fields,
        summary:
          missing === 1
            ? 'One person still needs a dish chosen.'
            : `${missing} people still need a dish chosen.`,
      }
}

/* -------------------------------------------------------------------------- */
/* Prefill & submission                                                        */
/* -------------------------------------------------------------------------- */

/** Rebuild a draft from a reply already on file, so editing feels continuous. */
export function draftFromRsvp(rsvp: PartyRsvp | null, plusOnes: PlusOneDraft[]): RsvpDraft {
  const draft = emptyDraft()
  draft.plusOnes = plusOnes
  if (!rsvp) return draft

  for (const answer of rsvp.attendance) {
    draft.attendance[attendanceKey(answer.guestId, answer.eventId)] = answer.attending
  }
  for (const meal of rsvp.meals) {
    draft.meals[meal.guestId] = {
      mealId: meal.mealId ?? '',
      dietaryNotes: meal.dietaryNotes ?? '',
    }
  }
  for (const answer of rsvp.custom) {
    draft.custom[questionKey(answer.questionId, answer.guestId)] = answer.value
  }
  draft.note = rsvp.noteToCouple ?? ''
  return draft
}

export function toSubmission(
  partyId: ID,
  members: Member[],
  events: WeddingEvent[],
  draft: RsvpDraft,
): RsvpSubmission {
  const attendance = members.flatMap((member) =>
    rsvpEventsForMember(events, member)
      .filter((event) => draft.attendance[attendanceKey(member.key, event.id)] !== undefined)
      .map((event) => ({
        guestId: member.key,
        eventId: event.id,
        attending: draft.attendance[attendanceKey(member.key, event.id)],
      })),
  )

  const meals = mealMembers(members, events, draft).map((member) => ({
    guestId: member.key,
    mealId: draft.meals[member.key]?.mealId || null,
    dietaryNotes: draft.meals[member.key]?.dietaryNotes ?? '',
  }))

  const custom = Object.entries(draft.custom)
    .filter(([, value]) => value.trim() !== '')
    .map(([key, value]) => {
      const [questionId, memberKey] = key.split('::')
      return memberKey
        ? { questionId, guestId: memberKey, value }
        : { questionId, value }
    })

  return {
    partyId,
    plusOnes: draft.plusOnes
      .map((p) => ({
        key: p.key,
        firstName: p.firstName.trim(),
        lastName: p.lastName.trim(),
      }))
      .filter((p) => p.firstName && p.lastName),
    attendance,
    meals,
    custom,
    noteToCouple: draft.note.trim() || undefined,
  }
}

/* -------------------------------------------------------------------------- */
/* Review helpers                                                              */
/* -------------------------------------------------------------------------- */

export interface PersonSummary {
  member: Member
  events: { event: WeddingEvent; attending: boolean | undefined }[]
  meal: MealOption | null
  dietaryNotes: string
  answers: { prompt: string; value: string }[]
}

export function reviewSummary(
  members: Member[],
  events: WeddingEvent[],
  meals: MealOption[],
  questions: CustomQuestion[],
  draft: RsvpDraft,
): PersonSummary[] {
  return members.map((member) => {
    const memberEvents = rsvpEventsForMember(events, member).map((event) => ({
      event,
      attending: draft.attendance[attendanceKey(member.key, event.id)],
    }))

    const mealChoice = draft.meals[member.key]
    const meal = meals.find((m) => m.id === mealChoice?.mealId) ?? null

    const answers = questions
      .filter((q) => q.perGuest)
      .map((question) => ({
        prompt: question.prompt,
        value: draft.custom[questionKey(question.id, member.key)] ?? '',
      }))
      .filter((entry) => entry.value.trim() !== '')

    return {
      member,
      events: memberEvents,
      meal,
      dietaryNotes: mealChoice?.dietaryNotes ?? '',
      answers,
    }
  })
}

/** Party-wide answers, shown once under the per-person blocks. */
export function partyAnswers(
  questions: CustomQuestion[],
  draft: RsvpDraft,
): { prompt: string; value: string }[] {
  return questions
    .filter((q) => !q.perGuest)
    .map((question) => ({
      prompt: question.prompt,
      value: draft.custom[questionKey(question.id)] ?? '',
    }))
    .filter((entry) => entry.value.trim() !== '')
}
