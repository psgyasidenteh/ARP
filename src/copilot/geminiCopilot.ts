import {
  GoogleGenerativeAI,
  SchemaType,
  type Tool,
} from '@google/generative-ai'
import type { AICommandContext } from './handleAICommand'
import { handleAICommand } from './handleAICommand'

/** Prefer 1.5 Flash on the free tier; 2.0 often has `limit: 0` until billing is enabled. */
const DEFAULT_MODEL = 'gemini-1.5-flash'

const FALLBACK_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-2.0-flash',
] as const

const EQUIPMENT_TYPES = [
  'mixer',
  'splitter',
  'pump',
  'compressor',
  'cstr',
  'pfr',
  'flash',
  'heat_exchanger',
  'dist_column',
  'absorber',
] as const

function flowsheetTools(): Tool[] {
  return [
    {
      functionDeclarations: [
        {
          name: 'add_equipment',
          description:
            'Place a new equipment block on the PFD flowsheet. Use when the user asks to add, insert, or place equipment.',
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              equipmentType: {
                type: SchemaType.STRING,
                description: `Equipment id. Allowed: ${EQUIPMENT_TYPES.join(', ')}`,
              },
              displayLabel: {
                type: SchemaType.STRING,
                description: 'Short label shown on the symbol (e.g. CSTR-1, Pump)',
              },
            },
            required: ['equipmentType', 'displayLabel'],
          },
        },
        {
          name: 'clear_flowsheet',
          description:
            'Remove all blocks and connecting streams from the flowsheet. Use only when the user clearly wants to clear, reset, or empty the canvas.',
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              confirm: {
                type: SchemaType.BOOLEAN,
                description: 'Must be true to clear the flowsheet',
              },
            },
            required: ['confirm'],
          },
        },
      ],
    },
  ] as Tool[]
}

function defaultLabelForType(t: string): string {
  const map: Record<string, string> = {
    mixer: 'Mixer',
    splitter: 'Splitter',
    pump: 'Pump',
    compressor: 'Compressor',
    cstr: 'CSTR',
    pfr: 'PFR',
    flash: 'Flash drum',
    heat_exchanger: 'Heat exchanger',
    dist_column: 'Distillation',
    absorber: 'Absorber',
  }
  return map[t] ?? t
}

function executeFunctionCall(
  name: string,
  args: Record<string, unknown> | undefined,
  ctx: AICommandContext,
): string {
  if (name === 'clear_flowsheet') {
    const ok =
      args?.confirm === true ||
      args?.confirm === 'true' ||
      String(args?.confirm).toLowerCase() === 'true'
    if (!ok) {
      return 'Clear cancelled (confirmation required).'
    }
    ctx.clearFlowsheet()
    return 'Cleared the flowsheet (all blocks and streams).'
  }
  if (name === 'add_equipment') {
    const equipmentType = String(args?.equipmentType ?? '')
    const displayLabel =
      String(args?.displayLabel ?? '').trim() ||
      defaultLabelForType(equipmentType)
    if (!EQUIPMENT_TYPES.includes(equipmentType as (typeof EQUIPMENT_TYPES)[number])) {
      return `Skipped add_equipment: unknown equipmentType "${equipmentType}".`
    }
    ctx.addEquipmentNode(equipmentType, displayLabel)
    return `Added "${displayLabel}" (${equipmentType}) to the flowsheet.`
  }
  return `Unknown tool: ${name}`
}

function isQuotaOrRateLimitError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return (
    /\b429\b/.test(msg) ||
    /\bquota\b/i.test(msg) ||
    /\brate[\s-]?limit\b/i.test(msg) ||
    /limit:\s*0\b/i.test(msg)
  )
}

function uniqueModelOrder(preferred: string | undefined): string[] {
  const fromEnv = preferred?.trim()
  const list = fromEnv
    ? [fromEnv, ...FALLBACK_MODELS.filter((m) => m !== fromEnv)]
    : [...FALLBACK_MODELS]
  return [...new Set(list)]
}

async function generateCopilotResponse(
  genAI: GoogleGenerativeAI,
  modelName: string,
  userMessage: string,
  ctx: AICommandContext,
  conversationSummary: string,
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: `You are the AI copilot for "Prompt-to-Plant", a browser-based chemical process flowsheet (PFD) editor.
You help with equipment placement, interpreting the current flowsheet, and concise chemical-engineering guidance.
When the user wants to modify the diagram, call the provided functions. Prefer function calls over describing fake placements.
For read-only questions, answer from the canvas JSON and your knowledge. Keep replies concise and professional.`,
    tools: flowsheetTools(),
  })

  const canvas = ctx.getCanvasSummary()
  const prompt = `Current flowsheet (JSON):\n${JSON.stringify(canvas, null, 2)}\n\nConversation (recent):\n${conversationSummary || '(none)'}\n\nUser message:\n${userMessage}`

  const result = await model.generateContent(prompt)
  const response = result.response

  const calls = response.functionCalls?.()
  const executed: string[] = []
  if (calls?.length) {
    for (const call of calls) {
      const args = (call.args ?? {}) as Record<string, unknown>
      executed.push(executeFunctionCall(call.name, args, ctx))
    }
  }

  let text = ''
  try {
    text = response.text()?.trim() ?? ''
  } catch {
    text = ''
  }

  if (text && executed.length) {
    return `${text}\n\n${executed.join(' ')}`
  }
  if (text) return text
  if (executed.length) return executed.join(' ')

  const after = ctx.getCanvasSummary()
  const plain = genAI.getGenerativeModel({ model: modelName })
  const follow = await plain.generateContent(
    `The user said: ${userMessage}\nCanvas is now: ${JSON.stringify(after)}.\nReply in 1–3 short sentences in a professional tone. Do not claim you added equipment unless the canvas JSON shows new blocks.`,
  )
  return follow.response.text().trim()
}

/**
 * Calls Gemini with flowsheet context and tools; falls back to local parser if no API key.
 */
export async function runCopilotReply(
  userMessage: string,
  ctx: AICommandContext,
  conversationSummary: string,
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim()
  if (!apiKey) {
    return handleAICommand(userMessage, ctx).reply
  }

  const envModel = import.meta.env.VITE_GEMINI_MODEL?.trim()
  const models = uniqueModelOrder(envModel || DEFAULT_MODEL)

  const genAI = new GoogleGenerativeAI(apiKey)
  let lastErr: unknown

  for (const modelName of models) {
    try {
      return await generateCopilotResponse(
        genAI,
        modelName,
        userMessage,
        ctx,
        conversationSummary,
      )
    } catch (err) {
      lastErr = err
      if (isQuotaOrRateLimitError(err) && models.indexOf(modelName) < models.length - 1) {
        continue
      }
      break
    }
  }

  const msg = lastErr instanceof Error ? lastErr.message : String(lastErr)
  const local = handleAICommand(userMessage, ctx).reply

  if (isQuotaOrRateLimitError(lastErr)) {
    return (
      `Gemini quota or rate limit reached for your API project (common on the free tier for some models). ` +
      `Try:\n` +
      `• Set \`VITE_GEMINI_MODEL=gemini-1.5-flash\` in \`.env.local\` and restart the dev server\n` +
      `• Or enable billing / check quotas: https://ai.google.dev/gemini-api/docs/rate-limits\n\n` +
      `Local reply (offline):\n\n${local}`
    )
  }

  return `Could not reach Gemini (${msg}). Local reply:\n\n${local}`
}
