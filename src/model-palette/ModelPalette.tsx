import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { MODEL_PALETTE_TABS } from './paletteData'
import { setFlowsheetDragData } from './flowsheetDrag'

export function ModelPalette() {
  const [activeTabId, setActiveTabId] = useState(MODEL_PALETTE_TABS[0]!.id)

  const activeTab = useMemo(
    () => MODEL_PALETTE_TABS.find((t) => t.id === activeTabId) ?? MODEL_PALETTE_TABS[0]!,
    [activeTabId],
  )

  return (
    <div
      className="flex h-full min-h-0 flex-col border-t border-gray-300 bg-industrial-panel"
      aria-label="Model palette"
    >
      <div
        className="flex shrink-0 gap-0.5 overflow-x-auto border-b border-gray-300 bg-[#eceef2] px-1 py-0.5"
        role="tablist"
        aria-label="Equipment categories"
      >
        {MODEL_PALETTE_TABS.map((tab) => {
          const selected = tab.id === activeTab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveTabId(tab.id)}
              className={clsx(
                'whitespace-nowrap rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                selected
                  ? 'border-gray-400 bg-white text-gray-900 shadow-sm'
                  : 'border-transparent bg-transparent text-gray-600 hover:border-gray-300 hover:bg-white/60',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div
        className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden px-1 py-1"
        role="tabpanel"
        aria-label={activeTab.label}
      >
        <div className="flex h-full items-stretch gap-1">
          {activeTab.items.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.equipmentType}
                draggable
                onDragStart={(e) =>
                  setFlowsheetDragData(e, {
                    equipmentType: item.equipmentType,
                    displayLabel: item.displayLabel,
                  })
                }
                className={clsx(
                  'flex w-[4.5rem] shrink-0 cursor-grab flex-col items-center justify-center gap-0.5 rounded border border-gray-300 bg-white px-1 py-0.5',
                  'text-center shadow-sm active:cursor-grabbing',
                  'hover:border-industrial-accent hover:bg-blue-50/40',
                  'focus-within:ring-2 focus-within:ring-industrial-accent focus-within:ring-offset-1',
                )}
                title={`Drag ${item.displayLabel} to the flowsheet`}
              >
                <Icon
                  className="h-5 w-5 text-gray-700"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span className="line-clamp-2 text-[9px] font-medium leading-tight text-gray-800">
                  {item.displayLabel}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
