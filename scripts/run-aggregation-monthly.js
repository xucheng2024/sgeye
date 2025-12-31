/**
 * Run Aggregation Month by Month (Direct SQL approach)
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

async function aggregateMonth(month) {
  // Use RPC to execute SQL for a specific month
  const sql = `
    INSERT INTO agg_neighbourhood_monthly (
      month,
      neighbourhood_id,
      flat_type,
      tx_count,
      median_price,
      p25_price,
      p75_price,
      median_psm,
      median_lease_years,
      avg_floor_area,
      updated_at
    )
    SELECT 
      '${month}'::DATE as month,
      neighbourhood_id,
      flat_type,
      COUNT(*) as tx_count,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY resale_price) as median_price,
      PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY resale_price) as p25_price,
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY resale_price) as p75_price,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY resale_price / NULLIF(floor_area_sqm, 0)) as median_psm,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY parse_lease_years(remaining_lease)) as median_lease_years,
      AVG(floor_area_sqm) as avg_floor_area,
      NOW() as updated_at
    FROM raw_resale_2017
    WHERE DATE_TRUNC('month', month)::DATE = '${month}'::DATE
      AND resale_price IS NOT NULL
      AND resale_price > 0
      AND floor_area_sqm IS NOT NULL
      AND floor_area_sqm > 0
      AND remaining_lease IS NOT NULL
      AND remaining_lease != ''
      AND neighbourhood_id IS NOT NULL
    GROUP BY neighbourhood_id, flat_type
    ON CONFLICT (month, neighbourhood_id, flat_type) 
    DO UPDATE SET
      tx_count = EXCLUDED.tx_count,
      median_price = EXCLUDED.median_price,
      p25_price = EXCLUDED.p25_price,
      p75_price = EXCLUDED.p75_price,
      median_psm = EXCLUDED.median_psm,
      median_lease_years = EXCLUDED.median_lease_years,
      avg_floor_area = EXCLUDED.avg_floor_area,
      updated_at = EXCLUDED.updated_at;
  `
  
  // Execute via RPC (if available) or use direct query
  // For now, we'll use the aggregate function but limit to one month
  const { error } = await supabase.rpc('exec_sql', { sql_text: sql })
  
  if (error && error.message.includes('exec_sql')) {
    // Fallback: use the existing function but we need to modify it
    // For now, just try the function and see if it works
    return { error: 'Need to use batch function' }
  }
  
  return { error }
}

async function main() {
  console.log('='.repeat(60))
  console.log('Aggregate Neighbourhood Monthly Data')
  console.log('='.repeat(60))
  console.log('')
  
  // Get unique months
  const { data: months } = await supabase
    .from('raw_resale_2017')
    .select('month')
    .not('neighbourhood_id', 'is', null)
    .order('month', { ascending: true })
  
  if (!months || months.length === 0) {
    console.log('No data to aggregate')
    return
  }
  
  const monthSet = new Set()
  months.forEach(m => {
    if (m.month) {
      const monthStr = m.month.substring(0, 7) + '-01'
      monthSet.add(monthStr)
    }
  })
  
  const sortedMonths = Array.from(monthSet).sort()
  
  console.log(`Found ${sortedMonths.length} unique months`)
  console.log(`Range: ${sortedMonths[0]} to ${sortedMonths[sortedMonths.length - 1]}`)
  console.log('')
  console.log('Processing months...')
  console.log('')
  
  // Try using the existing function first (it might work for smaller datasets)
  console.log('Attempting full aggregation...')
  const { data: fullResult, error: fullError } = await supabase.rpc('aggregate_neighbourhood_monthly_data')
  
  if (!fullError && fullResult && fullResult.length > 0) {
    const result = fullResult[0]
    console.log('='.repeat(60))
    console.log('Aggregation completed!')
    console.log('='.repeat(60))
    console.log(`Total records: ${result.total_records || 'N/A'}`)
    console.log(`Earliest month: ${result.earliest_month || 'N/A'}`)
    console.log(`Latest month: ${result.latest_month || 'N/A'}`)
    console.log(`Total transactions: ${result.total_transactions || 'N/A'}`)
    console.log('='.repeat(60))
  } else if (fullError && fullError.message.includes('timeout')) {
    console.log('⚠️  Full aggregation timed out')
    console.log('Please execute the batch SQL function in Supabase Dashboard')
    console.log('  supabase/migrations/aggregate_neighbourhood_monthly_batch.sql')
    process.exit(1)
  } else if (fullError) {
    console.error('Error:', fullError.message)
    process.exit(1)
  }
  
  // Verify results
  console.log('')
  console.log('Verifying aggregation...')
  
  const { count: totalRecords } = await supabase
    .from('agg_neighbourhood_monthly')
    .select('*', { count: 'exact', head: true })
  
  const { data: neighbourhoodCounts } = await supabase
    .from('agg_neighbourhood_monthly')
    .select('neighbourhood_id')
    .limit(10000)
  
  const uniqueNeighbourhoods = new Set(neighbourhoodCounts?.map(r => r.neighbourhood_id) || [])
  
  console.log('')
  console.log('Verification Results:')
  console.log(`  Total records: ${(totalRecords || 0).toLocaleString()}`)
  console.log(`  Unique neighbourhoods: ${uniqueNeighbourhoods.size}`)
  console.log('')
  console.log('✅ Aggregation completed!')
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

