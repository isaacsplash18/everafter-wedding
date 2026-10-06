import { useEffect, useId, useRef } from 'react'
import { gsap, useReducedMotion } from '../../lib/motion'

export interface FaqItemProps {
  question: string
  answer: string
  open: boolean
  onToggle: () => void
}

/**
 * One accordion row. A real button drives real `aria-expanded`; the panel is
 * always in the DOM (never `display: none` behind a tween) so screen readers
 * and reduced-motion visitors get the same content, just without the height
 * animation.
 */
export function FaqItem({ question, answer, open, onToggle }: FaqItemProps) {
  const panelId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const firstRun = useRef(true)
  const wasOpen = useRef(open)

  useEffect(() => {
    const node = panelRef.current
    if (!node) return

    if (firstRun.current) {
      firstRun.current = false
      wasOpen.current = open
      gsap.set(node, { height: open ? 'auto' : 0, overflow: 'hidden' })
      return
    }

    if (wasOpen.current === open) return
    wasOpen.current = open

    if (reduced) {
      gsap.set(node, { height: open ? 'auto' : 0 })
      return
    }

    if (open) {
      gsap.set(node, { height: 0, overflow: 'hidden' })
      const target = node.scrollHeight
      gsap.to(node, {
        height: target,
        duration: 0.45,
        ease: 'power3.out',
        onComplete: () => gsap.set(node, { height: 'auto' }),
      })
    } else {
      gsap.set(node, { height: node.scrollHeight, overflow: 'hidden' })
      gsap.to(node, { height: 0, duration: 0.35, ease: 'power3.out' })
    }
  }, [open, reduced])

  return (
    <div className="faq-item">
      <h3 className="faq-item__heading">
        <button
          type="button"
          className="faq-item__button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span>{question}</span>
          <span className="faq-item__icon" aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
      </h3>
      <div id={panelId} role="region" aria-label={question} ref={panelRef} className="faq-item__panel">
        <p className="faq-item__panel-inner">{answer}</p>
      </div>
    </div>
  )
}

export default FaqItem
