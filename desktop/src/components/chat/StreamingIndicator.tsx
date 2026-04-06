import { useChatStore } from '../../stores/chatStore'

export function StreamingIndicator() {
  const { chatState, elapsedSeconds, tokenUsage } = useChatStore()

  const verb = chatState === 'thinking'
    ? 'Thinking'
    : chatState === 'tool_executing'
      ? 'Executing'
      : 'Crafting'

  return (
    <div className="mb-4 ml-10 flex w-fit items-center gap-2 rounded-full border border-[var(--color-border)]/60 bg-[var(--color-surface-container-low)] px-3 py-1.5">
      <span className="text-[var(--color-brand)] animate-shimmer text-sm">✦</span>
      <span className="text-sm font-medium text-[var(--color-brand)]">{verb}...</span>
      <span className="text-xs text-[var(--color-text-tertiary)]">
        {elapsedSeconds}s
      </span>
      {tokenUsage.output_tokens > 0 && (
        <span className="text-xs text-[var(--color-text-tertiary)]">
          · ↓ {tokenUsage.output_tokens} tokens
        </span>
      )}
    </div>
  )
}
