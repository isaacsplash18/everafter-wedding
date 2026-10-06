/**
 * Everafter — Home.
 *
 * A full-bleed hero (photo under a --night wash) carries one orchestrated
 * load timeline: the honey rule draws, the names rise with a stagger, the
 * date fades in last. Below, three teaser sections are each built to their
 * own content — a typographic story moment, a panel-style schedule list, and
 * a full-bleed travel band — rather than one repeated card reflex.
 */
import { useRef } from 'react'
import { Link } from 'react-router-dom'

import { buttonClass } from '../../components/ui'
import Countdown from '../../components/guest/Countdown'
import { formatDate, formatTimeRange } from '../../lib/format'
import { EASE, gsap, guardCompletion, useGSAP, useSectionReveal, withMotion } from '../../lib/motion'
import { GUEST_IMAGERY, unsplashUrl } from '../../components/guest/imagery'
import { sortEvents, useWeddingStore } from '../../lib/store'
import '../../styles/guest-home.css'

function weekdayShort(dateISO: string): string {
  return formatDate(dateISO, { weekday: 'short' })
}

export default function Home() {
  const config = useWeddingStore((s) => s.config)
  const events = useWeddingStore((s) => s.events)

  const heroRef = useRef<HTMLDivElement>(null)
  const ruleRef = useRef<HTMLDivElement>(null)
  const nameRefs = useRef<(HTMLSpanElement | null)[]>([])
  const metaRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const [firstFull, secondFull] = config.coupleNames
  const orderedEvents = sortEvents(events)

  useGSAP(
    () => {
      withMotion(({ reduced }) => {
        if (reduced) return
        const tl = gsap.timeline({ defaults: { ease: EASE } })
        tl.fromTo(
          ruleRef.current,
          { scaleX: 0, transformOrigin: 'left center' },
          { scaleX: 1, duration: 0.9 },
        )
          // fromTo, not from: an interrupted run leaves partial inline values,
          // and a re-run's from() would adopt them as its end state.
          .fromTo(
            nameRefs.current.filter(Boolean),
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.85, stagger: 0.06 },
            '-=0.55',
          )
          .fromTo(
            metaRef.current,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.6 },
            '-=0.25',
          )
          .fromTo(
            bottomRef.current,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.6 },
            '-=0.35',
          )
        guardCompletion(tl, 2600)
        return () => {
          tl.kill()
        }
      }, heroRef.current)
    },
    { scope: heroRef },
  )

  const storyRef = useSectionReveal<HTMLElement>({ y: 20 })
  const scheduleRef = useSectionReveal<HTMLElement>({
    selector: '.home-schedule__item',
    y: 14,
    stagger: 0.06,
  })
  const travelRef = useSectionReveal<HTMLElement>({ y: 18, selector: '.home-travel__content' })

  return (
    <>
      <section className="home-hero" ref={heroRef}>
        <img
          className="home-hero__img"
          src={config.heroPhotoUrl}
          alt="A Balinese split gateway mirrored in still water."
        />
        <div className="home-hero__wash" aria-hidden="true" />
        <div className="home-hero__content">
          <div className="home-hero__rule" ref={ruleRef} />
          <h1 className="home-hero__names">
            <span className="home-hero__name" ref={(el) => (nameRefs.current[0] = el)}>
              {firstFull}
            </span>
            <span className="home-hero__amp" aria-hidden="true">
              &amp;
            </span>
            <span className="home-hero__name" ref={(el) => (nameRefs.current[1] = el)}>
              {secondFull}
            </span>
          </h1>
          <div className="home-hero__meta" ref={metaRef}>
            <span>{formatDate(config.dateISO)}</span>
            <span className="home-hero__meta-sep" aria-hidden="true">
              ·
            </span>
            <span>{config.city}</span>
          </div>
          <div className="home-hero__bottom" ref={bottomRef}>
            <Countdown dateISO={config.dateISO} />
            <Link className={buttonClass({ variant: 'primary', size: 'lg' })} to="/rsvp">
              RSVP
            </Link>
          </div>
        </div>
      </section>

      <section className="home-story" ref={storyRef}>
        <div className="home-story__inner">
          <div className="home-story__mark" aria-hidden="true">
            &amp;
          </div>
          <div data-reveal>
            <p className="home-story__quote">{config.tagline}</p>
            <p className="home-story__lede">
              A friendship years in the making, a quiet yes on an ordinary evening, and a cliff-top
              full of people who have been waiting for this weekend since it was announced.
            </p>
            <Link className="home-story__link link" to="/story">
              Read the whole story →
            </Link>
          </div>
        </div>
      </section>

      <section className="home-schedule" ref={scheduleRef}>
        <div className="home-schedule__inner">
          <div className="home-schedule__head">
            <h2>The weekend, briefly</h2>
            <p className="home-schedule__note">
              Find your invitation on the RSVP page to see exactly which of these are yours.
            </p>
          </div>
          <ul className="home-schedule__list">
            {orderedEvents.map((event) => (
              <li className="home-schedule__item" key={event.id}>
                <span className="home-schedule__day">{weekdayShort(event.dateISO)}</span>
                <span className="home-schedule__name">{event.name}</span>
                <span className="home-schedule__time tnum">{formatTimeRange(event.startTime)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="home-travel" ref={travelRef}>
        <img
          className="home-travel__img"
          src={unsplashUrl(GUEST_IMAGERY.travel)}
          alt="Limestone cliffs dropping to a turquoise bay in Bali, palm trees and a curve of white sand below."
        />
        <div className="home-travel__wash" aria-hidden="true" />
        <div className="home-travel__content" data-reveal>
          <h2>Getting to Bali</h2>
          <p>
            Fly into Ngurah Rai International (DPS), with a room block waiting at AYANA, a short
            shuttle from the airport.
          </p>
          <Link className={buttonClass({ variant: 'secondary', className: 'home-travel__link' })} to="/travel">
            Travel &amp; stay
          </Link>
        </div>
      </section>
    </>
  )
}
