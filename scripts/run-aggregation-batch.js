/**
 * Run Aggregation via Batch Function (Month by Month)
 * 
 * Processes data month by month to avoid timeout
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
  console.log('Aggregate Neighbourhood Monthly Data (Batch Processing)')
  console.log('='.repeat(60))
  console.log('')
  
  // Get date range
  const { data: dateRange } = await supabase
    .from('raw_resale_2017')
    .select('month')
    .not('neighbourhood_id', 'is', null)
    .order('month', { ascending: true })
    .limit(1)
  
  const { data: dateRangeEnd } = await supabase
    .from('raw_resale_2017')
    .select('month')
    .not('neighbourhood_id', 'is', null)
    .order('month', { ascending: false })
    .limit(1)
  
  if (!dateRange || dateRange.length === 0) {
    console.log('No data to aggregate')
    return
  }
  
  const startMonth = dateRange[0].month
  const endMonth = dateRangeEnd[0].month
  
  console.log(`Date range: ${startMonth} to ${endMonth}`)
  console.log('')
  
  // Call batch aggregation function
  console.log('Running batch aggregation (month by month)...')
  const { data, error } = await supabase.rpc('aggregate_neighbourhood_monthly_data_batch', {
    p_start_month: startMonth,
    p_end_month: endMonth
  })
  
  if (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
  
  if (data && data.length > 0) {
    console.log('')
    console.log('='.repeat(60))
    console.log('Aggregation Results:')
    console.log('='.repeat(60))
    
    let totalRecords = 0
    for (const row of data) {
      console.log(`  ${row.month_processed}: ${row.records_inserted} records`)
      totalRecords += row.records_inserted || 0
    }
    
    console.log('')
    console.log(`Total records aggregated: ${totalRecords.toLocaleString()}`)
    console.log('='.repeat(60))
  }
  
  // Verify results
  console.log('')
  console.log('Verifying aggregation...')
  
  const { count: totalRecords } = await supabase
    .from('agg_neighbourhood_monthly')
    .select('*', { count: 'exact', head: true })
  
  const { data: neighbourhoodStats } = await supabase
    .from('agg_neighbourhood_monthly')
    .select('neighbourhood_id')
    .limit(1000)
  
  const uniqueNeighbourhoods = new Set(neighbourhoodStats?.map(r => r.neighbourhood_id) || [])
  
  const { data: monthRange } = await supabase
    .from('agg_neighbourhood_monthly')
    .select('month')
    .order('month', { ascending: true })
    .limit(1)
  
  const { data: monthRangeEnd } = await supabase
    .from('agg_neighbourhood_monthly')
    .select('month')
    .order('month', { ascending: false })
    .limit(1)
  
  console.log('')
  console.log('Verification Results:')
  console.log(`  Total records: ${(totalRecords || 0).toLocaleString()}`)
  console.log(`  Unique neighbourhoods: ${uniqueNeighbourhoods.size}`)
  if (monthRange && monthRange.length > 0) {
    console.log(`  Month range: ${monthRange[0].month} to ${monthRangeEnd?.[0]?.month || monthRange[0].month}`)
  }
  console.log('')
  console.log('✅ Aggregation completed!')
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

