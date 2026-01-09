/**
 * Check which neighbourhoods are marked as 'not_scored' but have HDB resale data
 * Run: npx ts-node scripts/check-not-scored-with-hdb.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkNotScoredWithHdbData() {
  console.log('Checking neighbourhoods marked as not_scored but with HDB data...\n')

  // Step 1: Get all not_scored neighbourhoods
  const { data: notScoredNotes, error: error1 } = await supabase
    .from('neighbourhood_living_notes')
    .select('neighbourhood_name, zone_type, short_note')
    .eq('rating_mode', 'not_scored')

  if (error1) {
    console.error('Error fetching not_scored neighbourhoods:', error1)
    return
  }

  const notScoredNames = new Set(notScoredNotes.map(n => n.neighbourhood_name.toUpperCase().trim()))
  console.log(`Found ${notScoredNames.size} neighbourhood(s) marked as not_scored\n`)

  // Step 2: Get all residential neighbourhoods
  const { data: allNeighbourhoods, error: error2 } = await supabase
    .from('neighbourhoods')
    .select('id, name, planning_area_id, non_residential')
    .eq('non_residential', false)

  if (error2) {
    console.error('Error fetching neighbourhoods:', error2)
    return
  }

  // Step 3: Get neighbourhoods with HDB data
  const { data: withHdb, error: error3 } = await supabase
    .from('neighbourhood_summary')
    .select('neighbourhood_id, tx_12m, median_price_12m, median_lease_years_12m')
    .gt('tx_12m', 0)

  if (error3) {
    console.error('Error fetching neighbourhoods with HDB data:', error3)
    return
  }

  const hdbNeighbourhoodIds = new Set(withHdb.map(n => n.neighbourhood_id))
  const hdbMap = new Map(withHdb.map(n => [n.neighbourhood_id, n]))

  // Step 4: Get planning areas for display
  const planningAreaIds = [...new Set(allNeighbourhoods.map(n => n.planning_area_id).filter(Boolean))]
  const { data: planningAreas } = await supabase
    .from('planning_areas')
    .select('id, name')
    .in('id', planningAreaIds)

  const planningAreaMap = new Map((planningAreas || []).map(pa => [pa.id, pa.name]))

  // Step 5: Match them
  const issues: Array<{
    id: string
    name: string
    planning_area: string | null
    zone_type: string | null
    short_note: string | null
    tx_12m: number
    median_price_12m: number | null
    median_lease_years_12m: number | null
  }> = []

  for (const nbhd of allNeighbourhoods) {
    const normalizedName = nbhd.name.toUpperCase().trim()
    if (notScoredNames.has(normalizedName) && hdbNeighbourhoodIds.has(nbhd.id)) {
      const note = notScoredNotes.find(n => n.neighbourhood_name.toUpperCase().trim() === normalizedName)
      const summary = hdbMap.get(nbhd.id)
      if (summary) {
        issues.push({
          id: nbhd.id,
          name: nbhd.name,
          planning_area: nbhd.planning_area_id ? planningAreaMap.get(nbhd.planning_area_id) || null : null,
          zone_type: note?.zone_type || null,
          short_note: note?.short_note || null,
          tx_12m: summary.tx_12m || 0,
          median_price_12m: summary.median_price_12m,
          median_lease_years_12m: summary.median_lease_years_12m
        })
      }
    }
  }

  // Step 6: Display results
  if (issues.length > 0) {
    console.log(`\n⚠️  Found ${issues.length} neighbourhood(s) marked as not_scored but with HDB data:\n`)
    console.log('='.repeat(80))
    
    issues.forEach((n, index) => {
      console.log(`\n${index + 1}. ${n.name}`)
      if (n.planning_area) {
        console.log(`   Planning Area: ${n.planning_area}`)
      }
      console.log(`   Zone Type: ${n.zone_type || 'N/A'}`)
      console.log(`   Transactions (12m): ${n.tx_12m}`)
      if (n.median_price_12m) {
        console.log(`   Median Price: $${Number(n.median_price_12m).toLocaleString()}`)
      }
      if (n.median_lease_years_12m) {
        console.log(`   Median Lease: ${Number(n.median_lease_years_12m).toFixed(1)} years`)
      }
      if (n.short_note) {
        console.log(`   Note: ${n.short_note}`)
      }
    })
    
    console.log('\n' + '='.repeat(80))
  } else {
    console.log('\n✅ No neighbourhoods found with this issue.')
    console.log('All not_scored neighbourhoods correctly have no HDB data.')
  }

  // Step 7: Summary statistics
  console.log('\n=== Summary Statistics ===\n')

  let totalNotScored = 0
  let notScoredWithHdb = 0
  let notScoredWithoutHdb = 0

  for (const nbhd of allNeighbourhoods) {
    const normalizedName = nbhd.name.toUpperCase().trim()
    if (notScoredNames.has(normalizedName)) {
      totalNotScored++
      if (hdbNeighbourhoodIds.has(nbhd.id)) {
        notScoredWithHdb++
      } else {
        notScoredWithoutHdb++
      }
    }
  }

  console.log(`Total not_scored residential neighbourhoods: ${totalNotScored}`)
  console.log(`  ✅ With HDB data (should be scored): ${notScoredWithHdb}`)
  console.log(`  ✓ Without HDB data (correctly not_scored): ${notScoredWithoutHdb}`)

  // Step 8: Breakdown by zone_type
  console.log('\n=== Breakdown by Zone Type ===\n')
  
  const byZoneType = new Map<string, { total: number; withHdb: number; withoutHdb: number }>()
  
  for (const nbhd of allNeighbourhoods) {
    const normalizedName = nbhd.name.toUpperCase().trim()
    if (notScoredNames.has(normalizedName)) {
      const note = notScoredNotes.find(n => n.neighbourhood_name.toUpperCase().trim() === normalizedName)
      const zoneType = note?.zone_type || 'unknown'
      
      if (!byZoneType.has(zoneType)) {
        byZoneType.set(zoneType, { total: 0, withHdb: 0, withoutHdb: 0 })
      }
      
      const stats = byZoneType.get(zoneType)!
      stats.total++
      if (hdbNeighbourhoodIds.has(nbhd.id)) {
        stats.withHdb++
      } else {
        stats.withoutHdb++
      }
    }
  }

  for (const [zoneType, stats] of Array.from(byZoneType.entries()).sort((a, b) => b[1].withHdb - a[1].withHdb)) {
    console.log(`${zoneType}:`)
    console.log(`  Total: ${stats.total}`)
    console.log(`  With HDB data: ${stats.withHdb}`)
    console.log(`  Without HDB data: ${stats.withoutHdb}`)
    console.log('')
  }
}

checkNotScoredWithHdbData().catch(console.error)
