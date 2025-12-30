/**
 * Town Transport Profile Data
 * Structural transport burden mapping for all towns
 */

import { TownTransportProfile } from './types'
import { TOWNS } from '../compare-towns/constants'

// Town Transport Profile mapping (first version - structural data)
export const TOWN_TRANSPORT_PROFILES: Record<string, TownTransportProfile> = {
  'BISHAN': {
    town: 'BISHAN',
    centralAccessBurden: 10, // NS line direct to CBD
    transferBurden: 10, // Interchange but not crowded
    networkRedundancy: 10, // NS + Circle line
    dailyMobilityFriction: 10, // Good bus connectivity
    mrtLinesCount: 2,
    averageTransfersToCBD: 0,
    distanceBand: 'well_connected',
    commuteCategory: 'Well-connected',
  },
  'QUEENSTOWN': {
    town: 'QUEENSTOWN',
    centralAccessBurden: 15, // EW line direct to CBD
    transferBurden: 10, // Single line
    networkRedundancy: 20, // Single line dependency
    dailyMobilityFriction: 15, // Good connectivity
    mrtLinesCount: 1,
    averageTransfersToCBD: 0,
    distanceBand: 'central',
    commuteCategory: 'Central',
  },
  'TOA PAYOH': {
    town: 'TOA PAYOH',
    centralAccessBurden: 12, // NS line direct
    transferBurden: 10, // Interchange hub
    networkRedundancy: 15, // NS + Circle line
    dailyMobilityFriction: 12, // Central location
    mrtLinesCount: 2,
    averageTransfersToCBD: 0,
    distanceBand: 'central',
    commuteCategory: 'Central',
  },
  'CLEMENTI': {
    town: 'CLEMENTI',
    centralAccessBurden: 18, // EW line direct
    transferBurden: 15, // Single line
    networkRedundancy: 25, // Single line dependency
    dailyMobilityFriction: 15, // Good bus connectivity
    mrtLinesCount: 1,
    averageTransfersToCBD: 0,
    distanceBand: 'well_connected',
    commuteCategory: 'Well-connected',
  },
  'ANG MO KIO': {
    town: 'ANG MO KIO',
    centralAccessBurden: 25, // NS line direct
    transferBurden: 20, // Single line dependency
    networkRedundancy: 35, // Single line
    dailyMobilityFriction: 20, // Moderate connectivity
    mrtLinesCount: 1,
    averageTransfersToCBD: 0,
    distanceBand: 'well_connected',
    commuteCategory: 'Well-connected',
  },
  'BUKIT BATOK': {
    town: 'BUKIT BATOK',
    centralAccessBurden: 30, // NS line, further out
    transferBurden: 25, // Single line
    networkRedundancy: 40, // Single line dependency
    dailyMobilityFriction: 30, // Bus dependent
    mrtLinesCount: 1,
    averageTransfersToCBD: 0,
    distanceBand: 'peripheral',
    commuteCategory: 'Peripheral',
  },
  'TAMPINES': {
    town: 'TAMPINES',
    centralAccessBurden: 35, // EW line, far from CBD
    transferBurden: 20, // Regional hub
    networkRedundancy: 30, // EW + DT line
    dailyMobilityFriction: 25, // Regional center
    mrtLinesCount: 2,
    averageTransfersToCBD: 0,
    distanceBand: 'peripheral',
    commuteCategory: 'Peripheral',
  },
  'BEDOK': {
    town: 'BEDOK',
    centralAccessBurden: 38, // EW line, far
    transferBurden: 25, // Single line
    networkRedundancy: 35, // Single line dependency
    dailyMobilityFriction: 30, // Moderate connectivity
    mrtLinesCount: 1,
    averageTransfersToCBD: 0,
    distanceBand: 'peripheral',
    commuteCategory: 'Peripheral',
  },
  'WOODLANDS': {
    town: 'WOODLANDS',
    centralAccessBurden: 50, // NS line, very far
    transferBurden: 30, // Single line + long distance
    networkRedundancy: 40, // Single line dependency
    dailyMobilityFriction: 35, // Regional hub but far
    mrtLinesCount: 1,
    averageTransfersToCBD: 0,
    distanceBand: 'peripheral',
    commuteCategory: 'Peripheral',
  },
  'PUNGGOL': {
    town: 'PUNGGOL',
    centralAccessBurden: 55, // NE line, far + transfer needed
    transferBurden: 45, // LRT + MRT transfer
    networkRedundancy: 50, // Single line + LRT dependency
    dailyMobilityFriction: 40, // LRT dependent
    mrtLinesCount: 1,
    averageTransfersToCBD: 1,
    distanceBand: 'peripheral',
    commuteCategory: 'Peripheral',
  },
  'SENGKANG': {
    town: 'SENGKANG',
    centralAccessBurden: 58, // NE line, far
    transferBurden: 50, // LRT + MRT transfer
    networkRedundancy: 55, // Single line + LRT
    dailyMobilityFriction: 45, // LRT dependent
    mrtLinesCount: 1,
    averageTransfersToCBD: 1,
    distanceBand: 'peripheral',
    commuteCategory: 'Peripheral',
  },
  'YISHUN': {
    town: 'YISHUN',
    centralAccessBurden: 60, // NS line, very far
    transferBurden: 35, // Single line
    networkRedundancy: 50, // Single line dependency
    dailyMobilityFriction: 40, // Far from hubs
    mrtLinesCount: 1,
    averageTransfersToCBD: 0,
    distanceBand: 'peripheral',
    commuteCategory: 'Peripheral',
  },
  'CHOA CHU KANG': {
    town: 'CHOA CHU KANG',
    centralAccessBurden: 65, // NS line, very far
    transferBurden: 40, // Single line + long distance
    networkRedundancy: 55, // Single line dependency
    dailyMobilityFriction: 45, // Far from hubs
    mrtLinesCount: 1,
    averageTransfersToCBD: 0,
    distanceBand: 'peripheral',
    commuteCategory: 'Peripheral',
  },
  'CENTRAL AREA': {
    town: 'CENTRAL AREA',
    centralAccessBurden: 5, // In CBD
    transferBurden: 5, // Multiple lines
    networkRedundancy: 5, // Best connectivity
    dailyMobilityFriction: 5, // Central location
    mrtLinesCount: 4,
    averageTransfersToCBD: 0,
    distanceBand: 'central',
    commuteCategory: 'Central',
  },
  'BUKIT MERAH': {
    town: 'BUKIT MERAH',
    centralAccessBurden: 12, // Close to CBD
    transferBurden: 10, // EW line
    networkRedundancy: 15, // Good connectivity
    dailyMobilityFriction: 10, // Central location
    mrtLinesCount: 1,
    averageTransfersToCBD: 0,
    distanceBand: 'central',
    commuteCategory: 'Central',
  },
  'BUKIT TIMAH': {
    town: 'BUKIT TIMAH',
    centralAccessBurden: 15, // Close to CBD
    transferBurden: 10, // DT line
    networkRedundancy: 20, // Single line
    dailyMobilityFriction: 12, // Central location
    mrtLinesCount: 1,
    averageTransfersToCBD: 0,
    distanceBand: 'central',
    commuteCategory: 'Central',
  },
  'KALLANG/WHAMPOA': {
    town: 'KALLANG/WHAMPOA',
    centralAccessBurden: 15, // Close to CBD
    transferBurden: 10, // EW line
    networkRedundancy: 15, // Good connectivity
    dailyMobilityFriction: 12, // Central location
    mrtLinesCount: 1,
    averageTransfersToCBD: 0,
    distanceBand: 'central',
    commuteCategory: 'Central',
  },
  'MARINE PARADE': {
    town: 'MARINE PARADE',
    centralAccessBurden: 20, // Close to CBD
    transferBurden: 15, // DT line
    networkRedundancy: 20, // Single line
    dailyMobilityFriction: 15, // Good connectivity
    mrtLinesCount: 1,
    averageTransfersToCBD: 0,
    distanceBand: 'central',
    commuteCategory: 'Central',
  },
  'HOUGANG': {
    town: 'HOUGANG',
    centralAccessBurden: 40, // NE line, far
    transferBurden: 30, // Single line
    networkRedundancy: 35, // Single line dependency
    dailyMobilityFriction: 30, // Moderate connectivity
    mrtLinesCount: 1,
    averageTransfersToCBD: 0,
    distanceBand: 'peripheral',
    commuteCategory: 'Peripheral',
  },
  'JURONG EAST': {
    town: 'JURONG EAST',
    centralAccessBurden: 30, // EW line, far but hub
    transferBurden: 15, // Interchange hub
    networkRedundancy: 20, // EW + NS line
    dailyMobilityFriction: 15, // Regional hub
    mrtLinesCount: 2,
    averageTransfersToCBD: 0,
    distanceBand: 'well_connected',
    commuteCategory: 'Well-connected',
  },
  'JURONG WEST': {
    town: 'JURONG WEST',
    centralAccessBurden: 45, // EW line, very far
    transferBurden: 30, // Single line
    networkRedundancy: 45, // Single line dependency
    dailyMobilityFriction: 40, // Far from hubs
    mrtLinesCount: 1,
    averageTransfersToCBD: 0,
    distanceBand: 'peripheral',
    commuteCategory: 'Peripheral',
  },
  'PASIR RIS': {
    town: 'PASIR RIS',
    centralAccessBurden: 45, // EW line, very far
    transferBurden: 30, // Single line
    networkRedundancy: 40, // Single line dependency
    dailyMobilityFriction: 35, // Far from hubs
    mrtLinesCount: 1,
    averageTransfersToCBD: 0,
    distanceBand: 'peripheral',
    commuteCategory: 'Peripheral',
  },
  'SEMBAWANG': {
    town: 'SEMBAWANG',
    centralAccessBurden: 60, // NS line, very far
    transferBurden: 40, // Single line
    networkRedundancy: 50, // Single line dependency
    dailyMobilityFriction: 45, // Very far from hubs
    mrtLinesCount: 1,
    averageTransfersToCBD: 0,
    distanceBand: 'peripheral',
    commuteCategory: 'Peripheral',
  },
  'SERANGOON': {
    town: 'SERANGOON',
    centralAccessBurden: 35, // NE line
    transferBurden: 20, // Interchange hub
    networkRedundancy: 25, // NE + Circle line
    dailyMobilityFriction: 20, // Good connectivity
    mrtLinesCount: 2,
    averageTransfersToCBD: 0,
    distanceBand: 'well_connected',
    commuteCategory: 'Well-connected',
  },
  'BUKIT PANJANG': {
    town: 'BUKIT PANJANG',
    centralAccessBurden: 50, // DT line, far
    transferBurden: 35, // Single line
    networkRedundancy: 45, // Single line dependency
    dailyMobilityFriction: 40, // Far from hubs
    mrtLinesCount: 1,
    averageTransfersToCBD: 1,
    distanceBand: 'peripheral',
    commuteCategory: 'Peripheral',
  },
  'GEYLANG': {
    town: 'GEYLANG',
    centralAccessBurden: 18, // Close to CBD
    transferBurden: 12, // EW line
    networkRedundancy: 18, // Good connectivity
    dailyMobilityFriction: 15, // Central location
    mrtLinesCount: 1,
    averageTransfersToCBD: 0,
    distanceBand: 'central',
    commuteCategory: 'Central',
  },
}

// Get transport profile for a town
export function getTownTransportProfile(town: string): TownTransportProfile | null {
  return TOWN_TRANSPORT_PROFILES[town.toUpperCase()] || null
}

