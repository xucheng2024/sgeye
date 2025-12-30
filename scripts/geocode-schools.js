/**
 * Geocode School Addresses using OneMap API
 * 
 * This script reads a CSV file and geocodes addresses to get real coordinates
 * 
 * Usage:
 * node scripts/geocode-schools.js data/schools-sample.csv > data/schools-geocoded.csv
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
    return { lat: null, lng: null, planning_area: null, postal_code: null }
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
          address: result.ADDRESS || address // Use OneMap's formatted address if available
        }
      }
    }
  } catch (error) {
    console.error(`Geocoding failed for ${address}:`, error.message)
  }
  
  return { lat: null, lng: null, planning_area: null, postal_code: null, address: null }
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
 * Main function
 */
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.error('Usage: node scripts/geocode-schools.js <input.csv>')
    process.exit(1)
  }
  
  const inputFile = args[0]
  const schools = parseCSV(inputFile)
  
  console.log('school_name,address,postal_code,planning_area,town,latitude,longitude')
  
  for (let i = 0; i < schools.length; i++) {
    const school = schools[i]
    let lat = school.latitude || ''
    let lng = school.longitude || ''
    let planning_area = school.planning_area || ''
    let postal_code = school.postal_code || ''
    let address = school.address || ''
    
    // If coordinates are missing or look like estimates, try to geocode
    if ((!lat || !lng || lat === '1.3000' || lat === '1.3500') && school.address) {
      process.stderr.write(`Geocoding ${i + 1}/${schools.length}: ${school.school_name}...\n`)
      const geo = await geocodeAddress(school.address)
      
      if (geo.lat && geo.lng) {
        lat = geo.lat.toString()
        lng = geo.lng.toString()
        process.stderr.write(`  ✓ Found: ${geo.lat}, ${geo.lng}\n`)
      } else {
        process.stderr.write(`  ✗ Not found\n`)
      }
      
      if (geo.planning_area && !planning_area) {
        planning_area = geo.planning_area
      }
      if (geo.postal_code && !postal_code) {
        postal_code = geo.postal_code
      }
      if (geo.address && geo.address !== school.address) {
        address = geo.address // Use OneMap's formatted address
      }
      
      // Rate limiting (OneMap API has rate limits)
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    
    // Output CSV
    console.log(`"${school.school_name}","${address || school.address || ''}","${postal_code}","${planning_area}","${school.town || planning_area}","${lat}","${lng}"`)
  }
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})

