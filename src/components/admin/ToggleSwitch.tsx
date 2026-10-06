/**
 * An accessible on/off switch for admin settings (reminders, requiresRsvp,
 * hasMeal, strict name matching). A real button with role="switch" so it
 * behaves for keyboard and screen-reader users; 150-200ms ease-out per
 * DESIGN.md's "calm, instant" admin motion rule.
 */
import '../../styles/admin-shared.css'

export interface ToggleSwitchProps {
  checked: boolean
  onChange: (next: boolean) => void
  /** Always rendered as text — never colour alone. */
  label: string
  hideLabel?: boolean
  id?: string
  disabled?: boolean
}

export function ToggleSwitch({ checked, onChange, label, hideLabel, id, disabled }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      id={id}
      disabled={disabled}
      className={['toggle-switch', checked ? 'toggle-switch--on' : ''].filter(Boolean).join(' ')}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle-switch__track" aria-hidden="true">
        <span className="toggle-switch__thumb" />
      </span>
      <span className={hideLabel ? 'visually-hidden' : 'toggle-switch__label'}>{label}</span>
    </button>
  )
}

export default ToggleSwitch
