/**
 * Everafter — small formatting helpers.
 *
 * Dates in the data model are bare calendar strings (`YYYY-MM-DD`) and bare
 * wall times (`HH:mm`). They are deliberately not `Date` objects: the wedding
 * starts at four o'clock in Bali whatever timezone the guest's phone happens
 * to be in. Everything here builds local dates by hand so a `YYYY-MM-DD`
 * never slips a day across the UTC boundary.
 */

/** `2027-06-12` -> a local Date at midnight on that calendar day. */
export function parseCalendarDate(dateISO: string): Date {
  const [year, month, day] = dateISO.split('-').map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

/** `16:00` -> `{ hours: 16, minutes: 0 }` */
export function parseWallTime(time: string): { hours: number; minutes: number } {
  const [hours, minutes] = time.split(':').map(Number)
  return { hours: hours ?? 0, minutes: minutes ?? 0 }
}

/** `16:00` -> `4:00 pm`; `00:00` -> `midnight`. */
export function formatTime(time: string): string {
  const { hours, minutes } = parseWallTime(time)
  if (hours === 0 && minutes === 0) return 'midnight'
  if (hours === 12 && minutes === 0) return 'noon'
  const suffix = hours < 12 ? 'am' : 'pm'
  const display = hours % 12 === 0 ? 12 : hours % 12
  return `${display}:${String(minutes).padStart(2, '0')} ${suffix}`
}

/** `16:00`–`00:00` -> `4:00 pm – midnight`. */
export function formatTimeRange(start: string, end?: string): string {
  return end ? `${formatTime(start)} – ${formatTime(end)}` : formatTime(start)
}

export function formatDate(
  dateISO: string,
  options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
): string {
  return parseCalendarDate(dateISO).toLocaleDateString('en-US', options)
}

/** `2027-06-12` -> `Saturday, June 12`. */
export function formatDayAndDate(dateISO: string): string {
  return formatDate(dateISO, { weekday: 'long', month: 'long', day: 'numeric' })
}

/** `2027-06-12` -> `Jun 12, 2027`. */
export function formatShortDate(dateISO: string): string {
  return formatDate(dateISO, { month: 'short', day: 'numeric', year: 'numeric' })
}

/** An ISO timestamp -> `Mar 6, 2027 at 10:14 am`. */
export function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })} at ${date
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    .toLowerCase()}`
}

/** Whole days from today until a calendar date. Negative once it has passed. */
export function daysUntil(dateISO: string, from: Date = new Date()): number {
  const target = parseCalendarDate(dateISO)
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  return Math.round((target.getTime() - start.getTime()) / 86_400_000)
}

/** Replies close at the end of the deadline day, so today still counts. */
export function isDeadlinePassed(deadlineISO: string, from: Date = new Date()): boolean {
  return daysUntil(deadlineISO, from) < 0
}

/** `1` -> `one`, up to twelve; anything larger comes back as digits. */
const SMALL_NUMBERS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six',
  'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
]

export function spellNumber(value: number): string {
  return SMALL_NUMBERS[value] ?? String(value)
}

/** `['Ada', 'Ben', 'Cara']` -> `Ada, Ben and Cara`. */
export function joinNames(names: string[]): string {
  if (names.length === 0) return ''
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? singular : plural
}
