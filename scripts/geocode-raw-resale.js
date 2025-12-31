/**
 * Geocode Raw Resale Transactions
 * 
 * This script geocodes HDB resale transactions that are missing coordinates
 * Uses OneMap API to get coordinates from block + street_name
 * 
 * Usage:
 * node scripts/geocode-raw-resale.js
 * 
 * Environment variables required:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY for write access)
 */

// Load environment variables
const fs = require('fs')
const path = require('path')

// Try to load .env.local manually if dotenv not available
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

// Try to load dotenv if available (optional)
try {
  require('dotenv').config({ path: '.env.local' })
} catch (e) {
  // dotenv not installed, use environment variables directly
}

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials')
  console.error('Found NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('Found SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
  console.error('Found SUPABASE_SERVICE_KEY:', !!process.env.SUPABASE_SERVICE_KEY)
  console.error('Found NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY) in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Geocode address using OneMap API
 */
async function geocodeAddress(address) {
  if (!address || address.trim() === '') {
    return { lat: null, lng: null }
  }
  
  try {
    const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(address)}&returnGeom=Y&getAddrDetails=Y`
    const response = await fetch(url)
    
    if (response.ok) {
      const data = await response.json()
      if (data.results && data.results.length > 0) {
        const result = data.results[0]
        return {
          lat: parseFloat(result.LATITUDE) || null,
          lng: parseFloat(result.LONGITUDE) || null,
        }
      }
    }
  } catch (error) {
    // Silent fail, return null
  }
  
  return { lat: null, lng: null }
}

/**
 * Build address string from block and street_name
 * Tries multiple formats for better geocoding success
 */
function buildAddresses(block, streetName) {
  if (!block && !streetName) return []
  
  const addresses = []
  
  // Format 1: "Block XXX STREET_NAME Singapore"
  if (block && streetName) {
    addresses.push(`Block ${block} ${streetName} Singapore`)
  }
  
  // Format 2: "STREET_NAME Block XXX Singapore" (alternative format)
  if (block && streetName) {
    addresses.push(`${streetName} Block ${block} Singapore`)
  }
  
  // Format 3: Just street name (sometimes works better)
  if (streetName) {
    addresses.push(`${streetName} Singapore`)
  }
  
  // Format 4: "BLOCK STREET_NAME" (no "Block" prefix, sometimes OneMap prefers this)
  if (block && streetName) {
    addresses.push(`${block} ${streetName} Singapore`)
  }
  
  return addresses
}

/**
 * Get existing coordinates for a block + street_name combination
 */
async function getExistingCoordinates(block, streetName) {
  if (!block || !streetName) return null
  
  const { data, error } = await supabase
    .from('raw_resale_2017')
    .select('latitude, longitude')
    .eq('block', block)
    .eq('street_name', streetName)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .limit(1)
    .single()
  
  if (error || !data) return null
  
  return {
    lat: data.latitude,
    lng: data.longitude
  }
}

/**
 * Get records missing coordinates
 */
async function getRecordsMissingCoordinates(limit = 100) {
  const { data, error } = await supabase
    .from('raw_resale_2017')
    .select('id, block, street_name, latitude, longitude')
    .or('latitude.is.null,longitude.is.null')
    .not('block', 'is', null)
    .not('street_name', 'is', null)
    .limit(limit)
  
  if (error) {
    console.error('Error fetching records:', error)
    return []
  }
  
  return data || []
}

/**
 * Update coordinates in database
 */
async function updateCoordinates(id, latitude, longitude) {
  const { error } = await supabase
    .from('raw_resale_2017')
    .update({ 
      latitude: latitude,
      longitude: longitude 
    })
    .eq('id', id)
  
  if (error) {
    console.error(`Error updating record ${id}:`, error)
    return false
  }
  
  return true
}

/**
 * Main function
 */
async function main() {
  console.log('Starting geocoding for raw_resale_2017...\n')
  
  // Check how many records need geocoding
  const { count: totalMissing } = await supabase
    .from('raw_resale_2017')
    .select('*', { count: 'exact', head: true })
    .or('latitude.is.null,longitude.is.null')
    .not('block', 'is', null)
    .not('street_name', 'is', null)
  
  console.log(`Found ${totalMissing} records missing coordinates`)
  
  if (totalMissing === 0) {
    console.log('All records already have coordinates!')
    return
  }
  
  const batchSize = 100
  let processed = 0
  let geocoded = 0
  let failed = 0
  let skipped = 0
  
  while (processed < totalMissing) {
    const records = await getRecordsMissingCoordinates(batchSize)
    
    if (records.length === 0) {
      console.log('\nNo more records to process')
      break
    }
    
    console.log(`\nProcessing batch: ${processed + 1} to ${processed + records.length} of ${totalMissing}`)
    
    for (let i = 0; i < records.length; i++) {
      const record = records[i]
      
      // Skip if already has coordinates
      if (record.latitude && record.longitude) {
        skipped++
        continue
      }
      
      // First, check if same block + street_name already has coordinates
      const existingCoords = await getExistingCoordinates(record.block, record.street_name)
      
      let geo = { lat: null, lng: null }
      let source = ''
      
      if (existingCoords) {
        // Reuse existing coordinates
        geo = existingCoords
        source = 'reused'
        process.stderr.write(`  [${i + 1}/${records.length}] Reusing: Block ${record.block} ${record.street_name}... `)
      } else {
        // Need to geocode
        const addresses = buildAddresses(record.block, record.street_name)
        
        if (addresses.length === 0) {
          console.log(`  [${i + 1}/${records.length}] Skipping: Missing block or street_name (ID: ${record.id})`)
          skipped++
          continue
        }
        
        process.stderr.write(`  [${i + 1}/${records.length}] Geocoding: ${addresses[0].substring(0, 50)}... `)
        
        let triedAddress = ''
        
        // Try each address format until one works
        for (const address of addresses) {
          triedAddress = address
          geo = await geocodeAddress(address)
          if (geo.lat && geo.lng) {
            break // Found coordinates, stop trying
          }
          // Small delay between attempts
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        source = 'geocoded'
        
        // Rate limiting: OneMap API allows 250 requests per minute
        // Wait 300ms between requests to stay under limit
        await new Promise(resolve => setTimeout(resolve, 300))
      }
      
      if (geo.lat && geo.lng) {
        const success = await updateCoordinates(record.id, geo.lat, geo.lng)
        if (success) {
          geocoded++
          const sourceLabel = source === 'reused' ? '♻️' : '✓'
          process.stderr.write(`${sourceLabel} ${geo.lat.toFixed(6)}, ${geo.lng.toFixed(6)} ${source === 'reused' ? '(reused)' : ''}\n`)
        } else {
          failed++
          process.stderr.write(`✗ Update failed\n`)
        }
      } else {
        failed++
        if (source === 'reused') {
          process.stderr.write(`✗ Reuse check failed\n`)
        } else {
          const addresses = buildAddresses(record.block, record.street_name)
          process.stderr.write(`✗ Not found (tried ${addresses.length} formats)\n`)
        }
      }
    }
    
    processed += records.length
    
    console.log(`\nProgress: ${processed}/${totalMissing} | Geocoded: ${geocoded} | Failed: ${failed} | Skipped: ${skipped}`)
    
    // If we got fewer records than batch size, we're done
    if (records.length < batchSize) {
      break
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('Geocoding complete!')
  console.log(`Total processed: ${processed}`)
  console.log(`Successfully geocoded: ${geocoded}`)
  console.log(`Failed: ${failed}`)
  console.log(`Skipped: ${skipped}`)
  console.log('='.repeat(60))
  
  // Final count check
  const { count: remaining } = await supabase
    .from('raw_resale_2017')
    .select('*', { count: 'exact', head: true })
    .or('latitude.is.null,longitude.is.null')
    .not('block', 'is', null)
    .not('street_name', 'is', null)
  
  if (remaining > 0) {
    console.log(`\n⚠️  ${remaining} records still missing coordinates`)
    console.log('You may need to run this script again or check data quality')
  } else {
    console.log('\n✓ All records with block and street_name now have coordinates!')
  }
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

