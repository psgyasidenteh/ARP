import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import type { FlowsheetNodeData } from '../flowsheetTypes'

/** Centrifugal pump PFD symbol: circle + outlet cone. */
function PumpNodeComponent({ data }: NodeProps<FlowsheetNodeData>) {
  return (
    <div className="relative flex h-[72px] w-[88px] flex-col items-center justify-start rounded border border-gray-800 bg-white px-1 pt-1 shadow-sm">
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        className="!h-2 !w-2 !border !border-gray-800 !bg-white"
      />
      <svg
        viewBox="0 0 64 40"
        className="h-9 w-full text-gray-900"
        aria-hidden
      >
        <circle
          cx="22"
          cy="22"
          r="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M 36 22 L 52 14 L 52 30 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="miter"
        />
        <line x1="0" y1="22" x2="8" y2="22" stroke="currentColor" strokeWidth="2" />
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

export const PumpNode = memo(PumpNodeComponent)
