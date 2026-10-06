import { forwardRef, useId } from 'react'
import type { ReactNode, SelectHTMLAttributes } from 'react'

export interface SelectOption {
  value: string
  label: string
  /** Second line under the option label in the surrounding UI, not the list. */
  description?: string
  disabled?: boolean
}

export type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'children'> & {
  label: string
  options: SelectOption[]
  /** Empty-value first entry, e.g. "Choose a dish". */
  placeholder?: string
  hint?: ReactNode
  error?: string
  optional?: boolean
  id?: string
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, options, placeholder, hint, error, optional, id, className, ...rest },
  ref,
) {
  const generatedId = useId()
  const fieldId = id ?? `select-${generatedId}`
  const hintId = hint ? `${fieldId}-hint` : undefined
  const errorId = error ? `${fieldId}-error` : undefined

  return (
    <div className={['field', error ? 'field--invalid' : '', className ?? ''].filter(Boolean).join(' ')}>
      <label className="field__label" htmlFor={fieldId}>
        {label}
        {optional ? <span className="field__optional">optional</span> : null}
      </label>
      <span className="field__control field__control--select">
        <select
          ref={ref}
          id={fieldId}
          className="field__input"
          aria-invalid={error ? true : undefined}
          aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
          {...rest}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
      </span>
      {hint ? (
        <div className="field__hint" id={hintId}>
          {hint}
        </div>
      ) : null}
      {error ? (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  )
})

export default SelectField
