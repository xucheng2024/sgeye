// URA Regional Classification Mapping
// CCR: Core Central Region (核心中央区)
// RCR: Rest of Central Region (中央区外围)
// OCR: Outside Central Region (中央区以外)

export type RegionType = 'CCR' | 'RCR' | 'OCR'

export interface RegionInfo {
  code: RegionType
  name: string
  fullName: string
  description: string
  color: string
  bgColor: string
  borderColor: string
}

export const REGIONS: Record<RegionType, RegionInfo> = {
  CCR: {
    code: 'CCR',
    name: 'Core Central',
    fullName: 'Core Central Region',
    description: '核心中央区 - 城市最核心，离CBD最近',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300'
  },
  RCR: {
    code: 'RCR',
    name: 'Central Fringe',
    fullName: 'Rest of Central Region',
    description: '中央区外围 - 通勤和生活平衡，HDB用户最爱',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300'
  },
  OCR: {
    code: 'OCR',
    name: 'Outside Central',
    fullName: 'Outside Central Region',
    description: '中央区以外 - 价格友好，空间大，更居住型',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300'
  }
}

export function getRegionInfo(region: RegionType | null | undefined): RegionInfo | null {
  if (!region || !REGIONS[region]) return null
  return REGIONS[region]
}

// Common planning areas mapping (for reference, actual data should come from DB)
export const PLANNING_AREA_REGIONS: Record<string, RegionType> = {
  // CCR
  'ORCHARD': 'CCR',
  'RIVER VALLEY': 'CCR',
  'NEWTON': 'CCR',
  'MARINA EAST': 'CCR',
  'MARINA SOUTH': 'CCR',
  'MARINA BAY': 'CCR',
  'DOWNTOWN CORE': 'CCR',
  'MUSEUM': 'CCR',
  'ROCHOR': 'CCR',
  'SINGAPORE RIVER': 'CCR',
  'STRAITS VIEW': 'CCR',
  
  // RCR (most common for HDB)
  'QUEENSTOWN': 'RCR',
  'BISHAN': 'RCR',
  'TOA PAYOH': 'RCR',
  'KALLANG': 'RCR',
  'WHAMPOA': 'RCR',
  'GEYLANG': 'RCR',
  'MARINE PARADE': 'RCR',
  'NOVENA': 'RCR',
  'BUKIT MERAH': 'RCR',
  'CLEMENTI': 'RCR',
  
  // OCR
  'JURONG EAST': 'OCR',
  'JURONG WEST': 'OCR',
  'CHOA CHU KANG': 'OCR',
  'BUKIT PANJANG': 'OCR',
  'WOODLANDS': 'OCR',
  'SEMBAWANG': 'OCR',
  'YISHUN': 'OCR',
  'TAMPINES': 'OCR',
  'PASIR RIS': 'OCR',
  'BEDOK': 'OCR',
  'HOUGANG': 'OCR',
  'SENGKANG': 'OCR',
  'PUNGGOL': 'OCR',
  'SERANGOON': 'OCR',
  'ANG MO KIO': 'OCR',
  'YIO CHU KANG': 'OCR'
}

