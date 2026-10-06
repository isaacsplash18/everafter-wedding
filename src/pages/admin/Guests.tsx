/**
 * Admin — Guests.
 *
 * Party-grouped, searchable, filterable, exportable. Every mutation goes
 * straight through the store's own actions — this page owns no guest data of
 * its own.
 */
import { useMemo, useState } from 'react'

import { guestFullName, guestsOfParty, rsvpForParty, sortEvents, useWeddingStore } from '../../lib/store'
import type { WeddingData } from '../../lib/store'
import type { Party } from '../../data/types'
import { SelectField, TextField, tagLabel } from '../../components/ui'
import { AddGuestForm, AddPartyForm } from '../../components/admin/GuestIntakeForms'
import { CsvExportButton } from '../../components/admin/CsvExportButton'
import { GuestsTable } from '../../components/admin/GuestsTable'
import '../../styles/admin-shared.css'
import '../../styles/admin-guests.css'

const TAG_OPTIONS = ['family', 'friends', 'wedding-party', 'out-of-town']
const STATUS_OPTIONS = [
  { value: 'attending', label: 'Attending' },
  { value: 'declined', label: 'Declined' },
  { value: 'pending', label: 'Pending' },
]

type PartyStatus = 'attending' | 'declined' | 'pending'

function partyStatus(state: WeddingData, party: Party): PartyStatus {
  const rsvp = rsvpForParty(state, party.id)
  if (!rsvp) return 'pending'

  const members = guestsOfParty(state, party.id)
  let answered = false
  let anyAttending = false

  for (const guest of members) {
    for (const answer of rsvp.attendance.filter((a) => a.guestId === guest.id)) {
      answered = true
      if (answer.attending) anyAttending = true
    }
  }

  if (!answered) return 'pending'
  return anyAttending ? 'attending' : 'declined'
}

export default function AdminGuests() {
  const state = useWeddingStore()
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const events = useMemo(() => sortEvents(state.events), [state.events])

  const filteredParties = useMemo(() => {
    const query = search.trim().toLowerCase()

    return [...state.parties]
      .filter((party) => {
        if (!query) return true
        const members = guestsOfParty(state, party.id)
        const haystack = [party.label, ...members.map((g) => guestFullName(g))].join(' ').toLowerCase()
        return haystack.includes(query)
      })
      .filter((party) => {
        if (!tagFilter) return true
        return guestsOfParty(state, party.id).some((g) => g.tags.includes(tagFilter))
      })
      .filter((party) => {
        if (!statusFilter) return true
        return partyStatus(state, party) === statusFilter
      })
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [state, search, tagFilter, statusFilter])

  return (
    <section className="admin-page">
      <header className="page-head">
        <p className="eyebrow">Dashboard</p>
        <h1 className="page-head__title">Guest list</h1>
        <p className="admin-section__note">
          Every party, every named person, every answer — searchable, filterable and exportable.
        </p>
      </header>

      <div className="guests-toolbar">
        <div className="guests-toolbar__filters">
          <TextField
            label="Search"
            placeholder="Search by party or guest name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <SelectField
            label="Tag"
            placeholder="All tags"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            options={TAG_OPTIONS.map((tag) => ({ value: tag, label: tagLabel(tag) }))}
          />
          <SelectField
            label="Status"
            placeholder="Any status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={STATUS_OPTIONS}
          />
        </div>
        <div className="guests-toolbar__actions">
          <CsvExportButton state={state} />
        </div>
      </div>

      <div className="guests-toolbar__actions">
        <AddPartyForm onAdd={(label, allowance) => useWeddingStore.getState().addParty(label, allowance)} />
        <AddGuestForm
          parties={state.parties}
          onAdd={(partyId, guest) => useWeddingStore.getState().addGuestToParty(partyId, guest)}
        />
      </div>

      <p className="admin-section__note">
        {filteredParties.length} of {state.parties.length} {filteredParties.length === 1 ? 'party' : 'parties'}{' '}
        shown.
      </p>

      <GuestsTable
        state={state}
        parties={filteredParties}
        events={events}
        onSetAllowance={(partyId, allowance) => useWeddingStore.getState().setPartyAllowance(partyId, allowance)}
      />
    </section>
  )
}
