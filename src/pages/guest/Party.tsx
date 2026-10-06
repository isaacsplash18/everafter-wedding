/**
 * Everafter — Party.
 *
 * The wedding party as a roster, not a headshot grid: a monogram mark, a
 * name, a role, one line of bio, rule dividers between entries — the
 * printed-program voice rather than a SaaS team page.
 */
import PersonCard from '../../components/guest/PersonCard'
import { GUEST_IMAGERY, unsplashUrl } from '../../components/guest/imagery'
import { useSectionReveal } from '../../lib/motion'
import '../../styles/guest-party.css'

const WEDDING_PARTY = [
  {
    name: 'Mia Lim',
    role: 'Maid of Honor',
    bio: "Sam's younger sister, and the keeper of the family group chat since she got her first phone.",
  },
  {
    name: 'Owen Tan',
    role: 'Best Man',
    bio: "Alex's older brother. Terrible at writing toasts, excellent at everything else.",
  },
  {
    name: 'Jonah Reyes',
    role: 'Groomsman',
    bio: "Alex's university roommate, now his Saturday-morning kopi companion and worst influence.",
  },
  {
    name: 'Clara Ng',
    role: 'Bridesmaid',
    bio: "Sam's best friend since secondary school, and still the only one who can talk her down.",
  },
  {
    name: 'Anika Rao',
    role: 'Bridesmaid',
    bio: 'Met Sam at her first job in Singapore. The deadline jokes have not stopped since.',
  },
  {
    name: 'Ethan Koh',
    role: 'Groomsman',
    bio: "Alex's cousin, and the unofficial DJ of every Tan family gathering on record.",
  },
  {
    name: 'Hannah Sim',
    role: 'Bridesmaid',
    bio: "Owen's partner, adopted into the group so thoroughly nobody remembers a time before her.",
  },
  {
    name: 'Ryan Goh',
    role: 'Groomsman',
    bio: "Sam's flatmate through grad school, and reliably the one who brings the good wine.",
  },
]

export default function Party() {
  const rosterRef = useSectionReveal<HTMLUListElement>({
    selector: '.party-person',
    y: 14,
    stagger: 0.05,
  })

  return (
    <div>
      <div className="party-hero">
        <img
          className="party-hero__img"
          src={unsplashUrl(GUEST_IMAGERY.party)}
          alt="The people who will be standing closest on the day."
        />
        <div className="party-hero__wash" aria-hidden="true" />
        <div className="party-hero__content">
          <h1>The wedding party</h1>
        </div>
      </div>

      <div className="party-page">
        <p className="party-intro">
          The people standing beside us on the twelfth, and the short version of why we asked them.
        </p>

        <ul className="party-roster" ref={rosterRef}>
          {WEDDING_PARTY.map((person) => (
            <PersonCard key={person.name} {...person} />
          ))}
        </ul>
      </div>
    </div>
  )
}
