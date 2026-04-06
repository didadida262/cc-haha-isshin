import { useMemo, useState } from 'react'
import { CodeViewer } from './CodeViewer'
import { DiffViewer } from './DiffViewer'
import { TerminalChrome } from './TerminalChrome'
import { CopyButton } from '../shared/CopyButton'

type Props = {
  toolName: string
  input: unknown
  result?: { content: unknown; isError: boolean } | null
}

const TOOL_ICONS: Record<string, string> = {
  Bash: 'terminal',
  Read: 'description',
  Write: 'edit_document',
  Edit: 'edit_note',
  Glob: 'search',
  Grep: 'find_in_page',
  Agent: 'smart_toy',
  WebSearch: 'travel_explore',
  WebFetch: 'cloud_download',
  NotebookEdit: 'note',
  Skill: 'auto_awesome',
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  Edit: { label: 'MODIFIED', className: 'bg-[var(--color-primary-fixed)] text-[#75331C]' },
  Write: { label: 'CREATED', className: 'bg-[#D4EAB4] text-[#3B4C24]' },
  Read: { label: 'READ', className: 'bg-[var(--color-surface-container-high)] text-[var(--color-outline)]' },
  Bash: { label: 'EXECUTED', className: 'bg-[var(--color-surface-container-high)] text-[var(--color-outline)]' },
}

export function ToolCallBlock({ toolName, input, result }: Props) {
  const [expanded, setExpanded] = useState(false)
  const obj = input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
  const icon = TOOL_ICONS[toolName] || 'build'
  const filePath = typeof obj.file_path === 'string' ? obj.file_path : ''
  const summary = getToolSummary(toolName, obj)
  const outputSummary = getToolResultSummary(toolName, result?.content)
  const inlineError = getInlineErrorSummary(result)
  const badge = result
    ? result.isError
      ? { label: 'ERROR', className: 'bg-[var(--color-error-container)] text-[var(--color-error)]' }
      : { label: 'SUCCESS', className: 'bg-[#D4EAB4] text-[#3B4C24]' }
    : STATUS_BADGE[toolName]

  const preview = useMemo(() => renderPreview(toolName, obj, result), [obj, result, toolName])
  const details = useMemo(() => renderDetails(toolName, obj), [obj, toolName])
  const expandable = toolName === 'Edit' || toolName === 'Write'

  return (
    <div className="mb-2 ml-10 overflow-hidden rounded-xl border border-[var(--color-border)]/65 bg-[var(--color-surface-container-lowest)]">
      <button
        type="button"
        onClick={() => {
          if (expandable) {
            setExpanded((value) => !value)
          }
        }}
        className="flex w-full items-start justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[var(--color-surface-hover)]/50"
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="material-symbols-outlined mt-0.5 text-[16px] text-[var(--color-outline)]">{icon}</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-outline)]">
                {toolName}
              </span>
              {badge && (
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] ${badge.className}`}>
                  {badge.label}
                </span>
              )}
            </div>
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2 text-[11px] leading-[1.35] text-[var(--color-text-tertiary)]">
              {filePath ? (
                <span className="max-w-full truncate rounded-md bg-[var(--color-surface-container-low)] px-2 py-1 font-[var(--font-mono)] text-[10px] text-[var(--color-text-secondary)]">
                  {filePath}
                </span>
              ) : null}
              {summary ? (
                <span className="min-w-0 truncate font-[var(--font-mono)] text-[10px] text-[var(--color-text-tertiary)]">
                  {summary}
                </span>
              ) : null}
              {result && outputSummary ? (
                <span className="min-w-0 truncate text-[10px] text-[var(--color-outline)]">
                  {outputSummary}
                </span>
              ) : null}
            </div>
            {inlineError ? (
              <div className="mt-1 truncate text-[10px] text-[var(--color-error)]">
                {inlineError}
              </div>
            ) : null}
          </div>
        </div>
        {expandable ? (
          <span className="material-symbols-outlined text-[16px] text-[var(--color-outline)]">
            {expanded ? 'expand_less' : 'expand_more'}
          </span>
        ) : null}
      </button>

      {expandable && expanded && (
        <div className="space-y-2.5 border-t border-[var(--color-border)]/60 px-3 py-3">
          {preview}
          {details}
        </div>
      )}
    </div>
  )
}

function renderPreview(
  toolName: string,
  obj: Record<string, unknown>,
  result?: { content: unknown; isError: boolean } | null,
) {
  const filePath = typeof obj.file_path === 'string' ? obj.file_path : 'file'

  if (toolName === 'Edit' && typeof obj.old_string === 'string' && typeof obj.new_string === 'string') {
    return <DiffViewer filePath={filePath} oldString={obj.old_string} newString={obj.new_string} />
  }

  if (toolName === 'Write' && typeof obj.content === 'string') {
    return <DiffViewer filePath={filePath} oldString="" newString={obj.content} />
  }

  if (toolName === 'Bash' && typeof obj.command === 'string') {
    return (
      <TerminalChrome title={typeof obj.description === 'string' ? obj.description : filePath}>
        <div className="px-3 py-2.5 font-[var(--font-mono)] text-[11px] leading-[1.45] text-[#d8d8d8]">
          <span className="text-[#28c840]">$</span> {obj.command}
        </div>
      </TerminalChrome>
    )
  }

  if (toolName === 'Read') {
    return null
  }

  if (result) {
    const text = extractTextContent(result.content)
    if (text) {
      return (
        <div className={`overflow-hidden rounded-2xl border ${
          result.isError
            ? 'border-[var(--color-error)]/20 bg-[var(--color-error-container)]/60'
            : 'border-[var(--color-border)] bg-[var(--color-surface)]'
        }`}>
          <div className="flex items-center justify-between border-b border-[var(--color-border)]/60 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-[var(--color-outline)]">
            <span>{result.isError ? 'Error Output' : 'Tool Output'}</span>
            <CopyButton
              text={text}
              className="rounded-md border border-[var(--color-border)] px-2 py-1 text-[10px] normal-case tracking-normal text-[var(--color-text-tertiary)] transition-colors hover:text-[var(--color-text-primary)]"
            />
          </div>
          <CodeViewer code={text} language="plaintext" maxLines={18} />
        </div>
      )
    }
  }

  return null
}

function renderDetails(toolName: string, obj: Record<string, unknown>) {
  if (toolName === 'Edit' || toolName === 'Write') {
    return null
  }

  const text = JSON.stringify(obj, null, 2)
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-[var(--color-outline)]">
        <span>Tool Input</span>
        <CopyButton
          text={text}
          className="rounded-md border border-[var(--color-border)] px-2 py-1 text-[10px] normal-case tracking-normal text-[var(--color-text-tertiary)] transition-colors hover:text-[var(--color-text-primary)]"
        />
      </div>
      <CodeViewer code={text} language="json" maxLines={18} />
    </div>
  )
}

function getToolResultSummary(toolName: string, content: unknown): string {
  if (toolName === 'Bash') return ''

  const text = extractTextContent(content)
  if (!text) return ''

  const lineCount = text.split('\n').length
  if (lineCount > 1) {
    return `${lineCount} lines output`
  }

  const compact = text.replace(/\s+/g, ' ').trim()
  if (!compact) return ''
  if (compact.length <= 36) return compact
  return `${compact.slice(0, 36)}…`
}

function getInlineErrorSummary(result?: { content: unknown; isError: boolean } | null) {
  if (!result?.isError) return ''

  const text = extractTextContent(result.content)?.replace(/\s+/g, ' ').trim() || ''
  if (!text) return 'Tool failed'
  if (text.length <= 120) return text
  return `${text.slice(0, 120)}…`
}

function getToolSummary(toolName: string, obj: Record<string, unknown>): string {
  switch (toolName) {
    case 'Bash':
      return typeof obj.command === 'string' ? obj.command : ''
    case 'Read':
      return typeof obj.limit === 'number' ? `Read file contents` : 'Read file contents'
    case 'Write':
      return typeof obj.content === 'string' ? `${obj.content.split('\n').length} lines created` : 'Create file'
    case 'Edit':
      return typeof obj.old_string === 'string' && typeof obj.new_string === 'string'
        ? changedLineSummary(obj.old_string, obj.new_string)
        : 'Update file contents'
    case 'Glob':
      return typeof obj.pattern === 'string' ? obj.pattern : ''
    case 'Grep':
      return typeof obj.pattern === 'string' ? obj.pattern : ''
    case 'Agent':
      return typeof obj.description === 'string' ? obj.description : ''
    default:
      return ''
  }
}

function extractTextContent(content: unknown): string | null {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content
      .map((chunk: any) => (typeof chunk === 'string' ? chunk : chunk?.text || ''))
      .filter(Boolean)
      .join('\n')
  }
  if (content && typeof content === 'object') {
    return JSON.stringify(content, null, 2)
  }
  return null
}

function changedLineSummary(oldString: string, newString: string): string {
  const oldLines = oldString.split('\n')
  const newLines = newString.split('\n')
  let changed = 0
  const max = Math.max(oldLines.length, newLines.length)

  for (let index = 0; index < max; index += 1) {
    if ((oldLines[index] ?? '') !== (newLines[index] ?? '')) {
      changed += 1
    }
  }

  return `${changed} lines changed`
}
