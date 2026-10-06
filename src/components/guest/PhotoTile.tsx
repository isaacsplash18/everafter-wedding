import type { GuestPhoto } from '../../data/seed'

export interface PhotoTileProps {
  photo: GuestPhoto
  liked: boolean
  onToggleLike: () => void
}

export function PhotoTile({ photo, liked, onToggleLike }: PhotoTileProps) {
  return (
    <figure className="photos-tile" data-reveal>
      <img className="photos-tile__img" src={photo.url} alt={photo.alt} loading="lazy" />
      <figcaption className="photos-tile__caption">
        <span className="photos-tile__text">
          <span className="photos-tile__caption-line">{photo.caption}</span>
          <span className="photos-tile__credit">— {photo.credit}</span>
        </span>
        <button
          type="button"
          className={['photos-tile__like', liked ? 'photos-tile__like--active' : '']
            .filter(Boolean)
            .join(' ')}
          aria-pressed={liked}
          onClick={onToggleLike}
        >
          <svg viewBox="0 0 20 18" aria-hidden="true" className="photos-tile__heart">
            <path d="M10 17 1.9 9.4C-0.6 6.9 0 3 3.4 1.6 5.8 0.6 8.6 1.4 10 3.6 11.4 1.4 14.2 0.6 16.6 1.6 20 3 20.6 6.9 18.1 9.4Z" />
          </svg>
          <span className="tnum">{photo.likes}</span>
          <span className="visually-hidden">{liked ? 'Unlike this photo' : 'Like this photo'}</span>
        </button>
      </figcaption>
    </figure>
  )
}

export default PhotoTile
