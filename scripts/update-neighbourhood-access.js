/**
 * Update Neighbourhood Access (MRT-focused)
 * 
 * Calls calculate_neighbourhood_access() to refresh MRT access metrics
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
  console.log('Update Neighbourhood Access (MRT-focused)')
  console.log('='.repeat(60))
  console.log('')
  
  try {
    const { data, error } = await supabase.rpc('calculate_neighbourhood_access')
    
    if (error) {
      console.error('Error:', error.message)
      process.exit(1)
    }
    
    if (data && data.length > 0) {
      console.log('='.repeat(60))
      console.log('Access metrics updated successfully!')
      console.log('='.repeat(60))
      console.log(`Processed ${data.length} neighbourhoods`)
      console.log('')
    } else {
      console.log('Access metrics updated (no data returned)')
    }
    
    // Verify results
    const { count: totalRecords } = await supabase
      .from('neighbourhood_access')
      .select('*', { count: 'exact', head: true })
    
    const { data: highAccess } = await supabase
      .from('neighbourhood_access')
      .select('*')
      .eq('mrt_access_type', 'high')
      .order('mrt_station_count', { ascending: false })
      .limit(5)
    
    const { data: noneAccess } = await supabase
      .from('neighbourhood_access')
      .select('*')
      .eq('mrt_access_type', 'none')
      .limit(5)
    
    console.log('Verification:')
    console.log(`  Total records: ${(totalRecords || 0).toLocaleString()}`)
    
    if (highAccess && highAccess.length > 0) {
      console.log('  High MRT access (top 5):')
      highAccess.forEach((r, i) => {
        console.log(`    ${i + 1}. ${r.neighbourhood_id}: ${r.mrt_station_count} stations`)
      })
    }
    
    if (noneAccess && noneAccess.length > 0) {
      console.log('  No MRT access (sample):')
      noneAccess.slice(0, 3).forEach((r, i) => {
        const dist = r.avg_distance_to_mrt ? `${(r.avg_distance_to_mrt / 1000).toFixed(1)}km` : 'N/A'
        console.log(`    ${i + 1}. ${r.neighbourhood_id}: ${dist} to nearest MRT`)
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

