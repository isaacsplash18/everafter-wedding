/**
 * Everafter — Photos.
 *
 * A masonry wall of guest photos (CSS columns, no JS measuring), like
 * buttons wired to `toggleLikePhoto`, and a small "share a photo" affordance
 * that calls `addPhoto` with a verified image the guest picks — a stand-in
 * for a real upload, since there is no backend.
 */
import { useState } from 'react'
import type { FormEvent } from 'react'

import { Button, TextField, buttonClass } from '../../components/ui'
import PhotoTile from '../../components/guest/PhotoTile'
import { GUEST_IMAGERY, unsplashUrl } from '../../components/guest/imagery'
import { useSectionReveal } from '../../lib/motion'
import { useWeddingStore } from '../../lib/store'
import '../../styles/guest-photos.css'

const SHARE_OPTIONS = [
  { id: GUEST_IMAGERY.travel, label: 'The coast' },
  { id: GUEST_IMAGERY.baliGate, label: 'The gates' },
  { id: GUEST_IMAGERY.signage, label: 'The sign' },
]

export default function Photos() {
  const photos = useWeddingStore((s) => s.photos)
  const addPhoto = useWeddingStore((s) => s.addPhoto)
  const toggleLikePhoto = useWeddingStore((s) => s.toggleLikePhoto)

  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [formOpen, setFormOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(SHARE_OPTIONS[0].id)
  const [caption, setCaption] = useState('')
  const [credit, setCredit] = useState('')

  const wallRef = useSectionReveal<HTMLDivElement>({
    selector: '.photos-tile',
    y: 16,
    stagger: 0.04,
  })

  const handleLike = (photoId: string) => {
    const alreadyLiked = likedIds.has(photoId)
    toggleLikePhoto(photoId, !alreadyLiked)
    setLikedIds((current) => {
      const next = new Set(current)
      if (alreadyLiked) next.delete(photoId)
      else next.add(photoId)
      return next
    })
  }

  const handleShare = (event: FormEvent) => {
    event.preventDefault()
    const trimmedCredit = credit.trim() || 'A guest'
    addPhoto({
      url: unsplashUrl(selectedId, 1200),
      alt: `A photograph shared by ${trimmedCredit}.`,
      caption: caption.trim() || 'One from somewhere on the way to June.',
      credit: trimmedCredit,
    })
    setCaption('')
    setCredit('')
    setFormOpen(false)
  }

  return (
    <div className="photos-page">
      <div className="photos-head">
        <div>
          <h1>The photo wall</h1>
          <p>
            The years that got us here — and, come June, everything you catch that we miss. Add
            yours below.
          </p>
        </div>
        <Button variant="secondary" onClick={() => setFormOpen((open) => !open)} aria-expanded={formOpen}>
          {formOpen ? 'Close' : 'Share a photo'}
        </Button>
      </div>

      {formOpen ? (
        <div className="photos-upload">
          <div className="photos-upload__head">
            <h2>Add to the wall</h2>
          </div>
          <form className="photos-upload__form" onSubmit={handleShare}>
            <div>
              <p className="field__label">Pick a photo</p>
              <div className="photos-upload__options" role="radiogroup" aria-label="Choose a photo to share">
                {SHARE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selectedId === option.id}
                    className={[
                      'photos-upload__option',
                      selectedId === option.id ? 'photos-upload__option--selected' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => setSelectedId(option.id)}
                  >
                    <img src={unsplashUrl(option.id, 400)} alt="" />
                    <span className="visually-hidden">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <TextField
              label="Caption"
              placeholder="What was happening here?"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              optional
            />
            <TextField
              label="Your name"
              placeholder="So we know who to thank"
              value={credit}
              onChange={(event) => setCredit(event.target.value)}
              optional
            />

            <div className="photos-upload__actions">
              <button type="submit" className={buttonClass({ variant: 'primary' })}>
                Add to the wall
              </button>
              <span className="photos-upload__note">Demo only — this stays on your device.</span>
            </div>
          </form>
        </div>
      ) : null}

      <div className="photos-masonry" ref={wallRef}>
        {photos.map((photo) => (
          <PhotoTile
            key={photo.id}
            photo={photo}
            liked={likedIds.has(photo.id)}
            onToggleLike={() => handleLike(photo.id)}
          />
        ))}
      </div>
    </div>
  )
}
