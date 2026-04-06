import { useState, useEffect, useRef } from 'react'

export function ThinkingBlock({ content, isActive = false }: { content: string; isActive?: boolean }) {
  const [expanded, setExpanded] = useState(false)

  // Auto-scroll to bottom of content area when expanded and content is still growing
  const contentRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (expanded && isActive && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [content, expanded, isActive])

  const showCursor = isActive && expanded
  const inlinePreview = content.replace(/\s+/g, ' ').trim()
  const collapsedText = inlinePreview.slice(0, 140)
  const hasOverflow = inlinePreview.length > collapsedText.length

  return (
    <div className="mb-2 ml-10">
      <style>{thinkingStyles}</style>
      <button
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left text-[12px] text-[var(--color-text-tertiary)] transition-colors hover:text-[var(--color-text-secondary)]"
      >
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-surface-container-high)] text-[8px] text-[var(--color-outline)]">
          {expanded ? '\u25BE' : '\u25B8'}
        </span>
        <span className="shrink-0 font-medium italic">
          Thinking
          {isActive && <span className="thinking-dots" />}
        </span>
        {!expanded && (
          <span className="min-w-0 flex-1 truncate font-[var(--font-mono)] text-[11px] leading-[1.3] text-[var(--color-text-tertiary)]">
            {collapsedText}
            {hasOverflow ? '…' : ''}
            {isActive && !expanded ? <span className="thinking-inline-cursor" /> : null}
          </span>
        )}
      </button>
      {expanded && (
        <div className="mt-1 rounded-2xl border border-[var(--color-border)]/50 bg-[var(--color-surface-container-lowest)] px-3 py-3">
          <div
            ref={contentRef}
            className="max-h-[220px] overflow-y-auto whitespace-pre-wrap rounded-xl bg-[var(--color-surface)] font-[var(--font-mono)] text-[11px] leading-[1.45] text-[var(--color-text-secondary)]"
          >
            {content}
            {showCursor && <span className="thinking-cursor" />}
          </div>
        </div>
      )}
    </div>
  )
}

/** Shared keyframe styles injected once per ThinkingBlock mount */
const thinkingStyles = `
@keyframes thinking-cursor-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
@keyframes thinking-dots {
  0%, 20% { content: ''; }
  40% { content: '.'; }
  60% { content: '..'; }
  80%, 100% { content: '...'; }
}
.thinking-cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: var(--color-text-tertiary);
  vertical-align: middle;
  margin-left: 1px;
  animation: thinking-cursor-blink 1s step-end infinite;
}
.thinking-inline-cursor {
  display: inline-block;
  width: 1px;
  height: 0.95em;
  margin-left: 3px;
  vertical-align: text-bottom;
  background: var(--color-text-tertiary);
  animation: thinking-cursor-blink 1s step-end infinite;
}
.thinking-dots::after {
  content: '';
  animation: thinking-dots 1.4s steps(1, end) infinite;
}
`
