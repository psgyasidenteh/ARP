import { useCallback, useRef, type DragEvent } from 'react'
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useReactFlow,
} from 'reactflow'
import type { FlowsheetDragPayload } from '../model-palette/flowsheetDrag'
import { REACTFLOW_DRAG_MIME } from '../model-palette/flowsheetDrag'
import { FLOWSHEET_NODE_TYPES } from './nodeTypes'
import { defaultEdgeOptions, useFlowsheetState } from './FlowsheetStateContext'

import 'reactflow/dist/style.css'

export function FlowsheetCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition } = useReactFlow()
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addDroppedEquipmentNode,
  } = useFlowsheetState()

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault()
      if (!reactFlowWrapper.current) return

      const raw = event.dataTransfer.getData(REACTFLOW_DRAG_MIME)
      if (!raw) return

      let payload: FlowsheetDragPayload
      try {
        payload = JSON.parse(raw) as FlowsheetDragPayload
      } catch {
        return
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      addDroppedEquipmentNode(
        position,
        payload.equipmentType,
        payload.displayLabel,
      )
    },
    [screenToFlowPosition, addDroppedEquipmentNode],
  )

  return (
    <div ref={reactFlowWrapper} className="h-full w-full bg-[#fafafa]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={FLOWSHEET_NODE_TYPES}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        proOptions={{ hideAttribution: true }}
        minZoom={0.25}
        maxZoom={2}
        className="!bg-transparent"
      >
        <Background
          id="flowsheet-dots"
          variant={BackgroundVariant.Dots}
          gap={14}
          size={1}
          color="#c4c9d1"
        />
        <Controls
          className="!rounded !border !border-gray-400 !bg-white !shadow-md [&_button]:!border-gray-300 [&_button]:!bg-white [&_button:hover]:!bg-gray-100"
          showInteractive={false}
        />
        <MiniMap
          className="!rounded !border !border-gray-400 !bg-[#f3f4f6] !shadow-md"
          pannable
          zoomable
          nodeColor={() => '#dbeafe'}
          maskColor="rgba(209, 213, 219, 0.75)"
        />
      </ReactFlow>
    </div>
  )
}
