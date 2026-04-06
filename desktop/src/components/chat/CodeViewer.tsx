import { useMemo, useState } from 'react'
import hljs from 'highlight.js'
import { CopyButton } from '../shared/CopyButton'

type Props = {
  code: string
  language?: string
  maxLines?: number
  showLineNumbers?: boolean
}

export function CodeViewer({ code, language, maxLines = 20, showLineNumbers = true }: Props) {
  const [expanded, setExpanded] = useState(false)

  const lines = code.split('\n')
  const isTruncated = !expanded && lines.length > maxLines
  const visibleCode = isTruncated ? lines.slice(0, maxLines).join('\n') : code

  const highlightedLines = useMemo(() => {
    return visibleCode.split('\n').map((line) => {
      try {
        if (language && hljs.getLanguage(language)) {
          return hljs.highlight(line || ' ', { language, ignoreIllegals: true }).value
        }
        return hljs.highlightAuto(line || ' ').value
      } catch {
        return escapeHtml(line)
      }
    })
  }, [language, visibleCode])

  const startLine = 1

  const languageLabel = language || 'code'

  const visibleLines = visibleCode.split('\n')

  const lineCountLabel = `${lines.length} ${lines.length === 1 ? 'line' : 'lines'}`

  const showExpandToggle = lines.length > maxLines
  const displayLines = visibleLines.length

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d0d7de] bg-[#f6f8fa] text-[#24292f]">
      <div className="flex items-center justify-between border-b border-[#d0d7de] bg-white px-3 py-2 text-[11px] text-[#57606a]">
        <div className="flex items-center gap-3">
          <span className="font-semibold uppercase tracking-[0.14em] text-[#57606a]">{languageLabel}</span>
          <span>{lineCountLabel}</span>
        </div>
        <CopyButton
          text={code}
          className="rounded-md border border-[#d0d7de] bg-white px-2 py-1 text-[11px] text-[#57606a] transition-colors hover:bg-[#f3f4f6] hover:text-[#24292f]"
        />
      </div>

      <div className="max-h-[420px] overflow-auto">
        <div className="min-w-full font-[var(--font-mono)] text-[12px] leading-[1.45]">
          {visibleLines.map((line, index) => (
            <div
              key={`${startLine + index}-${line}`}
              className={`grid grid-cols-[3rem,minmax(0,1fr)] gap-0 last:border-b-0 ${
                index === displayLines - 1 ? '' : 'border-b border-[#d8dee4]'
              }`}
            >
              {showLineNumbers ? (
                <span className="select-none border-r border-[#d8dee4] bg-[#f6f8fa] px-3 py-1 text-right text-[11px] text-[#57606a]">
                  {startLine + index}
                </span>
              ) : (
                <span className="w-0" />
              )}
              <span
                className="overflow-hidden bg-white px-4 py-1 whitespace-pre-wrap break-words text-[#24292f]"
                dangerouslySetInnerHTML={{ __html: highlightedLines[index] ?? escapeHtml(line) }}
              />
            </div>
          ))}
        </div>
      </div>

      {showExpandToggle && (
        <button
          onClick={() => setExpanded((value) => !value)}
          className="w-full border-t border-white/8 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999] transition-colors hover:text-white"
        >
          {expanded ? 'Collapse' : `Show ${lines.length - maxLines} more lines`}
        </button>
      )}
    </div>
  )
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
