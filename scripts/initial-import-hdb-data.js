/**
 * Initial Full Import Script for HDB Resale Data
 * 
 * This script imports ALL historical data from data.gov.sg (2017-2025)
 * Use this for the first-time import, then use update-hdb-data.js for daily updates
 * 
 * Usage:
 * - Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables
 * - Run: node scripts/initial-import-hdb-data.js
 */

const { createClient } = require('@supabase/supabase-js')

// Use built-in fetch (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('Error: This script requires Node.js 18+ with built-in fetch')
  process.exit(1)
}

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const DATA_GOV_SG_RESOURCE_ID = 'f1765b54-a209-4718-8d38-a39237f502b3'
const BATCH_SIZE = 1000 // Larger batch size for initial import
const MAX_RECORDS = null // Import all records (set a number to limit)

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

/**
 * Fetch data from data.gov.sg API
 */
async function fetchData(limit, offset) {
  const url = `https://data.gov.sg/api/action/datastore_search?resource_id=${DATA_GOV_SG_RESOURCE_ID}&limit=${limit}&offset=${offset}`
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    
    if (data.success && data.result && data.result.records) {
      return {
        records: data.result.records,
        total: data.result.total || 0
      }
    } else {
      throw new Error('Invalid response from data.gov.sg')
    }
  } catch (error) {
    console.error('Error fetching data:', error.message)
    throw error
  }
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

  // Insert in smaller chunks to avoid payload size limits
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
 * Main import function - full import
 */
async function importData() {
  console.log('Starting FULL HDB data import...')
  console.log(`Time: ${new Date().toISOString()}`)
  console.log('')
  
  try {
    let offset = 0
    let totalInserted = 0
    let totalSkipped = 0
    let batchCount = 0

    // Fetch first batch to check total
    const firstBatch = await fetchData(1, 0)
    const totalRecords = firstBatch.total
    const maxRecords = MAX_RECORDS || totalRecords
    
    console.log(`Total records available: ${totalRecords}`)
    console.log(`Will import: ${maxRecords} records`)
    console.log(`Batch size: ${BATCH_SIZE}`)
    console.log('')

    while (offset < maxRecords) {
      const batchLimit = Math.min(BATCH_SIZE, maxRecords - offset)
      console.log(`[${new Date().toISOString()}] Batch ${batchCount + 1}: offset ${offset}, limit ${batchLimit}...`)
      
      const { records } = await fetchData(batchLimit, offset)
      
      if (records.length === 0) {
        console.log('  No more records available')
        break
      }

      console.log(`  Inserting ${records.length} records...`)
      const result = await insertBatch(records)
      totalInserted += result.inserted
      totalSkipped += result.skipped
      
      console.log(`  ✓ Inserted: ${result.inserted}, Skipped: ${result.skipped}`)
      console.log(`  Progress: ${totalInserted + totalSkipped} / ${maxRecords} (${Math.round((totalInserted + totalSkipped) / maxRecords * 100)}%)`)
      console.log('')

      offset += records.length
      batchCount++

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log('')
    console.log('='.repeat(50))
    console.log('Import completed!')
    console.log('='.repeat(50))
    console.log(`Total inserted: ${totalInserted}`)
    console.log(`Total skipped: ${totalSkipped}`)
    console.log(`Batches processed: ${batchCount}`)
    console.log('')
    console.log('Next steps:')
    console.log('1. Geocode records (if needed): node scripts/geocode-raw-resale.js')
    console.log('2. Populate neighbourhood_ids: Run populate_neighbourhood_ids() function')
    console.log('3. Run aggregation: node scripts/run-aggregation.js')
    console.log('   (This will update agg_neighbourhood_monthly table)')
    console.log('')
    
  } catch (error) {
    console.error('Fatal error during import:', error)
    process.exit(1)
  }
}

// Run import
importData()

