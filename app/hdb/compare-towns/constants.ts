/**
 * Constants for Compare Neighbourhoods page
 * Note: TOWNS list is kept for UI filtering/display only
 * All data aggregation is done by neighbourhood_id
 */

export const TOWNS = [
  'ANG MO KIO',
  'BEDOK',
  'BISHAN',
  'BUKIT BATOK',
  'BUKIT MERAH',
  'BUKIT PANJANG',
  'BUKIT TIMAH',
  'CENTRAL AREA',
  'CHOA CHU KANG',
  'CLEMENTI',
  'GEYLANG',
  'HOUGANG',
  'JURONG EAST',
  'JURONG WEST',
  'KALLANG/WHAMPOA',
  'MARINE PARADE',
  'PASIR RIS',
  'PUNGGOL',
  'QUEENSTOWN',
  'SEMBAWANG',
  'SENGKANG',
  'SERANGOON',
  'TAMPINES',
  'TOA PAYOH',
  'WOODLANDS',
  'YISHUN',
] as const

export const FLAT_TYPES = ['3 ROOM', '4 ROOM', '5 ROOM', 'EXECUTIVE'] as const

export interface RecommendedPair {
  townA: string
  townB: string
  label: string
  description: string
}

export const RECOMMENDED_PAIRS: RecommendedPair[] = [
  {
    townA: 'ANG MO KIO',
    townB: 'BUKIT BATOK',
    label: 'Popular vs Value',
    description: 'Compare two popular neighbourhoods with different price points',
  },
  {
    townA: 'QUEENSTOWN',
    townB: 'CLEMENTI',
    label: 'Central vs West',
    description: 'Central location vs established western neighbourhood',
  },
  {
    townA: 'BISHAN',
    townB: 'TAMPINES',
    label: 'North vs East',
    description: 'Two major regional centers',
  },
  {
    townA: 'BEDOK',
    townB: 'WOODLANDS',
    label: 'East vs North',
    description: 'Compare eastern and northern options',
  },
] as const

