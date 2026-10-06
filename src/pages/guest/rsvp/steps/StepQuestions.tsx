import { SelectField, TextAreaField, TextField } from '../../../../components/ui'
import type { QuestionInstance } from '../model'

export interface StepQuestionsProps {
  instances: QuestionInstance[]
  answers: Record<string, string>
  onAnswerChange: (key: string, value: string) => void
  note: string
  onNoteChange: (value: string) => void
}

/**
 * Step 5. Only what is relevant: questions are tag-filtered upstream, and
 * per-guest ones repeat for each attending person. Nothing here is required.
 */
export function StepQuestions({
  instances,
  answers,
  onAnswerChange,
  note,
  onNoteChange,
}: StepQuestionsProps) {
  return (
    <div className="rsvp__fields">
      {instances.map((instance) => {
        const label = instance.member
          ? `${instance.question.prompt} — ${instance.member.fullName}`
          : instance.question.prompt

        if (instance.question.type === 'multiple') {
          return (
            <SelectField
              key={instance.key}
              label={label}
              optional
              placeholder="Choose one"
              options={(instance.question.options ?? []).map((option) => ({
                value: option,
                label: option,
              }))}
              value={answers[instance.key] ?? ''}
              onChange={(event) => onAnswerChange(instance.key, event.target.value)}
            />
          )
        }

        return (
          <TextField
            key={instance.key}
            label={label}
            optional
            value={answers[instance.key] ?? ''}
            onChange={(event) => onAnswerChange(instance.key, event.target.value)}
          />
        )
      })}

      <TextAreaField
        label="A note to the couple"
        optional
        placeholder="Anything at all — we read every one."
        value={note}
        rows={4}
        onChange={(event) => onNoteChange(event.target.value)}
      />
    </div>
  )
}

export default StepQuestions
