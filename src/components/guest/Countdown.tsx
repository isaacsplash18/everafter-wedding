import { daysUntil, pluralize } from '../../lib/format'

export interface CountdownProps {
  dateISO: string
  className?: string
}

/**
 * "62 days to go" — the hero's quiet urgency. Past the date it retires itself
 * to a plain thank-you rather than showing a negative number.
 */
export function Countdown({ dateISO, className }: CountdownProps) {
  const days = daysUntil(dateISO)

  if (days < 0) {
    return (
      <p className={['countdown', className ?? ''].filter(Boolean).join(' ')}>
        Married at last.
      </p>
    )
  }

  if (days === 0) {
    return (
      <p className={['countdown', className ?? ''].filter(Boolean).join(' ')}>
        <span className="countdown__number tnum">Today</span>
      </p>
    )
  }

  return (
    <p className={['countdown', className ?? ''].filter(Boolean).join(' ')}>
      <span className="countdown__number tnum">{days}</span>
      <span className="countdown__unit">{pluralize(days, 'day')} to go</span>
    </p>
  )
}

export default Countdown
