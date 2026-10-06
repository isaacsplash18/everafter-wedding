/**
 * Events editor — name, date, times, venue, whether it needs an RSVP, and who
 * can see it. Every field writes straight to the store via `updateEvent`, so
 * a rename here shows up on Overview and the guest site immediately.
 */
import type { WeddingEvent } from '../../data/types'
import { TextField } from '../ui'
import { ToggleSwitch } from './ToggleSwitch'
import '../../styles/admin-settings.css'

const TAG_OPTIONS = ['family', 'friends', 'wedding-party', 'out-of-town']
const TAG_LABELS: Record<string, string> = {
  family: 'Family',
  friends: 'Friends',
  'wedding-party': 'Wedding party',
  'out-of-town': 'Out of town',
}

export interface EventEditorProps {
  events: WeddingEvent[]
  onUpdate: (eventId: string, patch: Partial<Omit<WeddingEvent, 'id'>>) => void
}

export function EventEditor({ events, onUpdate }: EventEditorProps) {
  return (
    <div className="settings-list">
      {events.map((event) => {
        const usesAllTags = event.visibleToTags === 'all'
        const nameError = event.name.trim() ? undefined : 'Every event needs a name.'

        return (
          <div className="settings-card" key={event.id}>
            <div className="inline-form__grid">
              <TextField
                label="Event name"
                value={event.name}
                onChange={(e) => onUpdate(event.id, { name: e.target.value })}
                error={nameError}
              />
              <TextField
                label="Venue"
                value={event.venue}
                onChange={(e) => onUpdate(event.id, { venue: e.target.value })}
              />
              <TextField
                label="Date"
                type="date"
                value={event.dateISO}
                onChange={(e) => onUpdate(event.id, { dateISO: e.target.value })}
              />
              <TextField
                label="Start time"
                type="time"
                value={event.startTime}
                onChange={(e) => onUpdate(event.id, { startTime: e.target.value })}
              />
              <TextField
                label="End time"
                type="time"
                optional
                value={event.endTime ?? ''}
                onChange={(e) => onUpdate(event.id, { endTime: e.target.value || undefined })}
              />
            </div>

            <TextField
              label="Address"
              value={event.address}
              onChange={(e) => onUpdate(event.id, { address: e.target.value })}
            />

            <div className="inline-form__row">
              <ToggleSwitch
                label="Requires RSVP"
                checked={event.requiresRsvp}
                onChange={(v) => onUpdate(event.id, { requiresRsvp: v })}
              />
              <ToggleSwitch
                label="Has a meal choice"
                checked={Boolean(event.hasMeal)}
                onChange={(v) => onUpdate(event.id, { hasMeal: v })}
              />
            </div>

            <fieldset>
              <legend className="field__label">Visible to</legend>
              <div className="inline-form__checks">
                <label className="check-field">
                  <input
                    type="radio"
                    name={`visibility-${event.id}`}
                    checked={usesAllTags}
                    onChange={() => onUpdate(event.id, { visibleToTags: 'all' })}
                  />
                  Everyone invited
                </label>
                <label className="check-field">
                  <input
                    type="radio"
                    name={`visibility-${event.id}`}
                    checked={!usesAllTags}
                    onChange={() => onUpdate(event.id, { visibleToTags: usesAllTags ? [] : event.visibleToTags })}
                  />
                  Only selected tags
                </label>
              </div>
              {!usesAllTags ? (
                <div className="inline-form__checks" style={{ marginTop: '0.5rem' }}>
                  {TAG_OPTIONS.map((tag) => {
                    const list = Array.isArray(event.visibleToTags) ? event.visibleToTags : []
                    const checked = list.includes(tag)
                    return (
                      <label className="check-field" key={tag}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const next = checked ? list.filter((t) => t !== tag) : [...list, tag]
                            onUpdate(event.id, { visibleToTags: next })
                          }}
                        />
                        {TAG_LABELS[tag] ?? tag}
                      </label>
                    )
                  })}
                </div>
              ) : null}
            </fieldset>
          </div>
        )
      })}
    </div>
  )
}

export default EventEditor
