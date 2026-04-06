import { useRef, useEffect } from 'react'
import { useChatStore } from '../../stores/chatStore'
import { UserMessage } from './UserMessage'
import { AssistantMessage } from './AssistantMessage'
import { ThinkingBlock } from './ThinkingBlock'
import { ToolCallBlock } from './ToolCallBlock'
import { ToolResultBlock } from './ToolResultBlock'
import { PermissionDialog } from './PermissionDialog'
import { AskUserQuestion } from './AskUserQuestion'
import { StreamingIndicator } from './StreamingIndicator'
import type { UIMessage } from '../../types/chat'

export function MessageList() {
  const { messages, chatState, streamingText, activeThinkingId } = useChatStore()
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ behavior: 'smooth' })
  }, [messages.length, streamingText])

  // Build a map of toolUseId → tool_use message for linking results
  const toolUseMap = new Map<string, Extract<UIMessage, { type: 'tool_use' }>>()

  for (const msg of messages) {
    if (msg.type === 'tool_use') {
      toolUseMap.set(msg.toolUseId, msg)
    }
  }

  // For each tool_use, find its matching tool_result
  const toolResultMap = new Map<string, Extract<UIMessage, { type: 'tool_result' }>>()
  for (const msg of messages) {
    if (msg.type === 'tool_result' && msg.toolUseId) {
      toolResultMap.set(msg.toolUseId, msg)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="mx-auto max-w-[860px]">
        {messages.map((msg) => {
          // Skip tool_results that are rendered inline within their ToolCallBlock
          if (msg.type === 'tool_result' && toolUseMap.has(msg.toolUseId)) {
            return null
          }

          return (
            <MessageBlock
              key={msg.id}
              message={msg}
              activeThinkingId={activeThinkingId}
              toolResult={
                msg.type === 'tool_use'
                  ? toolResultMap.get(msg.toolUseId) ?? null
                  : null
              }
            />
          )
        })}

        {/* Streaming text (not yet committed as a message) */}
        {streamingText && chatState === 'streaming' && (
          <AssistantMessage content={streamingText} isStreaming />
        )}

        {/* Loading indicator */}
        {chatState !== 'idle' && chatState !== 'streaming' && chatState !== 'permission_pending' && (
          <StreamingIndicator />
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}

function MessageBlock({
  message,
  activeThinkingId,
  toolResult,
}: {
  message: UIMessage
  activeThinkingId: string | null
  toolResult?: { content: unknown; isError: boolean } | null
}) {
  switch (message.type) {
    case 'user_text':
      return <UserMessage content={message.content} attachments={message.attachments} />
    case 'assistant_text':
      return <AssistantMessage content={message.content} />
    case 'thinking':
      return <ThinkingBlock content={message.content} isActive={message.id === activeThinkingId} />
    case 'tool_use':
      // Special handling for AskUserQuestion tool calls
      if (message.toolName === 'AskUserQuestion') {
        return (
          <AskUserQuestion
            toolUseId={message.toolUseId}
            input={message.input}
          />
        )
      }
      return (
        <ToolCallBlock
          toolName={message.toolName}
          input={message.input}
          result={toolResult}
        />
      )
    case 'tool_result':
      // Standalone tool_result (no matching tool_use found)
      return (
        <ToolResultBlock
          content={message.content}
          isError={message.isError}
          standalone
        />
      )
    case 'permission_request':
      return (
        <PermissionDialog
          requestId={message.requestId}
          toolName={message.toolName}
          input={message.input}
          description={message.description}
        />
      )
    case 'error':
      return (
        <div className="mb-4 px-4 py-3 rounded-[var(--radius-md)] bg-red-50 border border-red-200 text-sm text-[var(--color-error)]">
          <strong>Error:</strong> {message.message}
        </div>
      )
    case 'system':
      return (
        <div className="mb-4 text-center text-xs text-[var(--color-text-tertiary)]">
          {message.content}
        </div>
      )
  }
}
