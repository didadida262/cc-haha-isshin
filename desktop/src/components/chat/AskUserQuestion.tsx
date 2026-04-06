import { useState } from 'react'
import { useChatStore } from '../../stores/chatStore'
import { Button } from '../shared/Button'

type QuestionOption = {
  label: string
  description?: string
}

type Question = {
  question: string
  options?: QuestionOption[]
}

type AskUserInput = {
  questions?: Question[]
  question?: string
  options?: QuestionOption[]
}

type Props = {
  toolUseId: string
  input: unknown
}

/**
 * Parse the AskUserQuestion input which may come in different shapes.
 */
function parseInput(input: unknown): Question[] {
  if (!input || typeof input !== 'object') return []
  const obj = input as AskUserInput

  // Shape 1: { questions: [...] }
  if (Array.isArray(obj.questions)) {
    return obj.questions
  }

  // Shape 2: { question: "...", options: [...] }
  if (typeof obj.question === 'string') {
    return [{ question: obj.question, options: obj.options }]
  }

  return []
}

export function AskUserQuestion({ toolUseId: _toolUseId, input }: Props) {
  const { sendMessage } = useChatStore()
  const questions = parseInput(input)
  const [selections, setSelections] = useState<Record<number, string>>({})
  const [freeText, setFreeText] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (questions.length === 0) return null

  const handleSelect = (qIndex: number, label: string) => {
    if (submitted) return
    setSelections((prev) => ({ ...prev, [qIndex]: label }))
    // Clear free text when an option is selected
    setFreeText('')
  }

  const handleSubmit = () => {
    if (submitted) return

    // Build the response text
    const parts: string[] = []
    for (let i = 0; i < questions.length; i++) {
      const selected = selections[i]
      if (selected) {
        parts.push(selected)
      }
    }
    // Free text overrides if provided
    const response = freeText.trim() || parts.join('; ') || ''
    if (!response) return

    setSubmitted(true)
    // Send the response as a user message -- the server routes it as a tool_result
    sendMessage(response)
  }

  const hasSelection = Object.keys(selections).length > 0 || freeText.trim().length > 0

  return (
    <div className={`mb-4 rounded-[var(--radius-lg)] border overflow-hidden ${
      submitted
        ? 'border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-low)] opacity-70'
        : 'border-[var(--color-secondary)] bg-[var(--color-surface-container-lowest)]'
    }`}>
      {/* Header */}
      <div className={`flex items-center gap-3 px-4 py-3 ${
        submitted
          ? 'bg-[var(--color-surface-container-low)]'
          : 'bg-[var(--color-surface-container)]'
      }`}>
        <div className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-secondary)]/10">
          <span className="material-symbols-outlined text-[18px] text-[var(--color-secondary)]">
            help
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">
            Claude needs your input
          </span>
          {submitted && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--color-surface-container-high)] text-[var(--color-text-tertiary)]">
              Answered
            </span>
          )}
        </div>
      </div>

      {/* Questions */}
      <div className="px-4 py-3 space-y-4">
        {questions.map((q, qIndex) => (
          <div key={qIndex}>
            <p className="text-sm font-medium text-[var(--color-text-primary)] mb-3">
              {q.question}
            </p>

            {/* Option cards */}
            {q.options && q.options.length > 0 && (
              <div className="space-y-2 mb-3">
                {q.options.map((opt, optIndex) => {
                  const isSelected = selections[qIndex] === opt.label
                  return (
                    <button
                      key={optIndex}
                      onClick={() => handleSelect(qIndex, opt.label)}
                      disabled={submitted}
                      className={`w-full text-left px-4 py-3 rounded-[var(--radius-md)] border transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/8 ring-1 ring-[var(--color-secondary)]/30'
                          : 'border-[var(--color-outline-variant)]/40 bg-[var(--color-surface)] hover:border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-container-low)]'
                      } ${submitted ? 'cursor-default' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Radio indicator */}
                        <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'border-[var(--color-secondary)]'
                            : 'border-[var(--color-outline)]'
                        }`}>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-[var(--color-secondary)]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm font-medium ${
                            isSelected
                              ? 'text-[var(--color-secondary)]'
                              : 'text-[var(--color-text-primary)]'
                          }`}>
                            {opt.label}
                          </span>
                          {opt.description && (
                            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                              {opt.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}

        {/* Free text "Other" input */}
        {!submitted && (
          <div>
            <label className="text-xs text-[var(--color-text-tertiary)] mb-1.5 block">
              Or type a custom response:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={freeText}
                onChange={(e) => {
                  setFreeText(e.target.value)
                  // Clear radio selections when typing
                  if (e.target.value.trim()) {
                    setSelections({})
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && hasSelection) {
                    handleSubmit()
                  }
                }}
                placeholder="Type your answer..."
                className="flex-1 px-3 py-2 text-sm bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/40 rounded-[var(--radius-md)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)]/30"
              />
            </div>
          </div>
        )}

        {/* Submitted answer display */}
        {submitted && (
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
            <span className="material-symbols-outlined text-[14px] text-[var(--color-success)]">check_circle</span>
            <span>
              Answered: <strong>{freeText.trim() || Object.values(selections).join(', ')}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Submit button */}
      {!submitted && (
        <div className="flex items-center gap-2 px-4 py-3 border-t border-[var(--color-outline-variant)]/20 bg-[var(--color-surface-container-low)]">
          <Button
            variant="primary"
            size="sm"
            disabled={!hasSelection}
            onClick={handleSubmit}
            icon={
              <span className="material-symbols-outlined text-[14px]">send</span>
            }
          >
            Submit
          </Button>
        </div>
      )}
    </div>
  )
}
