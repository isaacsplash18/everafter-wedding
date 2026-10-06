/**
 * Add-party and add-guest forms for the guest list. Each starts collapsed as
 * a single button and expands into an inline form — no modal.
 */
import { useState } from 'react'
import type { FormEvent } from 'react'

import type { Party } from '../../data/types'
import { Button, TextField, SelectField, tagLabel } from '../ui'
import '../../styles/admin-shared.css'

const TAG_OPTIONS = ['family', 'friends', 'wedding-party', 'out-of-town'] as const

/* -------------------------------------------------------------------------- */
/* Add party                                                                   */
/* -------------------------------------------------------------------------- */

export interface AddPartyFormProps {
  onAdd: (label: string, plusOneAllowance: number) => void
}

export function AddPartyForm({ onAdd }: AddPartyFormProps) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [allowance, setAllowance] = useState('0')
  const [error, setError] = useState('')

  if (!open) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        + Add party
      </Button>
    )
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const trimmed = label.trim()
    if (!trimmed) {
      setError('Give the party a label, as it should appear on the invitation.')
      return
    }
    onAdd(trimmed, Math.max(0, Number(allowance) || 0))
    setLabel('')
    setAllowance('0')
    setError('')
    setOpen(false)
  }

  return (
    <form className="inline-form" onSubmit={submit}>
      <div className="inline-form__row">
        <TextField
          label="Party label"
          placeholder="e.g. The Chen Family"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          error={error}
        />
        <TextField
          label="Plus-one allowance"
          type="number"
          min={0}
          value={allowance}
          onChange={(e) => setAllowance(e.target.value)}
        />
      </div>
      <div className="inline-form__actions">
        <Button type="submit" size="sm">
          Add party
        </Button>
        <Button type="button" variant="quiet" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

/* -------------------------------------------------------------------------- */
/* Add guest                                                                   */
/* -------------------------------------------------------------------------- */

export interface AddGuestFormProps {
  parties: Party[]
  onAdd: (
    partyId: string,
    guest: { firstName: string; lastName: string; email?: string; isChild: boolean; tags: string[] },
  ) => void
}

export function AddGuestForm({ parties, onAdd }: AddGuestFormProps) {
  const [open, setOpen] = useState(false)
  const [partyId, setPartyId] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [isChild, setIsChild] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [errors, setErrors] = useState<{ party?: string; name?: string }>({})

  if (!open) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        + Add guest
      </Button>
    )
  }

  function toggleTag(tag: string) {
    setTags((current) => (current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]))
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const nextErrors: { party?: string; name?: string } = {}
    if (!partyId) nextErrors.party = 'Choose which party this guest belongs to.'
    if (!firstName.trim() || !lastName.trim()) nextErrors.name = 'First and last name are both required.'
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    onAdd(partyId, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim() || undefined,
      isChild,
      tags,
    })
    setPartyId('')
    setFirstName('')
    setLastName('')
    setEmail('')
    setIsChild(false)
    setTags([])
    setErrors({})
    setOpen(false)
  }

  return (
    <form className="inline-form" onSubmit={submit}>
      <div className="inline-form__grid">
        <SelectField
          label="Party"
          placeholder="Choose a party"
          value={partyId}
          onChange={(e) => setPartyId(e.target.value)}
          options={parties.map((p) => ({ value: p.id, label: p.label }))}
          error={errors.party}
        />
        <TextField
          label="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={errors.name}
        />
        <TextField label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <TextField
          label="Email"
          type="email"
          optional
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="inline-form__row">
        <label className="check-field">
          <input type="checkbox" checked={isChild} onChange={(e) => setIsChild(e.target.checked)} />
          Child
        </label>
      </div>

      <fieldset>
        <legend className="field__label">Tags</legend>
        <div className="inline-form__checks">
          {TAG_OPTIONS.map((tag) => (
            <label className="check-field" key={tag}>
              <input type="checkbox" checked={tags.includes(tag)} onChange={() => toggleTag(tag)} />
              {tagLabel(tag)}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="inline-form__actions">
        <Button type="submit" size="sm">
          Add guest
        </Button>
        <Button type="button" variant="quiet" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
