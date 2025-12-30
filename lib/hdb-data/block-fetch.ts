/**
 * Data fetching functions for block-level data
 */

import { supabase } from '../supabase'
import { paginateQuery } from '../utils/pagination'
import type { Block, BlockMetric, BlockWithMetrics, BlockFilters } from './block-types'

// Fetch blocks with metrics
export async function getBlocksWithMetrics(
  filters: BlockFilters
): Promise<BlockWithMetrics[]> {
  try {
    if (!supabase) {
      console.warn('Supabase not configured, returning empty array')
      return []
    }

    // Start with blocks query
    let blocksQuery = supabase
      .from('blocks')
      .select('*')
      .in('town', filters.towns.length > 0 ? filters.towns : [])

    const { data: blocksData, error: blocksError } = await blocksQuery

    if (blocksError) {
      console.error('Error fetching blocks:', blocksError)
      // Check if table doesn't exist (PGRST205)
      if (blocksError.code === 'PGRST205' || blocksError.message?.includes("Could not find the table")) {
        console.warn('Blocks table does not exist. Please run the migration: supabase/migrations/add_blocks_tables.sql')
      }
      return []
    }

    if (!blocksData || blocksData.length === 0) {
      return []
    }

    const blockIds = blocksData.map(b => b.id)

    // Fetch latest metrics for these blocks
    const endDate = new Date()
    const { data: metricsData, error: metricsError } = await supabase
      .from('block_metrics')
      .select('*')
      .in('block_id', blockIds)
      .eq('flat_type', filters.flatType)
      .eq('window_years', filters.window)
      .order('period_end', { ascending: false })

    if (metricsError) {
      console.error('Error fetching block metrics:', metricsError)
    }

    // Get the latest metric for each block
    const metricsMap = new Map<string, BlockMetric>()
    if (metricsData) {
      for (const metric of metricsData) {
        if (!metricsMap.has(metric.block_id)) {
          metricsMap.set(metric.block_id, {
            id: metric.id,
            blockId: metric.block_id,
            town: metric.town,
            flatType: metric.flat_type,
            windowYears: metric.window_years,
            txCount: Number(metric.tx_count) || 0,
            medianPricePsm: metric.median_price_psm ? Number(metric.median_price_psm) : null,
            medianResalePrice: metric.median_resale_price ? Number(metric.median_resale_price) : null,
            qoqChangePsm: metric.qoq_change_psm ? Number(metric.qoq_change_psm) : null,
            rolling6mChangePsm: metric.rolling_6m_change_psm ? Number(metric.rolling_6m_change_psm) : null,
            medianRemainingLeaseYears: metric.median_remaining_lease_years ? Number(metric.median_remaining_lease_years) : null,
            leasePercentileInTown: metric.lease_percentile_in_town ? Number(metric.lease_percentile_in_town) : null,
            mrtBand: metric.mrt_band as BlockMetric['mrtBand'],
            nearestMrtName: metric.nearest_mrt_name,
            nearestMrtDistM: metric.nearest_mrt_dist_m ? Number(metric.nearest_mrt_dist_m) : null,
            busStops400m: Number(metric.bus_stops_400m) || 0,
            primaryWithin1km: Number(metric.primary_within_1km) || 0,
            periodStart: metric.period_start,
            periodEnd: metric.period_end,
            updatedAt: metric.updated_at,
          })
        }
      }
    }

    // Combine blocks with metrics
    const blocksWithMetrics: BlockWithMetrics[] = blocksData
      .map(block => ({
        id: block.id,
        town: block.town,
        blockNo: block.block_no,
        street: block.street,
        address: block.address,
        lat: block.lat ? Number(block.lat) : null,
        lon: block.lon ? Number(block.lon) : null,
        metrics: metricsMap.get(block.id) || null,
      }))
      .filter(block => {
        // Apply filters
        if (filters.leaseMinYears && block.metrics?.medianRemainingLeaseYears) {
          if (block.metrics.medianRemainingLeaseYears < filters.leaseMinYears) {
            return false
          }
        }

        if (filters.mrtBand && block.metrics?.mrtBand) {
          if (filters.mrtBand === '<400' && block.metrics.mrtBand !== '<400') {
            return false
          }
          if (filters.mrtBand === '<800' && block.metrics.mrtBand === '>800') {
            return false
          }
        }

        if (filters.busStopsMin && block.metrics) {
          if (block.metrics.busStops400m < filters.busStopsMin) {
            return false
          }
        }

        // Note: priceVsTown filter would require town median data, skipping for now
        return true
      })

    // Apply sorting
    const sorted = sortBlocks(blocksWithMetrics, filters.sort)
    return sorted
  } catch (error) {
    console.error('Error fetching blocks with metrics:', error)
    return []
  }
}

function sortBlocks(
  blocks: BlockWithMetrics[],
  sortOption: BlockFilters['sort']
): BlockWithMetrics[] {
  const sorted = [...blocks]

  switch (sortOption) {
    case 'lease_healthiest':
      return sorted.sort((a, b) => {
        const aLease = a.metrics?.medianRemainingLeaseYears ?? 0
        const bLease = b.metrics?.medianRemainingLeaseYears ?? 0
        return bLease - aLease
      })

    case 'closest_mrt':
      return sorted.sort((a, b) => {
        const aDist = a.metrics?.nearestMrtDistM ?? Infinity
        const bDist = b.metrics?.nearestMrtDistM ?? Infinity
        return aDist - bDist
      })

    case 'best_value':
      return sorted.sort((a, b) => {
        const aPrice = a.metrics?.medianPricePsm ?? Infinity
        const bPrice = b.metrics?.medianPricePsm ?? Infinity
        return aPrice - bPrice
      })

    case 'balanced':
    default:
      // Balanced: prioritize blocks with metrics, then by lease health
      return sorted.sort((a, b) => {
        if (!a.metrics && !b.metrics) return 0
        if (!a.metrics) return 1
        if (!b.metrics) return -1
        const aLease = a.metrics.medianRemainingLeaseYears ?? 0
        const bLease = b.metrics.medianRemainingLeaseYears ?? 0
        return bLease - aLease
      })
  }
}

// Get town median price for comparison (used for priceVsTown filter)
export async function getTownMedianPrice(
  town: string,
  flatType: string,
  windowYears: number
): Promise<number | null> {
  try {
    if (!supabase) return null

    // This would require aggregating from block_metrics or using agg_monthly
    // For now, return null (can be implemented later)
    return null
  } catch (error) {
    console.error('Error fetching town median price:', error)
    return null
  }
}

