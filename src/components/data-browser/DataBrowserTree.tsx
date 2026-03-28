import { useCallback, useId, useState } from 'react'
import { ChevronRight, FileText, Folder } from 'lucide-react'
import clsx from 'clsx'
import { DATA_BROWSER_ROOTS, type EngineeringTreeNode } from './treeData'

type TreeRowProps = {
  node: EngineeringTreeNode
  depth: number
}

function TreeRow({ node, depth }: TreeRowProps) {
  const hasChildren = Boolean(node.children?.length)
  const [expanded, setExpanded] = useState(depth === 0)
  const rowId = useId()
  const groupId = `${rowId}-group`

  const toggle = useCallback(() => {
    if (hasChildren) setExpanded((e) => !e)
  }, [hasChildren])

  const paddingLeft = 4 + depth * 12

  if (!hasChildren) {
    return (
      <div
        role="treeitem"
        aria-level={depth + 1}
        className="flex min-h-[20px] cursor-default items-center gap-1 rounded px-0.5 text-[11px] text-gray-800 hover:bg-gray-200/80"
        style={{ paddingLeft }}
      >
        <span className="inline-flex w-4 shrink-0 justify-center" aria-hidden>
          <FileText className="h-3 w-3 text-gray-500" strokeWidth={1.75} />
        </span>
        <span className="truncate leading-tight">{node.label}</span>
      </div>
    )
  }

  return (
    <div role="group">
      <div
        role="treeitem"
        aria-expanded={expanded}
        aria-controls={groupId}
        aria-level={depth + 1}
        tabIndex={0}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggle()
          }
        }}
        className={clsx(
          'flex min-h-[20px] cursor-pointer select-none items-center gap-0.5 rounded px-0.5 text-[11px] font-medium text-gray-900',
          'hover:bg-gray-200/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-industrial-accent',
        )}
        style={{ paddingLeft }}
      >
        <span className="inline-flex w-4 shrink-0 justify-center text-gray-600" aria-hidden>
          <ChevronRight
            className={clsx('h-3.5 w-3.5 transition-transform', expanded && 'rotate-90')}
          />
        </span>
        <Folder className="h-3 w-3 shrink-0 text-amber-700/90" strokeWidth={1.75} aria-hidden />
        <span className="truncate leading-tight">{node.label}</span>
      </div>
      {expanded && (
        <div id={groupId} role="group">
          {node.children!.map((child) => (
            <TreeRow key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function DataBrowserTree() {
  return (
    <div
      className="text-left"
      role="tree"
      aria-label="Simulation data browser"
    >
      {DATA_BROWSER_ROOTS.map((node) => (
        <TreeRow key={node.id} node={node} depth={0} />
      ))}
    </div>
  )
}
