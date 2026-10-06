import { useState } from 'react'
import { buttonClass } from '../ui'

export interface FundProgressProps {
  label: string
  description: string
  goal: number
  raised: number
}

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

/**
 * A decorative meter with a demo "give" affordance. Nothing here ever moves
 * real money — clicking through just nudges the bar and says thank you.
 */
export function FundProgress({ label, description, goal, raised }: FundProgressProps) {
  const [given, setGiven] = useState(false)
  const displayRaised = given ? raised + Math.round(goal * 0.05) : raised
  const percent = Math.min(100, Math.round((displayRaised / Math.max(1, goal)) * 100))

  return (
    <div className="registry-fund" data-reveal>
      <div className="registry-fund__head">
        <h3 className="registry-fund__label">{label}</h3>
        <span className="registry-fund__amounts tnum">
          {currency.format(displayRaised)} <span className="muted">of {currency.format(goal)}</span>
        </span>
      </div>
      <p className="registry-fund__description">{description}</p>
      <div
        className="registry-fund__bar"
        role="progressbar"
        aria-label={`${label} progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className="registry-fund__fill" style={{ width: `${percent}%` }} />
      </div>
      <p className="registry-fund__percent tnum">{percent}% of the way there</p>

      {given ? (
        <p className="registry-fund__thanks">Thank you — that means more than you know. (Demo only, nothing was charged.)</p>
      ) : (
        <button
          type="button"
          className={buttonClass({ variant: 'secondary', size: 'sm', className: 'registry-fund__cta' })}
          onClick={() => setGiven(true)}
        >
          Give to this fund
        </button>
      )}
    </div>
  )
}

export default FundProgress
