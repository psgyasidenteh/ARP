import type { LucideIcon } from 'lucide-react'
import {
  ArrowRightLeft,
  CircleArrowUp,
  Cylinder,
  FlaskConical,
  GitMerge,
  SquareSplitVertical,
  Wind,
} from 'lucide-react'

export type PaletteItemDef = {
  equipmentType: string
  displayLabel: string
  icon: LucideIcon
}

export type PaletteTabDef = {
  id: string
  label: string
  items: PaletteItemDef[]
}

export const MODEL_PALETTE_TABS: PaletteTabDef[] = [
  {
    id: 'mixers-splitters',
    label: 'Mixers/Splitters',
    items: [
      { equipmentType: 'mixer', displayLabel: 'Mixer', icon: GitMerge },
      {
        equipmentType: 'splitter',
        displayLabel: 'Splitter',
        icon: SquareSplitVertical,
      },
    ],
  },
  {
    id: 'separators',
    label: 'Separators',
    items: [
      {
        equipmentType: 'flash',
        displayLabel: 'Flash drum',
        icon: Cylinder,
      },
      {
        equipmentType: 'heat_exchanger',
        displayLabel: 'Heat exchanger',
        icon: ArrowRightLeft,
      },
    ],
  },
  {
    id: 'columns',
    label: 'Columns',
    items: [
      {
        equipmentType: 'dist_column',
        displayLabel: 'Distillation',
        icon: Cylinder,
      },
      {
        equipmentType: 'absorber',
        displayLabel: 'Absorber',
        icon: Cylinder,
      },
    ],
  },
  {
    id: 'reactors',
    label: 'Reactors',
    items: [
      {
        equipmentType: 'cstr',
        displayLabel: 'CSTR',
        icon: FlaskConical,
      },
      {
        equipmentType: 'pfr',
        displayLabel: 'PFR',
        icon: FlaskConical,
      },
    ],
  },
  {
    id: 'pressure',
    label: 'Pressure Changers',
    items: [
      {
        equipmentType: 'pump',
        displayLabel: 'Pump',
        icon: CircleArrowUp,
      },
      {
        equipmentType: 'compressor',
        displayLabel: 'Compressor',
        icon: Wind,
      },
    ],
  },
]
