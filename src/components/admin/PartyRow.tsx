/**
 * One party in the guest table: a summary row (party, members, tags,
 * allowance, per-event status, meals) plus a keyboard-accessible expand
 * button that reveals the full per-person answers underneath.
 */
import { useId, useState } from 'react'

import type { Party, WeddingEvent } from '../../data/types'
import type { WeddingData } from '../../lib/store'
import { guestAttendsAMeal, guestFullName, guestsOfParty, isGuestInvitedTo, rsvpForParty } from '../../lib/store'
import { formatTimestamp } from '../../lib/format'
import { TagChip, tagLabel } from '../ui'
import { StatusDot } from './StatusDot'
import type { StatusTone } from './StatusDot'
import '../../styles/admin-guests.css'

export interface PartyRowProps {
  state: WeddingData
  party: Party
  events: WeddingEvent[]
  onSetAllowance: (partyId: string, allowance: number) => void
}

interface EventAggregate {
  tone: StatusTone
  label: string
  detail?: string
}

function aggregateForEvent(state: WeddingData, party: Party, event: WeddingEvent): EventAggregate | null {
  const members = guestsOfParty(state, party.id).filter((g) => isGuestInvitedTo(event, g))
  if (members.length === 0) return null

  const rsvp = rsvpForParty(state, party.id)
  let attending = 0
  let declined = 0
  let pending = 0

  for (const guest of members) {
    const answer = rsvp?.attendance.find((a) => a.guestId === guest.id && a.eventId === event.id)
    if (!answer) pending += 1
    else if (answer.attending) attending += 1
    else declined += 1
  }

  if (pending === members.length) return { tone: 'warn', label: 'Pending' }
  if (declined === members.length) return { tone: 'danger', label: 'Declined' }
  if (attending === members.length) return { tone: 'ok', label: 'Attending' }
  if (pending > 0) {
    return { tone: 'warn', label: 'Partial', detail: `${attending} of ${members.length} in` }
  }
  return { tone: 'warn', label: 'Mixed', detail: `${attending} of ${members.length} in` }
}

function mealsSummary(state: WeddingData, party: Party): string {
  const members = guestsOfParty(state, party.id)
  const rsvp = rsvpForParty(state, party.id)
  const counts = new Map<string, number>()
  let missing = 0

  for (const guest of members) {
    if (!guestAttendsAMeal(state, guest.id)) continue
    const answer = rsvp?.meals.find((m) => m.guestId === guest.id)
    const meal = state.meals.find((m) => m.id === answer?.mealId)
    if (meal) counts.set(meal.name, (counts.get(meal.name) ?? 0) + 1)
    else missing += 1
  }

  const parts = [...counts.entries()].map(([name, count]) => `${name} ×${count}`)
  if (missing > 0) parts.push(`${missing} unchosen`)
  return parts.length > 0 ? parts.join(', ') : '—'
}

export function PartyRow({ state, party, events, onSetAllowance }: PartyRowProps) {
  const [expanded, setExpanded] = useState(false)
  const panelId = useId()

  const members = guestsOfParty(state, party.id)
  const rsvp = rsvpForParty(state, party.id)
  const partyTags = [...new Set(members.flatMap((g) => g.tags))]

  return (
    <>
      <tr className="party-row">
        <td>
          <button
            type="button"
            className="party-row__toggle"
            aria-expanded={expanded}
            aria-controls={panelId}
            onClick={() => setExpanded((v) => !v)}
          >
            <span
              className={['party-row__chevron', expanded ? 'party-row__chevron--open' : '']
                .filter(Boolean)
                .join(' ')}
              aria-hidden="true"
            >
              &#9656;
            </span>
            {party.label}
          </button>
        </td>
        <td>
          <ul className="party-row__members">
            {members.map((guest) => (
              <li key={guest.id}>
                {guestFullName(guest)}
                {guest.isChild ? (
                  <TagChip tone="muted" className="party-row__badge">
                    Child
                  </TagChip>
                ) : null}
                {guest.isPlusOne ? (
                  <TagChip tone="muted" className="party-row__badge">
                    +1
                  </TagChip>
                ) : null}
              </li>
            ))}
          </ul>
        </td>
        <td>
          <div className="party-row__tags">
            {partyTags.length > 0
              ? partyTags.map((tag) => <TagChip key={tag}>{tagLabel(tag)}</TagChip>)
              : <span className="muted small">—</span>}
          </div>
        </td>
        <td>
          <label className="visually-hidden" htmlFor={`allowance-${party.id}`}>
            Plus-one allowance for {party.label}
          </label>
          <input
            id={`allowance-${party.id}`}
            className="table-input tnum"
            type="number"
            min={0}
            value={party.plusOneAllowance}
            onChange={(event) => onSetAllowance(party.id, Math.max(0, Number(event.target.value) || 0))}
          />
        </td>
        {events.map((event) => {
          const aggregate = aggregateForEvent(state, party, event)
          return (
            <td key={event.id}>
              {aggregate ? (
                <StatusDot tone={aggregate.tone} label={aggregate.label} detail={aggregate.detail} />
              ) : (
                <span className="muted small">not invited</span>
              )}
            </td>
          )
        })}
        <td>{mealsSummary(state, party)}</td>
      </tr>

      {expanded ? (
        <tr className="party-row__detail-row">
          <td colSpan={5 + events.length} id={panelId}>
            <div className="party-detail">
              {members.map((guest) => (
                <div className="party-detail__person" key={guest.id}>
                  <p className="party-detail__name">
                    {guestFullName(guest)}
                    {guest.isChild ? <TagChip tone="muted">Child</TagChip> : null}
                    {guest.isPlusOne ? <TagChip tone="muted">Plus-one</TagChip> : null}
                  </p>
                  <ul className="party-detail__answers">
                    {events
                      .filter((event) => isGuestInvitedTo(event, guest))
                      .map((event) => {
                        const answer = rsvp?.attendance.find(
                          (a) => a.guestId === guest.id && a.eventId === event.id,
                        )
                        const label = !answer ? 'Pending' : answer.attending ? 'Attending' : 'Declined'
                        return (
                          <li key={event.id}>
                            <span className="party-detail__event">{event.name}:</span> {label}
                          </li>
                        )
                      })}
                    {guestAttendsAMeal(state, guest.id)
                      ? (() => {
                          const mealAnswer = rsvp?.meals.find((m) => m.guestId === guest.id)
                          const meal = state.meals.find((m) => m.id === mealAnswer?.mealId)
                          return (
                            <li>
                              <span className="party-detail__event">Meal:</span>{' '}
                              {meal ? meal.name : 'Not chosen yet'}
                              {mealAnswer?.dietaryNotes ? (
                                <span className="party-detail__dietary"> — {mealAnswer.dietaryNotes}</span>
                              ) : null}
                            </li>
                          )
                        })()
                      : null}
                    {state.questions
                      .filter((q) => q.perGuest)
                      .filter((q) => !q.targetTags || q.targetTags.some((tag) => guest.tags.includes(tag)))
                      .map((question) => {
                        const answer = rsvp?.custom.find(
                          (c) => c.questionId === question.id && c.guestId === guest.id,
                        )
                        if (!answer) return null
                        return (
                          <li key={question.id}>
                            <span className="party-detail__event">{question.prompt}</span> {answer.value}
                          </li>
                        )
                      })}
                  </ul>
                </div>
              ))}

              {state.questions
                .filter((q) => !q.perGuest)
                .map((question) => {
                  const answer = rsvp?.custom.find((c) => c.questionId === question.id)
                  if (!answer) return null
                  return (
                    <p className="party-detail__note" key={question.id}>
                      <strong>{question.prompt}</strong> {answer.value}
                    </p>
                  )
                })}

              {rsvp?.noteToCouple ? (
                <p className="party-detail__note">
                  <strong>Note to the couple:</strong> {rsvp.noteToCouple}
                </p>
              ) : null}

              <p className="party-detail__meta muted small">
                {rsvp ? `Responded ${formatTimestamp(rsvp.submittedAt)}` : 'No response yet.'}
              </p>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  )
}

export default PartyRow
