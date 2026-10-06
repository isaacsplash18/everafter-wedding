import { useEffect, useRef } from 'react'

import { TextField } from '../../../../components/ui'

export interface StepFindProps {
  firstName: string
  lastName: string
  onFirstNameChange: (value: string) => void
  onLastNameChange: (value: string) => void
  /** True when the last attempt matched nothing. Copy lives here, not upstream. */
  noMatch: boolean
  fieldErrors: Record<string, string>
  contactEmail: string
}

/**
 * Step 1. Two fields, no account, no code.
 *
 * Privacy: this never lists candidates, never autocompletes another guest's
 * name, and never confirms that a surname exists. Either we find exactly one
 * party or we ask them to try the name as it is printed on the invitation.
 */
export function StepFind({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  noMatch,
  fieldErrors,
  contactEmail,
}: StepFindProps) {
  const firstRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    firstRef.current?.focus()
  }, [])

  return (
    <div>
      {noMatch ? (
        <div className="rsvp__alert rsvp__alert--error" role="alert">
          <p className="rsvp__alert-title">We couldn’t find that name</p>
          <p>
            Try it exactly as it appears on your invitation — Katherine rather than Katie, and the
            surname we would have addressed the envelope to. Still stuck? Write to us at{' '}
            <a className="link" href={`mailto:${contactEmail}`}>
              {contactEmail}
            </a>{' '}
            and we’ll sort it out.
          </p>
        </div>
      ) : null}

      <div className="rsvp__fields rsvp__fields--pair">
        <TextField
          ref={firstRef}
          label="First name"
          name="given-name"
          autoComplete="given-name"
          autoCapitalize="words"
          spellCheck={false}
          value={firstName}
          error={fieldErrors.firstName}
          onChange={(event) => onFirstNameChange(event.target.value)}
        />
        <TextField
          label="Last name"
          name="family-name"
          autoComplete="family-name"
          autoCapitalize="words"
          spellCheck={false}
          value={lastName}
          error={fieldErrors.lastName}
          onChange={(event) => onLastNameChange(event.target.value)}
        />
      </div>

      <p className="field__hint" style={{ marginTop: 'var(--space-4)' }}>
        One name finds your whole party — you’ll reply for everyone on the next screen.
      </p>
    </div>
  )
}

export default StepFind
