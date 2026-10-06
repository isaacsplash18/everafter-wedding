/**
 * Everafter — Registry.
 *
 * A short list of external retailers plus two zero-fee cash funds. Nothing
 * here processes a real payment — the "give" buttons are a demo affordance,
 * clearly labelled as such.
 */
import FundProgress from '../../components/guest/FundProgress'
import { useSectionReveal } from '../../lib/motion'
import '../../styles/guest-registry.css'

const RETAILERS = [
  { name: 'Crate & Barrel', href: 'https://www.crateandbarrel.com' },
  { name: 'West Elm', href: 'https://www.westelm.com' },
  { name: 'Powell’s Books', href: 'https://www.powells.com' },
]

export default function Registry() {
  const linksRef = useSectionReveal<HTMLDivElement>({ selector: '.registry-link', y: 10, stagger: 0.06 })
  const fundsRef = useSectionReveal<HTMLDivElement>({ selector: '.registry-fund', y: 16, stagger: 0.1 })
  const noteRef = useSectionReveal<HTMLParagraphElement>({ y: 10 })

  return (
    <div className="registry-page">
      <div className="registry-head">
        <h1>Registry</h1>
        <p>
          A short list of things we would use, and two funds that go straight toward what comes
          next — no fee ever taken off the top.
        </p>
      </div>

      <section>
        <h2>A few practical things</h2>
        <div className="registry-links" ref={linksRef}>
          {RETAILERS.map((retailer) => (
            <a
              key={retailer.name}
              className="registry-link"
              href={retailer.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {retailer.name}
              <span className="registry-link__arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2>Or help us get there</h2>
        <div className="registry-funds" ref={fundsRef}>
          <FundProgress
            label="Honeymoon fund"
            description="Three weeks away, chasing the trip we keep almost booking."
            goal={6000}
            raised={2450}
          />
          <FundProgress
            label="First-home fund"
            description="Toward whatever comes after the apartment — a proper balcony would be nice."
            goal={10000}
            raised={3800}
          />
        </div>
      </section>

      <p className="registry-note" ref={noteRef}>
        Every dollar given here reaches us directly — no processing fee, no middleman. Your presence
        at AYANA is the actual gift; this is only for anyone who insists.
      </p>
    </div>
  )
}
