import type { CanvasSummary } from '../flowsheet/FlowsheetStateContext'

export type AICommandContext = {
  addEquipmentNode: (equipmentType: string, displayLabel: string) => void
  clearFlowsheet: () => void
  getCanvasSummary: () => CanvasSummary
}

export type AICommandResult = {
  reply: string
}

/**
 * Mock AI: interprets natural-language commands and reads flowsheet state.
 * Extend with a real model or API later.
 */
export function handleAICommand(
  text: string,
  ctx: AICommandContext,
): AICommandResult {
  const raw = text.trim()
  if (!raw) {
    return { reply: 'Enter a command or question about the flowsheet.' }
  }

  if (
    /\b(clear|reset|empty|wipe)\b/i.test(raw) &&
    /\b(canvas|flowsheet|everything|all blocks?|diagram)\b/i.test(raw)
  ) {
    ctx.clearFlowsheet()
    return { reply: 'Cleared all blocks and streams from the flowsheet.' }
  }

  if (
    /\b(how many|what'?s on|what is on|list|describe|summarize|status|canvas|flowsheet|equipment)\b/i.test(
      raw,
    ) ||
    /\b(read|inspect|show)\b.*\b(canvas|flowsheet|blocks?)\b/i.test(raw)
  ) {
    return summarizeCanvas(ctx.getCanvasSummary())
  }

  if (/\badd\b/i.test(raw) && /\bcstr\b/i.test(raw)) {
    ctx.addEquipmentNode('cstr', 'CSTR')
    return { reply: 'Added a CSTR reactor to the flowsheet.' }
  }

  if (/\badd\b/i.test(raw) && /\bpfr\b/i.test(raw)) {
    ctx.addEquipmentNode('pfr', 'PFR')
    return { reply: 'Added a PFR to the flowsheet.' }
  }

  if (/\badd\b/i.test(raw) && /\b(pump|feed pump)\b/i.test(raw)) {
    ctx.addEquipmentNode('pump', 'Pump')
    return { reply: 'Added a pump to the flowsheet.' }
  }

  if (/\badd\b/i.test(raw) && /\bcompressor\b/i.test(raw)) {
    ctx.addEquipmentNode('compressor', 'Compressor')
    return { reply: 'Added a compressor to the flowsheet.' }
  }

  if (/\badd\b/i.test(raw) && /\bmixer\b/i.test(raw)) {
    ctx.addEquipmentNode('mixer', 'Mixer')
    return { reply: 'Added a mixer to the flowsheet.' }
  }

  if (/\badd\b/i.test(raw) && /\bsplitter\b/i.test(raw)) {
    ctx.addEquipmentNode('splitter', 'Splitter')
    return { reply: 'Added a splitter to the flowsheet.' }
  }

  if (/\badd\b/i.test(raw) && /\b(flash|drum)\b/i.test(raw)) {
    ctx.addEquipmentNode('flash', 'Flash drum')
    return { reply: 'Added a flash drum to the flowsheet.' }
  }

  if (/\badd\b/i.test(raw) && /\bheat exchanger|hex\b/i.test(raw)) {
    ctx.addEquipmentNode('heat_exchanger', 'Heat exchanger')
    return { reply: 'Added a heat exchanger to the flowsheet.' }
  }

  if (/\badd\b/i.test(raw) && /\b(column|distillation|dist)\b/i.test(raw)) {
    ctx.addEquipmentNode('dist_column', 'Distillation')
    return { reply: 'Added a distillation column to the flowsheet.' }
  }

  if (/\badd\b/i.test(raw) && /\breactor\b/i.test(raw)) {
    ctx.addEquipmentNode('cstr', 'CSTR')
    return {
      reply:
        'Added a reactor (modeled as CSTR). Say “add a PFR” if you need plug-flow instead.',
    }
  }

  return {
    reply:
      'Try: “Add a CSTR reactor”, “Add a pump”, “What’s on the canvas?”, or “Clear the flowsheet”.',
  }
}

function summarizeCanvas(s: CanvasSummary): AICommandResult {
  if (s.nodeCount === 0) {
    return {
      reply:
        'The flowsheet is empty: no equipment blocks yet. Drag icons from the model palette or ask me to add equipment.',
    }
  }

  const lines = s.nodes
    .map((n) => `• ${n.label} [${n.equipmentType}]`)
    .join('\n')
  return {
    reply: `Flowsheet: ${s.nodeCount} block(s), ${s.edgeCount} connecting stream(s).\n${lines}`,
  }
}
