/**
 * A two-step inline confirmation for irreversible admin actions ("Reset demo
 * data", "Remove meal option"). No modal — the button itself becomes a
 * question, calmly, in place.
 */
import { useState } from 'react'

import { Button } from '../ui'
import type { ButtonSize } from '../ui'
import '../../styles/admin-shared.css'

export interface ConfirmButtonProps {
  label: string
  confirmLabel?: string
  prompt?: string
  onConfirm: () => void
  size?: ButtonSize
}

export function ConfirmButton({
  label,
  confirmLabel = 'Yes, confirm',
  prompt = 'Are you sure?',
  onConfirm,
  size = 'md',
}: ConfirmButtonProps) {
  const [armed, setArmed] = useState(false)

  if (!armed) {
    return (
      <Button variant="secondary" danger size={size} onClick={() => setArmed(true)}>
        {label}
      </Button>
    )
  }

  return (
    <span className="confirm-inline">
      <span className="confirm-inline__prompt">{prompt}</span>
      <Button
        variant="secondary"
        danger
        size={size}
        onClick={() => {
          onConfirm()
          setArmed(false)
        }}
      >
        {confirmLabel}
      </Button>
      <Button variant="quiet" size={size} onClick={() => setArmed(false)}>
        Cancel
      </Button>
    </span>
  )
}

export default ConfirmButton
