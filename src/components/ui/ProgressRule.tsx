export interface ProgressRuleProps {
  /** 1-based position. */
  value: number
  max: number
  /** Name of the current step, set in Marcellus beside the counter. */
  label?: string
  /** Accessible name for the progressbar. */
  ariaLabel?: string
  className?: string
}

/**
 * A honey rule that fills as the RSVP progresses — the same 1px stationery
 * motif, doing a second job. Width is a plain CSS transition, so it degrades
 * to an instant jump under reduced motion via the token overrides.
 */
export function ProgressRule({
  value,
  max,
  label,
  ariaLabel = 'RSVP progress',
  className,
}: ProgressRuleProps) {
  const safeMax = Math.max(1, max)
  const safeValue = Math.min(Math.max(value, 0), safeMax)
  const percent = (safeValue / safeMax) * 100

  return (
    <div className={['progress-rule', className ?? ''].filter(Boolean).join(' ')}>
      <div className="progress-rule__meta">
        <span className="progress-rule__step">
          Step {safeValue} of {safeMax}
        </span>
        {label ? <span className="progress-rule__label">{label}</span> : null}
      </div>
      <div
        className="progress-rule__track"
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={safeValue}
        aria-valuetext={label ? `Step ${safeValue} of ${safeMax}: ${label}` : undefined}
      >
        <div className="progress-rule__fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

export default ProgressRule
