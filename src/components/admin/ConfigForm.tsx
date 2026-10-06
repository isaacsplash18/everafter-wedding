/**
 * Wedding config — strict name matching, RSVP deadline, and the couple's own
 * contact details. Writes straight through `updateConfig`.
 */
import type { WeddingConfig } from '../../data/types'
import { TextField } from '../ui'
import { ToggleSwitch } from './ToggleSwitch'
import '../../styles/admin-settings.css'

export interface ConfigFormProps {
  config: WeddingConfig
  onUpdate: (patch: Partial<WeddingConfig>) => void
}

export function ConfigForm({ config, onUpdate }: ConfigFormProps) {
  const [firstName, secondName] = config.coupleNames

  return (
    <div className="settings-card">
      <div className="inline-form__grid">
        <TextField
          label="Partner one"
          value={firstName}
          onChange={(e) => onUpdate({ coupleNames: [e.target.value, secondName] })}
          error={firstName.trim() ? undefined : 'Required.'}
        />
        <TextField
          label="Partner two"
          value={secondName}
          onChange={(e) => onUpdate({ coupleNames: [firstName, e.target.value] })}
          error={secondName.trim() ? undefined : 'Required.'}
        />
        <TextField
          label="Contact email"
          type="email"
          value={config.contactEmail}
          onChange={(e) => onUpdate({ contactEmail: e.target.value })}
          hint="Shown to guests who can't be found or reply after the deadline."
        />
        <TextField
          label="RSVP deadline"
          type="date"
          value={config.rsvpDeadlineISO}
          onChange={(e) => onUpdate({ rsvpDeadlineISO: e.target.value })}
        />
      </div>

      <ToggleSwitch
        label="Strict name matching"
        checked={config.strictNameMatching}
        onChange={(v) => onUpdate({ strictNameMatching: v })}
      />
      <p className="field__hint">
        On: guests must type their first and last name exactly as invited. Off: a shortened first
        name or an initial is still allowed, as long as the surname matches.
      </p>
    </div>
  )
}

export default ConfigForm
