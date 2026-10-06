/**
 * Everafter — the RSVP flow.
 *
 * Six steps, one household, per-person truth throughout. GSAP drives the step
 * transitions (out left, in from the right, ~0.45s end to end) and a honey rule
 * tracks progress. Every animation is gated behind `prefers-reduced-motion`,
 * and no content is ever hidden waiting for a tween to run.
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { Button, ProgressRule, buttonClass } from '../../../components/ui'
import { formatDate, formatShortDate, isDeadlinePassed } from '../../../lib/format'
import { stepIn, stepOut, useReducedMotion } from '../../../lib/motion'
import {
  lookupParty,
  rsvpForParty,
  sortEvents,
  useWeddingStore,
  type WeddingData,
} from '../../../lib/store'
import type { ID, WeddingEvent } from '../../../data/types'

import {
  STEP_TITLES,
  activeSteps,
  attendanceKey,
  attendingMembers,
  buildMembers,
  draftFromRsvp,
  emptyDraft,
  existingPlusOnes,
  mealMembers,
  newPlusOneKey,
  partyAnswers,
  questionInstances,
  reviewSummary,
  rsvpEventsForMember,
  rsvpEventsForMembers,
  toSubmission,
  validateAttendance,
  validateMeals,
  validateParty,
  type RsvpDraft,
  type StepErrors,
  type StepId,
} from './model'
import StepFind from './steps/StepFind'
import StepParty from './steps/StepParty'
import StepAttendance from './steps/StepAttendance'
import StepMeals from './steps/StepMeals'
import StepQuestions from './steps/StepQuestions'
import StepReview from './steps/StepReview'
import Confirmation from './steps/Confirmation'

const NO_ERRORS: StepErrors = { fields: {}, summary: '' }

/** Drop every answer belonging to a member who is no longer in the party. */
function purgeMember(draft: RsvpDraft, memberKey: string): RsvpDraft {
  const attendance: RsvpDraft['attendance'] = {}
  for (const [key, value] of Object.entries(draft.attendance)) {
    if (!key.startsWith(`${memberKey}::`)) attendance[key] = value
  }

  const meals: RsvpDraft['meals'] = { ...draft.meals }
  delete meals[memberKey]

  const custom: RsvpDraft['custom'] = {}
  for (const [key, value] of Object.entries(draft.custom)) {
    if (!key.endsWith(`::${memberKey}`)) custom[key] = value
  }

  return { ...draft, attendance, meals, custom }
}

interface SealedSnapshot {
  names: string[]
  events: WeddingEvent[]
}

export default function RsvpPage() {
  const config = useWeddingStore((s) => s.config)
  const events = useWeddingStore((s) => s.events)
  const parties = useWeddingStore((s) => s.parties)
  const guests = useWeddingStore((s) => s.guests)
  const meals = useWeddingStore((s) => s.meals)
  const questions = useWeddingStore((s) => s.questions)
  const rsvps = useWeddingStore((s) => s.rsvps)
  const submitRsvp = useWeddingStore((s) => s.submitRsvp)
  const rememberParty = useWeddingStore((s) => s.rememberParty)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [lookupFailed, setLookupFailed] = useState(false)
  const [partyId, setPartyId] = useState<ID | null>(null)
  const [draft, setDraft] = useState<RsvpDraft>(emptyDraft)
  const [stepId, setStepId] = useState<StepId>('find')
  const [renderedStep, setRenderedStep] = useState<StepId>('find')
  const [errors, setErrors] = useState<StepErrors>(NO_ERRORS)
  const [sealed, setSealed] = useState<SealedSnapshot | null>(null)

  const reduced = useReducedMotion()
  const paneRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const directionRef = useRef(1)
  const mountedRef = useRef(false)

  const closed = isDeadlinePassed(config.rsvpDeadlineISO)

  /* ---- derived ---------------------------------------------------------- */

  // A minimal snapshot for the pure model helpers.
  const snapshot = useMemo<WeddingData>(
    () => ({
      config,
      events,
      parties,
      guests,
      meals,
      questions,
      rsvps,
      reminders: [],
      photos: [],
      lastMatchedPartyId: partyId,
    }),
    [config, events, parties, guests, meals, questions, rsvps, partyId],
  )

  const party = partyId ? (parties.find((p) => p.id === partyId) ?? null) : null

  const members = useMemo(
    () => (partyId ? buildMembers(snapshot, partyId, draft.plusOnes) : []),
    [snapshot, partyId, draft.plusOnes],
  )

  const partyEvents = useMemo(() => rsvpEventsForMembers(events, members), [events, members])
  const diners = useMemo(() => mealMembers(members, events, draft), [members, events, draft])
  const coming = useMemo(() => attendingMembers(members, events, draft), [members, events, draft])
  const instances = useMemo(
    () => questionInstances(questions, members, events, draft),
    [questions, members, events, draft],
  )

  const steps = useMemo(() => activeSteps(diners.length > 0), [diners.length])
  const rawIndex = steps.indexOf(stepId)
  const stepIndex = rawIndex === -1 ? 0 : rawIndex
  const existingRsvp = partyId ? rsvpForParty(snapshot, partyId) : null

  /* ---- step transitions ------------------------------------------------- */

  useEffect(() => {
    if (stepId === renderedStep) return
    const pane = paneRef.current
    if (!pane || reduced) {
      setRenderedStep(stepId)
      return
    }
    const timeline = stepOut(pane, { reduced, direction: directionRef.current })
    if (!timeline) {
      setRenderedStep(stepId)
      return
    }
    timeline.eventCallback('onComplete', () => setRenderedStep(stepId))
    return () => {
      timeline.kill()
    }
  }, [stepId, renderedStep, reduced])

  useLayoutEffect(() => {
    const pane = paneRef.current
    if (!pane) return
    const timeline = stepIn(pane, { reduced, direction: directionRef.current })
    return () => {
      timeline?.kill()
    }
  }, [renderedStep, reduced])

  // Move focus to the new step's heading, but never on first paint.
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    headingRef.current?.focus()
    rootRef.current?.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' })
  }, [renderedStep, reduced])

  /* ---- handlers --------------------------------------------------------- */

  const goTo = (next: StepId, direction: 1 | -1) => {
    directionRef.current = direction
    setErrors(NO_ERRORS)
    setStepId(next)
  }

  const handleFind = () => {
    const fields: Record<string, string> = {}
    if (!firstName.trim()) fields.firstName = 'Please add your first name.'
    if (!lastName.trim()) fields.lastName = 'Please add your last name.'
    if (Object.keys(fields).length > 0) {
      setErrors({ fields, summary: 'We need both names to find your invitation.' })
      setLookupFailed(false)
      return
    }

    const state = useWeddingStore.getState()
    const match = lookupParty(state, firstName, lastName)
    if (!match) {
      setLookupFailed(true)
      setErrors(NO_ERRORS)
      return
    }

    setLookupFailed(false)
    setPartyId(match.id)
    setDraft(draftFromRsvp(rsvpForParty(state, match.id), existingPlusOnes(state, match.id)))
    rememberParty(match.id)
    goTo('party', 1)
  }

  const handleNotYou = () => {
    rememberParty(null)
    setPartyId(null)
    setDraft(emptyDraft())
    setFirstName('')
    setLastName('')
    setLookupFailed(false)
    goTo('find', -1)
  }

  const handleSubmit = () => {
    if (!partyId) return

    // Snapshot the answers before the store rewrites plus-one keys into ids.
    const acceptedIds = new Set<string>()
    for (const member of coming) {
      for (const event of rsvpEventsForMember(events, member)) {
        if (draft.attendance[attendanceKey(member.key, event.id)]) acceptedIds.add(event.id)
      }
    }
    const acceptedEvents = sortEvents(events.filter((e) => acceptedIds.has(e.id)))
    const names = coming.map((member) => member.fullName)

    submitRsvp(toSubmission(partyId, members, events, draft))

    // Re-read so any freshly created plus-one is a real Guest from here on.
    const state = useWeddingStore.getState()
    setDraft(draftFromRsvp(rsvpForParty(state, partyId), existingPlusOnes(state, partyId)))
    setSealed({ names, events: acceptedEvents })
  }

  const handleContinue = (event: FormEvent) => {
    event.preventDefault()

    if (stepId === 'find') {
      handleFind()
      return
    }

    let stepErrors: StepErrors = NO_ERRORS
    if (stepId === 'party') stepErrors = validateParty(draft.plusOnes)
    if (stepId === 'attendance') stepErrors = validateAttendance(members, events, draft)
    if (stepId === 'meals') stepErrors = validateMeals(members, events, draft)

    if (stepErrors.summary) {
      setErrors(stepErrors)
      return
    }

    if (stepId === 'review') {
      handleSubmit()
      return
    }

    goTo(steps[stepIndex + 1], 1)
  }

  const handleBack = () => {
    if (stepIndex === 0) return
    goTo(steps[stepIndex - 1], -1)
  }

  const setAttendance = (memberKey: string, eventId: string, attending: boolean) =>
    setDraft((current) => ({
      ...current,
      attendance: { ...current.attendance, [attendanceKey(memberKey, eventId)]: attending },
    }))

  const setMeal = (memberKey: string, mealId: string) =>
    setDraft((current) => ({
      ...current,
      meals: {
        ...current.meals,
        [memberKey]: { mealId, dietaryNotes: current.meals[memberKey]?.dietaryNotes ?? '' },
      },
    }))

  const setDietaryNotes = (memberKey: string, dietaryNotes: string) =>
    setDraft((current) => ({
      ...current,
      meals: {
        ...current.meals,
        [memberKey]: { mealId: current.meals[memberKey]?.mealId ?? '', dietaryNotes },
      },
    }))

  const setAnswer = (key: string, value: string) =>
    setDraft((current) => ({ ...current, custom: { ...current.custom, [key]: value } }))

  const addPlusOne = () =>
    setDraft((current) => ({
      ...current,
      plusOnes: [
        ...current.plusOnes,
        { key: newPlusOneKey(current.plusOnes.length), firstName: '', lastName: '' },
      ],
    }))

  const removePlusOne = (key: string) =>
    setDraft((current) =>
      purgeMember({ ...current, plusOnes: current.plusOnes.filter((p) => p.key !== key) }, key),
    )

  const changePlusOne = (key: string, patch: Partial<{ firstName: string; lastName: string }>) =>
    setDraft((current) => ({
      ...current,
      plusOnes: current.plusOnes.map((p) => (p.key === key ? { ...p, ...patch } : p)),
    }))

  /* ---- render ----------------------------------------------------------- */

  const masthead = (
    <div className="rsvp__masthead">
      <p className="rsvp__masthead-names">
        {config.coupleNames[0].split(' ')[0]} &amp; {config.coupleNames[1].split(' ')[0]}
      </p>
      <p className="rsvp__masthead-meta">
        {formatDate(config.dateISO)} · {config.city}
      </p>
    </div>
  )

  if (sealed) {
    return (
      <div className="rsvp" ref={rootRef}>
        {masthead}
        <Confirmation
          config={config}
          attendeeNames={sealed.names}
          acceptedEvents={sealed.events}
          onEdit={() => {
            setSealed(null)
            directionRef.current = -1
            setStepId('party')
            setRenderedStep('party')
          }}
        />
      </div>
    )
  }

  if (closed) {
    return (
      <div className="rsvp" ref={rootRef}>
        {masthead}
        <div className="rsvp-closed">
          <h1 className="rsvp__step-title">Replies have closed</h1>
          <hr className="rule rule--short" style={{ marginBlock: 'var(--space-5)' }} />
          <p className="rsvp__lede" style={{ marginTop: 0 }}>
            We closed the list on {formatShortDate(config.rsvpDeadlineISO)} so the kitchen and the
            seating plan could be finalised. If something has changed, please write to us directly
            at{' '}
            <a className="link" href={`mailto:${config.contactEmail}`}>
              {config.contactEmail}
            </a>{' '}
            — we would much rather hear from you than not.
          </p>
          <div className="rsvp__actions">
            <Link className={buttonClass({ variant: 'secondary' })} to="/schedule">
              See the schedule
            </Link>
            <Link className={buttonClass({ variant: 'quiet' })} to="/travel">
              Travel &amp; stay
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const stepTitle = STEP_TITLES[renderedStep]

  const stepBody = () => {
    switch (renderedStep) {
      case 'find':
        return (
          <StepFind
            firstName={firstName}
            lastName={lastName}
            onFirstNameChange={setFirstName}
            onLastNameChange={setLastName}
            noMatch={lookupFailed}
            fieldErrors={errors.fields}
            contactEmail={config.contactEmail}
          />
        )

      case 'party':
        return (
          <StepParty
            partyLabel={party?.label ?? ''}
            members={members}
            plusOnes={draft.plusOnes}
            allowance={party?.plusOneAllowance ?? 0}
            onAddPlusOne={addPlusOne}
            onRemovePlusOne={removePlusOne}
            onChangePlusOne={changePlusOne}
            fieldErrors={errors.fields}
            previouslySubmittedAt={existingRsvp?.submittedAt ?? null}
            onNotYou={handleNotYou}
          />
        )

      case 'attendance':
        return (
          <StepAttendance
            events={partyEvents}
            members={members}
            draft={draft}
            onChange={setAttendance}
            fieldErrors={errors.fields}
          />
        )

      case 'meals':
        return (
          <StepMeals
            meals={meals}
            members={diners}
            draft={draft}
            onMealChange={setMeal}
            onNotesChange={setDietaryNotes}
            fieldErrors={errors.fields}
          />
        )

      case 'questions':
        return (
          <StepQuestions
            instances={instances}
            answers={draft.custom}
            onAnswerChange={setAnswer}
            note={draft.note}
            onNoteChange={(note) => setDraft((current) => ({ ...current, note }))}
          />
        )

      case 'review':
        return (
          <StepReview
            people={reviewSummary(members, events, meals, questions, draft)}
            partyAnswers={partyAnswers(questions, draft)}
            note={draft.note}
            hasMealStep={diners.length > 0}
            onEdit={(target) => goTo(target, -1)}
          />
        )

      default:
        return null
    }
  }

  const lede: Record<StepId, string> = {
    find: 'Your name as it appears on the invitation. No account, no code — we will take it from there.',
    party: '',
    attendance: 'One answer per person, per event. Please reply for everyone, even the small ones.',
    meals: 'Every plate is bound to a name, so nobody ends up with the wrong dinner.',
    questions: 'Only the things that apply to you. All of it is optional.',
    review: 'Read it back, then seal it.',
  }

  return (
    <div className="rsvp" ref={rootRef}>
      {masthead}

      <ProgressRule
        className="rsvp__progress"
        value={stepIndex + 1}
        max={steps.length}
        label={STEP_TITLES[stepId]}
      />

      <form onSubmit={handleContinue} noValidate>
        <div className="rsvp__pane" ref={paneRef}>
          <div className="rsvp__step-head">
            <h1 className="rsvp__step-title" tabIndex={-1} ref={headingRef}>
              {stepTitle}
            </h1>
            {lede[renderedStep] ? <p className="rsvp__lede">{lede[renderedStep]}</p> : null}
          </div>

          {errors.summary ? (
            <div className="rsvp__alert rsvp__alert--error" role="alert">
              <p className="rsvp__alert-title">Almost there</p>
              <p>{errors.summary}</p>
            </div>
          ) : null}

          {stepBody()}
        </div>

        <div className="rsvp__actions">
          {stepIndex > 0 ? (
            <Button variant="quiet" onClick={handleBack}>
              Back
            </Button>
          ) : null}
          <span className="rsvp__spacer" />
          <Button type="submit" variant="primary" size="lg">
            {renderedStep === 'find'
              ? 'Find my invitation'
              : renderedStep === 'review'
                ? 'Seal my reply'
                : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  )
}
