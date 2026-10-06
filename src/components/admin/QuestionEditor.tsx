/**
 * Custom questions editor — the RSVP flow's optional extra questions (song
 * requests, shuttle seats, rehearsal attendance). Add, edit type/prompt/
 * options/perGuest/targetTags, or remove.
 */
import { useState } from 'react'
import type { FormEvent } from 'react'

import type { CustomQuestion } from '../../data/types'
import { Button, SelectField, TextField } from '../ui'
import { ToggleSwitch } from './ToggleSwitch'
import { ConfirmButton } from './ConfirmButton'
import '../../styles/admin-settings.css'

const TAG_OPTIONS = ['family', 'friends', 'wedding-party', 'out-of-town']
const TAG_LABELS: Record<string, string> = {
  family: 'Family',
  friends: 'Friends',
  'wedding-party': 'Wedding party',
  'out-of-town': 'Out of town',
}
const TYPE_OPTIONS = [
  { value: 'text', label: 'Open text' },
  { value: 'multiple', label: 'Multiple choice' },
]

function optionsToText(options?: string[]): string {
  return (options ?? []).join(', ')
}

function textToOptions(value: string): string[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

export interface QuestionEditorProps {
  questions: CustomQuestion[]
  onUpdate: (questionId: string, patch: Partial<Omit<CustomQuestion, 'id'>>) => void
  onRemove: (questionId: string) => void
  onAdd: (question: Omit<CustomQuestion, 'id'>) => void
}

export function QuestionEditor({ questions, onUpdate, onRemove, onAdd }: QuestionEditorProps) {
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [type, setType] = useState<'multiple' | 'text'>('text')
  const [options, setOptions] = useState('')
  const [perGuest, setPerGuest] = useState(false)
  const [targetTags, setTargetTags] = useState<string[]>([])
  const [error, setError] = useState('')

  function toggleTag(tag: string) {
    setTargetTags((current) => (current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]))
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!prompt.trim()) {
      setError('Every question needs a prompt.')
      return
    }
    onAdd({
      type,
      prompt: prompt.trim(),
      options: type === 'multiple' ? textToOptions(options) : undefined,
      perGuest,
      targetTags: targetTags.length > 0 ? targetTags : undefined,
    })
    setPrompt('')
    setType('text')
    setOptions('')
    setPerGuest(false)
    setTargetTags([])
    setError('')
    setOpen(false)
  }

  return (
    <div className="settings-list">
      {questions.map((question) => (
        <div className="settings-card" key={question.id}>
          <div className="inline-form__grid">
            <TextField
              label="Prompt"
              value={question.prompt}
              onChange={(e) => onUpdate(question.id, { prompt: e.target.value })}
              error={question.prompt.trim() ? undefined : 'Every question needs a prompt.'}
            />
            <SelectField
              label="Type"
              value={question.type}
              onChange={(e) =>
                onUpdate(question.id, {
                  type: e.target.value as CustomQuestion['type'],
                  options: e.target.value === 'multiple' ? question.options ?? [] : undefined,
                })
              }
              options={TYPE_OPTIONS}
            />
          </div>

          {question.type === 'multiple' ? (
            <TextField
              label="Options"
              hint="Comma-separated, shown in this order."
              value={optionsToText(question.options)}
              onChange={(e) => onUpdate(question.id, { options: textToOptions(e.target.value) })}
            />
          ) : null}

          <div className="inline-form__row">
            <ToggleSwitch
              label="Ask once per attending guest"
              checked={question.perGuest}
              onChange={(v) => onUpdate(question.id, { perGuest: v })}
            />
          </div>

          <fieldset>
            <legend className="field__label">Only ask parties holding</legend>
            <div className="inline-form__checks">
              {TAG_OPTIONS.map((tag) => {
                const checked = (question.targetTags ?? []).includes(tag)
                return (
                  <label className="check-field" key={tag}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const current = question.targetTags ?? []
                        const next = checked ? current.filter((t) => t !== tag) : [...current, tag]
                        onUpdate(question.id, { targetTags: next.length > 0 ? next : undefined })
                      }}
                    />
                    {TAG_LABELS[tag] ?? tag}
                  </label>
                )
              })}
            </div>
            <p className="field__hint">No tags selected asks everyone.</p>
          </fieldset>

          <ConfirmButton
            label="Remove question"
            confirmLabel="Yes, remove"
            size="sm"
            onConfirm={() => onRemove(question.id)}
          />
        </div>
      ))}

      {open ? (
        <form className="inline-form" onSubmit={submit}>
          <div className="inline-form__grid">
            <TextField label="Prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} error={error} />
            <SelectField
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value as 'multiple' | 'text')}
              options={TYPE_OPTIONS}
            />
          </div>
          {type === 'multiple' ? (
            <TextField
              label="Options"
              hint="Comma-separated."
              value={options}
              onChange={(e) => setOptions(e.target.value)}
            />
          ) : null}
          <div className="inline-form__row">
            <ToggleSwitch label="Ask once per attending guest" checked={perGuest} onChange={setPerGuest} />
          </div>
          <fieldset>
            <legend className="field__label">Only ask parties holding</legend>
            <div className="inline-form__checks">
              {TAG_OPTIONS.map((tag) => (
                <label className="check-field" key={tag}>
                  <input type="checkbox" checked={targetTags.includes(tag)} onChange={() => toggleTag(tag)} />
                  {TAG_LABELS[tag] ?? tag}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="inline-form__actions">
            <Button type="submit" size="sm">
              Add question
            </Button>
            <Button type="button" variant="quiet" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
          + Add question
        </Button>
      )}
    </div>
  )
}

export default QuestionEditor
