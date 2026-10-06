import { ATTENDANCE_OPTIONS, Segmented } from '../../../../components/ui'
import { formatDayAndDate, formatTimeRange } from '../../../../lib/format'
import type { WeddingEvent } from '../../../../data/types'
import { attendanceKey, isMemberInvitedTo, type Member, type RsvpDraft } from '../model'

export interface StepAttendanceProps {
  events: WeddingEvent[]
  members: Member[]
  draft: RsvpDraft
  onChange: (memberKey: string, eventId: string, attending: boolean) => void
  fieldErrors: Record<string, string>
}

function visibilityNote(event: WeddingEvent): string | null {
  if (event.visibleToTags === 'all') return null
  const labels: Record<string, string> = {
    family: 'family',
    friends: 'friends',
    'wedding-party': 'the wedding party',
    'out-of-town': 'guests travelling in',
  }
  const named = event.visibleToTags.map((tag) => labels[tag] ?? tag)
  const joined =
    named.length <= 1
      ? named[0]
      : `${named.slice(0, -1).join(', ')} and ${named[named.length - 1]}`
  return `A smaller gathering — this one is just for ${joined}.`
}

/**
 * Step 3. Per-person, per-event. This is the whole point of the product:
 * a household is never a single yes or no.
 */
export function StepAttendance({
  events,
  members,
  draft,
  onChange,
  fieldErrors,
}: StepAttendanceProps) {
  return (
    <div>
      <div>
        {events.map((event) => {
          const invited = members.filter((member) => isMemberInvitedTo(event, member))
          if (invited.length === 0) return null
          const note = visibilityNote(event)

          return (
            <section className="rsvp-event" key={event.id}>
              <h3 className="rsvp-event__name">{event.name}</h3>
              <p className="rsvp-event__when">
                {formatDayAndDate(event.dateISO)} · {formatTimeRange(event.startTime, event.endTime)}{' '}
                · {event.venue}
              </p>
              {note ? <p className="rsvp-event__note">{note}</p> : null}

              <div className="rsvp-event__people">
                {invited.map((member) => {
                  const key = attendanceKey(member.key, event.id)
                  const answer = draft.attendance[key]
                  return (
                    <div className="rsvp-attend" key={key}>
                      <p className="rsvp-attend__name" aria-hidden="true">
                        {member.fullName}
                      </p>
                      <Segmented
                        legend={`${member.fullName} — ${event.name}`}
                        name={key}
                        options={ATTENDANCE_OPTIONS}
                        value={answer === undefined ? null : answer ? 'accept' : 'decline'}
                        onChange={(value) => onChange(member.key, event.id, value === 'accept')}
                        error={fieldErrors[key]}
                      />
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

export default StepAttendance
