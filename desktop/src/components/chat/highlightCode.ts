import hljs from 'highlight.js'

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function highlightCodeLines(code: string, language?: string): string[] {
  return code.split('\n').map((line) => highlightCodeLine(line, language))
}

function highlightCodeLine(line: string, language?: string): string {
  const safeLine = line.length > 0 ? line : ' '

  try {
    if (language && hljs.getLanguage(language)) {
      return hljs.highlight(safeLine, { language }).value
    }
    return hljs.highlightAuto(safeLine).value
  } catch {
    return escapeHtml(safeLine)
  }
}
