/**
 * Address Resolver Types
 * Unified input/output structure for address resolution
 */

export type Confidence = 'High' | 'Medium' | 'Low'

export type InputType = 'postal' | 'address' | 'project' | 'mixed' | 'unknown'

export type Source = 'postal' | 'onemap' | 'project' | 'google' | 'subzone'

export interface ResolvedAddress {
  // Standard address + postal
  resolved_address: string
  postal?: string
  
  // Coordinates
  latlng: {
    lat: number
    lng: number
  }
  
  // Subzone (neighbourhood)
  subzone_id: string
  subzone_name: string
  
  // Planning area
  planning_area_id?: string
  planning_area_name?: string
  
  // Confidence level
  confidence: Confidence
  
  // Source chain (which sources were used)
  source_chain: Source[]
  
  // Additional metadata
  candidates?: AddressCandidate[]
  raw_query: string
  normalized_query: string
}

export interface AddressCandidate {
  address: string
  postal?: string
  latlng: {
    lat: number
    lng: number
  }
  score?: number
  subzone_id?: string
  subzone_name?: string
}

export interface OneMapResult {
  SEARCHVAL: string
  BLK_NO: string
  ROAD_NAME: string
  BUILDING: string
  ADDRESS: string
  POSTAL: string
  X: string
  Y: string
  LATITUDE: string
  LONGITUDE: string
  LONGTITUDE?: string
}

export interface OneMapResponse {
  found: number
  totalNumPages: number
  pageNum: number
  results: OneMapResult[]
}

export interface SubzoneData {
  id: string
  name: string
  planning_area_id: string
  region?: string
}
