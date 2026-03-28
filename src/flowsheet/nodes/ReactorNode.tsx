import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import type { FlowsheetNodeData } from '../flowsheetTypes'

function VesselSvg({ equipmentType }: { equipmentType: string }) {
  if (equipmentType === 'heat_exchanger') {
    return (
      <svg
        viewBox="0 0 72 44"
        className="h-10 w-full text-gray-900"
        aria-hidden
      >
        <rect
          x="6"
          y="10"
          width="28"
          height="24"
          rx="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect
          x="38"
          y="10"
          width="28"
          height="24"
          rx="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M 34 14 L 38 14 M 34 22 L 38 22 M 34 30 L 38 30"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M 10 6 L 10 10 M 30 6 L 30 10 M 42 6 L 42 10 M 62 6 L 62 10"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M 10 34 L 10 38 M 30 34 L 30 38 M 42 34 L 42 38 M 62 34 L 62 38"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 64 44" className="h-10 w-full text-gray-900" aria-hidden>
      <ellipse
        cx="32"
        cy="10"
        rx="18"
        ry="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M 14 10 L 14 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M 50 10 L 50 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M 14 32 Q 32 40 50 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      {(equipmentType === 'cstr' || equipmentType === 'pfr') && (
        <line
          x1="32"
          y1="14"
          x2="32"
          y2="28"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      )}
      {equipmentType === 'cstr' && (
        <line
          x1="24"
          y1="21"
          x2="40"
          y2="21"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      )}
    </svg>
  )
}

/** Vessel / reactor / column / HX PFD symbol (variant by equipmentType). */
function ReactorNodeComponent({ data }: NodeProps<FlowsheetNodeData>) {
  return (
    <div className="relative flex min-h-[80px] w-[96px] flex-col items-center justify-start rounded border border-gray-800 bg-white px-1 pt-1 shadow-sm">
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        className="!h-2 !w-2 !border !border-gray-800 !bg-white"
      />
      <VesselSvg equipmentType={data.equipmentType} />
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

export const ReactorNode = memo(ReactorNodeComponent)
