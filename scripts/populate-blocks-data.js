/**
 * Populate Blocks and Block Metrics Data
 * 
 * This script:
 * 1. Extracts unique blocks from raw_resale_2017
 * 2. Populates blocks table
 * 3. Calculates and populates block_metrics table
 * 
 * Usage:
 * node scripts/populate-blocks-data.js
 * 
 * Environment variables:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_KEY (service role key)
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: Missing Supabase credentials')
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

/**
 * Parse lease years from string like "84 years 3 months"
 */
function parseLeaseYears(leaseText) {
  if (!leaseText || typeof leaseText !== 'string') return null
  
  const trimmed = leaseText.trim()
  if (!trimmed) return null
  
  const yearsMatch = trimmed.match(/(\d+)\s*years?/i)
  const monthsMatch = trimmed.match(/(\d+)\s*months?/i)
  
  const years = yearsMatch ? parseFloat(yearsMatch[1]) : 0
  const months = monthsMatch ? parseFloat(monthsMatch[1]) : 0
  
  if (years === 0 && months === 0) return null
  
  const leaseYears = years + months / 12
  if (leaseYears <= 0 || leaseYears > 99) return null
  
  return leaseYears
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null
  
  const R = 6371000 // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Step 1: Extract and insert unique blocks
 */
async function populateBlocks() {
  console.log('Step 1: Extracting unique blocks from raw_resale_2017...')
  
  // Get unique blocks with address info
  const { data: rawBlocks, error } = await supabase
    .from('raw_resale_2017')
    .select('town, block, street_name')
    .not('block', 'is', null)
    .not('street_name', 'is', null)
    .not('town', 'is', null)

  if (error) {
    console.error('Error fetching raw blocks:', error)
    return false
  }

  if (!rawBlocks || rawBlocks.length === 0) {
    console.log('No block data found in raw_resale_2017')
    return false
  }

  // Create unique blocks map
  const blocksMap = new Map()
  
  for (const record of rawBlocks) {
    const key = `${record.town}|${record.block}|${record.street_name}`
    if (!blocksMap.has(key)) {
      const address = `${record.block} ${record.street_name}`
      blocksMap.set(key, {
        town: record.town,
        block_no: String(record.block),
        street: record.street_name,
        address: address,
        lat: null, // Will need geocoding later
        lon: null,
      })
    }
  }

  console.log(`Found ${blocksMap.size} unique blocks`)

  // Insert blocks in batches
  const blocksArray = Array.from(blocksMap.values())
  const batchSize = 100
  let inserted = 0
  let updated = 0

  for (let i = 0; i < blocksArray.length; i += batchSize) {
    const batch = blocksArray.slice(i, i + batchSize)
    
    const { data, error: insertError } = await supabase
      .from('blocks')
      .upsert(batch, {
        onConflict: 'town,block_no,street',
        ignoreDuplicates: false
      })

    if (insertError) {
      console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, insertError.message)
    } else {
      inserted += batch.length
      console.log(`  Processed ${Math.min(i + batchSize, blocksArray.length)}/${blocksArray.length} blocks`)
    }
  }

  console.log(`✓ Blocks populated: ${inserted} blocks`)
  return true
}

/**
 * Step 2: Calculate and populate block_metrics
 * @param {boolean} incremental - If true, only update blocks with recent transactions
 */
async function populateBlockMetrics(incremental = false) {
  console.log('\nStep 2: Calculating block metrics...')
  if (incremental) {
    console.log('  Mode: Incremental update (only blocks with recent transactions)')
  } else {
    console.log('  Mode: Full update (all blocks)')
  }

  let blocks
  let blocksError

  if (incremental) {
    // Find blocks with transactions in the last 3 months
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    const cutoffDate = threeMonthsAgo.toISOString().split('T')[0]

    // Get unique blocks with recent transactions
    const { data: recentTxs } = await supabase
      .from('raw_resale_2017')
      .select('town, block, street_name')
      .gte('month', cutoffDate)
      .not('block', 'is', null)
      .not('street_name', 'is', null)

    if (!recentTxs || recentTxs.length === 0) {
      console.log('  No recent transactions found, skipping incremental update')
      return true
    }

    // Create unique block keys
    const blockKeys = new Set()
    for (const tx of recentTxs) {
      blockKeys.add(`${tx.town}|${tx.block}|${tx.street_name}`)
    }

    console.log(`  Found ${blockKeys.size} blocks with recent transactions`)

    // Get full block records for these blocks
    const blockArray = Array.from(blockKeys).map(key => {
      const [town, block_no, street] = key.split('|')
      return { town, block_no, street }
    })

    // Fetch blocks from database
    const { data: allBlocks, error } = await supabase
      .from('blocks')
      .select('id, town, block_no, street, address, lat, lon')

    if (!allBlocks || error) {
      console.log('  Error fetching blocks from database')
      blocksError = error
      blocks = null
    } else {
      // Filter to only blocks that match our recent transactions
      const blockMap = new Map(blockArray.map(b => [`${b.town}|${b.block_no}|${b.street}`, true]))
      blocks = allBlocks.filter(block => 
        blockMap.has(`${block.town}|${block.block_no}|${block.street}`)
      )
      blocksError = null
      
      if (blocks.length === 0) {
        console.log('  No matching blocks found in database')
        return true
      }
    }
  } else {
    // Get all blocks
    const { data: blocksData, error } = await supabase
      .from('blocks')
      .select('id, town, block_no, street, address, lat, lon')
    
    blocks = blocksData
    blocksError = error
  }

  if (blocksError || !blocks || blocks.length === 0) {
    console.error('Error fetching blocks or no blocks found')
    return false
  }

  console.log(`Calculating metrics for ${blocks.length} blocks...`)

  const flatTypes = ['3 ROOM', '4 ROOM', '5 ROOM', 'EXECUTIVE']
  const windowYears = [5, 10]
  const endDate = new Date()
  
  let totalMetrics = 0

  for (const block of blocks) {
    for (const flatType of flatTypes) {
      for (const window of windowYears) {
        const startDate = new Date()
        startDate.setFullYear(startDate.getFullYear() - window)
        
        // Get transactions for this block and flat type
        const { data: transactions, error: txError } = await supabase
          .from('raw_resale_2017')
          .select('resale_price, floor_area_sqm, remaining_lease')
          .eq('town', block.town)
          .eq('block', block.block_no)
          .eq('street_name', block.street)
          .eq('flat_type', flatType)
          .gte('month', startDate.toISOString().split('T')[0])
          .lte('month', endDate.toISOString().split('T')[0])
          .not('resale_price', 'is', null)
          .not('floor_area_sqm', 'is', null)
          .not('remaining_lease', 'is', null)

        if (txError) {
          console.warn(`Error fetching transactions for ${block.address}:`, txError.message)
          continue
        }

        if (!transactions || transactions.length === 0) {
          continue // No transactions for this block/flat_type/window
        }

        // Calculate metrics
        const prices = transactions.map(t => Number(t.resale_price)).filter(p => p > 0)
        const floorAreas = transactions.map(t => Number(t.floor_area_sqm)).filter(a => a > 0)
        const leases = transactions
          .map(t => parseLeaseYears(t.remaining_lease))
          .filter(l => l !== null)

        if (prices.length === 0 || floorAreas.length === 0) {
          continue
        }

        // Calculate price per sqm
        const pricesPerSqm = transactions
          .map(t => {
            const price = Number(t.resale_price)
            const area = Number(t.floor_area_sqm)
            return area > 0 ? price / area : null
          })
          .filter(p => p !== null && p > 0)

        // Calculate medians
        const medianPrice = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)]
        const medianResalePrice = medianPrice
        const medianPricePsm = pricesPerSqm.length > 0
          ? pricesPerSqm.sort((a, b) => a - b)[Math.floor(pricesPerSqm.length / 2)]
          : null
        const medianLeaseYears = leases.length > 0
          ? leases.sort((a, b) => a - b)[Math.floor(leases.length / 2)]
          : null

        // Get town median lease for percentile calculation
        const { data: townTransactions } = await supabase
          .from('raw_resale_2017')
          .select('remaining_lease')
          .eq('town', block.town)
          .eq('flat_type', flatType)
          .gte('month', startDate.toISOString().split('T')[0])
          .lte('month', endDate.toISOString().split('T')[0])
          .not('remaining_lease', 'is', null)

        let leasePercentile = null
        if (townTransactions && medianLeaseYears) {
          const townLeases = townTransactions
            .map(t => parseLeaseYears(t.remaining_lease))
            .filter(l => l !== null)
            .sort((a, b) => a - b)
          
          if (townLeases.length > 0) {
            const belowCount = townLeases.filter(l => l < medianLeaseYears).length
            leasePercentile = (belowCount / townLeases.length) * 100
          }
        }

        // Calculate primary schools within 1km (if block has coordinates)
        let primaryWithin1km = 0
        if (block.lat && block.lon) {
          try {
            const { data: schools } = await supabase
              .from('primary_schools')
              .select('latitude, longitude')
              .not('latitude', 'is', null)
              .not('longitude', 'is', null)
            
            if (schools && schools.length > 0) {
              primaryWithin1km = schools.filter(school => {
                const dist = calculateDistance(
                  Number(block.lat),
                  Number(block.lon),
                  Number(school.latitude),
                  Number(school.longitude)
                )
                return dist !== null && dist <= 1000 // 1km = 1000m
              }).length
            }
          } catch (err) {
            console.warn(`Error calculating schools for ${block.address}:`, err.message)
          }
        }

        // Calculate MRT distance (if block has coordinates and mrt_stations table exists)
        let mrtBand = null
        let nearestMrtName = null
        let nearestMrtDistM = null
        
        if (block.lat && block.lon) {
          try {
            // Get all MRT stations
            const { data: mrtStations } = await supabase
              .from('mrt_stations')
              .select('station_name, latitude, longitude')
              .not('latitude', 'is', null)
              .not('longitude', 'is', null)
            
            if (mrtStations && mrtStations.length > 0) {
              // Find nearest MRT station
              let minDist = Infinity
              let nearestStation = null
              
              for (const station of mrtStations) {
                const dist = calculateDistance(
                  Number(block.lat),
                  Number(block.lon),
                  Number(station.latitude),
                  Number(station.longitude)
                )
                if (dist !== null && dist < minDist) {
                  minDist = dist
                  nearestStation = station
                }
              }
              
              if (nearestStation && minDist < Infinity) {
                nearestMrtName = nearestStation.station_name
                nearestMrtDistM = Math.round(minDist)
                
                // Set MRT band based on distance
                if (minDist < 400) {
                  mrtBand = '<400'
                } else if (minDist < 800) {
                  mrtBand = '400-800'
                } else {
                  mrtBand = '>800'
                }
              }
            }
          } catch (err) {
            console.warn(`Error calculating MRT distance for ${block.address}:`, err.message)
          }
        }
        
        // Calculate bus stops within 400m (if block has coordinates and bus_stops table exists)
        let busStops400m = 0
        if (block.lat && block.lon) {
          try {
            const { data: busStops } = await supabase
              .from('bus_stops')
              .select('latitude, longitude')
              .not('latitude', 'is', null)
              .not('longitude', 'is', null)
            
            if (busStops && busStops.length > 0) {
              busStops400m = busStops.filter(stop => {
                const dist = calculateDistance(
                  Number(block.lat),
                  Number(block.lon),
                  Number(stop.latitude),
                  Number(stop.longitude)
                )
                return dist !== null && dist <= 400
              }).length
            }
          } catch (err) {
            // Bus stops table might not exist yet, that's okay
            console.warn(`Error calculating bus stops for ${block.address}:`, err.message)
          }
        }

        // Calculate rolling 6-month change (simplified - would need historical data)
        const qoqChangePsm = null
        const rolling6mChangePsm = null

        // Insert metric
        const { error: metricError } = await supabase
          .from('block_metrics')
          .upsert({
            block_id: block.id,
            town: block.town,
            flat_type: flatType,
            window_years: window,
            tx_count: transactions.length,
            median_price_psm: medianPricePsm,
            median_resale_price: medianResalePrice,
            qoq_change_psm: qoqChangePsm,
            rolling_6m_change_psm: rolling6mChangePsm,
            median_remaining_lease_years: medianLeaseYears,
            lease_percentile_in_town: leasePercentile,
            mrt_band: mrtBand,
            nearest_mrt_name: nearestMrtName,
            nearest_mrt_dist_m: nearestMrtDistM,
            bus_stops_400m: busStops400m,
            primary_within_1km: primaryWithin1km,
            period_start: startDate.toISOString().split('T')[0],
            period_end: endDate.toISOString().split('T')[0],
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'block_id,flat_type,window_years,period_end'
          })

        if (metricError) {
          console.warn(`Error inserting metric for ${block.address} (${flatType}, ${window}y):`, metricError.message)
        } else {
          totalMetrics++
        }
      }
    }

    if (blocks.indexOf(block) % 10 === 0) {
      console.log(`  Processed ${blocks.indexOf(block) + 1}/${blocks.length} blocks...`)
    }
  }

  console.log(`✓ Block metrics populated: ${totalMetrics} metric records`)
  return true
}

/**
 * Main function
 */
async function main() {
  // Check for incremental flag: --incremental or -i
  const incremental = process.argv.includes('--incremental') || process.argv.includes('-i')
  
  console.log('Starting blocks data population...')
  console.log(`Time: ${new Date().toISOString()}\n`)

  try {
    // Step 1: Update blocks (only if not incremental, or if new blocks might exist)
    if (!incremental) {
      const blocksSuccess = await populateBlocks()
      if (!blocksSuccess) {
        console.error('Failed to populate blocks')
        process.exit(1)
      }
    } else {
      console.log('Step 1: Skipping blocks population (incremental mode)')
    }

    // Step 2: Calculate metrics (incremental or full)
    const metricsSuccess = await populateBlockMetrics(incremental)
    if (!metricsSuccess) {
      console.error('Failed to populate block metrics')
      process.exit(1)
    }

    console.log('\n' + '='.repeat(50))
    console.log('✅ Blocks data population completed successfully!')
    if (incremental) {
      console.log('   (Incremental update: only blocks with recent transactions)')
    }
    console.log('='.repeat(50))
    process.exit(0)
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

main()

