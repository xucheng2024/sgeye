/**
 * HDB Resale Data Import Script
 * 
 * This script fetches data from data.gov.sg API and imports into Supabase
 * 
 * Usage:
 * 1. Install dependencies: npm install @supabase/supabase-js node-fetch
 * 2. Set environment variables:
 *    - SUPABASE_URL=your_supabase_url
 *    - SUPABASE_SERVICE_KEY=your_service_role_key (not anon key!)
 * 3. Run: node scripts/import-hdb-data.js
 */

const { createClient } = require('@supabase/supabase-js')
const fetch = require('node-fetch')

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''
const DATA_GOV_SG_RESOURCE_ID = 'f1765b54-a209-4718-8d38-a39237f502b3'
const BATCH_SIZE = 100 // Number of records per API call
const MAX_RECORDS = 10000 // Limit for testing (remove or set to null for all data)

// Initialize Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

/**
 * Fetch data from data.gov.sg API
 */
async function fetchDataFromDataGovSG(limit = 100, offset = 0) {
  const url = `https://data.gov.sg/api/action/datastore_search?resource_id=${DATA_GOV_SG_RESOURCE_ID}&limit=${limit}&offset=${offset}`
  
  try {
    const response = await fetch(url)
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
    console.error('Error fetching data:', error)
    throw error
  }
}

/**
 * Transform data.gov.sg record to Supabase format
 */
function transformRecord(record) {
  return {
    month: record.month ? new Date(record.month).toISOString().split('T')[0] : null,
    town: record.town || null,
    flat_type: record.flat_type || null,
    block: record.block || null,
    street_name: record.street_name || null,
    storey_range: record.storey_range || null,
    floor_area_sqm: record.floor_area_sqm ? parseFloat(record.floor_area_sqm) : null,
    flat_model: record.flat_model || null,
    lease_commence_date: record.lease_commence_date ? parseInt(record.lease_commence_date) : null,
    remaining_lease: record.remaining_lease || null,
    resale_price: record.resale_price ? parseFloat(record.resale_price) : null,
  }
}

/**
 * Insert batch of records into Supabase
 */
async function insertBatch(records) {
  const transformed = records.map(transformRecord).filter(r => r.month && r.resale_price)
  
  if (transformed.length === 0) {
    return { inserted: 0, errors: 0 }
  }

  const { data, error } = await supabase
    .from('raw_resale_2017')
    .upsert(transformed, {
      onConflict: 'month,town,block,street_name,flat_type,resale_price',
      ignoreDuplicates: false
    })

  if (error) {
    console.error('Error inserting batch:', error)
    return { inserted: 0, errors: transformed.length }
  }

  return { inserted: transformed.length, errors: 0 }
}

/**
 * Main import function
 */
async function importData() {
  console.log('Starting HDB data import...')
  console.log(`Supabase URL: ${SUPABASE_URL}`)
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set')
    process.exit(1)
  }

  let offset = 0
  let totalInserted = 0
  let totalErrors = 0
  let hasMore = true

  try {
    // Get total count first
    const firstBatch = await fetchDataFromDataGovSG(1, 0)
    const totalRecords = firstBatch.total
    const maxRecords = MAX_RECORDS || totalRecords
    
    console.log(`Total records available: ${totalRecords}`)
    console.log(`Will import up to: ${maxRecords} records`)
    console.log(`Batch size: ${BATCH_SIZE}`)
    console.log('')

    while (hasMore && offset < maxRecords) {
      const batchLimit = Math.min(BATCH_SIZE, maxRecords - offset)
      console.log(`Fetching batch: offset ${offset}, limit ${batchLimit}...`)
      
      const { records, total } = await fetchDataFromDataGovSG(batchLimit, offset)
      
      if (records.length === 0) {
        hasMore = false
        break
      }

      console.log(`  Inserting ${records.length} records...`)
      const result = await insertBatch(records)
      totalInserted += result.inserted
      totalErrors += result.errors
      
      console.log(`  ✓ Inserted: ${result.inserted}, Errors: ${result.errors}`)
      console.log(`  Progress: ${totalInserted} / ${Math.min(offset + records.length, maxRecords)}`)
      console.log('')

      offset += records.length
      
      if (offset >= maxRecords || records.length < batchLimit) {
        hasMore = false
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log('')
    console.log('='.repeat(50))
    console.log('Import completed!')
    console.log(`Total inserted: ${totalInserted}`)
    console.log(`Total errors: ${totalErrors}`)
    console.log('')
    console.log('Next step: Run the aggregation SQL to populate agg_monthly table')
    console.log('See HDB_DATA_SETUP.md for the SQL query')
    
  } catch (error) {
    console.error('Fatal error during import:', error)
    process.exit(1)
  }
}

// Run import
if (require.main === module) {
  importData()
}

module.exports = { importData, fetchDataFromDataGovSG, transformRecord }

