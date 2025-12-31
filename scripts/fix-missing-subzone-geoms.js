/**
 * Fix missing geometry data for subzones
 * 
 * These 11 subzones have MultiPolygon geometry in GeoJSON but weren't imported correctly
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('='.repeat(60))
  console.log('Fix Missing Subzone Geometries')
  console.log('='.repeat(60))
  
  // Load GeoJSON
  const geojsonPath = 'data/subzones.geojson'
  if (!fs.existsSync(geojsonPath)) {
    console.error('Error: GeoJSON file not found:', geojsonPath)
    process.exit(1)
  }
  
  const data = JSON.parse(fs.readFileSync(geojsonPath, 'utf-8'))
  
  // These are the subzones missing geometry
  const missingNames = [
    'CHANGI BAY',
    'PULAU PUNGGOL TIMOR',
    'MURAI',
    'NORTH-EASTERN ISLANDS',
    'TUAS VIEW EXTENSION',
    'JURONG PORT',
    'JURONG ISLAND AND BUKOM',
    'SUDONG',
    'SEMAKAU',
    'SOUTHERN GROUP',
    'SENTOSA'
  ]
  
  console.log(`\nFound ${missingNames.length} subzones to fix\n`)
  
  let fixed = 0
  let failed = 0
  
  for (const name of missingNames) {
    const feature = data.features.find(f => 
      (f.properties.SUBZONE_N || f.properties.name || '') === name
    )
    
    if (!feature || !feature.geometry) {
      console.log(`✗ ${name}: Not found in GeoJSON`)
      failed++
      continue
    }
    
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const geomJson = JSON.stringify(feature.geometry)
    
    console.log(`Fixing ${name} (${feature.geometry.type})...`)
    
    try {
      // Use update_subzone_geom function
      const { error } = await supabase.rpc('update_subzone_geom', {
        p_id: id,
        p_geom_json: JSON.parse(geomJson)
      })
      
      if (error) {
        console.log(`  ✗ Error: ${error.message}`)
        failed++
      } else {
        console.log(`  ✓ Fixed`)
        fixed++
      }
    } catch (err) {
      console.log(`  ✗ Exception: ${err.message}`)
      failed++
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log(`Fixed: ${fixed} | Failed: ${failed}`)
  console.log('='.repeat(60))
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

