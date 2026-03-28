/**
 * Maps palette equipment ids to one of three PFD node components
 * (pump, reactor, mixer).
 */
export function getFlowsheetNodeType(equipmentType: string): 'pump' | 'reactor' | 'mixer' {
  switch (equipmentType) {
    case 'pump':
    case 'compressor':
      return 'pump'
    case 'mixer':
    case 'splitter':
      return 'mixer'
    case 'cstr':
    case 'pfr':
    case 'flash':
    case 'dist_column':
    case 'absorber':
    case 'heat_exchanger':
      return 'reactor'
    default:
      return 'reactor'
  }
}
