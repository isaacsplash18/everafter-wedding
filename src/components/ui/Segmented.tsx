import { useId } from 'react'

export interface SegmentedOption<T extends string = string> {
  value: T
  label: string
}

export interface SegmentedProps<T extends string = string> {
  /** Accessible name for the group, e.g. "Sophie Chen — Reception". */
  legend: string
  /** Render the legend visibly above the control instead of for readers only. */
  showLegend?: boolean
  options: SegmentedOption<T>[]
  value: T | null
  onChange: (value: T) => void
  /** Unique radio group name; generated when omitted. */
  name?: string
  error?: string
  className?: string
  disabled?: boolean
}

/**
 * The attendance toggle: "Joyfully accepts" / "Regretfully declines".
 *
 * Real radio inputs under the hood, so arrow keys, screen readers and form
 * semantics all behave. Selected state = honey wash fill, honey border, deep
 * honey text — never colour alone, the label carries the meaning.
 */
export function Segmented<T extends string = string>({
  legend,
  showLegend = false,
  options,
  value,
  onChange,
  name,
  error,
  className,
  disabled,
}: SegmentedProps<T>) {
  const generatedName = useId()
  const groupName = name ?? `segmented-${generatedName}`
  const errorId = error ? `${groupName}-error` : undefined

  return (
    <fieldset
      className={['segmented-group', className ?? ''].filter(Boolean).join(' ')}
      aria-describedby={errorId}
      disabled={disabled}
    >
      <legend className={showLegend ? 'field__label' : 'visually-hidden'}>{legend}</legend>
      <div
        className="segmented"
        style={{ ['--segmented-cols' as string]: String(options.length) }}
      >
        {options.map((option) => {
          const selected = value === option.value
          return (
            <label
              key={option.value}
              className={['segmented__option', selected ? 'segmented__option--selected' : '']
                .filter(Boolean)
                .join(' ')}
            >
              <input
                className="segmented__input"
                type="radio"
                name={groupName}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
              />
              <span className="segmented__mark" aria-hidden="true" />
              <span className="segmented__label">{option.label}</span>
            </label>
          )
        })}
      </div>
      {error ? (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}

/** The two answers the whole product is built around. */
export const ATTENDANCE_OPTIONS: SegmentedOption<'accept' | 'decline'>[] = [
  { value: 'accept', label: 'Joyfully accepts' },
  { value: 'decline', label: 'Regretfully declines' },
]

export default Segmented
