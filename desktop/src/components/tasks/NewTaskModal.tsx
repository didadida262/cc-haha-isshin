import { useState } from 'react'
import { useTaskStore } from '../../stores/taskStore'
import { Modal } from '../shared/Modal'
import { Input } from '../shared/Input'
import { Textarea } from '../shared/Textarea'
import { Button } from '../shared/Button'

type Props = {
  open: boolean
  onClose: () => void
}

const FREQUENCY_OPTIONS = [
  { value: '0 * * * *', label: 'Hourly' },
  { value: '0 9 * * *', label: 'Daily' },
  { value: '0 9 * * 1', label: 'Weekly' },
  { value: '0 9 1 * *', label: 'Monthly' },
]

export function NewTaskModal({ open, onClose }: Props) {
  const { createTask } = useTaskStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [prompt, setPrompt] = useState('')
  const [cron, setCron] = useState('0 9 * * *')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = name.trim() && prompt.trim()

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    try {
      await createTask({
        name: name.trim(),
        description: description.trim() || undefined,
        cron,
        prompt: prompt.trim(),
        enabled: true,
        recurring: true,
      })
      // Reset form
      setName('')
      setDescription('')
      setPrompt('')
      setCron('0 9 * * *')
      onClose()
    } catch (err) {
      console.error('Failed to create task:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New scheduled task"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit} loading={isSubmitting}>Create task</Button>
        </>
      }
    >
      {/* Info banner */}
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-surface-info)] mb-4">
        <span className="text-[var(--color-text-secondary)] text-sm">ℹ</span>
        <span className="text-xs text-[var(--color-text-secondary)]">
          Local tasks only run while your computer is awake.
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          label="Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="daily-code-review"
        />

        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Review yesterday's commits..."
        />

        <Textarea
          label="Prompt"
          required
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Look at the commits from the last 24 hours. Summarize what changed, call out any risky patterns..."
        />

        {/* Frequency */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[var(--color-text-primary)]">Frequency</label>
          <select
            value={cron}
            onChange={(e) => setCron(e.target.value)}
            className="h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
          >
            {FREQUENCY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <p className="text-xs text-[var(--color-text-tertiary)]">
          Scheduled tasks use a randomized delay of up to 5 minutes to avoid rate limits.
        </p>
      </div>
    </Modal>
  )
}
