/**
 * Everafter — Story.
 *
 * How we met, the trip that made it obvious, and the proposal — an
 * alternating timeline, each beat its own scroll reveal via
 * `useSectionReveal` (styled to its content: the image and copy rise
 * together with a stagger, not a uniform page-wide fade).
 */
import StoryBeat from '../../components/guest/StoryBeat'
import { GUEST_IMAGERY, unsplashUrl } from '../../components/guest/imagery'
import { useWeddingStore } from '../../lib/store'
import '../../styles/guest-story.css'

export default function Story() {
  const config = useWeddingStore((s) => s.config)
  const [firstFull, secondFull] = config.coupleNames
  const firstName = firstFull.split(' ')[0]
  const secondName = secondFull.split(' ')[0]

  return (
    <div className="story-page">
      <div className="story-intro">
        <h1>Our story</h1>
        <p>
          A friendship that turned into something else, a proposal neither of them tells quite the
          same way twice, and a wedding they still do not entirely believe is real yet.
        </p>
      </div>

      <div className="story-timeline">
        <StoryBeat
          index="One"
          title="The first hello"
          date="A mutual friend's gathering, a few years back"
          text={`${firstName} was pouring coffee badly at a friend's gathering. ${secondName} offered to take over. Neither of them remembers whose gathering it actually was.`}
          imgSrc={unsplashUrl(GUEST_IMAGERY.signage)}
          imgAlt="A carved wooden sign against a bright sky."
        />

        <StoryBeat
          index="Two"
          title="The trip that gave it away"
          date="No fixed plan, and a map that kept blowing out the window"
          text="Two weeks with nowhere they had to be. They came home having agreed on everything that mattered and nothing about directions."
          imgSrc={unsplashUrl(GUEST_IMAGERY.storyTrip)}
          imgAlt="A still green river winding between dense palms, a single outrigger canoe out in the middle of it."
          reverse
        />

        <StoryBeat
          index="Three"
          title="The yes"
          date="A quiet evening, at the end of an ordinary day"
          text="No plan survived contact with the moment. The ring came out early, and the answer was yes before the whole sentence was out."
          imgSrc={unsplashUrl(GUEST_IMAGERY.emptyRoom)}
          imgAlt="An empty reception hall, set and waiting, the morning before."
        />
      </div>
    </div>
  )
}
