/**
 * Everafter — iCalendar export.
 *
 * Builds a valid RFC 5545 VCALENDAR for the events an attendee accepted, with a
 * real VTIMEZONE so "four o'clock" means four o'clock at AYANA no matter
 * where the guest's phone thinks it is.
 */

import { parseWallTime } from './format'
import type { WeddingConfig, WeddingEvent } from '../data/types'

const CRLF = '\r\n'

/** RFC 5545 §3.3.11 — escape TEXT values. */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/** UTF-8 byte length of a single code point. */
function utf8Length(char: string): number {
  const code = char.codePointAt(0) ?? 0
  if (code < 0x80) return 1
  if (code < 0x800) return 2
  if (code < 0x10000) return 3
  return 4
}

/**
 * RFC 5545 §3.1 — fold at 75 *octets*, never mid-character. Counting
 * characters instead of bytes is the classic way an em dash breaks an .ics.
 */
function foldLine(line: string): string {
  const LIMIT = 75
  const parts: string[] = []
  let current = ''
  let bytes = 0

  for (const char of line) {
    const size = utf8Length(char)
    if (bytes + size > LIMIT) {
      parts.push(current)
      current = ` ${char}`
      bytes = 1 + size
    } else {
      current += char
      bytes += size
    }
  }

  parts.push(current)
  return parts.join(CRLF)
}

const pad = (n: number) => String(n).padStart(2, '0')

/** `2027-06-12` + `16:00` -> `20270612T160000` (floating local, paired with TZID). */
function localStamp(dateISO: string, time: string, addDays = 0): string {
  const [year, month, day] = dateISO.split('-').map(Number)
  const { hours, minutes } = parseWallTime(time)
  const date = new Date(year, (month ?? 1) - 1, (day ?? 1) + addDays)
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `T${pad(hours)}${pad(minutes)}00`
  )
}

/** UTC stamp for DTSTAMP / UID freshness. */
function utcStamp(date: Date): string {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  )
}

/**
 * Asia/Makassar. A fixed UTC+8 zone with no daylight-saving rules, so unlike
 * the old US East Coast venue this VTIMEZONE needs only a single STANDARD
 * block — written out rather than relying on the client to know it, since a
 * bare TZID no calendar recognises is the classic reason an .ics lands an
 * hour off.
 */
const VTIMEZONE_MAKASSAR = [
  'BEGIN:VTIMEZONE',
  'TZID:Asia/Makassar',
  'X-LIC-LOCATION:Asia/Makassar',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:+0800',
  'TZOFFSETTO:+0800',
  'TZNAME:WITA',
  'DTSTART:19700101T000000',
  'END:STANDARD',
  'END:VTIMEZONE',
]

export interface BuildCalendarOptions {
  /** Prefixes each event title, e.g. "Alex & Sam". */
  calendarName: string
  /** Appended to every description. */
  footer?: string
  /** IANA zone; only Asia/Makassar ships a VTIMEZONE, others go floating. */
  timeZone?: string
}

/** Two hours is a decent default when an event has no stated end. */
const DEFAULT_DURATION_MINUTES = 120

function endStampFor(event: WeddingEvent): string {
  if (!event.endTime) {
    const start = parseWallTime(event.startTime)
    const total = start.hours * 60 + start.minutes + DEFAULT_DURATION_MINUTES
    const addDays = Math.floor(total / (24 * 60))
    const minutesOfDay = total % (24 * 60)
    const time = `${pad(Math.floor(minutesOfDay / 60))}:${pad(minutesOfDay % 60)}`
    return localStamp(event.dateISO, time, addDays)
  }

  const start = parseWallTime(event.startTime)
  const end = parseWallTime(event.endTime)
  // A reception that ends at 00:00 ends the *next* day.
  const rollsOver = end.hours * 60 + end.minutes <= start.hours * 60 + start.minutes
  return localStamp(event.dateISO, event.endTime, rollsOver ? 1 : 0)
}

export function buildCalendar(
  events: WeddingEvent[],
  options: BuildCalendarOptions,
): string {
  const now = new Date()
  const stamp = utcStamp(now)
  const zone = options.timeZone ?? 'Asia/Makassar'
  const useZone = zone === 'Asia/Makassar'
  const tzParam = useZone ? `;TZID=${zone}` : ''

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Everafter//Wedding RSVP//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(options.calendarName)}`,
    ...(useZone ? [`X-WR-TIMEZONE:${zone}`, ...VTIMEZONE_MAKASSAR] : []),
  ]

  for (const event of events) {
    const description = [event.description, event.dressCode ? `Dress: ${event.dressCode}` : '', options.footer ?? '']
      .filter(Boolean)
      .join('\n\n')

    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.id}-${event.dateISO}@everafter.love`,
      `DTSTAMP:${stamp}`,
      `DTSTART${tzParam}:${localStamp(event.dateISO, event.startTime)}`,
      `DTEND${tzParam}:${endStampFor(event)}`,
      `SUMMARY:${escapeText(`${options.calendarName} — ${event.name}`)}`,
      `LOCATION:${escapeText(`${event.venue}, ${event.address}`)}`,
      `DESCRIPTION:${escapeText(description)}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'TRIGGER:-P1D',
      `DESCRIPTION:${escapeText(`${event.name} is tomorrow.`)}`,
      'END:VALARM',
      'END:VEVENT',
    )
  }

  lines.push('END:VCALENDAR')

  return lines.map(foldLine).join(CRLF) + CRLF
}

/** Trigger a download of an .ics file the browser has never seen. */
export function downloadIcs(filename: string, contents: string): void {
  const blob = new Blob([contents], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename.endsWith('.ics') ? filename : `${filename}.ics`
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  // Give Safari a beat before revoking.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * The one-call version used by the RSVP confirmation: hand it the accepted
 * events and it puts an .ics in the guest's downloads folder.
 */
export function downloadWeddingCalendar(
  events: WeddingEvent[],
  config: WeddingConfig,
  filename = 'alex-and-sam.ics',
): void {
  const [one, two] = config.coupleNames
  const shortNames = `${one.split(' ')[0]} & ${two.split(' ')[0]}`
  const ics = buildCalendar(events, {
    calendarName: shortNames,
    footer: `Questions? Write to us at ${config.contactEmail}.`,
    timeZone: config.timeZone,
  })
  downloadIcs(filename, ics)
}
