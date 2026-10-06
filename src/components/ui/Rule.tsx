import { forwardRef } from 'react'

export type RuleWidth = 'full' | 'half' | 'short'
export type RuleTone = 'indigo' | 'honey' | 'night'

export interface RuleProps {
  /** `short` is the 4.5rem stationery tick; `full` spans its container. */
  width?: RuleWidth
  tone?: RuleTone
  center?: boolean
  /** Adds generous vertical margin. */
  spaced?: boolean
  className?: string
  /** Decorative by default; pass a label to expose it as a separator. */
  label?: string
}

/**
 * The thin rule that runs through the whole invitation suite — 1px, partial
 * width, indigo unless a moment calls for honey.
 */
export const Rule = forwardRef<HTMLHRElement, RuleProps>(function Rule(
  { width = 'full', tone = 'indigo', center = false, spaced = false, className, label },
  ref,
) {
  return (
    <hr
      ref={ref}
      className={[
        'rule',
        width !== 'full' ? `rule--${width}` : '',
        tone !== 'indigo' ? `rule--${tone}` : '',
        center ? 'rule--center' : '',
        spaced ? 'rule--spaced' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden={label ? undefined : true}
      aria-label={label}
    />
  )
})

export default Rule
