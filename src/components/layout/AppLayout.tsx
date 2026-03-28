import { ChevronDown, Play } from 'lucide-react'
import clsx from 'clsx'
import { DataBrowserTree } from '../data-browser/DataBrowserTree'
import { ModelPalette } from '../../model-palette/ModelPalette'
import { FlowsheetRoot } from '../../flowsheet/FlowsheetStateContext'
import { FlowsheetCanvas } from '../../flowsheet/FlowsheetCanvas'
import { CopilotChat } from '../../copilot/CopilotChat'
import { FileRibbonMenu } from '../ribbon/FileRibbonMenu'

const ribbonMenus = ['Home', 'View', 'Simulation', 'AI Tools'] as const

function RibbonMenuButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex items-center gap-0.5 rounded px-2 py-0.5 text-[11px] font-medium text-gray-800',
        'border border-transparent hover:border-gray-300 hover:bg-gray-100',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-industrial-accent',
      )}
    >
      {label}
      <ChevronDown className="h-3 w-3 text-gray-500" aria-hidden />
    </button>
  )
}

export function AppLayout() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-white text-gray-900">
      <FlowsheetRoot>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      {/* Top ribbon — 5vh */}
      <header
        className="flex shrink-0 items-center gap-3 border-b border-gray-400 bg-[#f9fafb] px-2"
        style={{ height: '5vh', minHeight: '2rem' }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto border-r border-gray-300 pr-2">
          <span className="shrink-0 px-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Prompt-to-Plant
          </span>
          <nav className="flex items-center gap-0.5" aria-label="Application menu">
            <FileRibbonMenu />
            {ribbonMenus.map((m) => (
              <RibbonMenuButton key={m} label={m} />
            ))}
          </nav>
        </div>
        <div className="flex shrink-0 items-center border-l border-gray-300 pl-2">
          <button
            type="button"
            className={clsx(
              'inline-flex items-center gap-1.5 rounded border border-industrial-accent bg-industrial-accent',
              'px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm',
              'hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-industrial-accent',
            )}
          >
            <Play className="h-3.5 w-3.5 fill-current" aria-hidden />
            Run Simulation
          </button>
        </div>
      </header>

      {/* Main body — remaining height: 3 columns 20% / 60% / 20% */}
      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-[20%_60%_20%] border-t-0">
        {/* Left — Data Browser */}
        <aside
          className="min-h-0 overflow-hidden border-r border-gray-400 bg-industrial-panel"
          aria-label="Data browser"
        >
          <div className="flex h-full min-h-0 flex-col overflow-hidden p-1.5">
            <p className="shrink-0 border-b border-gray-300 pb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              Data Browser
            </p>
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-1">
              <DataBrowserTree />
            </div>
          </div>
        </aside>

        {/* Center — Flowsheet + Palette */}
        <section
          className="flex min-h-0 min-w-0 flex-col border-x border-gray-400 bg-white"
          aria-label="Flowsheet and model palette"
        >
          <div className="min-h-0 flex-[8] overflow-hidden border-b border-gray-400 bg-[#fafafa]">
            <FlowsheetCanvas />
          </div>
          <div className="min-h-0 flex-[2] overflow-hidden bg-industrial-panel">
            <ModelPalette />
          </div>
        </section>

        {/* Right — AI Copilot */}
        <aside
          className="min-h-0 overflow-hidden border-l border-gray-400 bg-industrial-panel"
          aria-label="AI copilot"
        >
          <CopilotChat />
        </aside>
      </div>
        </div>
      </FlowsheetRoot>
    </div>
  )
}
