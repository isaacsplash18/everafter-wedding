import { Button } from '../../../../components/ui'
import type { PersonSummary, StepId } from '../model'

export interface StepReviewProps {
  people: PersonSummary[]
  partyAnswers: { prompt: string; value: string }[]
  note: string
  onEdit: (step: StepId) => void
  hasMealStep: boolean
}

/**
 * Step 6. Grouped by person, because that is how the answers were given and
 * how the couple will read them back.
 */
export function StepReview({ people, partyAnswers, note, onEdit, hasMealStep }: StepReviewProps) {
  return (
    <div>
      {people.map((person) => {
        const anyAnswer = person.events.some((entry) => entry.attending !== undefined)
        if (!anyAnswer) return null

        return (
          <section className="rsvp-review__group" key={person.member.key}>
            <h3 className="rsvp-review__name">{person.member.fullName}</h3>

            <div className="rsvp-review__list">
              {person.events.map((entry) => (
                <p className="rsvp-review__row" key={entry.event.id}>
                  <span className="rsvp-review__label">{entry.event.name}</span>
                  <span
                    className={[
                      'rsvp-review__value',
                      entry.attending ? '' : 'rsvp-review__value--declined',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {entry.attending === undefined
                      ? 'No answer yet'
                      : entry.attending
                        ? 'Joyfully accepts'
                        : 'Regretfully declines'}
                  </span>
                </p>
              ))}

              {person.meal ? (
                <p className="rsvp-review__row">
                  <span className="rsvp-review__label">Main course</span>
                  <span className="rsvp-review__value">{person.meal.name}</span>
                </p>
              ) : null}

              {person.answers.map((answer) => (
                <p className="rsvp-review__row" key={answer.prompt}>
                  <span className="rsvp-review__label">{answer.prompt}</span>
                  <span className="rsvp-review__value">{answer.value}</span>
                </p>
              ))}
            </div>

            {person.dietaryNotes ? (
              <p className="rsvp-review__notes">Dietary note: {person.dietaryNotes}</p>
            ) : null}
          </section>
        )
      })}

      {partyAnswers.length > 0 || note ? (
        <section className="rsvp-review__group">
          <h3 className="rsvp-review__name">From all of you</h3>
          <div className="rsvp-review__list">
            {partyAnswers.map((answer) => (
              <p className="rsvp-review__row" key={answer.prompt}>
                <span className="rsvp-review__label">{answer.prompt}</span>
                <span className="rsvp-review__value">{answer.value}</span>
              </p>
            ))}
          </div>
          {note ? <p className="rsvp-review__notes">“{note}”</p> : null}
        </section>
      ) : null}

      <div className="rsvp__actions" style={{ borderTop: 0, paddingTop: 0 }}>
        <Button variant="quiet" size="sm" onClick={() => onEdit('attendance')}>
          Change who’s coming
        </Button>
        {hasMealStep ? (
          <Button variant="quiet" size="sm" onClick={() => onEdit('meals')}>
            Change a dish
          </Button>
        ) : null}
        <Button variant="quiet" size="sm" onClick={() => onEdit('questions')}>
          Change a note
        </Button>
      </div>
    </div>
  )
}

export default StepReview
