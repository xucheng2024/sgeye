/**
 * Populate neighbourhood_id for records with coordinates
 * 
 * This script uses the populate_neighbourhood_ids() function to match
 * coordinates to neighbourhoods using spatial queries (ST_Contains)
 * 
 * Usage:
 * node scripts/populate-neighbourhood-ids.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('='.repeat(60))
  console.log('Populate Neighbourhood IDs from Coordinates')
  console.log('='.repeat(60))
  
  // Check how many records have coordinates but no neighbourhood_id
  const { count: resaleWithCoords } = await supabase
    .from('raw_resale_2017')
    .select('*', { count: 'exact', head: true })
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .is('neighbourhood_id', null)
  
  const { count: schoolsWithCoords } = await supabase
    .from('primary_schools')
    .select('*', { count: 'exact', head: true })
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .is('neighbourhood_id', null)
  
  const { count: mrtWithCoords } = await supabase
    .from('mrt_stations')
    .select('*', { count: 'exact', head: true })
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .is('neighbourhood_id', null)
  
  const { count: busWithCoords } = await supabase
    .from('bus_stops')
    .select('*', { count: 'exact', head: true })
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .is('neighbourhood_id', null)
  
  console.log('\nRecords with coordinates but missing neighbourhood_id:')
  console.log(`  raw_resale_2017: ${resaleWithCoords || 0}`)
  console.log(`  primary_schools: ${schoolsWithCoords || 0}`)
  console.log(`  mrt_stations: ${mrtWithCoords || 0}`)
  console.log(`  bus_stops: ${busWithCoords || 0}`)
  
  const total = (resaleWithCoords || 0) + (schoolsWithCoords || 0) + (mrtWithCoords || 0) + (busWithCoords || 0)
  
  if (total === 0) {
    console.log('\n✅ All records with coordinates already have neighbourhood_id!')
    return
  }
  
  console.log(`\nTotal records to process: ${total}`)
  console.log('\nRunning populate_neighbourhood_ids() function...')
  
  const { data, error } = await supabase.rpc('populate_neighbourhood_ids')
  
  if (error) {
    console.error('Error:', error)
    process.exit(1)
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('Results:')
  console.log('='.repeat(60))
  
  let totalUpdated = 0
  for (const row of data || []) {
    console.log(`  ${row.table_name}: ${row.updated_count} records updated`)
    totalUpdated += parseInt(row.updated_count) || 0
  }
  
  console.log(`\nTotal updated: ${totalUpdated} records`)
  console.log('='.repeat(60))
  
  // Check remaining
  const { count: remainingResale } = await supabase
    .from('raw_resale_2017')
    .select('*', { count: 'exact', head: true })
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .is('neighbourhood_id', null)
  
  if (remainingResale > 0) {
    console.log(`\n⚠️  ${remainingResale} raw_resale_2017 records still missing neighbourhood_id`)
    console.log('This might be because:')
    console.log('  - Coordinates are outside all neighbourhood boundaries')
    console.log('  - Neighbourhoods are missing geometry data')
    console.log('  - Coordinate precision issues')
  } else {
    console.log('\n✅ All records with coordinates now have neighbourhood_id!')
  }
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

