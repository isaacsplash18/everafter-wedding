import { useSectionReveal } from '../../lib/motion'

export interface StoryBeatProps {
  index: string
  title: string
  date: string
  text: string
  imgSrc: string
  imgAlt: string
  reverse?: boolean
}

/** One alternating timeline entry — image and text swap sides in pairs. */
export function StoryBeat({ index, title, date, text, imgSrc, imgAlt, reverse }: StoryBeatProps) {
  const ref = useSectionReveal<HTMLDivElement>({
    selector: '[data-reveal]',
    y: 28,
    stagger: 0.12,
  })

  return (
    <div
      className={['story-beat', reverse ? 'story-beat--reverse' : ''].filter(Boolean).join(' ')}
      ref={ref}
    >
      <figure className="story-beat__media" data-reveal>
        <img className="story-beat__img" src={imgSrc} alt={imgAlt} loading="lazy" />
      </figure>
      <div className="story-beat__body" data-reveal>
        <span className="story-beat__index">{index}</span>
        <h2 className="story-beat__title">{title}</h2>
        <p className="story-beat__date">{date}</p>
        <p className="story-beat__text">{text}</p>
      </div>
    </div>
  )
}

export default StoryBeat
