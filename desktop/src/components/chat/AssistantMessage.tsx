import { MarkdownRenderer } from '../markdown/MarkdownRenderer'
import { useState } from 'react'

type Props = {
  content: string
  isStreaming?: boolean
}

export function AssistantMessage({ content, isStreaming }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="group mb-5 flex gap-3">
      {/* Avatar */}
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--color-brand)] flex items-center justify-center mt-0.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.9"/>
          <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
          <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85"/>
        </svg>
      </div>
      {/* Content */}
      <div className="min-w-0 flex-1 text-sm text-[var(--color-text-primary)]">
        {!isStreaming && content.trim() && (
          <div className="mb-2 flex justify-end">
            <button
              onClick={handleCopy}
              className="rounded-lg border border-[var(--color-border)] px-2.5 py-1 text-[11px] text-[var(--color-text-tertiary)] opacity-0 transition-opacity hover:text-[var(--color-text-primary)] group-hover:opacity-100"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}
        <MarkdownRenderer content={content} />
        {isStreaming && (
          <span className="inline-block w-0.5 h-4 bg-[var(--color-brand)] animate-shimmer ml-0.5 align-text-bottom" />
        )}
      </div>
    </div>
  )
}
