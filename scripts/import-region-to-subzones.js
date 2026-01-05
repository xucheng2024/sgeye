/**
 * Import 5 Major Regions to Subzones from GeoJSON
 * 
 * This script reads the subzones.geojson file and updates the region field
 * in the subzones table based on REGION_N field from the GeoJSON.
 * 
 * Usage:
 * node scripts/import-region-to-subzones.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables manually if dotenv fails
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

/**
 * Map REGION_N from GeoJSON to region values in database
 */
function mapRegionName(regionName) {
  if (!regionName) return null
  
  const normalized = regionName.toUpperCase().trim()
  
  // Map GeoJSON region names to database values
  const mapping = {
    'CENTRAL REGION': 'Central',
    'EAST REGION': 'East',
    'NORTH REGION': 'North',
    'NORTH-EAST REGION': 'North-East',
    'NORTHEAST REGION': 'North-East',
    'WEST REGION': 'West'
  }
  
  return mapping[normalized] || null
}

/**
 * Generate subzone ID from name (same logic as import script)
 */
function generateSubzoneId(name) {
  if (!name) return null
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

/**
 * Import regions from GeoJSON
 */
async function importRegions() {
  const geojsonPath = path.join(__dirname, '..', 'data', 'subzones.geojson')
  
  if (!fs.existsSync(geojsonPath)) {
    console.error(`Error: GeoJSON file not found: ${geojsonPath}`)
    process.exit(1)
  }
  
  console.log(`Reading GeoJSON from: ${geojsonPath}`)
  const content = fs.readFileSync(geojsonPath, 'utf-8')
  const geojson = JSON.parse(content)
  
  if (!geojson.features || !Array.isArray(geojson.features)) {
    console.error('Error: Invalid GeoJSON format')
    process.exit(1)
  }
  
  console.log(`Found ${geojson.features.length} features`)
  
  // Build mapping: subzone name -> region
  const regionMap = new Map()
  let skipped = 0
  
  for (const feature of geojson.features) {
    const props = feature.properties || {}
    const subzoneName = props.SUBZONE_N || props.name
    const regionName = props.REGION_N
    
    if (!subzoneName) {
      skipped++
      continue
    }
    
    const subzoneId = generateSubzoneId(subzoneName)
    const region = mapRegionName(regionName)
    
    if (region) {
      regionMap.set(subzoneId, region)
    } else if (regionName) {
      console.warn(`  Warning: Unknown region "${regionName}" for subzone "${subzoneName}"`)
    }
  }
  
  console.log(`\nMapped ${regionMap.size} subzones to regions`)
  console.log(`Skipped ${skipped} features without subzone name`)
  
  // Count regions
  const regionCounts = new Map()
  for (const region of regionMap.values()) {
    regionCounts.set(region, (regionCounts.get(region) || 0) + 1)
  }
  
  console.log('\nRegion distribution:')
  for (const [region, count] of Array.from(regionCounts.entries()).sort()) {
    console.log(`  ${region}: ${count}`)
  }
  
  // Update database
  console.log('\nUpdating database...')
  let updated = 0
  let failed = 0
  let notFound = 0
  
  for (const [subzoneId, region] of regionMap.entries()) {
    const { error } = await supabase
      .from('subzones')
      .update({ 
        region: region,
        updated_at: new Date().toISOString()
      })
      .eq('id', subzoneId)
    
    if (error) {
      // Check if subzone exists
      const { data } = await supabase
        .from('subzones')
        .select('id')
        .eq('id', subzoneId)
        .single()
      
      if (!data) {
        notFound++
        if (notFound <= 5) {
          console.warn(`  Subzone not found in DB: ${subzoneId}`)
        }
      } else {
        console.error(`  Error updating ${subzoneId}:`, error.message)
        failed++
      }
    } else {
      updated++
      if (updated % 100 === 0) {
        process.stderr.write(`  Updated ${updated}/${regionMap.size}...\r`)
      }
    }
  }
  
  console.log(`\n\nResults:`)
  console.log(`  Updated: ${updated}`)
  console.log(`  Failed: ${failed}`)
  console.log(`  Not found in DB: ${notFound}`)
  
  // Verify update
  console.log('\nVerifying update...')
  const { data: regionStats, error: statsError } = await supabase
    .from('subzones')
    .select('region')
  
  if (!statsError && regionStats) {
    const stats = new Map()
    for (const row of regionStats) {
      const region = row.region || 'NULL'
      stats.set(region, (stats.get(region) || 0) + 1)
    }
    
    console.log('\nDatabase region distribution:')
    for (const [region, count] of Array.from(stats.entries()).sort()) {
      console.log(`  ${region}: ${count}`)
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('='.repeat(60))
  console.log('Import 5 Major Regions to Subzones')
  console.log('='.repeat(60))
  
  await importRegions()
  
  console.log('\n' + '='.repeat(60))
  console.log('Import complete!')
  console.log('='.repeat(60))
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

