import { SelectField, TextField } from '../../../../components/ui'
import type { MealOption } from '../../../../data/types'
import type { Member, RsvpDraft } from '../model'

export interface StepMealsProps {
  meals: MealOption[]
  /** Only the people who accepted a meal-bearing event. */
  members: Member[]
  draft: RsvpDraft
  onMealChange: (memberKey: string, mealId: string) => void
  onNotesChange: (memberKey: string, notes: string) => void
  fieldErrors: Record<string, string>
}

/**
 * Step 4. A dish is bound to a named person, not to a household — this is the
 * answer the caterer actually needs, and the thing most RSVP tools get wrong.
 */
export function StepMeals({
  meals,
  members,
  draft,
  onMealChange,
  onNotesChange,
  fieldErrors,
}: StepMealsProps) {
  const options = meals.map((meal) => ({
    value: meal.id,
    label: meal.vegetarian ? `${meal.name} (vegetarian)` : meal.name,
  }))

  return (
    <div>
      <div className="rsvp-meal-menu">
        <h3 className="rsvp-meal-menu__title">Saturday’s menu</h3>
        {meals.map((meal) => (
          <p className="rsvp-meal-menu__item" key={meal.id}>
            <span className="rsvp-meal-menu__name">
              {meal.name}
              {meal.vegetarian ? ' (v)' : ''}
            </span>{' '}
            <span className="rsvp-meal-menu__desc">{meal.description}</span>
          </p>
        ))}
      </div>

      <div className="rsvp-people">
        {members.map((member) => {
          const choice = draft.meals[member.key]
          return (
            <section className="rsvp-person" key={member.key}>
              <h3 className="rsvp-person__name">{member.fullName}</h3>
              {member.isChild ? <p className="rsvp-person__meta">Child’s portion</p> : null}

              <div className="rsvp-person__body">
                <SelectField
                  label="Main course"
                  placeholder="Choose a dish"
                  options={options}
                  value={choice?.mealId ?? ''}
                  error={fieldErrors[member.key]}
                  onChange={(event) => onMealChange(member.key, event.target.value)}
                />
                <TextField
                  label="Allergies or dietary notes"
                  optional
                  placeholder="Anything the kitchen should know"
                  value={choice?.dietaryNotes ?? ''}
                  onChange={(event) => onNotesChange(member.key, event.target.value)}
                />
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

export default StepMeals
