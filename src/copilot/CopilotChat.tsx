import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import clsx from 'clsx'
import { useFlowsheetState } from '../flowsheet/FlowsheetStateContext'
import { runCopilotReply } from './geminiCopilot'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
}

const WELCOME_GEMINI =
  'Gemini is enabled. Ask in natural language to add equipment, describe the flowsheet, or clear the canvas. Example: “Add a CSTR and a pump.”'

const WELCOME_LOCAL =
  'Add VITE_GEMINI_API_KEY to .env.local for Gemini. Until then, local phrase matching is used. Example: “Add a CSTR reactor” or “What’s on the canvas?”'

export function CopilotChat() {
  const formId = useId()
  const { nodes, edges, addEquipmentNode, clearFlowsheet, getCanvasSummary } =
    useFlowsheetState()
  const geminiConfigured = Boolean(
    import.meta.env.VITE_GEMINI_API_KEY?.trim(),
  )
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: geminiConfigured ? WELCOME_GEMINI : WELCOME_LOCAL,
    },
  ])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const submit = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || pending) return

    const conversationSummary = messages
      .slice(-8)
      .map(
        (msg) =>
          `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}`,
      )
      .join('\n')

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    }
    setInput('')
    setMessages((m) => [...m, userMsg])
    setPending(true)

    try {
      const reply = await runCopilotReply(
        trimmed,
        {
          addEquipmentNode,
          clearFlowsheet,
          getCanvasSummary,
        },
        conversationSummary,
      )
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: reply,
        },
      ])
    } finally {
      setPending(false)
    }
  }, [
    input,
    pending,
    messages,
    addEquipmentNode,
    clearFlowsheet,
    getCanvasSummary,
  ])

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
          {geminiConfigured ? (
            <span className="ml-1 text-emerald-700"> · Gemini on</span>
          ) : (
            <span className="ml-1 text-amber-800"> · Local only</span>
          )}
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
        {pending ? (
          <div className="mr-2 flex items-center gap-2 rounded border border-gray-300 bg-white px-2 py-1.5 text-[11px] text-gray-600">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
            Thinking…
          </div>
        ) : null}
      </div>

      <form
        id={formId}
        className="shrink-0 border-t border-gray-300 bg-[#eceef2] p-2"
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
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
            disabled={pending}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void submit()
              }
            }}
            placeholder="Ask or command…"
            className="min-h-[2.5rem] flex-1 resize-none rounded border border-gray-400 bg-white px-2 py-1 text-[11px] text-gray-900 placeholder:text-gray-400 focus:border-industrial-accent focus:outline-none focus:ring-1 focus:ring-industrial-accent disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={pending}
            className={clsx(
              'inline-flex shrink-0 items-center justify-center self-end rounded border border-industrial-accent bg-industrial-accent',
              'px-2 py-1.5 text-white shadow-sm hover:bg-blue-700 disabled:opacity-50',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-industrial-accent',
            )}
            aria-label="Send message"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Send className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
