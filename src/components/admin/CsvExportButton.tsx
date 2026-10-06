/**
 * Client-side CSV export — one row per person, vendor-ready. No backend: the
 * file is built from `vendorRows` and handed to the browser as a blob.
 */
import { sortEvents, vendorRows } from '../../lib/store'
import type { WeddingData } from '../../lib/store'
import { formatTimestamp } from '../../lib/format'
import { Button } from '../ui'

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

function buildCsv(state: WeddingData): string {
  const rows = vendorRows(state)
  const eventNames = sortEvents(state.events).map((e) => e.name)

  const header = [
    'Party',
    'First name',
    'Last name',
    'Email',
    'Tags',
    'Child',
    'Plus-one',
    ...eventNames,
    'Meal',
    'Dietary notes',
    'Responded on',
  ]

  const lines = [header.map(csvCell).join(',')]

  for (const row of rows) {
    const line = [
      row.partyLabel,
      row.firstName,
      row.lastName,
      row.email,
      row.tags,
      row.isChild ? 'Yes' : 'No',
      row.isPlusOne ? 'Yes' : 'No',
      ...eventNames.map((name) => row.events[name] ?? ''),
      row.meal,
      row.dietaryNotes,
      row.respondedOn ? formatTimestamp(row.respondedOn) : '',
    ]
    lines.push(line.map((value) => csvCell(String(value))).join(','))
  }

  return lines.join('\r\n')
}

export interface CsvExportButtonProps {
  state: WeddingData
}

export function CsvExportButton({ state }: CsvExportButtonProps) {
  function handleExport() {
    const csv = buildCsv(state)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'everafter-guests.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleExport}>
      Export CSV
    </Button>
  )
}

export default CsvExportButton
