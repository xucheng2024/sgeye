/**
 * Check for New HDB Data
 * 
 * This script checks if there is new HDB resale data available from data.gov.sg
 * that hasn't been imported yet.
 * 
 * Usage:
 * node scripts/check-new-hdb-data.js
 * 
 * Environment variables required:
 * - NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const DATA_GOV_SG_RESOURCE_ID = 'f1765b54-a209-4718-8d38-a39237f502b3'
const CHECK_LIMIT = 100 // Check first 100 records to see if there's new data

/**
 * Fetch latest records from data.gov.sg
 */
async function fetchLatestRecords(limit = 10) {
  const url = `https://data.gov.sg/api/action/datastore_search?resource_id=${DATA_GOV_SG_RESOURCE_ID}&limit=${limit}&sort=month desc`
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    
    if (data.success && data.result && data.result.records) {
      return data.result.records
    } else {
      throw new Error('Invalid response from data.gov.sg')
    }
  } catch (error) {
    console.error('Error fetching data:', error.message)
    throw error
  }
}

/**
 * Transform month to date format
 */
function parseMonth(monthStr) {
  if (!monthStr) return null
  try {
    const dateStr = monthStr.toString()
    if (dateStr.match(/^\d{4}-\d{2}$/)) {
      return `${dateStr}-01`
    } else {
      const date = new Date(monthStr)
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]
      }
    }
  } catch (e) {
    return null
  }
  return null
}

/**
 * Check if record exists in database
 */
async function recordExists(record) {
  const month = parseMonth(record.month)
  if (!month) return false

  const { count, error } = await supabase
    .from('raw_resale_2017')
    .select('*', { count: 'exact', head: true })
    .eq('month', month)
    .eq('town', record.town || '')
    .eq('block', String(record.block || ''))
    .eq('street_name', record.street_name || '')
    .eq('flat_type', record.flat_type || '')
    .eq('resale_price', parseFloat(record.resale_price || 0))

  if (error) {
    console.warn('Error checking record:', error.message)
    return false
  }

  return count > 0
}

async function main() {
  console.log('='.repeat(60))
  console.log('Checking for New HDB Data')
  console.log('='.repeat(60))
  console.log('')

  try {
    // Get latest month in database
    const { data: latestDbRecord, error: dbError } = await supabase
      .from('raw_resale_2017')
      .select('month')
      .order('month', { ascending: false })
      .limit(1)
      .single()

    if (dbError && dbError.code !== 'PGRST116') {
      console.error('Error getting latest month from database:', dbError.message)
      process.exit(1)
    }

    const latestDbMonth = latestDbRecord?.month || null
    console.log(`Latest month in database: ${latestDbMonth || 'None (empty database)'}`)
    console.log('')

    // Fetch latest records from data.gov.sg
    console.log('Fetching latest records from data.gov.sg...')
    const latestRecords = await fetchLatestRecords(CHECK_LIMIT)
    
    if (latestRecords.length === 0) {
      console.log('No records found in data.gov.sg')
      process.exit(0)
    }

    console.log(`Fetched ${latestRecords.length} latest records`)
    console.log('')

    // Get unique months from latest records
    const months = new Set()
    latestRecords.forEach(r => {
      const month = parseMonth(r.month)
      if (month) months.add(month)
    })

    const latestApiMonth = Array.from(months).sort().reverse()[0]
    console.log(`Latest month in data.gov.sg: ${latestApiMonth || 'Unknown'}`)
    console.log('')

    // Compare months
    if (!latestDbMonth) {
      console.log('⚠️  Database is empty. Run initial import.')
      process.exit(1)
    }

    if (latestApiMonth && new Date(latestApiMonth) > new Date(latestDbMonth)) {
      console.log('✅ NEW DATA AVAILABLE!')
      console.log(`   Database: ${latestDbMonth}`)
      console.log(`   API: ${latestApiMonth}`)
      console.log('')
      console.log('Run update script:')
      console.log('  node scripts/update-hdb-data.js')
      process.exit(0)
    }

    // Check if there are new records in the same month
    console.log('Checking for new records in latest month...')
    let newRecordsCount = 0
    let checkedCount = 0
    const maxCheck = Math.min(50, latestRecords.length) // Check up to 50 records

    for (const record of latestRecords.slice(0, maxCheck)) {
      checkedCount++
      const exists = await recordExists(record)
      if (!exists) {
        newRecordsCount++
      }
      
      // Progress indicator
      if (checkedCount % 10 === 0) {
        process.stdout.write(`  Checked ${checkedCount}/${maxCheck} records...\r`)
      }
    }
    console.log('')

    if (newRecordsCount > 0) {
      console.log(`✅ Found ${newRecordsCount} new records (out of ${checkedCount} checked)`)
      console.log('')
      console.log('Run update script:')
      console.log('  node scripts/update-hdb-data.js')
      process.exit(0)
    } else {
      console.log('✓ No new data found.')
      console.log(`  Checked ${checkedCount} latest records, all already in database.`)
      process.exit(0)
    }

  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

main()

