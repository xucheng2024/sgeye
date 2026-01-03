// URA Regional Classification Mapping
// CCR: Core Central Region
// RCR: Rest of Central Region
// OCR: Outside Central Region

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
    description: 'Core Central Region - closest to the CBD and prime districts',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300'
  },
  RCR: {
    code: 'RCR',
    name: 'Central Fringe',
    fullName: 'Rest of Central Region',
    description: 'Rest of Central Region - central fringe with balanced commute and lifestyle',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300'
  },
  OCR: {
    code: 'OCR',
    name: 'Outside Central',
    fullName: 'Outside Central Region',
    description: 'Outside Central Region - more space and generally more budget-friendly',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300'
  }
}

export function getRegionInfo(region: RegionType | null | undefined): RegionInfo | null {
  if (!region || !REGIONS[region]) return null
  return REGIONS[region]
}

// Common planning areas mapping (reference only; source of truth should come from DB)
export const PLANNING_AREA_REGIONS: Record<string, RegionType> = {
  // CCR
  'ORCHARD': 'CCR',
  'RIVER VALLEY': 'CCR',
  'NEWTON': 'CCR',
  'NOVENA': 'CCR',
  'MARINA EAST': 'CCR',
  'MARINA SOUTH': 'CCR',
  'MARINA BAY': 'CCR',
  'DOWNTOWN CORE': 'CCR',
  'MUSEUM': 'CCR',
  'ROCHOR': 'CCR',
  'SINGAPORE RIVER': 'CCR',
  'STRAITS VIEW': 'CCR',
  'TANGLIN': 'CCR',
  'SENTOSA': 'CCR',
  
  // RCR (most common for HDB)
  'QUEENSTOWN': 'RCR',
  'BISHAN': 'RCR',
  'TOA PAYOH': 'RCR',
  'KALLANG': 'RCR',
  'WHAMPOA': 'RCR',
  'GEYLANG': 'RCR',
  'MARINE PARADE': 'RCR',
  'MOUNTBATTEN': 'RCR',
  'JOO CHIAT': 'RCR',
  'BUKIT MERAH': 'RCR',
  'CLEMENTI': 'RCR',
  'PASIR PANJANG': 'RCR',
  'TELOK BLANGAH': 'RCR',
  'REDHILL': 'RCR',
  'QUEENSWAY': 'RCR',
  'ALEXANDRA': 'RCR',
  'BUKIT TIMAH': 'RCR',
  'DOVER': 'RCR',
  'OUTRAM': 'RCR',
  
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

