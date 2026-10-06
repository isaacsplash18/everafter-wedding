/**
 * The reminder drip schedule — demo UI, nothing is ever actually sent.
 * Each rule reads like a sentence ("21 days before the deadline, by email,
 * to guests who haven't replied") with a switch to enable or disable it.
 */
import type { ReminderRule } from '../../data/types'
import { ToggleSwitch } from './ToggleSwitch'
import '../../styles/admin-shared.css'

export interface ReminderListProps {
  reminders: ReminderRule[]
  onToggle: (id: string) => void
}

function offsetLabel(days: number): string {
  if (days === 0) return 'On the deadline day'
  return `${days} ${days === 1 ? 'day' : 'days'} before the deadline`
}

function channelLabel(channel: ReminderRule['channel']): string {
  return channel === 'email' ? 'Email' : 'Text message'
}

function audienceLabel(audience: ReminderRule['audience']): string {
  return audience === 'pending' ? "guests who haven't replied" : 'everyone invited'
}

export function ReminderList({ reminders, onToggle }: ReminderListProps) {
  const sorted = [...reminders].sort((a, b) => b.offsetDaysBeforeDeadline - a.offsetDaysBeforeDeadline)

  return (
    <ul className="reminder-list">
      {sorted.map((rule) => (
        <li key={rule.id} className="reminder-row">
          <div className="reminder-row__text">
            <p className="reminder-row__offset">{offsetLabel(rule.offsetDaysBeforeDeadline)}</p>
            <p className="reminder-row__meta muted small">
              {channelLabel(rule.channel)} to {audienceLabel(rule.audience)}
            </p>
          </div>
          <ToggleSwitch
            checked={rule.enabled}
            onChange={() => onToggle(rule.id)}
            label={rule.enabled ? 'Enabled' : 'Disabled'}
          />
        </li>
      ))}
    </ul>
  )
}

export default ReminderList
