/**
 * Admin — Overview.
 *
 * The yardstick from PRODUCT.md: this page "answers the caterer's phone
 * call." Composed as a working brief — a lede sentence, a table of where
 * everyone stands, the exact counts a kitchen needs, and the reminder drip —
 * not a grid of hero-metric stat tiles.
 */
import {
  allergyList,
  eventStats,
  mealCounts,
  pendingParties,
  sortEvents,
  useWeddingStore,
} from '../../lib/store'
import { daysUntil, formatShortDate, pluralize } from '../../lib/format'
import { ConfirmButton } from '../../components/admin/ConfirmButton'
import { ReminderList } from '../../components/admin/ReminderList'
import '../../styles/admin-shared.css'
import '../../styles/admin-overview.css'

export default function Overview() {
  const state = useWeddingStore()
  const { config, events, reminders } = state

  const pending = pendingParties(state)
  const days = daysUntil(config.rsvpDeadlineISO)
  const orderedEvents = sortEvents(events)
  const meals = mealCounts(state)
  const allergies = allergyList(state)

  return (
    <section className="admin-page">
      <header className="page-head">
        <p className="eyebrow">Dashboard</p>
        <h1 className="page-head__title">Overview</h1>
      </header>

      <p className="brief-lede">
        <strong>{pending.length}</strong> {pluralize(pending.length, 'party', 'parties')}{' '}
        {pending.length === 1 ? 'has' : 'have'} not replied yet. RSVPs close{' '}
        <span className="brief-lede__deadline">{formatShortDate(config.rsvpDeadlineISO)}</span>
        {days >= 0 ? (
          <>
            {' '}
            — <strong>{days}</strong> {pluralize(days, 'day')} from today.
          </>
        ) : (
          <span className="brief-lede--closed"> — replies have closed.</span>
        )}
      </p>

      <div className="admin-section">
        <div className="admin-section__head">
          <h2 className="admin-section__title">Where everyone stands</h2>
          <p className="admin-section__note">Per event, by the numbers.</p>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Event</th>
                <th scope="col">Date</th>
                <th scope="col">Invited</th>
                <th scope="col">Attending</th>
                <th scope="col">Declined</th>
                <th scope="col">Pending</th>
              </tr>
            </thead>
            <tbody>
              {orderedEvents.map((event) => {
                const stats = eventStats(state, event.id)
                return (
                  <tr key={event.id}>
                    <th scope="row" style={{ fontWeight: 500 }}>
                      {event.name}
                    </th>
                    <td className="muted">{formatShortDate(event.dateISO)}</td>
                    <td className="tnum">{stats.invited}</td>
                    <td className="tnum">{stats.attending}</td>
                    <td className="tnum">{stats.declined}</td>
                    <td className="tnum">{stats.pending}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-section">
        <div className="admin-section__head">
          <h2 className="admin-section__title">What the kitchen needs</h2>
          <p className="admin-section__note">
            Meal counts and every dietary note attached to someone who is actually coming to
            dinner.
          </p>
        </div>

        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Dish</th>
                <th scope="col">Count</th>
              </tr>
            </thead>
            <tbody>
              {meals.rows.map(({ meal, count }) => (
                <tr key={meal.id}>
                  <th scope="row" style={{ fontWeight: 500 }}>
                    {meal.name}
                    {meal.vegetarian ? <span className="muted small"> · vegetarian</span> : null}
                  </th>
                  <td className="tnum">{count}</td>
                </tr>
              ))}
              <tr>
                <th scope="row" className="muted" style={{ fontWeight: 400 }}>
                  No meal chosen yet
                </th>
                <td className="tnum">{meals.unselected}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="admin-section__title" style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>
            Allergies &amp; dietary notes
          </h3>
          {allergies.length === 0 ? (
            <p className="admin-empty">No dietary notes recorded yet.</p>
          ) : (
            <div className="allergy-list">
              {allergies.map((entry) => (
                <div className="allergy-row" key={entry.guestId}>
                  <p className="allergy-row__who">
                    {entry.name} <span>({entry.partyLabel})</span>
                  </p>
                  <p className="allergy-row__meal">{entry.meal}</p>
                  <p className="allergy-row__notes">{entry.notes}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="admin-section">
        <div className="admin-section__head">
          <h2 className="admin-section__title">Reminder schedule</h2>
          <p className="admin-section__note">
            The drip that would go out before the deadline. Demo UI — nothing is ever actually
            sent.
          </p>
        </div>
        <ReminderList
          reminders={reminders}
          onToggle={(id) => useWeddingStore.getState().toggleReminder(id)}
        />
      </div>

      <div className="admin-footer-note">
        <p className="admin-section__note">
          Reset the whole dashboard back to its seeded demo state. Every RSVP, added guest and
          setting change made in this session will be lost.
        </p>
        <ConfirmButton
          label="Reset demo data"
          confirmLabel="Yes, reset everything"
          prompt="This clears every change made in this session."
          onConfirm={() => useWeddingStore.getState().resetDemo()}
        />
      </div>
    </section>
  )
}
