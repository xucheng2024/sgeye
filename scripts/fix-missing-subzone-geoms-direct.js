/**
 * Fix missing geometry data for subzones (Direct SQL approach)
 * 
 * These 11 subzones have MultiPolygon geometry in GeoJSON but weren't imported correctly
 * because the table was defined as GEOGRAPHY(POLYGON) instead of GEOGRAPHY
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

async function executeSQL(sql) {
  // Try using Supabase's SQL execution if available
  // Otherwise, we'll need to use a different approach
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql })
    if (!error) return { success: true }
    return { success: false, error }
  } catch (e) {
    return { success: false, error: e }
  }
}

async function fixSubzoneGeom(id, geomJson) {
  // Direct update using the helper function
  const { error } = await supabase.rpc('update_subzone_geom', {
    p_id: id,
    p_geom_json: JSON.parse(geomJson)
  })
  
  return { success: !error, error }
}

async function main() {
  console.log('='.repeat(60))
  console.log('Fix Missing Subzone Geometries')
  console.log('='.repeat(60))
  console.log('\n⚠️  注意：需要先修改表结构支持 MultiPolygon')
  console.log('请在 Supabase Dashboard 中执行：')
  console.log('  supabase/migrations/fix_geom_type_for_multipolygon.sql')
  console.log('')
  console.log('或者手动执行以下 SQL：')
  console.log('')
  console.log('ALTER TABLE subzones ALTER COLUMN geom TYPE GEOGRAPHY;')
  console.log('ALTER TABLE neighbourhoods ALTER COLUMN geom TYPE GEOGRAPHY;')
  console.log('ALTER TABLE planning_areas ALTER COLUMN geom TYPE GEOGRAPHY;')
  console.log('')
  
  // Load GeoJSON
  const geojsonPath = 'data/subzones.geojson'
  if (!fs.existsSync(geojsonPath)) {
    console.error('Error: GeoJSON file not found:', geojsonPath)
    process.exit(1)
  }
  
  const data = JSON.parse(fs.readFileSync(geojsonPath, 'utf-8'))
  
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
  
  console.log(`\n准备修复 ${missingNames.length} 个 subzones\n`)
  
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
    
    const result = await fixSubzoneGeom(id, geomJson)
    
    if (result.success) {
      console.log(`  ✓ Fixed`)
      fixed++
    } else {
      console.log(`  ✗ Error: ${result.error?.message || 'Unknown error'}`)
      failed++
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log(`Fixed: ${fixed} | Failed: ${failed}`)
  console.log('='.repeat(60))
  
  if (failed > 0) {
    console.log('\n如果失败，请先执行 SQL 迁移修改表结构：')
    console.log('  supabase/migrations/fix_geom_type_for_multipolygon.sql')
  }
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

