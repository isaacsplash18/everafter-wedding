/**
 * The vendor-table status indicator: a small coloured dot plus a text label.
 * Colour never carries the meaning alone — the label is always rendered.
 */
import '../../styles/admin-shared.css'

export type StatusTone = 'ok' | 'warn' | 'danger' | 'muted'

export interface StatusDotProps {
  tone: StatusTone
  label: string
  /** Optional secondary text, e.g. a "2 of 4" breakdown for a mixed party. */
  detail?: string
  className?: string
}

export function StatusDot({ tone, label, detail, className }: StatusDotProps) {
  return (
    <span className={['status-dot', `status-dot--${tone}`, className ?? ''].filter(Boolean).join(' ')}>
      <span className="status-dot__mark" aria-hidden="true" />
      <span className="status-dot__label">{label}</span>
      {detail ? <span className="status-dot__detail">{detail}</span> : null}
    </span>
  )
}

export default StatusDot
