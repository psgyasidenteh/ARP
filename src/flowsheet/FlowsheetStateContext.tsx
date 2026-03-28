import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import {
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type OnEdgesChange,
  type OnNodesChange,
} from 'reactflow'
import { getFlowsheetNodeType } from './equipmentToNodeType'
import type { FlowsheetNodeData } from './flowsheetTypes'
import {
  loadFlowsheetFromStorage,
  saveFlowsheetToStorage,
} from './flowsheetPersistence'

export type CanvasSummary = {
  nodeCount: number
  edgeCount: number
  nodes: Array<{ id: string; label: string; equipmentType: string }>
}

type FlowsheetStateContextValue = {
  nodes: Node<FlowsheetNodeData>[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: (connection: Connection) => void
  addEquipmentNode: (equipmentType: string, displayLabel: string) => void
  addDroppedEquipmentNode: (
    position: { x: number; y: number },
    equipmentType: string,
    displayLabel: string,
  ) => void
  clearFlowsheet: () => void
  replaceFlowsheet: (
    nextNodes: Node<FlowsheetNodeData>[],
    nextEdges: Edge[],
  ) => void
  getCanvasSummary: () => CanvasSummary
}

const FlowsheetStateContext = createContext<FlowsheetStateContextValue | null>(
  null,
)

const defaultEdgeOptions = {
  type: 'smoothstep' as const,
  style: { stroke: '#374151', strokeWidth: 1.5 },
}

function FlowsheetStateProvider({ children }: { children: ReactNode }) {
  const persisted = useMemo(() => loadFlowsheetFromStorage(), [])
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<FlowsheetNodeData>>(
    persisted?.nodes ?? [],
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState(persisted?.edges ?? [])

  useEffect(() => {
    const id = window.setTimeout(() => {
      saveFlowsheetToStorage({ version: 1, nodes, edges })
    }, 450)
    return () => window.clearTimeout(id)
  }, [nodes, edges])

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) => addEdge({ ...connection, ...defaultEdgeOptions }, eds)),
    [setEdges],
  )

  const addEquipmentNode = useCallback(
    (equipmentType: string, displayLabel: string) => {
      const type = getFlowsheetNodeType(equipmentType)
      const id = `${equipmentType}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      setNodes((nds) => {
        const col = nds.length % 6
        const row = Math.floor(nds.length / 6)
        return nds.concat({
          id,
          type,
          position: { x: 48 + col * 130, y: 48 + row * 110 },
          data: { label: displayLabel, equipmentType },
        })
      })
    },
    [setNodes],
  )

  const addDroppedEquipmentNode = useCallback(
    (
      position: { x: number; y: number },
      equipmentType: string,
      displayLabel: string,
    ) => {
      const type = getFlowsheetNodeType(equipmentType)
      const id = `${equipmentType}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      setNodes((nds) =>
        nds.concat({
          id,
          type,
          position,
          data: { label: displayLabel, equipmentType },
        }),
      )
    },
    [setNodes],
  )

  const clearFlowsheet = useCallback(() => {
    setNodes([])
    setEdges([])
  }, [setNodes, setEdges])

  const replaceFlowsheet = useCallback(
    (nextNodes: Node<FlowsheetNodeData>[], nextEdges: Edge[]) => {
      setNodes(nextNodes)
      setEdges(nextEdges)
    },
    [setNodes, setEdges],
  )

  const getCanvasSummary = useCallback((): CanvasSummary => {
    return {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      nodes: nodes.map((n) => ({
        id: n.id,
        label: n.data.label,
        equipmentType: n.data.equipmentType,
      })),
    }
  }, [nodes, edges])

  const value = useMemo(
    (): FlowsheetStateContextValue => ({
      nodes,
      edges,
      onNodesChange,
      onEdgesChange,
      onConnect,
      addEquipmentNode,
      addDroppedEquipmentNode,
      clearFlowsheet,
      replaceFlowsheet,
      getCanvasSummary,
    }),
    [
      nodes,
      edges,
      onNodesChange,
      onEdgesChange,
      onConnect,
      addEquipmentNode,
      addDroppedEquipmentNode,
      clearFlowsheet,
      replaceFlowsheet,
      getCanvasSummary,
    ],
  )

  return (
    <FlowsheetStateContext.Provider value={value}>
      {children}
    </FlowsheetStateContext.Provider>
  )
}

export function useFlowsheetState() {
  const ctx = useContext(FlowsheetStateContext)
  if (!ctx) {
    throw new Error('useFlowsheetState must be used within FlowsheetRoot')
  }
  return ctx
}

/** React Flow store + shared flowsheet state for canvas and AI copilot. */
export function FlowsheetRoot({ children }: { children: ReactNode }) {
  return (
    <ReactFlowProvider>
      <FlowsheetStateProvider>{children}</FlowsheetStateProvider>
    </ReactFlowProvider>
  )
}

export { defaultEdgeOptions }
