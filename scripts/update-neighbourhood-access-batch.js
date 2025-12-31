/**
 * Update Neighbourhood Access (MRT-focused) - Batch Processing
 * 
 * Processes neighbourhoods in batches to avoid timeout
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
  console.log('Update Neighbourhood Access (MRT-focused) - Batch Processing')
  console.log('='.repeat(60))
  console.log('')
  
  const BATCH_SIZE = 20  // Process 20 neighbourhoods at a time
  const MAX_ITERATIONS = 100  // Safety limit
  
  let totalProcessed = 0
  let iteration = 0
  
  try {
    while (iteration < MAX_ITERATIONS) {
      iteration++
      console.log(`Batch ${iteration} (processing ${BATCH_SIZE} neighbourhoods)...`)
      
      const { data, error } = await supabase.rpc('calculate_neighbourhood_access_batch', {
        p_batch_size: BATCH_SIZE
      })
      
      if (error) {
        console.error('Error:', error.message)
        break
      }
      
      if (data && data.length > 0) {
        const result = data[0]
        const processed = result.processed_count || 0
        const remaining = result.remaining_count || 0
        
        totalProcessed += processed
        
        console.log(`  ✓ Processed ${processed} neighbourhoods, ${remaining} remaining`)
        
        if (remaining === 0) {
          console.log('')
          console.log('✅ All neighbourhoods processed!')
          break
        }
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 500))
      } else {
        console.log('  No more neighbourhoods to process')
        break
      }
    }
    
    if (iteration >= MAX_ITERATIONS) {
      console.log('')
      console.log('⚠️  Reached maximum iterations. Some neighbourhoods may not be processed.')
    }
    
    console.log('')
    console.log('='.repeat(60))
    console.log(`Total processed: ${totalProcessed} neighbourhoods`)
    console.log('='.repeat(60))
    console.log('')
    
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
      .not('avg_distance_to_mrt', 'is', null)
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
      console.log('  No MRT access (with distance, sample):')
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

