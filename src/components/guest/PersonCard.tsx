export interface PersonCardProps {
  name: string
  role: string
  bio: string
}

/** A roster entry — an initial in a honey-wash mark, not a headshot grid. */
export function PersonCard({ name, role, bio }: PersonCardProps) {
  const initial = name.trim().charAt(0)

  return (
    <li className="party-person" data-reveal>
      <span className="party-person__mark" aria-hidden="true">
        {initial}
      </span>
      <span className="party-person__body">
        <span className="party-person__name">{name}</span>
        <span className="party-person__role">{role}</span>
        <span className="party-person__bio">{bio}</span>
      </span>
    </li>
  )
}

export default PersonCard
