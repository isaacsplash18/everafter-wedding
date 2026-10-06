/**
 * Admin — Settings.
 *
 * Events, meal options, custom questions, and the wedding-wide config. Every
 * control writes straight to the store, so a change here (renaming an event,
 * say) is visible on Overview and the guest site immediately.
 */
import { sortEvents, useWeddingStore } from '../../lib/store'
import { ConfigForm } from '../../components/admin/ConfigForm'
import { EventEditor } from '../../components/admin/EventEditor'
import { MealEditor } from '../../components/admin/MealEditor'
import { QuestionEditor } from '../../components/admin/QuestionEditor'
import '../../styles/admin-shared.css'
import '../../styles/admin-settings.css'

export default function AdminSettings() {
  const state = useWeddingStore()
  const events = sortEvents(state.events)

  return (
    <section className="admin-page">
      <header className="page-head">
        <p className="eyebrow">Dashboard</p>
        <h1 className="page-head__title">Settings</h1>
        <p className="admin-section__note">
          Events, meal options, custom questions, and the wedding's own details.
        </p>
      </header>

      <div className="admin-section">
        <div className="admin-section__head">
          <h2 className="admin-section__title">Events</h2>
        </div>
        <EventEditor
          events={events}
          onUpdate={(id, patch) => useWeddingStore.getState().updateEvent(id, patch)}
        />
      </div>

      <div className="admin-section">
        <div className="admin-section__head">
          <h2 className="admin-section__title">Meal options</h2>
        </div>
        <MealEditor
          meals={state.meals}
          onUpdate={(id, patch) => useWeddingStore.getState().updateMeal(id, patch)}
          onRemove={(id) => useWeddingStore.getState().removeMeal(id)}
          onAdd={(meal) => useWeddingStore.getState().addMeal(meal)}
        />
      </div>

      <div className="admin-section">
        <div className="admin-section__head">
          <h2 className="admin-section__title">Custom questions</h2>
        </div>
        <QuestionEditor
          questions={state.questions}
          onUpdate={(id, patch) => useWeddingStore.getState().updateQuestion(id, patch)}
          onRemove={(id) => useWeddingStore.getState().removeQuestion(id)}
          onAdd={(question) => useWeddingStore.getState().addQuestion(question)}
        />
      </div>

      <div className="admin-section">
        <div className="admin-section__head">
          <h2 className="admin-section__title">Wedding details</h2>
        </div>
        <ConfigForm
          config={state.config}
          onUpdate={(patch) => useWeddingStore.getState().updateConfig(patch)}
        />
      </div>
    </section>
  )
}
