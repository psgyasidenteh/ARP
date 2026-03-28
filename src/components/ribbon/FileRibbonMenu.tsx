import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { ChevronDown, Download, FilePlus, Upload } from 'lucide-react'
import clsx from 'clsx'
import { useFlowsheetState } from '../../flowsheet/FlowsheetStateContext'
import {
  buildExportBlob,
  parseFlowsheetImport,
} from '../../flowsheet/flowsheetPersistence'

export function FileRibbonMenu() {
  const { nodes, edges, clearFlowsheet, replaceFlowsheet } = useFlowsheetState()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const onNew = useCallback(() => {
    clearFlowsheet()
    setOpen(false)
  }, [clearFlowsheet])

  const onExport = useCallback(() => {
    const blob = buildExportBlob({ version: 1, nodes, edges })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'prompt-to-plant-flowsheet.json'
    a.click()
    URL.revokeObjectURL(url)
    setOpen(false)
  }, [nodes, edges])

  const onImportChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const data = JSON.parse(String(reader.result))
          const parsed = parseFlowsheetImport(data)
          if (parsed) replaceFlowsheet(parsed.nodes, parsed.edges)
        } catch {
          /* invalid file */
        }
      }
      reader.readAsText(file)
      e.target.value = ''
      setOpen(false)
    },
    [replaceFlowsheet],
  )

  const menuItemClass =
    'flex w-full items-center gap-2 px-2 py-1 text-left text-[11px] text-gray-900 hover:bg-gray-100'

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          'inline-flex items-center gap-0.5 rounded px-2 py-0.5 text-[11px] font-medium text-gray-800',
          'border border-transparent hover:border-gray-300 hover:bg-gray-100',
          open && 'border-gray-300 bg-gray-100',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-industrial-accent',
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        File
        <ChevronDown className="h-3 w-3 text-gray-500" aria-hidden />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-0.5 min-w-[12rem] rounded border border-gray-400 bg-white py-0.5 shadow-md"
        >
          <button type="button" role="menuitem" className={menuItemClass} onClick={onNew}>
            <FilePlus className="h-3.5 w-3.5 shrink-0 text-gray-600" aria-hidden />
            New flowsheet
          </button>
          <button type="button" role="menuitem" className={menuItemClass} onClick={onExport}>
            <Download className="h-3.5 w-3.5 shrink-0 text-gray-600" aria-hidden />
            Export JSON…
          </button>
          <button
            type="button"
            role="menuitem"
            className={menuItemClass}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5 shrink-0 text-gray-600" aria-hidden />
            Import JSON…
          </button>
        </div>
      ) : null}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={onImportChange}
      />
    </div>
  )
}
