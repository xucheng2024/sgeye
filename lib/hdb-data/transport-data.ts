/**
 * Neighbourhood Transport Profile Data
 * Dynamic calculation based on neighbourhood_access table
 */

import { supabase } from '../supabase'
import type { NeighbourhoodTransportProfile } from './types'

// Get transport profile for a neighbourhood based on neighbourhood_access data
export async function getNeighbourhoodTransportProfile(neighbourhoodId: string): Promise<NeighbourhoodTransportProfile | null> {
  try {
    if (supabase) {
      // Get access data
      const { data: accessData } = await supabase
        .from('neighbourhood_access')
        .select('*')
        .eq('neighbourhood_id', neighbourhoodId)
        .single()

      if (!accessData) return null

      // Get neighbourhood name
      const { data: neighbourhood } = await supabase
        .from('neighbourhoods')
        .select('id, name')
        .eq('id', neighbourhoodId)
        .single()

      // Calculate transport burden metrics from access data
      const mrtStationCount = Number(accessData.mrt_station_count) || 0
      const busStopCount = Number(accessData.bus_stop_count) || 0
      const mrtAccessType = accessData.mrt_access_type || 'none'
      const transferComplexity = accessData.transfer_complexity || '1_transfer'
      const busDependency = accessData.bus_dependency || 'high'

      // Calculate central access burden (0-100)
      // Based on MRT station count and access type
      // Represents structural convenience to job centers/main hubs
      let centralAccessBurden = 50 // default
      if (mrtAccessType === 'high') {
        if (mrtStationCount >= 4) centralAccessBurden = 10
        else if (mrtStationCount >= 2) centralAccessBurden = 15
        else centralAccessBurden = 20 // 1 station
      } else if (mrtAccessType === 'medium') {
        if (mrtStationCount >= 2) centralAccessBurden = 25
        else centralAccessBurden = 35 // 1 station
      } else if (mrtAccessType === 'low') {
        centralAccessBurden = 45
      } else {
        centralAccessBurden = 60 // none
      }

      // Transfer burden (0-100)
      // Adjusted: direct routes may still be slow if centralAccessBurden is high
      let transferBurden = 20 // default
      if (transferComplexity === 'direct') {
        // If central access is already poor, direct route may still be slow
        transferBurden = centralAccessBurden >= 40 ? 15 : 10
      } else if (transferComplexity === '1_transfer') {
        transferBurden = 25
      } else {
        transferBurden = 50 // 2_plus
      }

      // Network redundancy (0-100, lower is better)
      // Based on MRT lines and bus coverage
      // Represents alternative route availability when one line is disrupted
      let networkRedundancy = 30 // default
      if (mrtStationCount >= 3) {
        networkRedundancy = 10
      } else if (mrtStationCount >= 1) {
        if (busStopCount >= 10) {
          networkRedundancy = 20
        } else if (busStopCount >= 5) {
          networkRedundancy = 28
        } else {
          networkRedundancy = 35
        }
      } else if (busStopCount >= 10) {
        networkRedundancy = 40
      } else {
        networkRedundancy = 55
      }

      // Daily mobility friction (0-100)
      // Proxy for last-mile, waiting uncertainty, and walking exposure
      // busDependency is a proxy, not "more buses = better/worse"
      let dailyMobilityFriction = 30 // default
      if (busDependency === 'low') {
        dailyMobilityFriction = 10
      } else if (busDependency === 'medium') {
        dailyMobilityFriction = 20
      } else {
        dailyMobilityFriction = 35 // high (reduced from 40 for better balance)
      }

      // Determine distance band and commute category
      let distanceBand: 'central' | 'well_connected' | 'peripheral' = 'peripheral'
      let commuteCategory: 'Central' | 'Well-connected' | 'Peripheral' = 'Peripheral'
      
      if (centralAccessBurden <= 15) {
        distanceBand = 'central'
        commuteCategory = 'Central'
      } else if (centralAccessBurden <= 35) {
        distanceBand = 'well_connected'
        commuteCategory = 'Well-connected'
      }

      // Estimate MRT lines count (simplified - could be enhanced with actual line data)
      const mrtLinesCount = mrtStationCount > 2 ? 2 : (mrtStationCount > 0 ? 1 : 0)
      
      // Average transfers to CBD
      const averageTransfersToCBD = transferComplexity === 'direct' ? 0 : (transferComplexity === '1_transfer' ? 1 : 2)

      return {
        neighbourhoodId,
        neighbourhoodName: neighbourhood?.name,
        centralAccessBurden,
        transferBurden,
        networkRedundancy,
        dailyMobilityFriction,
        mrtLinesCount,
        averageTransfersToCBD,
        distanceBand,
        commuteCategory,
      }
    }
  } catch (error) {
    console.error('Error fetching neighbourhood transport profile:', error)
  }

  return null
}
