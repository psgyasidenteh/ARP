export type EngineeringTreeNode = {
  id: string
  label: string
  children?: EngineeringTreeNode[]
}

/** Dummy process simulation tree (Aspen-like hierarchy). */
export const DATA_BROWSER_ROOTS: EngineeringTreeNode[] = [
  {
    id: 'setup',
    label: 'Setup',
    children: [
      { id: 'setup-sim', label: 'Simulation' },
      { id: 'setup-units', label: 'Units of Measurement' },
      { id: 'setup-run', label: 'Run Control' },
    ],
  },
  {
    id: 'components',
    label: 'Components',
    children: [
      { id: 'comp-water', label: 'Water' },
      { id: 'comp-bauxite', label: 'Bauxite' },
      { id: 'comp-hcl', label: 'HCl' },
      { id: 'comp-naoh', label: 'NaOH' },
    ],
  },
  {
    id: 'properties',
    label: 'Properties',
    children: [
      {
        id: 'props-pure',
        label: 'Pure Component',
        children: [
          { id: 'pc-water', label: 'Water — NRTL' },
          { id: 'pc-hcl', label: 'HCl — Hayden-O\'Connell' },
        ],
      },
      { id: 'props-eos', label: 'Equation of State' },
      { id: 'props-transport', label: 'Transport Property' },
    ],
  },
  {
    id: 'streams',
    label: 'Streams',
    children: [
      { id: 'str-feed', label: 'FEED-1' },
      { id: 'str-s101', label: 'S-101' },
      { id: 'str-s102', label: 'S-102' },
      { id: 'str-prod', label: 'PRODUCT' },
    ],
  },
  {
    id: 'blocks',
    label: 'Blocks',
    children: [
      {
        id: 'blk-mix',
        label: 'Mixers/Splitters',
        children: [
          { id: 'blk-m1', label: 'MIX-01' },
          { id: 'blk-s1', label: 'SPLIT-01' },
        ],
      },
      { id: 'blk-p101', label: 'PUMP-101' },
      { id: 'blk-r100', label: 'R-100 (CSTR)' },
      { id: 'blk-dc1', label: 'DIST-01' },
    ],
  },
  {
    id: 'results',
    label: 'Results',
    children: [
      { id: 'res-mbal', label: 'Material Balance' },
      { id: 'res-ebal', label: 'Energy Balance' },
      { id: 'res-dof', label: 'Degrees of Freedom' },
    ],
  },
]
