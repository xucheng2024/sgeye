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
 * Normalize street name (expand abbreviations, handle special cases)
 */
function normalizeStreetName(streetName) {
  if (!streetName) return streetName
  
  let normalized = streetName.trim()
  
  // Special cases that must be handled before general abbreviations
  // "ST. GEORGE'S" -> "SAINT GEORGES" (not "STREET GEORGE'S")
  normalized = normalized.replace(/\bST\.\s+GEORGE'S?\b/gi, 'SAINT GEORGES')
  normalized = normalized.replace(/\bST\s+GEORGE'S?\b/gi, 'SAINT GEORGES')
  
  // "KG" -> "KAMPONG" (but only if it's at the start or after a space)
  normalized = normalized.replace(/\bKG\s+/gi, 'KAMPONG ')
  
  // Common Singapore address abbreviations
  const abbreviations = {
    "C'WEALTH": "COMMONWEALTH",
    "C'WEALTH CL": "COMMONWEALTH CLOSE",
    "C'WEALTH CRES": "COMMONWEALTH CRESCENT",
    "C'WEALTH DR": "COMMONWEALTH DRIVE",
    "C'WEALTH AVE": "COMMONWEALTH AVENUE",
    "RD.": "ROAD",
    "RD": "ROAD",
    "AVE.": "AVENUE",
    "AVE": "AVENUE",
    "DR.": "DRIVE",
    "DR": "DRIVE",
    "ST.": "STREET",
    "ST": "STREET",
    "CRES": "CRESCENT",
    "CRES.": "CRESCENT",
    "CL": "CLOSE",
    "CL.": "CLOSE",
    "TER": "TERRACE",
    "TER.": "TERRACE",
    "PL": "PLACE",
    "PL.": "PLACE",
  }
  
  // Replace abbreviations (case-insensitive)
  const sortedAbbrs = Object.entries(abbreviations).sort((a, b) => b[0].length - a[0].length)
  
  for (const [abbr, full] of sortedAbbrs) {
    const escapedAbbr = abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`\\b${escapedAbbr}\\.?\\b`, 'gi')
    normalized = normalized.replace(regex, full)
  }
  
  // Handle apostrophes
  normalized = normalized.replace(/([A-Z])'([A-Z])/g, '$1 $2')
  normalized = normalized.replace(/'S\b/g, 'S')
  normalized = normalized.replace(/'/g, '')
  
  // Clean up
  normalized = normalized.replace(/\s+/g, ' ')
  normalized = normalized.replace(/\b(\w+)\.(\s|$)/g, '$1$2')
  
  return normalized.trim()
}

/**
 * Build address variations for better geocoding success
 */
function buildAddresses(block, streetName) {
  const addresses = new Set()
  const normalizedStreet = normalizeStreetName(streetName)
  
  // Original format
  if (block && streetName) {
    addresses.add(`Block ${block} ${streetName} Singapore`)
    addresses.add(`${block} ${streetName} Singapore`)
  }
  if (streetName) {
    addresses.add(`${streetName} Singapore`)
  }
  
  // Normalized format (expanded abbreviations)
  if (block && normalizedStreet && normalizedStreet !== streetName) {
    addresses.add(`Block ${block} ${normalizedStreet} Singapore`)
    addresses.add(`${block} ${normalizedStreet} Singapore`)
  }
  if (normalizedStreet && normalizedStreet !== streetName) {
    addresses.add(`${normalizedStreet} Singapore`)
  }
  
  // Special handling for ST. GEORGE'S RD -> SAINT GEORGE'S ROAD
  // OneMap API recognizes "SAINT GEORGE'S ROAD" format (without "Block" prefix works better)
  if (streetName && /ST\.?\s+GEORGE'S?\s+RD/i.test(streetName)) {
    if (block) {
      addresses.add(`${block} SAINT GEORGE'S ROAD Singapore`) // This format works!
      addresses.add(`Block ${block} SAINT GEORGE'S ROAD Singapore`)
    }
    addresses.add(`SAINT GEORGE'S ROAD Singapore`)
  }
  
  // Special handling for KG ARANG RD -> KAMPONG ARANG ROAD
  if (streetName && /^KG\s+ARANG/i.test(streetName)) {
    if (block) {
      addresses.add(`Block ${block} KAMPONG ARANG ROAD Singapore`)
      addresses.add(`${block} KAMPONG ARANG ROAD Singapore`)
    }
    addresses.add(`KAMPONG ARANG ROAD Singapore`)
  }
  
  // Block only (fallback)
  if (block) {
    addresses.add(`Block ${block} Singapore`)
  }
  
  return Array.from(addresses).filter(Boolean)
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
  
  // Pre-load ALL existing coordinates from database (maximize reuse)
  console.log('Pre-loading ALL coordinates from database...')
  console.log('  (This maximizes coordinate reuse and minimizes API calls)')
  
  const geocodedCache = new Map()
  let offset = 0
  const batchSize = 1000 // Supabase limit per query
  let totalProcessed = 0
  
  while (true) {
    const { data: existingRecords, error } = await supabase
      .from('raw_resale_2017')
      .select('block, street_name, latitude, longitude')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .not('block', 'is', null)
      .not('street_name', 'is', null)
      .range(offset, offset + batchSize - 1)
    
    if (error || !existingRecords || existingRecords.length === 0) {
      break
    }
    
    // Add unique combinations to cache
    existingRecords.forEach(rec => {
      const key = `${rec.block || ''}-${rec.street_name || ''}`.toLowerCase()
      if (!geocodedCache.has(key) && rec.latitude && rec.longitude) {
        geocodedCache.set(key, { lat: rec.latitude, lng: rec.longitude })
      }
    })
    
    totalProcessed += existingRecords.length
    
    // Progress indicator (every 10k records)
    if (totalProcessed % 10000 === 0 || totalProcessed < 10000) {
      process.stdout.write(`  Loaded ${geocodedCache.size.toLocaleString()} unique combinations from ${totalProcessed.toLocaleString()} records...\r`)
    }
    
    // Check if we got fewer records than requested (last batch)
    if (existingRecords.length < batchSize) {
      break
    } else {
      offset += batchSize
    }
  }
  
  console.log('') // New line after progress indicator
  console.log(`  Pre-loaded ${geocodedCache.size.toLocaleString()} unique block+street combinations into cache`)
  console.log(`  (Processed ${totalProcessed.toLocaleString()} records with coordinates)`)
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
    
    // Check cache (pre-loaded from database - contains ALL existing coordinates)
    if (geocodedCache.has(cacheKey)) {
      geo = geocodedCache.get(cacheKey)
      source = 'reused'
    } else {
      // Call OneMap API (cache miss means this is a new block+street combination)
      const addresses = buildAddresses(record.block, record.street_name)
      
      if (addresses.length === 0) {
        skipped++
        continue
      }
      
      for (const address of addresses) {
        geo = await geocodeAddress(address)
        if (geo.lat && geo.lng) {
          geocodedCache.set(cacheKey, geo) // Add to cache for future use
          break
        }
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 300))
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

