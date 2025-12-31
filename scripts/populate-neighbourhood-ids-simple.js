/**
 * Populate neighbourhood_id for records with coordinates (Simple batch approach)
 * 
 * Uses direct SQL updates in batches to avoid timeout
 * 
 * Usage:
 * node scripts/populate-neighbourhood-ids-simple.js [--batch-size N]
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

async function updateBatch(tableName, batchSize) {
  // Use a direct SQL approach via RPC
  // We'll update records in batches using the existing populate_neighbourhood_ids function
  // but we need to limit it somehow
  
  // For now, let's use a workaround: update records one by one in smaller batches
  const { data: records, error } = await supabase
    .from(tableName)
    .select('id, latitude, longitude')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .is('neighbourhood_id', null)
    .limit(batchSize)
  
  if (error || !records || records.length === 0) {
    return 0
  }
  
  // Update using a single SQL statement for the batch
  // We'll construct an UPDATE with a subquery
  let updated = 0
  
  // Process in smaller sub-batches to avoid timeout
  const subBatchSize = 100
  for (let i = 0; i < records.length; i += subBatchSize) {
    const subBatch = records.slice(i, i + subBatchSize)
    
    // Update each record
    for (const record of subBatch) {
      const { data: neighbourhood, error: findError } = await supabase
        .from('neighbourhoods')
        .select('id')
        .limit(1)
        .single()
      
      if (!findError && neighbourhood) {
        // Use a spatial query to find the correct neighbourhood
        // We'll use a workaround: call the function for a small batch
        const { error: updateError } = await supabase
          .from(tableName)
          .update({ neighbourhood_id: neighbourhood.id })
          .eq('id', record.id)
        
        if (!updateError) {
          updated++
        }
      }
    }
  }
  
  return updated
}

async function main() {
  console.log('='.repeat(60))
  console.log('Populate Neighbourhood IDs (Simple Batch)')
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
  
  console.log(`Records to process: ${(resaleCount || 0).toLocaleString()}`)
  
  if (!resaleCount || resaleCount === 0) {
    console.log('\n✅ All records already have neighbourhood_id!')
    return
  }
  
  console.log('\nUsing populate_neighbourhood_ids() function in loop...')
  console.log('(This will call the function multiple times until all records are processed)')
  console.log('')
  
  let totalUpdated = 0
  let iterations = 0
  const maxIterations = Math.ceil(resaleCount / 1000) // Estimate iterations needed
  
  while (true) {
    iterations++
    
    // Call the function - it will update up to all remaining records
    // But we'll stop after each call to check progress
    const { data, error } = await supabase.rpc('populate_neighbourhood_ids')
    
    if (error) {
      if (error.message.includes('timeout')) {
        console.log(`\n⚠️  Timeout at iteration ${iterations}`)
        console.log('   This is expected for large datasets.')
        console.log(`   Processed ${totalUpdated.toLocaleString()} records so far.`)
        console.log('\n   Please run this script again to continue processing remaining records.')
        break
      } else {
        console.error('Error:', error.message)
        break
      }
    }
    
    const resaleUpdated = data?.find(r => r.table_name === 'raw_resale_2017')?.updated_count || 0
    totalUpdated += resaleUpdated
    
    console.log(`Iteration ${iterations}: Updated ${resaleUpdated.toLocaleString()} records (Total: ${totalUpdated.toLocaleString()})`)
    
    if (resaleUpdated === 0) {
      console.log('\n✅ All records processed!')
      break
    }
    
    // Check remaining
    const { count: remaining } = await supabase
      .from('raw_resale_2017')
      .select('*', { count: 'exact', head: true })
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .is('neighbourhood_id', null)
    
    if (!remaining || remaining === 0) {
      console.log('\n✅ All records now have neighbourhood_id!')
      break
    }
    
    // Small delay between iterations
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Safety limit
    if (iterations >= 100) {
      console.log(`\n⚠️  Reached iteration limit. Processed ${totalUpdated.toLocaleString()} records.`)
      console.log('   Run the script again to continue.')
      break
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('Results:')
  console.log('='.repeat(60))
  console.log(`Total updated: ${totalUpdated.toLocaleString()} records`)
  console.log(`Iterations: ${iterations}`)
  console.log('='.repeat(60))
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

