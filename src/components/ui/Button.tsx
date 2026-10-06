import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'quiet'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonOwnProps {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
  /** Recolours secondary/quiet for destructive admin actions. */
  danger?: boolean
}

export type ButtonProps = ButtonOwnProps & ButtonHTMLAttributes<HTMLButtonElement>

/**
 * Class string for the button look, so `<Link>` and `<a>` can wear it too.
 */
export function buttonClass({
  variant = 'primary',
  size = 'md',
  block = false,
  danger = false,
  className,
}: ButtonOwnProps & { className?: string } = {}): string {
  return [
    'btn',
    `btn--${variant}`,
    size !== 'md' ? `btn--${size}` : '',
    block ? 'btn--block' : '',
    danger ? 'btn--danger' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', block = false, danger = false, className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClass({ variant, size, block, danger, className })}
      {...rest}
    />
  )
})

export default Button
