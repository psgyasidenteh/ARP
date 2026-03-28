import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import clsx from 'clsx'
import { useFlowsheetState } from '../flowsheet/FlowsheetStateContext'
import { handleAICommand } from './handleAICommand'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
}

export function CopilotChat() {
  const formId = useId()
  const { nodes, edges, addEquipmentNode, clearFlowsheet, getCanvasSummary } =
    useFlowsheetState()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Ask me to add equipment or describe the flowsheet. Example: “Add a CSTR reactor” or “What’s on the canvas?”',
    },
  ])
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const submit = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    }
    setInput('')
    const { reply } = handleAICommand(trimmed, {
      addEquipmentNode,
      clearFlowsheet,
      getCanvasSummary,
    })
    const assistantMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      text: reply,
    }
    setMessages((m) => [...m, userMsg, assistantMsg])
  }, [input, addEquipmentNode, clearFlowsheet, getCanvasSummary])

  return (
    <div className="flex h-full min-h-0 flex-col bg-industrial-panel">
      <div className="shrink-0 border-b border-gray-300 px-2 py-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
          AI Copilot
        </p>
        <p
          className="mt-0.5 text-[10px] tabular-nums text-gray-600"
          aria-live="polite"
        >
          Canvas: {nodes.length} block{nodes.length === 1 ? '' : 's'} ·{' '}
          {edges.length} stream{edges.length === 1 ? '' : 's'}
        </p>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-2 overflow-y-auto px-2 py-2"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={clsx(
              'rounded border px-2 py-1.5 text-[11px] leading-snug shadow-sm',
              msg.role === 'user'
                ? 'ml-3 border-industrial-accent/40 bg-white text-gray-900'
                : 'mr-2 border-gray-300 bg-white text-gray-800',
            )}
          >
            <span className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-gray-500">
              {msg.role === 'user' ? 'You' : 'Copilot'}
            </span>
            <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
          </div>
        ))}
      </div>

      <form
        id={formId}
        className="shrink-0 border-t border-gray-300 bg-[#eceef2] p-2"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <div className="flex gap-1.5">
          <label htmlFor={`${formId}-input`} className="sr-only">
            Message to copilot
          </label>
          <textarea
            id={`${formId}-input`}
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
            placeholder="Ask or command…"
            className="min-h-[2.5rem] flex-1 resize-none rounded border border-gray-400 bg-white px-2 py-1 text-[11px] text-gray-900 placeholder:text-gray-400 focus:border-industrial-accent focus:outline-none focus:ring-1 focus:ring-industrial-accent"
          />
          <button
            type="submit"
            className={clsx(
              'inline-flex shrink-0 items-center justify-center self-end rounded border border-industrial-accent bg-industrial-accent',
              'px-2 py-1.5 text-white shadow-sm hover:bg-blue-700',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-industrial-accent',
            )}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </form>
    </div>
  )
}
