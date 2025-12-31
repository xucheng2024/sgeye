/**
 * Update Neighbourhood Summary
 * 
 * Calls update_neighbourhood_summary() to refresh the summary table
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('='.repeat(60))
  console.log('Update Neighbourhood Summary')
  console.log('='.repeat(60))
  console.log('')
  
  try {
    const { data, error } = await supabase.rpc('update_neighbourhood_summary')
    
    if (error) {
      console.error('Error:', error.message)
      process.exit(1)
    }
    
    if (data && data.length > 0) {
      const result = data[0]
      console.log('='.repeat(60))
      console.log('Summary updated successfully!')
      console.log('='.repeat(60))
      console.log(`Updated neighbourhoods: ${result.updated_count || 'N/A'}`)
      console.log(`Total neighbourhoods: ${result.total_neighbourhoods || 'N/A'}`)
      console.log('')
    } else {
      console.log('Summary updated (no data returned)')
    }
    
    // Verify results
    const { count: totalRecords } = await supabase
      .from('neighbourhood_summary')
      .select('*', { count: 'exact', head: true })
    
    const { data: sample } = await supabase
      .from('neighbourhood_summary')
      .select('*')
      .order('tx_12m', { ascending: false })
      .limit(5)
    
    console.log('Verification:')
    console.log(`  Total records: ${(totalRecords || 0).toLocaleString()}`)
    if (sample && sample.length > 0) {
      console.log('  Top 5 by transaction count:')
      sample.forEach((r, i) => {
        console.log(`    ${i + 1}. ${r.neighbourhood_id}: ${r.tx_12m} tx, median: $${(r.median_price_12m / 1000).toFixed(0)}k`)
      })
    }
    console.log('')
    console.log('✅ Update completed!')
    
  } catch (error) {
    console.error('Fatal error:', error.message)
    process.exit(1)
  }
}

main()

