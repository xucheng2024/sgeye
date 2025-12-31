/**
 * Run Aggregation via Supabase Database Function
 * 
 * Calls the aggregate_neighbourhood_monthly_data() function to update agg_neighbourhood_monthly table
 * This function is defined in supabase/migrations/create_agg_neighbourhood_monthly.sql
 * 
 * Note: This replaces the old aggregate_monthly_data() which aggregated by town.
 * Now we aggregate by neighbourhood_id for more accurate spatial analysis.
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function runAggregation() {
  console.log('Running neighbourhood-based aggregation via database function...')
  console.log('')
  
  try {
    // First, populate neighbourhood_ids for records that have coordinates but no neighbourhood_id
    console.log('Step 1: Populating neighbourhood_ids for records with coordinates...')
    const { error: populateError } = await supabase.rpc('populate_neighbourhood_ids')
    
    if (populateError) {
      console.warn('Warning: Could not populate neighbourhood_ids:', populateError.message)
      console.warn('This is OK if all records already have neighbourhood_id assigned.')
    } else {
      console.log('✓ Neighbourhood IDs populated')
    }
    console.log('')
    
    // Call the database function to aggregate by neighbourhood
    console.log('Step 2: Aggregating data by neighbourhood...')
    const { data, error } = await supabase.rpc('aggregate_neighbourhood_monthly_data')
    
    if (error) {
      console.error('Error calling aggregation function:', error.message)
      console.error('')
      console.error('Make sure you have run the migration:')
      console.error('  supabase/migrations/create_agg_neighbourhood_monthly.sql')
      console.error('')
      console.error('To fix:')
      console.error('1. Go to Supabase Dashboard → SQL Editor')
      console.error('2. Run create_agg_neighbourhood_monthly.sql')
      process.exit(1)
    }
    
    if (data && data.length > 0) {
      const result = data[0]
      console.log('='.repeat(50))
      console.log('Aggregation completed successfully!')
      console.log('='.repeat(50))
      console.log('')
      console.log('Summary:')
      console.log(`  Total aggregated records: ${result.total_records || 'N/A'}`)
      console.log(`  Earliest month: ${result.earliest_month || 'N/A'}`)
      console.log(`  Latest month: ${result.latest_month || 'N/A'}`)
      console.log(`  Total transactions: ${result.total_transactions || 'N/A'}`)
      console.log('')
      console.log('Note: Data is now aggregated by neighbourhood_id instead of town.')
      console.log('This provides more accurate spatial analysis.')
    } else {
      console.log('Aggregation completed, but no summary data returned.')
    }
    
  } catch (error) {
    console.error('Fatal error during aggregation:', error.message)
    console.error('')
    console.error('Fallback: Please run the aggregation SQL manually in Supabase SQL Editor')
    process.exit(1)
  }
}

// Run aggregation
runAggregation()

