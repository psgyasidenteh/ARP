import type { DragEvent } from 'react'

/** React Flow convention for native HTML5 drag onto the canvas. */
export const REACTFLOW_DRAG_MIME = 'application/reactflow' as const

export type FlowsheetDragPayload = {
  equipmentType: string
  displayLabel: string
}

export function setFlowsheetDragData(
  event: DragEvent<HTMLElement>,
  payload: FlowsheetDragPayload,
) {
  event.dataTransfer.setData(
    REACTFLOW_DRAG_MIME,
    JSON.stringify(payload),
  )
  event.dataTransfer.effectAllowed = 'move'
}
