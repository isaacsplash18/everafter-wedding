import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface FieldShellProps {
  label: string
  /** Shown under the control in muted ink. */
  hint?: string
  /** Any non-empty string puts the field in its error state. */
  error?: string
  /** Appends a quiet "optional" to the label. */
  optional?: boolean
}

export type TextFieldProps = FieldShellProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
    id?: string
  }

/**
 * Label above, 0.875rem/500. Errors are announced as text — never colour alone.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, optional, id, className, ...rest },
  ref,
) {
  const generatedId = useId()
  const fieldId = id ?? `text-${generatedId}`
  const hintId = hint ? `${fieldId}-hint` : undefined
  const errorId = error ? `${fieldId}-error` : undefined

  return (
    <div className={['field', error ? 'field--invalid' : '', className ?? ''].filter(Boolean).join(' ')}>
      <label className="field__label" htmlFor={fieldId}>
        {label}
        {optional ? <span className="field__optional">optional</span> : null}
      </label>
      <span className="field__control">
        <input
          ref={ref}
          id={fieldId}
          className="field__input"
          aria-invalid={error ? true : undefined}
          aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
          {...rest}
        />
      </span>
      {hint ? (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  )
})

export type TextAreaFieldProps = FieldShellProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
    id?: string
  }

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  function TextAreaField({ label, hint, error, optional, id, className, ...rest }, ref) {
    const generatedId = useId()
    const fieldId = id ?? `textarea-${generatedId}`
    const hintId = hint ? `${fieldId}-hint` : undefined
    const errorId = error ? `${fieldId}-error` : undefined

    return (
      <div className={['field', error ? 'field--invalid' : '', className ?? ''].filter(Boolean).join(' ')}>
        <label className="field__label" htmlFor={fieldId}>
          {label}
          {optional ? <span className="field__optional">optional</span> : null}
        </label>
        <span className="field__control">
          <textarea
            ref={ref}
            id={fieldId}
            className="field__input"
            aria-invalid={error ? true : undefined}
            aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
            {...rest}
          />
        </span>
        {hint ? (
          <p className="field__hint" id={hintId}>
            {hint}
          </p>
        ) : null}
        {error ? (
          <p className="field__error" id={errorId}>
            {error}
          </p>
        ) : null}
      </div>
    )
  },
)

export default TextField
