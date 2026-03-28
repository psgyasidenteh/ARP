import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import type { FlowsheetNodeData } from '../flowsheetTypes'

/** Mixing tee PFD symbol. */
function MixerNodeComponent({ data }: NodeProps<FlowsheetNodeData>) {
  return (
    <div className="relative flex h-[72px] w-[88px] flex-col items-center justify-start rounded border border-gray-800 bg-white px-1 pt-1 shadow-sm">
      <Handle
        type="target"
        position={Position.Top}
        id="in1"
        className="!h-2 !w-2 !border !border-gray-800 !bg-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="in2"
        className="!h-2 !w-2 !border !border-gray-800 !bg-white"
      />
      <svg
        viewBox="0 0 64 40"
        className="h-9 w-full text-gray-900"
        aria-hidden
      >
        <path
          d="M 8 8 L 32 24 L 8 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="miter"
        />
        <path
          d="M 8 24 L 56 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
      <span className="max-w-full truncate px-0.5 text-center text-[9px] font-semibold leading-tight text-gray-900">
        {data.label}
      </span>
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        className="!h-2 !w-2 !border !border-gray-800 !bg-white"
      />
    </div>
  )
}

export const MixerNode = memo(MixerNodeComponent)
