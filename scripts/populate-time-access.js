/**
 * Populate town_time_access table with data for all Singapore HDB towns
 * 
 * Data sources:
 * - Centrality: URA definitions (Central Area + City Fringe = central)
 * - MRT Density: Based on station count (≥3 = high, 1-2 = medium, 0 = low)
 * - Transfer Complexity: Based on MRT line structure (NSL/EWL/CCL direct = direct, needs transfer = 1_transfer, edge = 2_plus)
 * - Regional Hub Access: Based on proximity to regional centres (Jurong East, Tampines, Woodlands, Punggol)
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js')

// Configuration - use service role key for write access
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: Missing Supabase credentials')
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY (or NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY)')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Town Time & Access data
// Based on Singapore MRT structure and URA planning definitions
const townTimeAccessData = [
  // Central Area & City Fringe (central)
  { town: 'CENTRAL AREA', centrality: 'central', mrtDensity: 'high', transferComplexity: 'direct', regionalHubAccess: 'yes' },
  { town: 'QUEENSTOWN', centrality: 'central', mrtDensity: 'high', transferComplexity: 'direct', regionalHubAccess: 'no' },
  { town: 'BISHAN', centrality: 'central', mrtDensity: 'high', transferComplexity: 'direct', regionalHubAccess: 'no' },
  { town: 'TOA PAYOH', centrality: 'central', mrtDensity: 'high', transferComplexity: 'direct', regionalHubAccess: 'no' },
  { town: 'KALLANG/WHAMPOA', centrality: 'central', mrtDensity: 'medium', transferComplexity: '1_transfer', regionalHubAccess: 'no' },
  { town: 'MARINE PARADE', centrality: 'central', mrtDensity: 'low', transferComplexity: '1_transfer', regionalHubAccess: 'no' },
  { town: 'GEYLANG', centrality: 'central', mrtDensity: 'medium', transferComplexity: '1_transfer', regionalHubAccess: 'no' },
  { town: 'BUKIT MERAH', centrality: 'central', mrtDensity: 'medium', transferComplexity: 'direct', regionalHubAccess: 'no' },
  { town: 'BUKIT TIMAH', centrality: 'central', mrtDensity: 'medium', transferComplexity: 'direct', regionalHubAccess: 'no' },
  
  // Regional Hubs (non_central, but yes for regional hub access)
  { town: 'JURONG EAST', centrality: 'non_central', mrtDensity: 'high', transferComplexity: 'direct', regionalHubAccess: 'yes' },
  { town: 'TAMPINES', centrality: 'non_central', mrtDensity: 'high', transferComplexity: 'direct', regionalHubAccess: 'yes' },
  { town: 'WOODLANDS', centrality: 'non_central', mrtDensity: 'high', transferComplexity: 'direct', regionalHubAccess: 'yes' },
  { town: 'PUNGGOL', centrality: 'non_central', mrtDensity: 'high', transferComplexity: '1_transfer', regionalHubAccess: 'yes' },
  
  // Towns adjacent to regional hubs (partial access)
  { town: 'JURONG WEST', centrality: 'non_central', mrtDensity: 'medium', transferComplexity: '1_transfer', regionalHubAccess: 'partial' },
  { town: 'SENGKANG', centrality: 'non_central', mrtDensity: 'high', transferComplexity: '1_transfer', regionalHubAccess: 'partial' },
  { town: 'SERANGOON', centrality: 'non_central', mrtDensity: 'high', transferComplexity: 'direct', regionalHubAccess: 'partial' },
  
  // Established towns with good MRT access (non_central)
  { town: 'ANG MO KIO', centrality: 'non_central', mrtDensity: 'high', transferComplexity: 'direct', regionalHubAccess: 'no' },
  { town: 'BEDOK', centrality: 'non_central', mrtDensity: 'high', transferComplexity: 'direct', regionalHubAccess: 'no' },
  { town: 'CLEMENTI', centrality: 'non_central', mrtDensity: 'high', transferComplexity: 'direct', regionalHubAccess: 'no' },
  { town: 'HOUGANG', centrality: 'non_central', mrtDensity: 'high', transferComplexity: '1_transfer', regionalHubAccess: 'no' },
  { town: 'PASIR RIS', centrality: 'non_central', mrtDensity: 'medium', transferComplexity: '1_transfer', regionalHubAccess: 'no' },
  
  // Towns with moderate MRT access
  { town: 'BUKIT BATOK', centrality: 'non_central', mrtDensity: 'medium', transferComplexity: '1_transfer', regionalHubAccess: 'partial' },
  { town: 'BUKIT PANJANG', centrality: 'non_central', mrtDensity: 'medium', transferComplexity: '1_transfer', regionalHubAccess: 'no' },
  { town: 'CHOA CHU KANG', centrality: 'non_central', mrtDensity: 'high', transferComplexity: '1_transfer', regionalHubAccess: 'no' },
  { town: 'YISHUN', centrality: 'non_central', mrtDensity: 'high', transferComplexity: 'direct', regionalHubAccess: 'no' },
  
  // Towns with lower MRT density
  { town: 'SEMBAWANG', centrality: 'non_central', mrtDensity: 'low', transferComplexity: '2_plus', regionalHubAccess: 'no' },
]

async function populateTimeAccess() {
  console.log('Starting to populate town_time_access table...')
  
  let successCount = 0
  let errorCount = 0
  
  for (const data of townTimeAccessData) {
    try {
      const { error } = await supabase
        .from('town_time_access')
        .upsert({
          town: data.town,
          centrality: data.centrality,
          mrt_density: data.mrtDensity,
          transfer_complexity: data.transferComplexity,
          regional_hub_access: data.regionalHubAccess,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'town'
        })
      
      if (error) {
        console.error(`Error inserting ${data.town}:`, error.message)
        errorCount++
      } else {
        console.log(`✓ Inserted/Updated: ${data.town}`)
        successCount++
      }
    } catch (err) {
      console.error(`Exception inserting ${data.town}:`, err)
      errorCount++
    }
  }
  
  console.log('\n=== Summary ===')
  console.log(`Successfully inserted/updated: ${successCount} towns`)
  console.log(`Errors: ${errorCount} towns`)
  
  if (errorCount === 0) {
    console.log('\n✅ All towns populated successfully!')
  } else {
    console.log(`\n⚠️  ${errorCount} towns had errors. Please check the logs above.`)
  }
}

// Run the script
populateTimeAccess()
  .then(() => {
    console.log('\nScript completed.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

