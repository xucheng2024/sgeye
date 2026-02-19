/**
 * HDB Resale Data Update Script
 * 
 * Fetches latest data from data.gov.sg and updates Supabase
 * Designed to run daily via GitHub Actions
 * 
 * Environment variables required:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_KEY (service role key, not anon key)
 * 
 * Note: Requires Node.js 18+ (for built-in fetch)
 */

const path = require('path')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

// Use built-in fetch (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('Error: This script requires Node.js 18+ with built-in fetch')
  process.exit(1)
}

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const DATA_GOV_SG_RESOURCE_ID = 'f1765b54-a209-4718-8d38-a39237f502b3'
const BATCH_SIZE = 100
const MAX_BATCHES = 200 // Increased for initial import scenarios (adjust as needed)
const BATCH_DELAY_MS = 3000 // Delay between batches to avoid rate limiting (data.gov.sg)
const MAX_RETRIES = 10
const BASE_DELAY_MS = 3000
const MAX_BACKOFF_MS = 120000

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

function getRetryDelayMs(response, retryCount) {
  const retryAfter = response.headers.get('retry-after')

  if (retryAfter) {
    const asSeconds = Number.parseInt(retryAfter, 10)
    if (!Number.isNaN(asSeconds)) {
      return Math.min(asSeconds * 1000, MAX_BACKOFF_MS)
    }

    const asDate = new Date(retryAfter)
    if (!Number.isNaN(asDate.getTime())) {
      const deltaMs = asDate.getTime() - Date.now()
      if (deltaMs > 0) {
        return Math.min(deltaMs, MAX_BACKOFF_MS)
      }
    }
  }

  const exponential = BASE_DELAY_MS * Math.pow(2, retryCount)
  const capped = Math.min(exponential, MAX_BACKOFF_MS)
  const jitter = Math.floor(Math.random() * 1000)
  return capped + jitter
}

/**
 * Fetch data from data.gov.sg API
 * Implements retry with exponential backoff for 429/5xx and network errors
 */
async function fetchData(limit, offset) {
  const url = `https://data.gov.sg/api/action/datastore_search?resource_id=${DATA_GOV_SG_RESOURCE_ID}&limit=${limit}&offset=${offset}&sort=${encodeURIComponent('month desc')}`

  for (let retryCount = 0; retryCount <= MAX_RETRIES; retryCount++) {
    try {
      const response = await fetch(url)

      if (response.ok) {
        const data = await response.json()
        
        if (data.success && data.result && data.result.records) {
          return {
            records: data.result.records,
            total: data.result.total || 0
          }
        }

        throw new Error('Invalid response from data.gov.sg')
      }

      const isRetriable = response.status === 429 || response.status >= 500
      if (isRetriable && retryCount < MAX_RETRIES) {
        const delayMs = getRetryDelayMs(response, retryCount)
        console.warn(`  HTTP ${response.status}, retrying in ${(delayMs / 1000).toFixed(1)}s (attempt ${retryCount + 1}/${MAX_RETRIES})...`)
        await new Promise(resolve => setTimeout(resolve, delayMs))
        continue
      }

      throw new Error(`HTTP error! status: ${response.status}`)
    } catch (error) {
      const isNetworkError = error instanceof TypeError
      if (isNetworkError && retryCount < MAX_RETRIES) {
        const delayMs = Math.min(BASE_DELAY_MS * Math.pow(2, retryCount), MAX_BACKOFF_MS)
        console.warn(`  Network error, retrying in ${(delayMs / 1000).toFixed(1)}s (attempt ${retryCount + 1}/${MAX_RETRIES})...`)
        await new Promise(resolve => setTimeout(resolve, delayMs))
        continue
      }

      console.error('Error fetching data:', error.message)
      throw error
    }
  }

  throw new Error('Failed to fetch data after maximum retries')
}

/**
 * Transform record to Supabase format
 */
function transformRecord(record) {
  // Parse month - handle different formats
  let month = null
  if (record.month) {
    try {
      // Handle YYYY-MM format or full date
      const dateStr = record.month.toString()
      if (dateStr.match(/^\d{4}-\d{2}$/)) {
        // YYYY-MM format, add day
        month = `${dateStr}-01`
      } else {
        const date = new Date(record.month)
        if (!isNaN(date.getTime())) {
          month = date.toISOString().split('T')[0]
        }
      }
    } catch (e) {
      console.warn(`Invalid month format: ${record.month}`)
    }
  }

  // Parse numeric fields with validation
  const floorArea = record.floor_area_sqm ? parseFloat(record.floor_area_sqm) : null
  const resalePrice = record.resale_price ? parseFloat(record.resale_price) : null
  const leaseCommence = record.lease_commence_date ? parseInt(record.lease_commence_date, 10) : null

  return {
    month,
    town: record.town || null,
    flat_type: record.flat_type || null,
    block: record.block ? String(record.block) : null,
    street_name: record.street_name || null,
    storey_range: record.storey_range || null,
    floor_area_sqm: (floorArea && !isNaN(floorArea) && floorArea > 0) ? floorArea : null,
    flat_model: record.flat_model || null,
    lease_commence_date: (leaseCommence && !isNaN(leaseCommence) && leaseCommence > 1900) ? leaseCommence : null,
    remaining_lease: record.remaining_lease || null,
    resale_price: (resalePrice && !isNaN(resalePrice) && resalePrice > 0) ? resalePrice : null,
  }
}

/**
 * Insert batch into Supabase
 */
async function insertBatch(records) {
  const transformed = records
    .map(transformRecord)
    .filter(r => r.month && r.resale_price && r.resale_price > 0)
  
  if (transformed.length === 0) {
    return { inserted: 0, skipped: 0 }
  }

  // Insert in chunks to avoid payload size limits
  const chunkSize = 500
  let totalInserted = 0
  let totalSkipped = 0

  for (let i = 0; i < transformed.length; i += chunkSize) {
    const chunk = transformed.slice(i, i + chunkSize)
    
    const { data, error } = await supabase
      .from('raw_resale_2017')
      .upsert(chunk, {
        onConflict: 'month,town,block,street_name,flat_type,resale_price',
        ignoreDuplicates: true
      })

    if (error) {
      console.error(`  Error inserting chunk ${Math.floor(i/chunkSize) + 1}:`, error.message)
      totalSkipped += chunk.length
    } else {
      totalInserted += chunk.length
    }
  }

  return { inserted: totalInserted, skipped: totalSkipped }
}

/**
 * Get latest month in database
 */
async function getLatestMonth() {
  const { data, error } = await supabase
    .from('raw_resale_2017')
    .select('month')
    .order('month', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error getting latest month:', error.message)
    return null
  }

  return data?.month || null
}

/**
 * Main update function - incremental update
 */
async function updateData() {
  console.log('Starting HDB data update...')
  console.log(`Time: ${new Date().toISOString()}`)
  
  try {
    // Initial delay to avoid rate limit on cold start (e.g. GitHub Actions)
    console.log('Waiting 2s before first API request (rate limit precaution)...')
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Get latest month in database
    const latestMonth = await getLatestMonth()
    console.log(`Latest month in database: ${latestMonth || 'None'}`)
    
    let offset = 0
    let totalInserted = 0
    let totalSkipped = 0
    let batchCount = 0
    let hasNewData = false

    // Fetch first batch to check total
    const firstBatch = await fetchData(1, 0)
    const totalRecords = firstBatch.total
    console.log(`Total records available: ${totalRecords}`)
    console.log('')

    // If database is empty, import more data (first run)
    const isFirstRun = !latestMonth
    const maxBatchesForFirstRun = 500 // Import more data on first run
    
    while (batchCount < (isFirstRun ? maxBatchesForFirstRun : MAX_BATCHES)) {
      console.log(`Fetching batch ${batchCount + 1}: offset ${offset}...`)
      
      const { records } = await fetchData(BATCH_SIZE, offset)
      
      if (records.length === 0) {
        break
      }

      // Check if we've reached data we already have (only for incremental updates)
      if (latestMonth && !isFirstRun && offset > 0) {
        const batchMonths = records.map(r => r.month).filter(Boolean)
        const latestBatchMonth = batchMonths.sort().reverse()[0]
        
        if (latestBatchMonth && new Date(latestBatchMonth) <= new Date(latestMonth)) {
          // Check if any records are newer
          const hasNewer = batchMonths.some(m => new Date(m) > new Date(latestMonth))
          if (!hasNewer) {
            console.log('  Reached existing data, stopping incremental update...')
            break
          }
        }
      }

      const result = await insertBatch(records)
      totalInserted += result.inserted
      totalSkipped += result.skipped
      
      if (result.inserted > 0) {
        hasNewData = true
      }
      
      console.log(`  ✓ Inserted: ${result.inserted}, Skipped: ${result.skipped}`)

      offset += records.length
      batchCount++

      // Delay between batches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS))
    }

    console.log('')
    console.log('='.repeat(50))
    console.log('Update completed!')
    console.log(`Total inserted: ${totalInserted}`)
    console.log(`Total skipped: ${totalSkipped}`)
    console.log(`Batches processed: ${batchCount}`)
    
    if (hasNewData) {
      console.log('')
      console.log('⚠️  New data detected!')
      console.log('')
      console.log('Next steps:')
      console.log('1. Geocode new records (if needed): node scripts/geocode-raw-resale.js')
      console.log('2. Populate neighbourhood_ids: Run populate_neighbourhood_ids() function')
      console.log('3. Run aggregation: node scripts/run-aggregation.js')
      console.log('   (This will update agg_neighbourhood_monthly table)')
      process.exit(0)
    } else {
      console.log('')
      console.log('✓ No new data found.')
      process.exit(0)
    }
    
  } catch (error) {
    console.error('Fatal error during update:', error)
    process.exit(1)
  }
}

// Run update
updateData()
