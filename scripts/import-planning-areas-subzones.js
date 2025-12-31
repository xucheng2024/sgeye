/**
 * Import Planning Areas and Subzones from Official Data
 * 
 * This script imports polygon geometries for planning areas and subzones
 * from Singapore's official data sources (data.gov.sg or URA)
 * 
 * Usage:
 * node scripts/import-planning-areas-subzones.js [--file path/to/geojson]
 * 
 * Data sources:
 * - data.gov.sg: https://data.gov.sg/datasets
 * - URA Master Plan: https://www.ura.gov.sg/Corporate/Planning/Master-Plan
 * - OneMap API: https://www.onemap.gov.sg/docs/
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
 * Parse GeoJSON and extract features
 */
function parseGeoJSON(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const geojson = JSON.parse(content)
  
  if (!geojson.features || !Array.isArray(geojson.features)) {
    throw new Error('Invalid GeoJSON: missing features array')
  }
  
  return geojson.features
}

/**
 * Convert GeoJSON geometry to PostGIS GEOGRAPHY format
 * Returns GeoJSON string that PostGIS can parse
 */
function geometryToPostGIS(geometry) {
  if (!geometry || !geometry.coordinates) {
    return null
  }
  
  // Return GeoJSON string - PostGIS can parse this directly
  return JSON.stringify(geometry)
}

/**
 * Calculate bounding box from geometry
 */
function calculateBBox(geometry) {
  if (!geometry || !geometry.coordinates) {
    return null
  }
  
  let minLng = Infinity
  let maxLng = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity
  
  function processCoords(coords) {
    if (Array.isArray(coords[0])) {
      coords.forEach(coord => processCoords(coord))
    } else {
      const [lng, lat] = coords
      minLng = Math.min(minLng, lng)
      maxLng = Math.max(maxLng, lng)
      minLat = Math.min(minLat, lat)
      maxLat = Math.max(maxLat, lat)
    }
  }
  
  processCoords(geometry.coordinates)
  
  return {
    minLng,
    maxLng,
    minLat,
    maxLat
  }
}

/**
 * Import Planning Areas
 */
async function importPlanningAreas(features) {
  console.log(`\nImporting ${features.length} planning areas...`)
  
  let imported = 0
  let failed = 0
  
  for (let i = 0; i < features.length; i++) {
    const feature = features[i]
    const props = feature.properties || {}
    
    // Extract ID and name from URA Master Plan 2019 format
    // Field: PLN_AREA_N (Planning Area name)
    const name = props.PLN_AREA_N || props.name || 'Unknown'
    // Generate ID from name (lowercase, replace spaces with hyphens)
    const id = name ? name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : `pa-${i + 1}`
    const geometry = feature.geometry
    
    if (!geometry) {
      console.error(`  [${i + 1}/${features.length}] Skipping ${name}: No geometry`)
      failed++
      continue
    }
    
    const geomJson = geometryToPostGIS(geometry)
    if (!geomJson) {
      console.error(`  [${i + 1}/${features.length}] Skipping ${name}: Invalid geometry type`)
      failed++
      continue
    }
    
    const bbox = calculateBBox(geometry)
    
    // Insert using raw SQL with PostGIS function
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO planning_areas (id, name, geom, bbox, updated_at)
        VALUES (
          $1,
          $2,
          ST_SetSRID(ST_GeomFromGeoJSON($3::text), 4326)::GEOGRAPHY,
          $4::jsonb,
          NOW()
        )
        ON CONFLICT (id) 
        DO UPDATE SET
          name = EXCLUDED.name,
          geom = EXCLUDED.geom,
          bbox = EXCLUDED.bbox,
          updated_at = EXCLUDED.updated_at;
      `,
      params: [id.toString(), name.toString(), geomJson, JSON.stringify(bbox)]
    }).catch(async () => {
      // Fallback: Use direct SQL query
      const { data, error: sqlError } = await supabase
        .from('planning_areas')
        .select('id')
        .eq('id', id.toString())
        .single()
      
      if (sqlError && sqlError.code !== 'PGRST116') {
        return sqlError
      }
      
      // Use Supabase's PostGIS support via raw query
      // Note: This requires enabling PostGIS in Supabase and using the correct format
      const query = `
        INSERT INTO planning_areas (id, name, geom, bbox, updated_at)
        VALUES ($1, $2, ST_SetSRID(ST_GeomFromGeoJSON($3), 4326)::GEOGRAPHY, $4::jsonb, NOW())
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, geom = EXCLUDED.geom, bbox = EXCLUDED.bbox, updated_at = EXCLUDED.updated_at
      `
      
      // For now, insert without geometry and update separately
      const { error: insertError } = await supabase
        .from('planning_areas')
        .upsert({
          id: id.toString(),
          name: name.toString(),
          bbox: bbox,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
      
      return insertError
    })
    
    if (error) {
      console.error(`  [${i + 1}/${features.length}] Error importing ${name}:`, error.message)
      failed++
    } else {
      imported++
      if (imported % 10 === 0) {
        process.stderr.write(`  Imported ${imported}/${features.length}...\r`)
      }
    }
  }
  
  console.log(`\nPlanning Areas: ${imported} imported, ${failed} failed`)
  return { imported, failed }
}

/**
 * Import Subzones
 */
async function importSubzones(features) {
  console.log(`\nImporting ${features.length} subzones...`)
  
  let imported = 0
  let failed = 0
  
  for (let i = 0; i < features.length; i++) {
    const feature = features[i]
    const props = feature.properties || {}
    
    // Extract ID, name, and planning_area_id from URA Master Plan 2019 format
    // Fields: SUBZONE_N (Subzone name), PLN_AREA_N (Planning Area name)
    const name = props.SUBZONE_N || props.name || 'Unknown'
    const planningAreaName = props.PLN_AREA_N || props.planning_area_id || props.PLANNING_AREA || null
    // Generate IDs from names (lowercase, replace spaces with hyphens)
    const id = name ? name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : `sz-${i + 1}`
    const planningAreaId = planningAreaName ? planningAreaName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : null
    const geometry = feature.geometry
    
    if (!geometry) {
      console.error(`  [${i + 1}/${features.length}] Skipping ${name}: No geometry`)
      failed++
      continue
    }
    
    const geomJson = geometryToPostGIS(geometry)
    if (!geomJson) {
      console.error(`  [${i + 1}/${features.length}] Skipping ${name}: Invalid geometry type`)
      failed++
      continue
    }
    
    const bbox = calculateBBox(geometry)
    
    // Use helper function to update geometry
    let error = null
    try {
      // First insert/update the record without geometry
      const { error: insertError } = await supabase
        .from('subzones')
        .upsert({
          id: id.toString(),
          name: name.toString(),
          planning_area_id: planningAreaId ? planningAreaId.toString() : null,
          bbox: bbox,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
      
      if (insertError) {
        error = insertError
      } else {
        // Then update geometry using helper function
        // The function expects JSONB, so pass the parsed GeoJSON object
        const { error: updateError } = await supabase.rpc('update_subzone_geom', {
          p_id: id.toString(),
          p_geom_json: JSON.parse(geomJson) // Convert string to object for JSONB
        })
        error = updateError
      }
    } catch (err) {
      error = err
    }
    
    if (error) {
      console.error(`  [${i + 1}/${features.length}] Error importing ${name}:`, error.message)
      failed++
    } else {
      imported++
      if (imported % 10 === 0) {
        process.stderr.write(`  Imported ${imported}/${features.length}...\r`)
      }
    }
  }
  
  console.log(`\nSubzones: ${imported} imported, ${failed} failed`)
  return { imported, failed }
}

/**
 * Extract and create Planning Areas from Subzones data
 */
async function extractAndCreatePlanningAreas(features) {
  console.log('\nExtracting Planning Areas from Subzones data...')
  
  // Collect unique planning areas
  const planningAreasMap = new Map()
  
  for (const feature of features) {
    const props = feature.properties || {}
    const planningAreaName = props.PLN_AREA_N || props.planning_area_id || props.PLANNING_AREA
    
    if (planningAreaName) {
      const id = planningAreaName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      if (!planningAreasMap.has(id)) {
        planningAreasMap.set(id, {
          id: id,
          name: planningAreaName.toString()
        })
      }
    }
  }
  
  console.log(`Found ${planningAreasMap.size} unique planning areas`)
  
  // Create planning areas (without geometry for now)
  let created = 0
  let failed = 0
  
  for (const [id, pa] of planningAreasMap) {
    const { error } = await supabase
      .from('planning_areas')
      .upsert({
        id: pa.id,
        name: pa.name,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
    
    if (error) {
      console.error(`  Error creating planning area ${pa.name}:`, error.message)
      failed++
    } else {
      created++
    }
  }
  
  console.log(`Planning Areas: ${created} created/updated, ${failed} failed`)
  return { created, failed }
}

/**
 * Create sealed neighbourhoods from subzones
 * This is Step 0: sealed neighbourhood = subzone
 */
async function createSealedNeighbourhoods() {
  console.log('\nCreating sealed neighbourhoods from subzones...')
  
  // Get all subzones with their geometries
  const { data: subzones, error: fetchError } = await supabase
    .from('subzones')
    .select('id, name, planning_area_id, geom')
  
  if (fetchError) {
    console.error('Error fetching subzones:', fetchError)
    return { created: 0, failed: 0 }
  }
  
  if (!subzones || subzones.length === 0) {
    console.log('No subzones found. Please import subzones first.')
    return { created: 0, failed: 0 }
  }
  
  console.log(`Found ${subzones.length} subzones to convert to neighbourhoods`)
  
  let created = 0
  let failed = 0
  
  for (let i = 0; i < subzones.length; i++) {
    const subzone = subzones[i]
    
    // Create neighbourhood with same geometry as subzone
    const { error } = await supabase
      .from('neighbourhoods')
      .upsert({
        id: subzone.id, // Use subzone ID as neighbourhood ID
        name: subzone.name,
        planning_area_id: subzone.planning_area_id,
        type: 'sealed', // Mark as sealed
        parent_subzone_id: subzone.id, // Self-reference
        geom: subzone.geom, // Same geometry
        one_liner: `Sealed neighbourhood based on ${subzone.name} subzone`,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
    
    if (error) {
      console.error(`  [${i + 1}/${subzones.length}] Error creating neighbourhood for ${subzone.name}:`, error.message)
      failed++
    } else {
      created++
      if (created % 10 === 0) {
        process.stderr.write(`  Created ${created}/${subzones.length} neighbourhoods...\r`)
      }
    }
  }
  
  console.log(`\nNeighbourhoods: ${created} created, ${failed} failed`)
  return { created, failed }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2)
  
  console.log('='.repeat(60))
  console.log('Import Planning Areas and Subzones')
  console.log('='.repeat(60))
  
  // Check if file path provided
  if (args.length > 0 && args[0].startsWith('--file')) {
    const filePath = args[1] || args[0].replace('--file=', '')
    
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found: ${filePath}`)
      process.exit(1)
    }
    
    console.log(`\nReading GeoJSON from: ${filePath}`)
    const features = parseGeoJSON(filePath)
    console.log(`Found ${features.length} features`)
    
    // Determine if this is planning areas or subzones based on properties
    // You may need to adjust this logic based on your data structure
    const firstFeature = features[0]
    const props = firstFeature?.properties || {}
    
    // Determine type based on URA Master Plan 2019 field names
    if (props.PLN_AREA_N && !props.SUBZONE_N) {
      // Planning Area: has PLN_AREA_N but no SUBZONE_N
      console.log('Detected: Planning Areas (PLN_AREA_N field found)')
      await importPlanningAreas(features)
    } else if (props.SUBZONE_N) {
      // Subzone: has SUBZONE_N (may also have PLN_AREA_N for parent reference)
      console.log('Detected: Subzones (SUBZONE_N field found)')
      
      // First, extract and create Planning Areas from Subzones data
      await extractAndCreatePlanningAreas(features)
      
      // Then import Subzones
      await importSubzones(features)
    } else {
      console.log('\n⚠️  Cannot determine feature type.')
      console.log('Expected URA Master Plan 2019 format:')
      console.log('  - Planning Areas: PLN_AREA_N field')
      console.log('  - Subzones: SUBZONE_N field (may also have PLN_AREA_N)')
      console.log('\nFound properties:', Object.keys(props).join(', '))
    }
  } else {
    console.log('\n⚠️  No file provided.')
    console.log('\nUsage:')
    console.log('  node scripts/import-planning-areas-subzones.js --file path/to/planning-areas.geojson')
    console.log('  node scripts/import-planning-areas-subzones.js --file path/to/subzones.geojson')
    console.log('\nOr run create-sealed-neighbourhoods to create neighbourhoods from existing subzones:')
    console.log('  node scripts/import-planning-areas-subzones.js --create-neighbourhoods')
  }
  
  // Create sealed neighbourhoods if requested
  if (args.includes('--create-neighbourhoods')) {
    await createSealedNeighbourhoods()
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('Import complete!')
  console.log('='.repeat(60))
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

