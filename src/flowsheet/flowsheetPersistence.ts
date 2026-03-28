import type { Edge, Node } from 'reactflow'
import type { FlowsheetNodeData } from './flowsheetTypes'

export const FLOWSHEET_STORAGE_KEY = 'prompt-to-plant/v1/flowsheet'

export type PersistedFlowsheetV1 = {
  version: 1
  nodes: Node<FlowsheetNodeData>[]
  edges: Edge[]
}

const VALID_NODE_TYPES = new Set(['pump', 'reactor', 'mixer'])

export function loadFlowsheetFromStorage(): PersistedFlowsheetV1 | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(FLOWSHEET_STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as unknown
    return parseFlowsheetImport(data)
  } catch {
    return null
  }
}

export function saveFlowsheetToStorage(snapshot: PersistedFlowsheetV1): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(FLOWSHEET_STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    /* quota or private mode */
  }
}

export function parseFlowsheetImport(
  data: unknown,
): PersistedFlowsheetV1 | null {
  if (!data || typeof data !== 'object') return null
  const obj = data as Record<string, unknown>
  const nodesRaw = obj.nodes
  const edgesRaw = obj.edges
  if (!Array.isArray(nodesRaw) || !Array.isArray(edgesRaw)) return null

  const nodes: Node<FlowsheetNodeData>[] = []
  for (const item of nodesRaw) {
    if (!item || typeof item !== 'object') continue
    const n = item as Record<string, unknown>
    if (typeof n.id !== 'string') continue
    if (typeof n.type !== 'string' || !VALID_NODE_TYPES.has(n.type)) continue
    const pos = n.position as Record<string, unknown> | undefined
    if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') continue
    const dat = n.data as Record<string, unknown> | undefined
    if (
      !dat ||
      typeof dat.label !== 'string' ||
      typeof dat.equipmentType !== 'string'
    ) {
      continue
    }
    nodes.push({
      id: n.id,
      type: n.type as 'pump' | 'reactor' | 'mixer',
      position: { x: pos.x, y: pos.y },
      data: {
        label: dat.label,
        equipmentType: dat.equipmentType,
      },
    })
  }

  const edges: Edge[] = []
  for (const item of edgesRaw) {
    if (!item || typeof item !== 'object') continue
    const e = item as Record<string, unknown>
    if (typeof e.id !== 'string') continue
    if (typeof e.source !== 'string' || typeof e.target !== 'string') continue
    const edge: Edge = {
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'smoothstep',
      style: { stroke: '#374151', strokeWidth: 1.5 },
    }
    if (typeof e.sourceHandle === 'string') edge.sourceHandle = e.sourceHandle
    if (typeof e.targetHandle === 'string') edge.targetHandle = e.targetHandle
    edges.push(edge)
  }

  return { version: 1, nodes, edges }
}

export function buildExportBlob(snapshot: PersistedFlowsheetV1): Blob {
  return new Blob([JSON.stringify(snapshot, null, 2)], {
    type: 'application/json',
  })
}
