/**
 * Optimized Geocode Raw Resale Transactions
 * 
 * Performance optimizations:
 * 1. Batch database operations (pre-load cache, batch updates)
 * 2. Parallel processing (concurrent API calls with rate limiting)
 * 3. Smart rate limiting (only delay when needed)
 * 4. Reduced database queries (bulk cache pre-loading)
 * 
 * Usage:
 * node scripts/geocode-raw-resale-optimized.js [--concurrency N] [--batch-size N]
 * 
 * Default: concurrency=3, batch-size=500
 * 
 * Note: OneMap API limit is 250 requests/minute
 * Default concurrency=3 ensures we stay well under the limit (~180 req/min)
 */

const { createClient } = require('@supabase/supabase-js')

// Parse command line arguments
const args = process.argv.slice(2)
const concurrencyArg = args.find(arg => arg.startsWith('--concurrency='))
const batchSizeArg = args.find(arg => arg.startsWith('--batch-size='))
// Default concurrency: 3 (safe for 250 req/min limit)
// With 3 concurrent: max 180 req/min (well under 250 limit)
// Can increase to 4-5 if needed, but monitor for rate limit errors
const CONCURRENCY = concurrencyArg ? parseInt(concurrencyArg.split('=')[1]) : 3
const BATCH_SIZE = batchSizeArg ? parseInt(batchSizeArg.split('=')[1]) : 500
const DB_BATCH_SIZE = 1000 // Batch size for database operations

// Load environment
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Rate limiting: OneMap API allows 250 requests per minute
// Use token bucket algorithm for smarter rate limiting
class RateLimiter {
  constructor(maxRequests = 230, windowMs = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
    this.requests = []
    this.lock = false // Prevent concurrent access
  }

  async waitIfNeeded() {
    // Wait for lock to prevent race conditions
    while (this.lock) {
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    
    this.lock = true
    try {
      const now = Date.now()
      // Remove requests outside the window
      this.requests = this.requests.filter(time => now - time < this.windowMs)
      
      if (this.requests.length >= this.maxRequests) {
        const oldestRequest = this.requests[0]
        const waitTime = this.windowMs - (now - oldestRequest) + 200 // Add 200ms buffer
        if (waitTime > 0) {
          this.lock = false
          await new Promise(resolve => setTimeout(resolve, waitTime))
          return this.waitIfNeeded() // Recursively check again
        }
      }
      
      this.requests.push(Date.now())
    } finally {
      this.lock = false
    }
  }
  
  // Get current request count in window
  getCurrentCount() {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.windowMs)
    return this.requests.length
  }
}

const rateLimiter = new RateLimiter(230, 60000) // 230 requests per minute (92% of 250 limit, safety margin)

/**
 * Geocode address using OneMap API
 */
async function geocodeAddress(address) {
  if (!address || address.trim() === '') {
    return { lat: null, lng: null }
  }
  
  await rateLimiter.waitIfNeeded() // Smart rate limiting
  
  try {
    const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(address)}&returnGeom=Y&getAddrDetails=Y`
    const response = await fetch(url)
    
    if (response.ok) {
      const data = await response.json()
      if (data.results && data.results.length > 0) {
        const result = data.results[0]
        return {
          lat: parseFloat(result.LATITUDE) || null,
          lng: parseFloat(result.LONGITUDE) || null,
        }
      }
    }
  } catch (error) {
    // Silent fail
  }
  
  return { lat: null, lng: null }
}

/**
 * Normalize street name by expanding common abbreviations
 */
function normalizeStreetName(streetName) {
  if (!streetName) return streetName
  
  let normalized = streetName.trim()
  
  // Special cases that must be handled before general abbreviations
  // "ST. GEORGE'S" -> "SAINT GEORGES" (not "STREET GEORGE'S")
  normalized = normalized.replace(/\bST\.\s+GEORGE'S?\b/gi, 'SAINT GEORGES')
  normalized = normalized.replace(/\bST\s+GEORGE'S?\b/gi, 'SAINT GEORGES')
  
  // "KG" -> "KAMPONG" (but only if it's at the start or after a space)
  normalized = normalized.replace(/\bKG\s+/gi, 'KAMPONG ')
  
  // Common Singapore address abbreviations
  const abbreviations = {
    "C'WEALTH": "COMMONWEALTH",
    "C'WEALTH CL": "COMMONWEALTH CLOSE",
    "C'WEALTH CRES": "COMMONWEALTH CRESCENT",
    "C'WEALTH DR": "COMMONWEALTH DRIVE",
    "C'WEALTH AVE": "COMMONWEALTH AVENUE",
    "RD.": "ROAD",
    "RD": "ROAD",
    "AVE.": "AVENUE",
    "AVE": "AVENUE",
    "DR.": "DRIVE",
    "DR": "DRIVE",
    "ST.": "STREET", // Only if not part of "ST. GEORGE'S"
    "ST": "STREET",  // Only if not part of "ST GEORGE'S"
    "CTRL": "CENTRAL",
    "CTR": "CENTRE",
    "PK": "PARK",
    "PK.": "PARK",
    "BLK": "BLOCK",
    "BLK.": "BLOCK",
    "JLN": "JALAN",
    "JLN.": "JALAN",
    "LOR": "LORONG",
    "LOR.": "LORONG",
    "UPP": "UPPER",
    "LOW": "LOWER",
    "NTH": "NORTH",
    "STH": "SOUTH",
    "EST": "EAST",
    "WST": "WEST",
    "CRES": "CRESCENT",
    "CRES.": "CRESCENT",
    "CL": "CLOSE",
    "CL.": "CLOSE",
    "TER": "TERRACE",
    "TER.": "TERRACE",
    "PL": "PLACE",
    "PL.": "PLACE",
    "WALK": "WALK",
    "WALK.": "WALK",
    "GDNS": "GARDENS",
    "GDNS.": "GARDENS",
    "GRN": "GREEN",
    "GRN.": "GREEN",
    "HTS": "HEIGHTS",
    "HTS.": "HEIGHTS",
    "VW": "VIEW",
    "VW.": "VIEW",
    "VALE": "VALE",
    "VALE.": "VALE",
    "RISE": "RISE",
    "RISE.": "RISE",
    "WAY": "WAY",
    "WAY.": "WAY",
    "LANE": "LANE",
    "LANE.": "LANE",
    "SQ": "SQUARE",
    "SQ.": "SQUARE",
    "CT": "COURT",
    "CT.": "COURT",
    "CIRCLE": "CIRCLE",
    "CIRCLE.": "CIRCLE",
    "RING RD": "RING ROAD",
    "RING RD.": "RING ROAD",
    "RING ROAD": "RING ROAD",
  }
  
  // Replace abbreviations (case-insensitive)
  // Sort by length (longest first) to handle compound abbreviations correctly
  const sortedAbbrs = Object.entries(abbreviations).sort((a, b) => b[0].length - a[0].length)
  
  for (const [abbr, full] of sortedAbbrs) {
    // Match whole word or at word boundary (with optional trailing period)
    const escapedAbbr = abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // Match abbreviation with or without trailing period
    const regex = new RegExp(`\\b${escapedAbbr}\\.?\\b`, 'gi')
    normalized = normalized.replace(regex, full)
  }
  
  // Handle apostrophes - only remove standalone apostrophes, keep possessive forms
  // Replace ' with space only if it's between letters (like C'WEALTH)
  normalized = normalized.replace(/([A-Z])'([A-Z])/g, '$1 $2')
  // Remove trailing apostrophes and 'S
  normalized = normalized.replace(/'S\b/g, 'S')
  normalized = normalized.replace(/'/g, '')
  
  // Clean up: remove multiple spaces and trailing periods after words
  normalized = normalized.replace(/\s+/g, ' ')
  normalized = normalized.replace(/\b(\w+)\.(\s|$)/g, '$1$2') // Remove period after word if followed by space or end
  
  return normalized.trim()
}

/**
 * Build address variations with normalization
 */
function buildAddresses(block, streetName) {
  if (!block && !streetName) return []
  
  const normalizedStreet = normalizeStreetName(streetName)
  const addresses = new Set() // Use Set to avoid duplicates
  
  // Original format (may work for some addresses)
  if (block && streetName) {
    addresses.add(`Block ${block} ${streetName} Singapore`)
    addresses.add(`${block} ${streetName} Singapore`)
  }
  if (streetName) {
    addresses.add(`${streetName} Singapore`)
  }
  
  // Normalized format (expanded abbreviations)
  if (block && normalizedStreet && normalizedStreet !== streetName) {
    addresses.add(`Block ${block} ${normalizedStreet} Singapore`)
    addresses.add(`${block} ${normalizedStreet} Singapore`)
  }
  if (normalizedStreet && normalizedStreet !== streetName) {
    addresses.add(`${normalizedStreet} Singapore`)
  }
  
  // Special handling for ST. GEORGE'S RD -> SAINT GEORGE'S ROAD
  // OneMap API recognizes "SAINT GEORGE'S ROAD" format (without "Block" prefix works better)
  if (streetName && /ST\.?\s+GEORGE'S?\s+RD/i.test(streetName)) {
    if (block) {
      addresses.add(`${block} SAINT GEORGE'S ROAD Singapore`) // This format works!
      addresses.add(`Block ${block} SAINT GEORGE'S ROAD Singapore`)
    }
    addresses.add(`SAINT GEORGE'S ROAD Singapore`)
  }
  
  // Special handling for KG ARANG RD -> KAMPONG ARANG ROAD
  if (streetName && /^KG\s+ARANG/i.test(streetName)) {
    if (block) {
      addresses.add(`Block ${block} KAMPONG ARANG ROAD Singapore`)
      addresses.add(`${block} KAMPONG ARANG ROAD Singapore`)
    }
    addresses.add(`KAMPONG ARANG ROAD Singapore`)
  }
  
  // Block only (fallback)
  if (block) {
    addresses.add(`Block ${block} Singapore`)
  }
  
  return Array.from(addresses)
}

/**
 * Pre-load ALL coordinates cache from database
 * This loads all existing block+street combinations to maximize coordinate reuse
 */
async function preloadAllCoordinatesCache() {
  console.log('Pre-loading ALL coordinates cache from database...')
  console.log('  (This maximizes coordinate reuse and minimizes API calls)')
  
  const cache = new Map()
  let offset = 0
  const batchSize = 1000 // Supabase limit per query
  let totalProcessed = 0
  let hasMore = true
  
  while (hasMore) {
    const { data: records, error } = await supabase
      .from('raw_resale_2017')
      .select('block, street_name, latitude, longitude')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .not('block', 'is', null)
      .not('street_name', 'is', null)
      .range(offset, offset + batchSize - 1)
    
    if (error) {
      console.error(`  Error loading batch at offset ${offset}:`, error.message)
      break
    }
    
    if (!records || records.length === 0) {
      hasMore = false
      break
    }
    
    // Add unique combinations to cache
    records.forEach(rec => {
      const key = `${rec.block || ''}-${rec.street_name || ''}`.toLowerCase()
      if (!cache.has(key) && rec.latitude && rec.longitude) {
        cache.set(key, { lat: rec.latitude, lng: rec.longitude })
      }
    })
    
    totalProcessed += records.length
    
    // Progress indicator (every 10k records)
    if (totalProcessed % 10000 === 0 || totalProcessed < 10000) {
      process.stdout.write(`  Loaded ${cache.size.toLocaleString()} unique combinations from ${totalProcessed.toLocaleString()} records...\r`)
    }
    
    // Check if we got fewer records than requested (last batch)
    if (records.length < batchSize) {
      hasMore = false
    } else {
      offset += batchSize
    }
  }
  
  console.log('') // New line after progress indicator
  console.log(`  Pre-loaded ${cache.size.toLocaleString()} unique block+street combinations into cache`)
  console.log(`  (Processed ${totalProcessed.toLocaleString()} records with coordinates)`)
  return cache
}

/**
 * Process a single record
 */
async function processRecord(record, cache) {
  const cacheKey = `${record.block || ''}-${record.street_name || ''}`.toLowerCase()
  
  // Check cache first
  if (cache.has(cacheKey)) {
    return {
      id: record.id,
      geo: cache.get(cacheKey),
      source: 'reused'
    }
  }
  
  // Need to geocode
  const addresses = buildAddresses(record.block, record.street_name)
  if (addresses.length === 0) {
    return { id: record.id, geo: null, source: 'skipped' }
  }
  
  for (const address of addresses) {
    const geo = await geocodeAddress(address)
    if (geo.lat && geo.lng) {
      // Add to cache for future use
      cache.set(cacheKey, geo)
      return { id: record.id, geo, source: 'geocoded' }
    }
    await new Promise(resolve => setTimeout(resolve, 50)) // Small delay between address attempts
  }
  
  return { id: record.id, geo: null, source: 'failed' }
}

/**
 * Process records in parallel with concurrency limit
 */
async function processBatch(records, cache) {
  const results = []
  const queue = [...records]
  
  // Monitor rate limit status
  let rateLimitWarnings = 0
  
  // Process with concurrency limit
  const workers = []
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push((async () => {
      while (queue.length > 0) {
        const record = queue.shift()
        if (!record) break
        
        try {
          // Check rate limit status periodically
          const currentCount = rateLimiter.getCurrentCount()
          if (currentCount > 200 && rateLimitWarnings < 3) {
            console.warn(`  ⚠️  Rate limit warning: ${currentCount}/230 requests in window`)
            rateLimitWarnings++
          }
          
          const result = await processRecord(record, cache)
          results.push(result)
        } catch (error) {
          // Check if it's a rate limit error
          if (error.message && (error.message.includes('429') || error.message.includes('rate limit'))) {
            console.error(`  ✗ Rate limit exceeded! Waiting 60 seconds...`)
            await new Promise(resolve => setTimeout(resolve, 60000))
            // Re-queue this record
            queue.unshift(record)
          } else {
            results.push({ id: record.id, geo: null, source: 'error', error: error.message })
          }
        }
      }
    })())
  }
  
  await Promise.all(workers)
  return results
}

/**
 * Batch update coordinates in database
 * Only updates latitude and longitude fields to avoid constraint violations
 */
async function batchUpdateCoordinates(updates) {
  if (updates.length === 0) return 0
  
  let updated = 0
  // Update in chunks to avoid payload size limits
  for (let i = 0; i < updates.length; i += DB_BATCH_SIZE) {
    const chunk = updates.slice(i, i + DB_BATCH_SIZE)
    
    // Update each record individually to only update lat/lng fields
    // This avoids triggering NOT NULL constraints on other fields
    const updatePromises = chunk.map(u => 
      supabase
        .from('raw_resale_2017')
        .update({ 
          latitude: u.lat, 
          longitude: u.lng 
        })
        .eq('id', u.id)
    )
    
    const results = await Promise.all(updatePromises)
    const successCount = results.filter(r => !r.error).length
    updated += successCount
    
    if (successCount < chunk.length) {
      const errors = results.filter(r => r.error)
      if (errors.length > 0) {
        console.warn(`  Warning: ${chunk.length - successCount} records failed to update in batch ${Math.floor(i / DB_BATCH_SIZE) + 1}`)
      }
    }
  }
  
  return updated
}

/**
 * Main function
 */
async function main() {
  console.log('='.repeat(60))
  console.log('Optimized Geocoding Script')
  console.log('='.repeat(60))
  console.log(`Concurrency: ${CONCURRENCY}`)
  console.log(`Batch size: ${BATCH_SIZE}`)
  console.log('')
  
  // Get total count (will be updated periodically during processing)
  let { count: totalMissing } = await supabase
    .from('raw_resale_2017')
    .select('*', { count: 'exact', head: true })
    .or('latitude.is.null,longitude.is.null')
    .not('block', 'is', null)
    .not('street_name', 'is', null)
  
  if (!totalMissing || totalMissing === 0) {
    console.log('✓ No records need geocoding')
    return
  }
  
  console.log(`Total records to geocode: ${totalMissing.toLocaleString()}`)
  console.log('')
  
  let processed = 0
  let totalGeocoded = 0
  let totalReused = 0
  let totalFailed = 0
  let totalSkipped = 0
  let batchesProcessed = 0
  
  // Pre-load ALL existing coordinates into cache
  // This maximizes coordinate reuse and minimizes API calls
  const cache = await preloadAllCoordinatesCache()
  console.log('')
  
  // Check if there are any records to process
  const { data: firstBatch } = await supabase
    .from('raw_resale_2017')
    .select('id, block, street_name, latitude, longitude')
    .or('latitude.is.null,longitude.is.null')
    .not('block', 'is', null)
    .not('street_name', 'is', null)
    .limit(1)
  
  if (!firstBatch || firstBatch.length === 0) {
    console.log('No records to process')
    return
  }
  
  // Process in batches
  // Don't use offset/range because records get updated and no longer match the query
  // Instead, always query the latest batch of unprocessed records
  while (true) {
    // Re-check total missing count periodically (every 10 batches)
    if (batchesProcessed % 10 === 0 || batchesProcessed === 0) {
      const { count: currentMissing } = await supabase
        .from('raw_resale_2017')
        .select('*', { count: 'exact', head: true })
        .or('latitude.is.null,longitude.is.null')
        .not('block', 'is', null)
        .not('street_name', 'is', null)
      
      if (!currentMissing || currentMissing === 0) {
        console.log('No more records to process')
        break
      }
      
      totalMissing = currentMissing
    }
    
    // Always fetch the next batch of unprocessed records
    const { data: records } = await supabase
      .from('raw_resale_2017')
      .select('id, block, street_name, latitude, longitude')
      .or('latitude.is.null,longitude.is.null')
      .not('block', 'is', null)
      .not('street_name', 'is', null)
      .limit(BATCH_SIZE)
    
    if (!records || records.length === 0) {
      console.log('No more records to process')
      break
    }
    
    batchesProcessed++
    // Calculate remaining more accurately
    const estimatedRemaining = Math.max(0, totalMissing - batchesProcessed * BATCH_SIZE)
    console.log(`Processing batch ${batchesProcessed}: ${records.length} records (estimated remaining: ~${estimatedRemaining.toLocaleString()})`)
    
    // Process batch in parallel
    const results = await processBatch(records, cache)
    
    // Separate results by type (count for this batch only)
    const toUpdate = []
    let batchGeocoded = 0
    let batchReused = 0
    let batchFailed = 0
    let batchSkipped = 0
    
    for (const result of results) {
      if (result.geo && result.geo.lat && result.geo.lng) {
        toUpdate.push({ id: result.id, lat: result.geo.lat, lng: result.geo.lng })
        if (result.source === 'reused') {
          batchReused++
          totalReused++
        } else {
          batchGeocoded++
          totalGeocoded++
        }
      } else if (result.source === 'skipped') {
        batchSkipped++
        totalSkipped++
      } else {
        batchFailed++
        totalFailed++
      }
    }
    
    // Batch update database
    if (toUpdate.length > 0) {
      const updated = await batchUpdateCoordinates(toUpdate)
      console.log(`  ✓ Updated ${updated} records (this batch: ${batchGeocoded} geocoded, ${batchReused} reused)`)
    }
    
    console.log(`Progress: Batch ${batchesProcessed} | Total: ${totalGeocoded} geocoded, ${totalReused} reused, ${totalFailed} failed, ${totalSkipped} skipped`)
    console.log(`  Remaining: ~${Math.max(0, totalMissing - batchesProcessed * BATCH_SIZE)} records`)
    console.log('')
  }
  
  console.log('='.repeat(60))
  console.log('Geocoding completed!')
  console.log(`Total batches processed: ${batchesProcessed}`)
  console.log(`  ✓ Geocoded: ${totalGeocoded}`)
  console.log(`  ♻️  Reused: ${totalReused}`)
  console.log(`  ✗ Failed: ${totalFailed}`)
  console.log(`  ⊘ Skipped: ${totalSkipped}`)
  console.log('='.repeat(60))
  
  // Final check
  const { count: finalMissing } = await supabase
    .from('raw_resale_2017')
    .select('*', { count: 'exact', head: true })
    .or('latitude.is.null,longitude.is.null')
    .not('block', 'is', null)
    .not('street_name', 'is', null)
  
  if (finalMissing && finalMissing > 0) {
    console.log(`\n⚠️  Note: ${finalMissing} records still need geocoding`)
    console.log('   (These may be addresses that OneMap API cannot find)')
  } else {
    console.log('\n✅ All records with addresses have been processed!')
  }
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

