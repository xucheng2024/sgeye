/**
 * Check which neighbourhoods are marked as 'not_scored' but have HDB resale data
 * Run: node scripts/check_not_scored_with_hdb.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

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

  // Query 1: Find all neighbourhoods marked as not_scored but have HDB transaction data
  const { data: neighbourhoods, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT 
        n.id,
        n.name,
        pa.name as planning_area_name,
        nln.zone_type,
        nln.rating_mode,
        nln.short_note,
        COUNT(DISTINCT r.id) as total_transactions,
        COUNT(DISTINCT CASE WHEN r.month >= CURRENT_DATE - INTERVAL '12 months' THEN r.id END) as tx_12m,
        ns.tx_12m as summary_tx_12m,
        ns.median_price_12m,
        ns.median_lease_years_12m
      FROM neighbourhoods n
      INNER JOIN neighbourhood_living_notes nln ON UPPER(TRIM(n.name)) = UPPER(TRIM(nln.neighbourhood_name))
      LEFT JOIN planning_areas pa ON n.planning_area_id = pa.id
      LEFT JOIN raw_resale_2017 r ON n.id = r.neighbourhood_id
      LEFT JOIN neighbourhood_summary ns ON n.id = ns.neighbourhood_id
      WHERE nln.rating_mode = 'not_scored'
        AND n.non_residential = false
        AND (
          r.id IS NOT NULL
          OR (ns.tx_12m IS NOT NULL AND ns.tx_12m > 0)
        )
      GROUP BY n.id, n.name, pa.name, nln.zone_type, nln.rating_mode, nln.short_note, ns.tx_12m, ns.median_price_12m, ns.median_lease_years_12m
      ORDER BY total_transactions DESC, tx_12m DESC, n.name;
    `
  })

  if (error) {
    console.error('Error:', error)
    // Try direct query instead
    await directQuery()
    return
  }

  if (neighbourhoods && neighbourhoods.length > 0) {
    console.log(`Found ${neighbourhoods.length} neighbourhood(s) marked as not_scored but with HDB data:\n`)
    neighbourhoods.forEach(n => {
      console.log(`- ${n.name} (${n.planning_area_name || 'N/A'})`)
      console.log(`  Zone Type: ${n.zone_type}`)
      console.log(`  Total Transactions: ${n.total_transactions || 0}`)
      console.log(`  Transactions (12m): ${n.tx_12m || 0} (summary: ${n.summary_tx_12m || 0})`)
      if (n.median_price_12m) {
        console.log(`  Median Price: $${Number(n.median_price_12m).toLocaleString()}`)
      }
      if (n.short_note) {
        console.log(`  Note: ${n.short_note}`)
      }
      console.log('')
    })
  } else {
    console.log('No neighbourhoods found with this issue.')
  }

  // Query 2: Summary statistics
  await getSummary()
}

async function directQuery() {
  console.log('Using direct queries...\n')

  // Get all not_scored neighbourhoods
  const { data: notScored, error: error1 } = await supabase
    .from('neighbourhood_living_notes')
    .select('neighbourhood_name, zone_type, short_note')
    .eq('rating_mode', 'not_scored')

  if (error1) {
    console.error('Error fetching not_scored neighbourhoods:', error1)
    return
  }

  const notScoredNames = notScored.map(n => n.neighbourhood_name.toUpperCase().trim())

  // Get neighbourhoods with HDB data
  const { data: withHdb, error: error2 } = await supabase
    .from('neighbourhood_summary')
    .select('neighbourhood_id, tx_12m, median_price_12m')
    .gt('tx_12m', 0)

  if (error2) {
    console.error('Error fetching neighbourhoods with HDB data:', error2)
    return
  }

  const hdbNeighbourhoodIds = new Set(withHdb.map(n => n.neighbourhood_id))

  // Get neighbourhood details
  const { data: allNeighbourhoods, error: error3 } = await supabase
    .from('neighbourhoods')
    .select('id, name, planning_area_id, non_residential')
    .eq('non_residential', false)
    .in('id', Array.from(hdbNeighbourhoodIds))

  if (error3) {
    console.error('Error fetching neighbourhoods:', error3)
    return
  }

  // Match them
  const issues = []
  for (const nbhd of allNeighbourhoods) {
    const normalizedName = nbhd.name.toUpperCase().trim()
    if (notScoredNames.includes(normalizedName)) {
      const note = notScored.find(n => n.neighbourhood_name.toUpperCase().trim() === normalizedName)
      const summary = withHdb.find(s => s.neighbourhood_id === nbhd.id)
      issues.push({
        name: nbhd.name,
        zone_type: note?.zone_type,
        short_note: note?.short_note,
        tx_12m: summary?.tx_12m || 0,
        median_price_12m: summary?.median_price_12m
      })
    }
  }

  if (issues.length > 0) {
    console.log(`Found ${issues.length} neighbourhood(s) marked as not_scored but with HDB data:\n`)
    issues.forEach(n => {
      console.log(`- ${n.name}`)
      console.log(`  Zone Type: ${n.zone_type}`)
      console.log(`  Transactions (12m): ${n.tx_12m}`)
      if (n.median_price_12m) {
        console.log(`  Median Price: $${Number(n.median_price_12m).toLocaleString()}`)
      }
      if (n.short_note) {
        console.log(`  Note: ${n.short_note}`)
      }
      console.log('')
    })
  } else {
    console.log('No neighbourhoods found with this issue.')
  }

  await getSummary()
}

async function getSummary() {
  console.log('\n=== Summary Statistics ===\n')

  // Get all not_scored residential neighbourhoods
  const { data: notScoredNotes, error: error1 } = await supabase
    .from('neighbourhood_living_notes')
    .select('neighbourhood_name')
    .eq('rating_mode', 'not_scored')

  if (error1) {
    console.error('Error:', error1)
    return
  }

  const notScoredNames = new Set(notScoredNotes.map(n => n.neighbourhood_name.toUpperCase().trim()))

  // Get all neighbourhoods
  const { data: allNeighbourhoods, error: error2 } = await supabase
    .from('neighbourhoods')
    .select('id, name, non_residential')
    .eq('non_residential', false)

  if (error2) {
    console.error('Error:', error2)
    return
  }

  // Get neighbourhoods with HDB data
  const { data: withHdb, error: error3 } = await supabase
    .from('neighbourhood_summary')
    .select('neighbourhood_id, tx_12m')
    .gt('tx_12m', 0)

  if (error3) {
    console.error('Error:', error3)
    return
  }

  const hdbNeighbourhoodIds = new Set(withHdb.map(n => n.neighbourhood_id))

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
  console.log(`  - With HDB data: ${notScoredWithHdb}`)
  console.log(`  - Without HDB data: ${notScoredWithoutHdb}`)
}

checkNotScoredWithHdbData().catch(console.error)
