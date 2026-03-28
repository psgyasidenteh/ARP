import type { NodeTypes } from 'reactflow'
import { MixerNode } from './nodes/MixerNode'
import { PumpNode } from './nodes/PumpNode'
import { ReactorNode } from './nodes/ReactorNode'

export const FLOWSHEET_NODE_TYPES: NodeTypes = {
  pump: PumpNode,
  reactor: ReactorNode,
  mixer: MixerNode,
}
