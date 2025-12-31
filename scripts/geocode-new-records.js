/**
 * Geocode New HDB Resale Records (for GitHub Actions)
 * 
 * This script geocodes only newly imported records that are missing coordinates.
 * Designed to run in GitHub Actions after data import.
 * 
 * Features:
 * - Only processes records missing coordinates
 * - Limits to a reasonable number of records per run (to avoid timeout)
 * - Reuses coordinates for same block/street combinations
 * - Rate-limited to respect OneMap API limits
 * 
 * Usage:
 * node scripts/geocode-new-records.js [--limit N]
 * 
 * Environment variables required:
 * - NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY
 */

const { createClient } = require('@supabase/supabase-js')

// Parse command line arguments
const args = process.argv.slice(2)
const limitArg = args.find(arg => arg.startsWith('--limit='))
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 500 // Default: 500 records per run

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// OneMap API endpoint
const ONEMAP_API = 'https://www.onemap.gov.sg/api/common/elastic/search'

/**
 * Build address variations for better geocoding success
 */
function buildAddresses(block, streetName) {
  const addresses = []
  
  if (block && streetName) {
    addresses.push(`Block ${block} ${streetName} Singapore`)
    addresses.push(`${block} ${streetName} Singapore`)
    addresses.push(`${streetName} Singapore`)
  } else if (streetName) {
    addresses.push(`${streetName} Singapore`)
  } else if (block) {
    addresses.push(`Block ${block} Singapore`)
  }
  
  return addresses.filter(Boolean)
}

/**
 * Geocode address using OneMap API
 */
async function geocodeAddress(address) {
  try {
    const url = `${ONEMAP_API}?searchVal=${encodeURIComponent(address)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`
    const response = await fetch(url)
    
    if (!response.ok) {
      return { lat: null, lng: null }
    }
    
    const data = await response.json()
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0]
      return {
        lat: parseFloat(result.LATITUDE),
        lng: parseFloat(result.LONGITUDE)
      }
    }
    
    return { lat: null, lng: null }
  } catch (error) {
    return { lat: null, lng: null }
  }
}

/**
 * Update coordinates in database
 */
async function updateCoordinates(id, lat, lng) {
  const { error } = await supabase
    .from('raw_resale_2017')
    .update({ latitude: lat, longitude: lng })
    .eq('id', id)
  
  return !error
}

async function main() {
  console.log('='.repeat(60))
  console.log('Geocoding New HDB Resale Records')
  console.log('='.repeat(60))
  console.log(`Limit: ${limit} records per run`)
  console.log('')
  
  // Fetch records missing coordinates
  const { data: records, error: fetchError } = await supabase
    .from('raw_resale_2017')
    .select('id, block, street_name, latitude, longitude')
    .or('latitude.is.null,longitude.is.null')
    .not('block', 'is', null)
    .not('street_name', 'is', null)
    .limit(limit)
  
  if (fetchError) {
    console.error('Error fetching records:', fetchError.message)
    process.exit(1)
  }
  
  if (!records || records.length === 0) {
    console.log('✓ No records need geocoding')
    process.exit(0)
  }
  
  console.log(`Found ${records.length} records to geocode`)
  console.log('')
  
  // Pre-load cache: Collect unique block+street_name combinations
  console.log('Pre-loading coordinates from database...')
  const uniqueCombinations = new Map() // block+street -> first occurrence
  records.forEach(r => {
    if (r.block && r.street_name && !r.latitude && !r.longitude) {
      const key = `${r.block || ''}-${r.street_name || ''}`.toLowerCase()
      if (!uniqueCombinations.has(key)) {
        uniqueCombinations.set(key, { block: r.block, street_name: r.street_name })
      }
    }
  })
  
  console.log(`  Found ${uniqueCombinations.size} unique block+street combinations`)
  
  // Pre-load cache by querying database for existing coordinates
  const geocodedCache = new Map()
  if (uniqueCombinations.size > 0) {
    let preloaded = 0
    // Query each unique combination (can be optimized further with batch queries if needed)
    for (const [key, combo] of uniqueCombinations) {
      const { data: existingCoords } = await supabase
        .from('raw_resale_2017')
        .select('latitude, longitude')
        .eq('block', combo.block)
        .eq('street_name', combo.street_name)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .limit(1)
        .single()
      
      if (existingCoords && existingCoords.latitude && existingCoords.longitude) {
        geocodedCache.set(key, { lat: existingCoords.latitude, lng: existingCoords.longitude })
        preloaded++
      }
    }
    
    console.log(`  Pre-loaded ${preloaded} coordinates into cache (${((preloaded/uniqueCombinations.size)*100).toFixed(1)}% hit rate)`)
  }
  console.log('')
  
  let geocoded = 0
  let reused = 0
  let failed = 0
  let skipped = 0
  
  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    const cacheKey = `${record.block || ''}-${record.street_name || ''}`.toLowerCase()
    
    let geo = { lat: null, lng: null }
    let source = 'geocoded'
    
    // Check if already has coordinates
    if (record.latitude && record.longitude) {
      skipped++
      continue
    }
    
    // Check cache (pre-loaded from database)
    if (geocodedCache.has(cacheKey)) {
      geo = geocodedCache.get(cacheKey)
      source = 'reused'
    } else {
      // Fallback: Check database for existing coordinates (should rarely happen now)
      const { data: existingCoords } = await supabase
        .from('raw_resale_2017')
        .select('latitude, longitude')
        .eq('block', record.block)
        .eq('street_name', record.street_name)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .limit(1)
        .single()
      
      if (existingCoords && existingCoords.latitude && existingCoords.longitude) {
        geo = { lat: existingCoords.latitude, lng: existingCoords.longitude }
        geocodedCache.set(cacheKey, geo)
        source = 'reused'
      } else {
        // Call OneMap API
        const addresses = buildAddresses(record.block, record.street_name)
        
        if (addresses.length === 0) {
          skipped++
          continue
        }
        
        for (const address of addresses) {
          geo = await geocodeAddress(address)
          if (geo.lat && geo.lng) {
            geocodedCache.set(cacheKey, geo)
            break
          }
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }
    
    if (geo.lat && geo.lng) {
      const success = await updateCoordinates(record.id, geo.lat, geo.lng)
      if (success) {
        if (source === 'reused') {
          reused++
        } else {
          geocoded++
        }
      } else {
        failed++
      }
    } else {
      failed++
    }
    
    // Progress indicator
    if ((i + 1) % 50 === 0) {
      process.stdout.write(`Progress: ${i + 1}/${records.length}\r`)
    }
  }
  
  console.log('')
  console.log('='.repeat(60))
  console.log('Geocoding Summary')
  console.log('='.repeat(60))
  console.log(`Total processed: ${records.length}`)
  console.log(`  ✓ Geocoded: ${geocoded}`)
  console.log(`  ♻️  Reused: ${reused}`)
  console.log(`  ✗ Failed: ${failed}`)
  console.log(`  ⊘ Skipped: ${skipped}`)
  console.log('')
  
  if (records.length >= limit) {
    console.log(`⚠️  Note: Reached limit of ${limit} records.`)
    console.log('   Run again to process more records.')
    console.log('')
  }
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

