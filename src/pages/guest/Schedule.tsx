/**
 * Everafter — Schedule.
 *
 * Every event in one timeline, Joy's best idea. Once the RSVP flow has
 * matched a party this session (`lastMatchedPartyId`), the page narrows to
 * just that party's invited events with a "personalized for you" note and a
 * "not you?" reset — no lookup form duplicated here, just a read of state
 * the RSVP flow already owns.
 */
import { useMemo } from 'react'

import { TagChip } from '../../components/ui'
import { formatDayAndDate, formatTimeRange } from '../../lib/format'
import { useSectionReveal } from '../../lib/motion'
import { eventsForParty, sortEvents, useWeddingStore, type WeddingData } from '../../lib/store'
import '../../styles/guest-schedule.css'

function isInvitationOnly(visibleToTags: string[] | 'all'): boolean {
  return visibleToTags !== 'all'
}

export default function Schedule() {
  const config = useWeddingStore((s) => s.config)
  const events = useWeddingStore((s) => s.events)
  const parties = useWeddingStore((s) => s.parties)
  const guests = useWeddingStore((s) => s.guests)
  const lastMatchedPartyId = useWeddingStore((s) => s.lastMatchedPartyId)
  const rememberParty = useWeddingStore((s) => s.rememberParty)

  const party = lastMatchedPartyId ? (parties.find((p) => p.id === lastMatchedPartyId) ?? null) : null

  const snapshot = useMemo<WeddingData>(
    () => ({
      config,
      events,
      parties,
      guests,
      meals: [],
      questions: [],
      rsvps: [],
      reminders: [],
      photos: [],
      lastMatchedPartyId,
    }),
    [config, events, parties, guests, lastMatchedPartyId],
  )

  const displayEvents = party ? eventsForParty(snapshot, party.id) : sortEvents(events)

  const listRef = useSectionReveal<HTMLDivElement>({
    selector: '.schedule-item',
    y: 16,
    stagger: 0.08,
  })

  return (
    <div className="schedule-page">
      <div className="schedule-head">
        <h1>The full schedule</h1>
        <p>Every hour of the weekend, in order — arrival to last dance.</p>
      </div>

      {party ? (
        <div className="schedule-banner">
          <p className="schedule-banner__text">Personalized for {party.label}</p>
          <button type="button" className="btn btn--quiet" onClick={() => rememberParty(null)}>
            Not you?
          </button>
        </div>
      ) : null}

      {displayEvents.length === 0 ? (
        <p className="schedule-empty">Nothing on the list for this party yet.</p>
      ) : (
        <div className="schedule-timeline" ref={listRef}>
          {displayEvents.map((event) => (
            <article className="schedule-item" key={event.id}>
              <div>
                <p className="schedule-item__date">{formatDayAndDate(event.dateISO)}</p>
                <p className="schedule-item__time tnum">{formatTimeRange(event.startTime, event.endTime)}</p>
              </div>
              <div>
                <div className="schedule-item__head">
                  <h2 className="schedule-item__name">{event.name}</h2>
                  {isInvitationOnly(event.visibleToTags) ? (
                    <TagChip tone="honey">Invitation only</TagChip>
                  ) : null}
                </div>
                <p className="schedule-item__venue">{event.venue}</p>
                <p className="schedule-item__address">{event.address}</p>
                <p className="schedule-item__desc">{event.description}</p>
                {event.dressCode ? (
                  <p className="schedule-item__dress">
                    <strong>Dress:</strong> {event.dressCode}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
