import { Button, Rule, TextField } from '../../../../components/ui'
import { formatTimestamp } from '../../../../lib/format'
import type { Member, PlusOneDraft } from '../model'

export interface StepPartyProps {
  partyLabel: string
  /** Everyone already on the invitation (plus-ones included). */
  members: Member[]
  plusOnes: PlusOneDraft[]
  allowance: number
  onAddPlusOne: () => void
  onRemovePlusOne: (key: string) => void
  onChangePlusOne: (key: string, patch: Partial<PlusOneDraft>) => void
  fieldErrors: Record<string, string>
  /** Set when this party has replied before. */
  previouslySubmittedAt: string | null
  onNotYou: () => void
}

/**
 * Step 2. Greet the household, show who is on the invitation, and — if the
 * envelope allowed it — take the *name* of anyone extra. No anonymous +1s
 * anywhere in this product.
 */
export function StepParty({
  partyLabel,
  members,
  plusOnes,
  allowance,
  onAddPlusOne,
  onRemovePlusOne,
  onChangePlusOne,
  fieldErrors,
  previouslySubmittedAt,
  onNotYou,
}: StepPartyProps) {
  const named = members.filter((m) => !m.isPlusOne)
  const draftedPlusOnes = plusOnes
  const spotsLeft = Math.max(0, allowance - draftedPlusOnes.length)

  return (
    <div>
      {previouslySubmittedAt ? (
        <div className="rsvp__alert" role="status">
          <p className="rsvp__alert-title">You’ve replied once already</p>
          <p>
            We have your answers from {formatTimestamp(previouslySubmittedAt)}. Everything below is
            filled in — change whatever you like and seal it again.
          </p>
        </div>
      ) : null}

      <p className="rsvp__lede" style={{ marginTop: 0 }}>
        We have you down as <strong>{partyLabel}</strong>.
      </p>

      <div className="rsvp-members">
        {named.map((member) => (
          <div className="rsvp-member-line" key={member.key}>
            <span className="rsvp-member-line__name">{member.fullName}</span>
            {member.isChild ? <span className="rsvp-member-line__meta">child</span> : null}
          </div>
        ))}
      </div>

      <button type="button" className="btn btn--quiet btn--sm" onClick={onNotYou}>
        Not you? Search again
      </button>

      {allowance > 0 ? (
        <>
          <Rule spaced />
          <h3 style={{ fontFamily: 'var(--font-display)' }}>Bringing someone?</h3>
          <p className="rsvp__lede">
            Your invitation includes {allowance === 1 ? 'one guest' : `${allowance} guests`}. We ask
            for full names so the place cards, the seating plan and the kitchen all agree.
          </p>

          <div className="rsvp__fields" style={{ marginTop: 'var(--space-5)' }}>
            {draftedPlusOnes.map((plusOne, index) => (
              <div className="rsvp-plusone" key={plusOne.key}>
                <div className="rsvp-plusone__head">
                  <span className="rsvp-plusone__title">
                    Guest {draftedPlusOnes.length > 1 ? index + 1 : ''}
                  </span>
                  <Button
                    variant="quiet"
                    size="sm"
                    danger
                    onClick={() => onRemovePlusOne(plusOne.key)}
                  >
                    Remove
                  </Button>
                </div>
                <div className="rsvp__fields rsvp__fields--pair">
                  <TextField
                    label="First name"
                    autoComplete="off"
                    autoCapitalize="words"
                    value={plusOne.firstName}
                    error={fieldErrors[`${plusOne.key}:first`]}
                    onChange={(event) =>
                      onChangePlusOne(plusOne.key, { firstName: event.target.value })
                    }
                  />
                  <TextField
                    label="Last name"
                    autoComplete="off"
                    autoCapitalize="words"
                    value={plusOne.lastName}
                    error={fieldErrors[`${plusOne.key}:last`]}
                    onChange={(event) =>
                      onChangePlusOne(plusOne.key, { lastName: event.target.value })
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          {spotsLeft > 0 ? (
            <div style={{ marginTop: 'var(--space-4)' }}>
              <Button variant="secondary" onClick={onAddPlusOne}>
                {draftedPlusOnes.length === 0 ? 'Add a guest' : 'Add another guest'}
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

export default StepParty
