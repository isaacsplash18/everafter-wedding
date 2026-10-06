import type { ReactNode } from 'react'

export type TagTone = 'indigo' | 'honey' | 'ok' | 'warn' | 'danger' | 'muted'

export interface TagChipProps {
  children: ReactNode
  /** Admin-only by default: indigo at 10%, indigo text, pill radius. */
  tone?: TagTone
  className?: string
  title?: string
}

export function TagChip({ children, tone = 'indigo', className, title }: TagChipProps) {
  return (
    <span
      className={['tag-chip', tone !== 'indigo' ? `tag-chip--${tone}` : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
      title={title}
    >
      {children}
    </span>
  )
}

/** Human labels for the seeded guest tags. */
export const TAG_LABELS: Record<string, string> = {
  family: 'Family',
  friends: 'Friends',
  'wedding-party': 'Wedding party',
  'out-of-town': 'Out of town',
}

export function tagLabel(tag: string): string {
  return TAG_LABELS[tag] ?? tag
}

export default TagChip
