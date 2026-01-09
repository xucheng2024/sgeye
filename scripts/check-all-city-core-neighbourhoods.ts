/**
 * Check all city_core neighbourhoods and their HDB data status
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAllCityCore() {
  console.log('Checking all city_core neighbourhoods and their HDB data...\n')

  // Get all city_core neighbourhoods
  const { data: cityCoreNotes } = await supabase
    .from('neighbourhood_living_notes')
    .select('neighbourhood_name, zone_type, rating_mode')
    .eq('zone_type', 'city_core')

  if (!cityCoreNotes) {
    console.log('No city_core neighbourhoods found')
    return
  }

  const cityCoreNames = cityCoreNotes.map(n => n.neighbourhood_name.toUpperCase().trim())
  const cityCoreMap = new Map(cityCoreNotes.map(n => [n.neighbourhood_name.toUpperCase().trim(), n]))

  // Get neighbourhoods
  const { data: neighbourhoods } = await supabase
    .from('neighbourhoods')
    .select('id, name, planning_area_id, non_residential')
    .eq('non_residential', false)

  if (!neighbourhoods) {
    console.log('No neighbourhoods found')
    return
  }

  // Filter city_core neighbourhoods
  const cityCoreNeighbourhoods = neighbourhoods.filter(n => 
    cityCoreNames.includes(n.name.toUpperCase().trim())
  )

  // Get planning areas
  const planningAreaIds = [...new Set(cityCoreNeighbourhoods.map(n => n.planning_area_id).filter(Boolean))]
  const { data: planningAreas } = await supabase
    .from('planning_areas')
    .select('id, name')
    .in('id', planningAreaIds)

  const paMap = new Map((planningAreas || []).map(pa => [pa.id, pa.name]))

  // Get HDB data
  const neighbourhoodIds = cityCoreNeighbourhoods.map(n => n.id)
  const { data: hdbData } = await supabase
    .from('neighbourhood_summary')
    .select('neighbourhood_id, tx_12m, median_price_12m')
    .in('neighbourhood_id', neighbourhoodIds)
    .gt('tx_12m', 0)

  const hdbMap = new Map((hdbData || []).map(h => [h.neighbourhood_id, h]))

  // Group by planning area
  const byPA = new Map<string, Array<{
    name: string
    hasHdb: boolean
    tx_12m: number | null
    rating_mode: string | null
  }>>()

  for (const nbhd of cityCoreNeighbourhoods) {
    const paName = nbhd.planning_area_id ? paMap.get(nbhd.planning_area_id) || 'Unknown' : 'No planning area'
    if (!byPA.has(paName)) byPA.set(paName, [])
    
    const hdb = hdbMap.get(nbhd.id)
    const note = cityCoreMap.get(nbhd.name.toUpperCase().trim())
    
    byPA.get(paName)!.push({
      name: nbhd.name,
      hasHdb: !!hdb,
      tx_12m: hdb?.tx_12m || null,
      rating_mode: note?.rating_mode || null
    })
  }

  console.log('City Core Neighbourhoods by Planning Area:\n')
  console.log('='.repeat(80))
  
  for (const [pa, nbs] of Array.from(byPA.entries()).sort()) {
    console.log(`\n${pa}:`)
    for (const nb of nbs.sort((a, b) => a.name.localeCompare(b.name))) {
      const status = nb.hasHdb 
        ? (nb.rating_mode === 'residential_scored' ? '✅ Scored' : '⚠️  Has HDB but not_scored')
        : (nb.rating_mode === 'not_scored' ? '✓ Correctly not_scored' : '⚠️  No HDB but scored')
      console.log(`  - ${nb.name}: ${status}${nb.tx_12m ? ` (${nb.tx_12m} tx)` : ''}`)
    }
  }

  console.log('\n' + '='.repeat(80))
  
  // Summary
  const total = cityCoreNeighbourhoods.length
  const withHdb = cityCoreNeighbourhoods.filter(n => hdbMap.has(n.id)).length
  const scored = cityCoreNeighbourhoods.filter(n => {
    const note = cityCoreMap.get(n.name.toUpperCase().trim())
    return note?.rating_mode === 'residential_scored'
  }).length
  const withHdbButNotScored = cityCoreNeighbourhoods.filter(n => {
    const hasHdb = hdbMap.has(n.id)
    const note = cityCoreMap.get(n.name.toUpperCase().trim())
    return hasHdb && note?.rating_mode !== 'residential_scored'
  }).length

  console.log('\n=== Summary ===\n')
  console.log(`Total city_core residential neighbourhoods: ${total}`)
  console.log(`  - With HDB data: ${withHdb}`)
  console.log(`  - Currently scored: ${scored}`)
  console.log(`  - With HDB but not_scored (needs fix): ${withHdbButNotScored}`)
}

checkAllCityCore().catch(console.error)
