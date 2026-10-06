/**
 * Meal options editor — add, edit and remove the dishes offered at the
 * reception. Every field writes straight to the store.
 */
import { useState } from 'react'
import type { FormEvent } from 'react'

import type { MealOption } from '../../data/types'
import { Button, TextField } from '../ui'
import { ConfirmButton } from './ConfirmButton'
import '../../styles/admin-settings.css'

export interface MealEditorProps {
  meals: MealOption[]
  onUpdate: (mealId: string, patch: Partial<Omit<MealOption, 'id'>>) => void
  onRemove: (mealId: string) => void
  onAdd: (meal: Omit<MealOption, 'id'>) => void
}

export function MealEditor({ meals, onUpdate, onRemove, onAdd }: MealEditorProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [vegetarian, setVegetarian] = useState(false)
  const [error, setError] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      setError('Give the dish a name.')
      return
    }
    onAdd({ name: name.trim(), description: description.trim(), vegetarian })
    setName('')
    setDescription('')
    setVegetarian(false)
    setError('')
    setOpen(false)
  }

  return (
    <div className="settings-list">
      {meals.map((meal) => (
        <div className="settings-card" key={meal.id}>
          <div className="inline-form__grid">
            <TextField
              label="Dish name"
              value={meal.name}
              onChange={(e) => onUpdate(meal.id, { name: e.target.value })}
              error={meal.name.trim() ? undefined : 'Every dish needs a name.'}
            />
            <TextField
              label="Description"
              value={meal.description}
              onChange={(e) => onUpdate(meal.id, { description: e.target.value })}
            />
          </div>
          <div className="inline-form__row">
            <label className="check-field">
              <input
                type="checkbox"
                checked={Boolean(meal.vegetarian)}
                onChange={(e) => onUpdate(meal.id, { vegetarian: e.target.checked })}
              />
              Vegetarian
            </label>
            <ConfirmButton
              label="Remove"
              confirmLabel="Yes, remove"
              prompt="Guests who chose this get an empty meal."
              size="sm"
              onConfirm={() => onRemove(meal.id)}
            />
          </div>
        </div>
      ))}

      {open ? (
        <form className="inline-form" onSubmit={submit}>
          <div className="inline-form__grid">
            <TextField
              label="Dish name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={error}
            />
            <TextField
              label="Description"
              optional
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="inline-form__row">
            <label className="check-field">
              <input type="checkbox" checked={vegetarian} onChange={(e) => setVegetarian(e.target.checked)} />
              Vegetarian
            </label>
          </div>
          <div className="inline-form__actions">
            <Button type="submit" size="sm">
              Add dish
            </Button>
            <Button type="button" variant="quiet" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
          + Add meal option
        </Button>
      )}
    </div>
  )
}

export default MealEditor
