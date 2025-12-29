/**
 * Run Aggregation via Supabase Database Function
 * 
 * Calls the aggregate_monthly_data() function to update agg_monthly table
 * This function is defined in supabase/schema.sql
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function runAggregation() {
  console.log('Running aggregation via database function...')
  console.log('')
  
  try {
    // Call the database function
    const { data, error } = await supabase.rpc('aggregate_monthly_data')
    
    if (error) {
      console.error('Error calling aggregation function:', error.message)
      console.error('')
      console.error('Make sure you have run the updated schema.sql that includes')
      console.error('the aggregate_monthly_data() function.')
      console.error('')
      console.error('To fix:')
      console.error('1. Go to Supabase Dashboard → SQL Editor')
      console.error('2. Run the updated supabase/schema.sql (the function definition)')
      console.error('3. Or manually run aggregate-hdb-data.sql')
      process.exit(1)
    }
    
    if (data && data.length > 0) {
      const result = data[0]
      console.log('='.repeat(50))
      console.log('Aggregation completed successfully!')
      console.log('='.repeat(50))
      console.log('')
      console.log('Summary:')
      console.log(`  Total aggregated records: ${result.total_records}`)
      console.log(`  Earliest month: ${result.earliest_month}`)
      console.log(`  Latest month: ${result.latest_month}`)
      console.log(`  Total transactions: ${result.total_transactions}`)
      console.log('')
    } else {
      console.log('Aggregation completed, but no summary data returned.')
    }
    
  } catch (error) {
    console.error('Fatal error during aggregation:', error.message)
    console.error('')
    console.error('Fallback: Please run aggregate-hdb-data.sql manually in Supabase SQL Editor')
    process.exit(1)
  }
}

// Run aggregation
runAggregation()

