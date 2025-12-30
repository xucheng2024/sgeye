/**
 * Geocode School Addresses Only (No Database Import)
 * 
 * This script only geocodes addresses and outputs CSV, doesn't import to database
 * 
 * Usage:
 * node scripts/geocode-only.js data/schools-sample.csv > data/schools-real-coords.csv
 */

const fs = require('fs')

// Use built-in fetch (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('Error: This script requires Node.js 18+ with built-in fetch')
  process.exit(1)
}

/**
 * Geocode address using OneMap API
 */
async function geocodeAddress(address) {
  if (!address || address.trim() === '') {
    return { lat: null, lng: null, planning_area: null, postal_code: null, formatted_address: null }
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
          planning_area: result.PLANNING_AREA || null,
          postal_code: result.POSTAL || null,
          formatted_address: result.ADDRESS || address
        }
      }
    }
  } catch (error) {
    // Silent fail, return null
  }
  
  return { lat: null, lng: null, planning_area: null, postal_code: null, formatted_address: null }
}

/**
 * Parse CSV
 */
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim())
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase())
  
  const schools = []
  for (let i = 1; i < lines.length; i++) {
    // Handle CSV with quoted fields
    const values = []
    let current = ''
    let inQuotes = false
    
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''))
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''))
    
    if (values.length !== headers.length) continue
    
    const school = {}
    headers.forEach((header, index) => {
      school[header] = values[index] || ''
    })
    
    if (school.school_name) {
      schools.push(school)
    }
  }
  
  return schools
}

/**
 * Check if coordinates look like estimates
 */
function isEstimate(lat, lng) {
  if (!lat || !lng) return true
  const latNum = parseFloat(lat)
  const lngNum = parseFloat(lng)
  // Estimates often have too many zeros or are round numbers
  return latNum.toString().match(/\.\d{4}0+$/) || lngNum.toString().match(/\.\d{4}0+$/)
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.error('Usage: node scripts/geocode-only.js <input.csv>')
    process.exit(1)
  }
  
  const inputFile = args[0]
  const schools = parseCSV(inputFile)
  
  console.error(`Processing ${schools.length} schools...`)
  console.error('This may take several minutes due to API rate limits.\n')
  
  console.log('school_name,address,postal_code,planning_area,town,latitude,longitude')
  
  let geocoded = 0
  let failed = 0
  
  for (let i = 0; i < schools.length; i++) {
    const school = schools[i]
    let lat = school.latitude || ''
    let lng = school.longitude || ''
    let planning_area = school.planning_area || ''
    let postal_code = school.postal_code || ''
    let address = school.address || ''
    
    // Force geocode all schools to get real coordinates from OneMap API
    if (school.address) {
      process.stderr.write(`[${i + 1}/${schools.length}] Geocoding: ${school.school_name}... `)
      const geo = await geocodeAddress(school.address)
      
      if (geo.lat && geo.lng) {
        lat = geo.lat.toString()
        lng = geo.lng.toString()
        geocoded++
        process.stderr.write(`✓ Found: ${geo.lat.toFixed(6)}, ${geo.lng.toFixed(6)}\n`)
      } else {
        // Try geocoding with school name if address fails
        process.stderr.write(`✗ Address not found, trying school name... `)
        const geo2 = await geocodeAddress(school.school_name)
        if (geo2.lat && geo2.lng) {
          lat = geo2.lat.toString()
          lng = geo2.lng.toString()
          geocoded++
          process.stderr.write(`✓ Found: ${geo2.lat.toFixed(6)}, ${geo2.lng.toFixed(6)}\n`)
        } else {
          failed++
          process.stderr.write(`✗ Not found\n`)
        }
        await new Promise(resolve => setTimeout(resolve, 300))
      }
      
      if (geo.planning_area && !planning_area) {
        planning_area = geo.planning_area
      }
      if (geo.postal_code && !postal_code) {
        postal_code = geo.postal_code
      }
      if (geo.formatted_address && geo.formatted_address !== school.address) {
        address = geo.formatted_address
      }
      
      // Rate limiting (OneMap API has rate limits - 250 requests per minute)
      await new Promise(resolve => setTimeout(resolve, 300))
    } else {
      process.stderr.write(`[${i + 1}/${schools.length}] No address for: ${school.school_name}\n`)
    }
    
    // Output CSV
    console.log(`"${school.school_name}","${address || school.address || ''}","${postal_code}","${planning_area}","${school.town || planning_area}","${lat}","${lng}"`)
  }
  
  console.error(`\nDone! Geocoded: ${geocoded}, Failed: ${failed}, Kept existing: ${schools.length - geocoded - failed}`)
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})

