/**
 * The party-grouped guest table. Sticky header, tabular numerals, one row per
 * party with a keyboard-accessible expand for the full per-person answers.
 */
import type { Party, WeddingEvent } from '../../data/types'
import type { WeddingData } from '../../lib/store'
import { PartyRow } from './PartyRow'
import '../../styles/admin-guests.css'

export interface GuestsTableProps {
  state: WeddingData
  parties: Party[]
  events: WeddingEvent[]
  onSetAllowance: (partyId: string, allowance: number) => void
}

export function GuestsTable({ state, parties, events, onSetAllowance }: GuestsTableProps) {
  return (
    <div className="data-table-wrap">
      <table className="data-table guests-table">
        <thead>
          <tr>
            <th scope="col">Party</th>
            <th scope="col">Members</th>
            <th scope="col">Tags</th>
            <th scope="col">Allowance</th>
            {events.map((event) => (
              <th scope="col" key={event.id}>
                {event.name}
              </th>
            ))}
            <th scope="col">Meals</th>
          </tr>
        </thead>
        <tbody>
          {parties.length === 0 ? (
            <tr>
              <td colSpan={5 + events.length} className="admin-empty">
                No parties match these filters.
              </td>
            </tr>
          ) : (
            parties.map((party) => (
              <PartyRow
                key={party.id}
                state={state}
                party={party}
                events={events}
                onSetAllowance={onSetAllowance}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default GuestsTable
