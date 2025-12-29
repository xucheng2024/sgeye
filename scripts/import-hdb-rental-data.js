/**
 * HDB Rental Data Import Script
 * 
 * This script fetches rental data from data.gov.sg API and imports into Supabase
 * Designed to run daily via GitHub Actions
 * 
 * Data source: "Renting Out of Flats from Jan 2021"
 * Dataset URL: https://data.gov.sg/datasets/d_c9f57187485a850908655db0e8cfe651/view
 * 
 * Environment variables required:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_KEY (service role key, not anon key)
 * 
 * Note: Requires Node.js 18+ (for built-in fetch)
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js')

// Use built-in fetch (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('Error: This script requires Node.js 18+ with built-in fetch')
  process.exit(1)
}

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''
// HDB Rental Statistics dataset ID
// Dataset: "Renting Out of Flats from Jan 2021"
// URL: https://data.gov.sg/datasets/d_c9f57187485a850908655db0e8cfe651/view
const DATA_GOV_SG_DATASET_ID = 'd_c9f57187485a850908655db0e8cfe651'
let DATA_GOV_SG_RENTAL_RESOURCE_ID = null // Will be fetched from dataset
const BATCH_SIZE = 100
const MAX_RECORDS = null // Set to null for all data

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

/**
 * Get resource ID from dataset ID
 */
async function getResourceIdFromDataset() {
  // First, try to get resource_id from dataset
  const datasetUrl = `https://data.gov.sg/api/action/package_show?id=${DATA_GOV_SG_DATASET_ID}`
  
  try {
    const response = await fetch(datasetUrl)
    const data = await response.json()
    
    if (data.success && data.result && data.result.resources && data.result.resources.length > 0) {
      // Get the first resource ID (usually there's one main resource)
      const resourceId = data.result.resources[0].id
      console.log(`Found resource ID: ${resourceId}`)
      return resourceId
    }
  } catch (error) {
    console.warn('Could not fetch resource ID from dataset, trying direct dataset ID:', error.message)
  }
  
  // Fallback: try using dataset_id as resource_id directly
  return DATA_GOV_SG_DATASET_ID
}

/**
 * Fetch rental data from data.gov.sg API
 */
async function fetchRentalDataFromDataGovSG(limit = 100, offset = 0) {
  if (!DATA_GOV_SG_RENTAL_RESOURCE_ID) {
    throw new Error('Resource ID not initialized. Call getResourceIdFromDataset() first.')
  }
  
  const url = `https://data.gov.sg/api/action/datastore_search?resource_id=${DATA_GOV_SG_RENTAL_RESOURCE_ID}&limit=${limit}&offset=${offset}`
  
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
      throw new Error('Invalid response from data.gov.sg: ' + JSON.stringify(data))
    }
  } catch (error) {
    console.error('Error fetching rental data:', error)
    throw error
  }
}

/**
 * Normalize flat type to match database format
 */
function normalizeFlatType(flatType) {
  if (!flatType) return null
  
  const normalized = flatType.toUpperCase().trim()
  // Map common variations
  if (normalized.includes('3') && normalized.includes('ROOM')) return '3 ROOM'
  if (normalized.includes('4') && normalized.includes('ROOM')) return '4 ROOM'
  if (normalized.includes('5') && normalized.includes('ROOM')) return '5 ROOM'
  if (normalized.includes('EXECUTIVE')) return 'EXECUTIVE'
  
  return normalized
}

/**
 * Parse month string to Date
 */
function parseMonth(monthStr) {
  if (!monthStr) return null
  
  // Handle formats like "2024-01", "2024-1", "2024/01", etc.
  const cleaned = monthStr.toString().trim()
  const parts = cleaned.split(/[-/]/)
  
  if (parts.length >= 2) {
    const year = parseInt(parts[0])
    const month = parseInt(parts[1]) - 1 // JavaScript months are 0-indexed
    
    if (!isNaN(year) && !isNaN(month) && month >= 0 && month < 12) {
      return new Date(year, month, 1)
    }
  }
  
  return null
}

/**
 * Transform and validate rental record
 */
function transformRentalRecord(record) {
  try {
    // Field names from "Renting Out of Flats" dataset
    // Support multiple field name variations from data.gov.sg API
    const month = parseMonth(record.month || record.Month || record.month_year || record.rental_month)
    const town = (record.town || record.Town || record.town_name || '').trim().toUpperCase()
    const flatType = normalizeFlatType(record.flat_type || record.Flat_Type || record.flat_type_name || record.room_type)
    const medianRent = parseFloat(record.median_rent || record.Median_Rent || record.median_monthly_rent || record.median_rental || 0)
    const contractCount = parseInt(record.number_of_rental_contracts || record.Number_of_Rental_Contracts || record.contract_count || record.rental_contracts || record.number_of_contracts || 0)

    // Validation
    if (!month || !town || !flatType || medianRent <= 0) {
      return null
    }

    return {
      month: month.toISOString().split('T')[0], // Format as YYYY-MM-DD
      town: town,
      flat_type: flatType,
      median_rent: medianRent,
      number_of_rental_contracts: contractCount || 0
    }
  } catch (error) {
    console.error('Error transforming record:', error, record)
    return null
  }
}

/**
 * Import rental data to Supabase
 */
async function importRentalData() {
  console.log('Starting HDB rental data import...')
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set')
  }

  // Get resource ID from dataset
  console.log('Fetching resource ID from dataset...')
  DATA_GOV_SG_RENTAL_RESOURCE_ID = await getResourceIdFromDataset()
  console.log(`Using resource ID: ${DATA_GOV_SG_RENTAL_RESOURCE_ID}`)

  let totalImported = 0
  let totalSkipped = 0
  let offset = 0
  let hasMore = true

  while (hasMore) {
    try {
      console.log(`Fetching records ${offset} to ${offset + BATCH_SIZE}...`)
      
      const { records } = await fetchRentalDataFromDataGovSG(BATCH_SIZE, offset)
      
      if (!records || records.length === 0) {
        console.log('No more records to fetch')
        hasMore = false
        break
      }

      // Transform records
      const transformedRecords = records
        .map(transformRentalRecord)
        .filter(record => record !== null)

      if (transformedRecords.length === 0) {
        console.log('No valid records in this batch')
        offset += BATCH_SIZE
        continue
      }

      // Insert into Supabase (using upsert to handle duplicates)
      const { error } = await supabase
        .from('hdb_rental_stats')
        .upsert(transformedRecords, {
          onConflict: 'month,town,flat_type',
          ignoreDuplicates: false
        })

      if (error) {
        console.error('Error inserting data:', error)
        throw error
      }

      const imported = transformedRecords.length
      const skipped = records.length - imported
      
      totalImported += imported
      totalSkipped += skipped

      console.log(`Imported ${imported} records (${skipped} skipped)`)
      console.log(`Progress: ${totalImported} total imported`)

      // Check if we should continue
      if (MAX_RECORDS && totalImported >= MAX_RECORDS) {
        console.log(`Reached MAX_RECORDS limit (${MAX_RECORDS})`)
        hasMore = false
      } else if (records.length < BATCH_SIZE) {
        console.log('Reached end of data')
        hasMore = false
      } else {
        offset += BATCH_SIZE
      }

    } catch (error) {
      console.error('Error in import loop:', error)
      throw error
    }
  }

  console.log('\n=== Import Summary ===')
  console.log(`Total imported: ${totalImported}`)
  console.log(`Total skipped: ${totalSkipped}`)
  console.log('Import completed successfully!')
}

// Run import
if (require.main === module) {
  importRentalData()
    .then(() => {
      console.log('Script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Script failed:', error)
      process.exit(1)
    })
}

module.exports = { importRentalData }

