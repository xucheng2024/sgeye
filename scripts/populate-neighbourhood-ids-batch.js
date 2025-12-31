/**
 * Populate neighbourhood_id for records with coordinates (BATCH PROCESSING)
 * 
 * This script processes records in batches to avoid timeout issues
 * 
 * Usage:
 * node scripts/populate-neighbourhood-ids-batch.js [--batch-size N]
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const args = process.argv.slice(2)
const batchSizeArg = args.find(arg => arg.startsWith('--batch-size='))
const BATCH_SIZE = batchSizeArg ? parseInt(batchSizeArg.split('=')[1]) : 5000 // Default: 5k records per batch

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('='.repeat(60))
  console.log('Populate Neighbourhood IDs (Batch Processing)')
  console.log('='.repeat(60))
  console.log(`Batch size: ${BATCH_SIZE.toLocaleString()} records per batch`)
  console.log('')
  
  // Check counts
  const { count: resaleCount } = await supabase
    .from('raw_resale_2017')
    .select('*', { count: 'exact', head: true })
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .is('neighbourhood_id', null)
  
  const { count: schoolsCount } = await supabase
    .from('primary_schools')
    .select('*', { count: 'exact', head: true })
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .is('neighbourhood_id', null)
  
  const { count: mrtCount } = await supabase
    .from('mrt_stations')
    .select('*', { count: 'exact', head: true })
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .is('neighbourhood_id', null)
  
  const { count: busCount } = await supabase
    .from('bus_stops')
    .select('*', { count: 'exact', head: true })
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .is('neighbourhood_id', null)
  
  console.log('Records to process:')
  console.log(`  raw_resale_2017: ${(resaleCount || 0).toLocaleString()}`)
  console.log(`  primary_schools: ${(schoolsCount || 0).toLocaleString()}`)
  console.log(`  mrt_stations: ${(mrtCount || 0).toLocaleString()}`)
  console.log(`  bus_stops: ${(busCount || 0).toLocaleString()}`)
  
  const total = (resaleCount || 0) + (schoolsCount || 0) + (mrtCount || 0) + (busCount || 0)
  
  if (total === 0) {
    console.log('\n✅ All records already have neighbourhood_id!')
    return
  }
  
  console.log(`\nTotal: ${total.toLocaleString()} records`)
  console.log('')
  
  let totalUpdated = 0
  
  // Process raw_resale_2017 in batches
  if (resaleCount > 0) {
    console.log('\nProcessing raw_resale_2017...')
    let processed = 0
    let batchNum = 0
    
    while (processed < resaleCount) {
      batchNum++
      const { data: updated, error } = await supabase.rpc('populate_neighbourhood_ids_batch', {
        p_table_name: 'raw_resale_2017',
        p_batch_size: BATCH_SIZE
      })
      
      if (error) {
        console.error('Error:', error.message)
        break
      }
      
      const batchUpdated = updated || 0
      totalUpdated += batchUpdated
      processed += batchUpdated
      
      console.log(`  Batch ${batchNum}: Updated ${batchUpdated.toLocaleString()} records (Total: ${processed.toLocaleString()} / ${resaleCount.toLocaleString()})`)
      
      if (batchUpdated === 0) {
        break
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }
  
  // Process other tables
  const otherTables = [
    { name: 'primary_schools', count: schoolsCount },
    { name: 'mrt_stations', count: mrtCount },
    { name: 'bus_stops', count: busCount }
  ]
  
  for (const table of otherTables) {
    if (table.count > 0) {
      console.log(`\nProcessing ${table.name}...`)
      const { data: updated, error } = await supabase.rpc('populate_neighbourhood_ids_batch', {
        p_table_name: table.name,
        p_batch_size: BATCH_SIZE
      })
      
      if (error) {
        console.error(`Error processing ${table.name}:`, error.message)
      } else {
        const updatedCount = updated || 0
        totalUpdated += updatedCount
        console.log(`  Updated ${updatedCount.toLocaleString()} records`)
      }
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('Results:')
  console.log('='.repeat(60))
  console.log(`Total updated: ${totalUpdated.toLocaleString()} records`)
  console.log('='.repeat(60))
  
  // Check remaining
  const { count: remaining } = await supabase
    .from('raw_resale_2017')
    .select('*', { count: 'exact', head: true })
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .is('neighbourhood_id', null)
  
  if (remaining > 0) {
    console.log(`\n⚠️  ${remaining.toLocaleString()} records still missing neighbourhood_id`)
  } else {
    console.log('\n✅ All records with coordinates now have neighbourhood_id!')
  }
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
