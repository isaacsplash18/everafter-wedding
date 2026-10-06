import { useRef } from 'react'
import { Link } from 'react-router-dom'

import { Button, buttonClass } from '../../../../components/ui'
import { drawRule, gsap, useGSAP, withMotion } from '../../../../lib/motion'
import { downloadWeddingCalendar } from '../../../../lib/ics'
import {
  formatDayAndDate,
  formatShortDate,
  formatTimeRange,
  joinNames,
} from '../../../../lib/format'
import type { WeddingConfig, WeddingEvent } from '../../../../data/types'

export interface ConfirmationProps {
  config: WeddingConfig
  /** Names of everyone attending at least one event. */
  attendeeNames: string[]
  /** Events at least one person accepted — what goes in the .ics. */
  acceptedEvents: WeddingEvent[]
  onEdit: () => void
}

/**
 * The "sealed with love" moment. A honey rule draws itself across the page and
 * the words settle in behind it. Under reduced motion the rule is simply drawn
 * and the text is simply there — nothing waits on an animation.
 */
export function Confirmation({ config, attendeeNames, acceptedEvents, onEdit }: ConfirmationProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const ruleRef = useRef<HTMLHRElement>(null)
  const coming = attendeeNames.length > 0

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return

      withMotion(({ reduced }) => {
        drawRule(ruleRef.current, { reduced, duration: 1, delay: reduced ? 0 : 0.15 })
        if (reduced) return

        const lines = root.querySelectorAll('[data-seal]')
        gsap.from(lines, {
          y: 14,
          opacity: 0,
          duration: 0.6,
          stagger: 0.09,
          ease: 'power3.out',
          delay: 0.1,
        })
      }, root)
    },
    { scope: rootRef },
  )

  return (
    <div className="rsvp-sealed" ref={rootRef}>
      <p className="rsvp-sealed__eyebrow" data-seal>
        Your reply is in
      </p>

      <h1 className="rsvp-sealed__title" data-seal>
        Sealed with love
      </h1>

      <hr className="rsvp-sealed__rule" ref={ruleRef} aria-hidden="true" />

      {coming ? (
        <>
          <p className="rsvp-sealed__body" data-seal>
            Thank you. We have you down, name by name, and the kitchen has your notes. There is
            nothing else to do until June.
          </p>

          <p className="rsvp-sealed__names" data-seal>
            {joinNames(attendeeNames)}
            {attendeeNames.length === 1 ? ' is coming.' : ' are coming.'}
          </p>

          {acceptedEvents.length > 0 ? (
            <div className="rsvp-sealed__events" data-seal>
              {acceptedEvents.map((event) => (
                <span key={event.id}>
                  {event.name} · {formatDayAndDate(event.dateISO)} ·{' '}
                  {formatTimeRange(event.startTime, event.endTime)}
                </span>
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <p className="rsvp-sealed__body" data-seal>
          Thank you for telling us. We will miss you on the day, and we mean that — but we are glad
          to know. If anything changes before {formatShortDate(config.rsvpDeadlineISO)}, come back
          and change your answer.
        </p>
      )}

      <div className="rsvp-sealed__actions" data-seal>
        {coming && acceptedEvents.length > 0 ? (
          <Button
            variant="primary"
            onClick={() => downloadWeddingCalendar(acceptedEvents, config)}
          >
            Add to calendar
          </Button>
        ) : null}
        <Button variant="secondary" onClick={onEdit}>
          Edit your response
        </Button>
        <Link className={buttonClass({ variant: 'quiet' })} to="/schedule">
          See the schedule
        </Link>
      </div>
    </div>
  )
}

export default Confirmation
