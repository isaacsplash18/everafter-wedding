/**
 * Everafter — motion.
 *
 * One place registers ScrollTrigger. Every tween in the app goes through
 * `withMotion`, which is a thin `gsap.matchMedia()` wrapper with a
 * `(prefers-reduced-motion: reduce)` branch. The reduced branch never leaves
 * content hidden: it either does nothing or crossfades instantly.
 *
 * House rule, from DESIGN.md: content is visible by default. Use `from` tweens
 * or set initial state in JS — never hide anything in CSS pending an animation.
 */

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

let registered = false
if (typeof window !== 'undefined' && !registered) {
  gsap.registerPlugin(ScrollTrigger)
  registered = true
}

export { gsap, ScrollTrigger, useGSAP }

export const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'
export const FULL_QUERY = '(prefers-reduced-motion: no-preference)'

/** Guest-site defaults, straight from DESIGN.md. */
export const EASE = 'power3.out'
export const REVEAL_DURATION = 0.7
export const REVEAL_DISTANCE = 24
/** Admin: state-change transitions only, 150–200ms. */
export const ADMIN_DURATION = 0.18

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(REDUCED_QUERY).matches
}

/** React-land mirror of the media query, so components can branch on it. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const query = window.matchMedia(REDUCED_QUERY)
    const onChange = () => setReduced(query.matches)
    onChange()
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return reduced
}

export interface MotionBranch {
  /** True when the visitor asked for less motion. */
  reduced: boolean
  context: gsap.Context
}

/**
 * Run `build` inside a `gsap.matchMedia()` with both motion branches wired up.
 * Returns the MatchMedia so callers outside a `gsap.context` can revert it.
 */
export function withMotion(
  build: (branch: MotionBranch) => void | (() => void),
  scope?: Element | null,
): gsap.MatchMedia {
  const mm = gsap.matchMedia(scope ?? undefined)
  mm.add({ full: FULL_QUERY, reduced: REDUCED_QUERY }, (context) => {
    const reduced = Boolean(context.conditions?.reduced)
    return build({ reduced, context })
  })
  return mm
}

/**
 * Wall-clock completion guard. GSAP's ticker rides requestAnimationFrame,
 * which suspended tabs, headless renderers, and throttled iframes stop
 * entirely — an entrance tween then freezes and content it hides never
 * appears. After `ms` of real time, if the ticker provably hasn't advanced,
 * jump the animation to its finished state. In a healthy renderer the frame
 * counter advances and this is a no-op, so the choreography is untouched.
 */
export function guardCompletion(anim: gsap.core.Animation, ms = 1800): void {
  if (typeof window === 'undefined') return
  let done = false
  anim.eventCallback('onComplete', () => {
    done = true
  })
  // Poll on wall-clock timers (which survive rAF suspension). If the ticker
  // frame counter hasn't moved across a whole window while the animation is
  // unfinished, the renderer is stalled — jump to the end state. A merely
  // not-yet-triggered ScrollTrigger tween in a healthy renderer never trips
  // this: its ticker keeps advancing, so we just keep watching.
  const check = (frameAtLastCheck: number) => {
    if (done) return
    try {
      if (anim.progress() >= 1) return
      if (gsap.ticker.frame === frameAtLastCheck) {
        anim.progress(1)
        return
      }
      window.setTimeout(() => check(gsap.ticker.frame), 500)
    } catch {
      // Animation was killed/reverted; nothing to guard anymore.
    }
  }
  window.setTimeout(() => check(gsap.ticker.frame), ms)
}

/* -------------------------------------------------------------------------- */
/* Section reveals                                                             */
/* -------------------------------------------------------------------------- */

export interface SectionRevealOptions {
  /** Children to stagger in. Pass `null` to reveal the container itself. */
  selector?: string | null
  y?: number
  duration?: number
  stagger?: number
  delay?: number
  /** ScrollTrigger `start`. */
  start?: string
  once?: boolean
  ease?: string
  dependencies?: unknown[]
}

/**
 * Scroll reveal for a section: children marked `data-reveal` rise 24px and fade
 * in on `power3.out`. Each section should tune the options to its own content
 * rather than reaching for the same reflex everywhere.
 *
 * Under reduced motion nothing animates at all — the content simply is there.
 */
export function useSectionReveal<T extends HTMLElement = HTMLDivElement>(
  options: SectionRevealOptions = {},
) {
  const {
    selector = '[data-reveal]',
    y = REVEAL_DISTANCE,
    duration = REVEAL_DURATION,
    stagger = 0.08,
    delay = 0,
    start = 'top 82%',
    once = true,
    ease = EASE,
    dependencies = [],
  } = options

  const ref = useRef<T>(null)

  useGSAP(
    () => {
      const root = ref.current
      if (!root) return

      const targets: Element[] = selector
        ? Array.from(root.querySelectorAll(selector))
        : [root]
      if (targets.length === 0) return

      withMotion(({ reduced }) => {
        if (reduced) return
        // fromTo with explicit end values: a from() interrupted mid-tween and
        // re-run (HMR, remount race) would freeze at the partial inline state.
        const tween = gsap.fromTo(
          targets,
          { y, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration,
            delay,
            stagger,
            ease,
            scrollTrigger: { trigger: root, start, once },
          },
        )
        guardCompletion(tween)
      }, root)
    },
    { scope: ref, dependencies },
  )

  return ref
}

/* -------------------------------------------------------------------------- */
/* Shared gestures                                                             */
/* -------------------------------------------------------------------------- */

/**
 * The stationery rule drawing itself across the page — the motif used on the
 * hero and on the "Sealed with love" confirmation.
 */
export function drawRule(
  target: Element | null,
  { reduced, duration = 0.9, delay = 0 }: { reduced: boolean; duration?: number; delay?: number },
): gsap.core.Tween | null {
  if (!target) return null
  if (reduced) {
    gsap.set(target, { scaleX: 1, transformOrigin: 'left center' })
    return null
  }
  const tween = gsap.fromTo(
    target,
    { scaleX: 0, transformOrigin: 'left center' },
    { scaleX: 1, duration, delay, ease: EASE },
  )
  guardCompletion(tween)
  return tween
}

/**
 * RSVP step transition: the outgoing step slides left and fades, the incoming
 * step arrives from the right. Two halves of one ~0.45s move, each returned as
 * a timeline so the caller can chain or kill it.
 */
export const STEP_OUT_DURATION = 0.22
export const STEP_IN_DURATION = 0.23

export function stepOut(
  target: Element | null,
  { reduced, direction = 1 }: { reduced: boolean; direction?: number },
): gsap.core.Timeline | null {
  if (!target) return null
  const tl = gsap.timeline()
  if (reduced) {
    tl.to(target, { opacity: 0, duration: 0.001 })
    return tl
  }
  tl.to(target, {
    x: -24 * direction,
    opacity: 0,
    duration: STEP_OUT_DURATION,
    ease: 'power2.in',
  })
  // A stalled renderer must not deadlock the flow: forcing completion also
  // fires onComplete, so the caller's step sequencing continues.
  guardCompletion(tl, 600)
  return tl
}

export function stepIn(
  target: Element | null,
  { reduced, direction = 1 }: { reduced: boolean; direction?: number },
): gsap.core.Timeline | null {
  if (!target) return null
  const tl = gsap.timeline()
  if (reduced) {
    // No slide, no fade to wait through — the step is simply present.
    tl.set(target, { x: 0, opacity: 1 })
    return tl
  }
  tl.fromTo(
    target,
    { x: 24 * direction, opacity: 0 },
    { x: 0, opacity: 1, duration: STEP_IN_DURATION, ease: EASE },
  )
  guardCompletion(tl, 600)
  return tl
}
