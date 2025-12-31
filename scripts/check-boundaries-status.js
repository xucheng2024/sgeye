/**
 * Check current status of boundaries in database
 */

// Try to load dotenv if available
try {
  require('dotenv').config({ path: '.env.local' })
} catch (e) {
  // dotenv not installed, use environment variables directly
}

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkStatus() {
  console.log('='.repeat(60))
  console.log('Checking Boundaries Status')
  console.log('='.repeat(60))
  
  // Check planning areas
  const { count: paCount, data: paData } = await supabase
    .from('planning_areas')
    .select('*', { count: 'exact', head: false })
  
  const paWithGeom = (paData || []).filter(p => p.geom).length
  
  console.log(`\n📊 Planning Areas:`)
  console.log(`   Total: ${paCount || 0}`)
  console.log(`   With geometry: ${paWithGeom}`)
  
  // Check subzones
  const { count: szCount, data: szData } = await supabase
    .from('subzones')
    .select('*', { count: 'exact', head: false })
  
  const szWithGeom = (szData || []).filter(s => s.geom).length
  
  console.log(`\n📊 Subzones:`)
  console.log(`   Total: ${szCount || 0}`)
  console.log(`   With geometry: ${szWithGeom}`)
  
  // Check sealed neighbourhoods
  const { count: nhCount, data: nhData } = await supabase
    .from('neighbourhoods')
    .select('*', { count: 'exact', head: false })
    .eq('type', 'sealed')
  
  const nhWithGeom = (nhData || []).filter(n => n.geom).length
  
  console.log(`\n📊 Sealed Neighbourhoods:`)
  console.log(`   Total: ${nhCount || 0}`)
  console.log(`   With geometry: ${nhWithGeom}`)
  
  console.log('\n' + '='.repeat(60))
  
  // Recommendations
  if (paWithGeom === 0 && szWithGeom === 0) {
    console.log('\n⚠️  No boundary data found!')
    console.log('\nNext steps:')
    console.log('1. Get planning areas and subzones GeoJSON/Shapefile from:')
    console.log('   - data.gov.sg (https://data.gov.sg/datasets)')
    console.log('   - URA (https://www.ura.gov.sg/Corporate/Planning/Master-Plan)')
    console.log('2. Import using:')
    console.log('   node scripts/import-planning-areas-subzones.js --file data/planning-areas.geojson')
    console.log('   node scripts/import-planning-areas-subzones.js --file data/subzones.geojson')
  } else if (paWithGeom > 0 && szWithGeom > 0 && nhWithGeom === 0) {
    console.log('\n✅ Boundary data imported!')
    console.log('\nNext step: Create sealed neighbourhoods')
    console.log('   Run: node scripts/import-planning-areas-subzones.js --create-neighbourhoods')
    console.log('   Or execute: supabase/migrations/create_sealed_neighbourhoods_from_subzones.sql')
  } else if (nhWithGeom > 0) {
    console.log('\n✅ All boundaries ready!')
    console.log('\nNext step: Run geocoding script')
    console.log('   node scripts/geocode-raw-resale.js')
  }
  
  console.log('='.repeat(60))
}

checkStatus().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})

