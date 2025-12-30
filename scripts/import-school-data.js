/**
 * Primary School Data Import Script
 * 
 * Imports primary school data from MOE School Directory into Supabase
 * 
 * Data Sources:
 * 1. MOE School Finder (https://www.moe.gov.sg/schoolfinder) - manual CSV export or web scraping
 * 2. data.gov.sg (if available)
 * 3. Manual CSV/JSON file import
 * 
 * Usage:
 * 1. Set environment variables:
 *    - SUPABASE_URL=your_supabase_url
 *    - SUPABASE_SERVICE_KEY=your_service_role_key
 * 2. Option A: Import from CSV file
 *    node scripts/import-school-data.js --file path/to/schools.csv
 * 3. Option B: Import from JSON file
 *    node scripts/import-school-data.js --file path/to/schools.json
 * 4. Option C: Fetch from data.gov.sg (if resource_id available)
 *    node scripts/import-school-data.js --source datagovsg --resource-id <resource_id>
 * 
 * CSV Format (expected columns):
 * school_name, address, postal_code, planning_area, town, latitude, longitude
 * 
 * JSON Format:
 * [
 *   {
 *     "school_name": "Example Primary School",
 *     "address": "123 Example Street",
 *     "postal_code": "123456",
 *     "planning_area": "ANG MO KIO",
 *     "town": "ANG MO KIO",
 *     "latitude": 1.3691,
 *     "longitude": 103.8454
 *   }
 * ]
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

/**
 * Parse CSV file
 */
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim())
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  
  const schools = []
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    if (values.length !== headers.length) continue
    
    const school = {}
    headers.forEach((header, index) => {
      const value = values[index]
      if (value && value !== '') {
        // Map CSV headers to database columns
        switch (header) {
          case 'school_name':
          case 'name':
          case 'school':
            school.school_name = value
            break
          case 'address':
            school.address = value
            break
          case 'postal_code':
          case 'postalcode':
          case 'postcode':
            school.postal_code = value
            break
          case 'planning_area':
          case 'planningarea':
            school.planning_area = value.toUpperCase()
            break
          case 'town':
            school.town = value.toUpperCase()
            break
          case 'latitude':
          case 'lat':
            school.latitude = parseFloat(value) || null
            break
          case 'longitude':
          case 'lng':
          case 'lon':
            school.longitude = parseFloat(value) || null
            break
        }
      }
    })
    
    if (school.school_name) {
      schools.push(school)
    }
  }
  
  return schools
}

/**
 * Parse JSON file
 */
function parseJSON(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const data = JSON.parse(content)
  
  // Handle both array and object formats
  const schools = Array.isArray(data) ? data : [data]
  
  return schools.map(school => ({
    school_name: school.school_name || school.name || school.school,
    address: school.address || null,
    postal_code: school.postal_code || school.postalcode || school.postcode || null,
    planning_area: school.planning_area || school.planningarea || null,
    town: school.town ? school.town.toUpperCase() : null,
    latitude: school.latitude || school.lat || null,
    longitude: school.longitude || school.lng || school.lon || null
  })).filter(s => s.school_name)
}

/**
 * Fetch from data.gov.sg API
 */
async function fetchFromDataGovSG(resourceId) {
  const url = `https://data.gov.sg/api/action/datastore_search?resource_id=${resourceId}&limit=1000`
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    
    if (data.success && data.result && data.result.records) {
      return data.result.records.map(record => ({
        school_name: record.school_name || record.name || record.school,
        address: record.address || null,
        postal_code: record.postal_code || record.postalcode || null,
        planning_area: record.planning_area || record.planningarea || null,
        town: record.town ? record.town.toUpperCase() : null,
        latitude: record.latitude || record.lat || null,
        longitude: record.longitude || record.lng || record.lon || null
      })).filter(s => s.school_name)
    } else {
      throw new Error('Invalid response from data.gov.sg')
    }
  } catch (error) {
    console.error('Error fetching from data.gov.sg:', error.message)
    throw error
  }
}

/**
 * Geocode address using OneMap API (if coordinates missing)
 */
async function geocodeAddress(address) {
  if (!address) return { lat: null, lng: null }
  
  try {
    // OneMap API endpoint
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
          postal_code: result.POSTAL || null
        }
      }
    }
  } catch (error) {
    console.warn(`Geocoding failed for ${address}:`, error.message)
  }
  
  return { lat: null, lng: null, planning_area: null, postal_code: null }
}

/**
 * Import schools to Supabase
 */
async function importSchools(schools) {
  console.log(`\nImporting ${schools.length} schools...`)
  
  let imported = 0
  let updated = 0
  let errors = 0
  
  for (const school of schools) {
    try {
      // Check if school already exists
      const { data: existing } = await supabase
        .from('primary_schools')
        .select('id')
        .eq('school_name', school.school_name)
        .eq('postal_code', school.postal_code || '')
        .limit(1)
      
      if (existing && existing.length > 0) {
        // Update existing
        const { error } = await supabase
          .from('primary_schools')
          .update({
            address: school.address,
            planning_area: school.planning_area,
            town: school.town,
            latitude: school.latitude,
            longitude: school.longitude
          })
          .eq('id', existing[0].id)
        
        if (error) throw error
        updated++
      } else {
        // Insert new
        const { error } = await supabase
          .from('primary_schools')
          .insert([school])
        
        if (error) throw error
        imported++
      }
    } catch (error) {
      console.error(`Error importing ${school.school_name}:`, error.message)
      errors++
    }
  }
  
  console.log(`\nImport complete:`)
  console.log(`  - Imported: ${imported}`)
  console.log(`  - Updated: ${updated}`)
  console.log(`  - Errors: ${errors}`)
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2)
  let schools = []
  
  // Parse arguments
  const fileIndex = args.indexOf('--file')
  const sourceIndex = args.indexOf('--source')
  const resourceIdIndex = args.indexOf('--resource-id')
  
  if (fileIndex !== -1 && args[fileIndex + 1]) {
    // Import from file
    const filePath = args[fileIndex + 1]
    const ext = path.extname(filePath).toLowerCase()
    
    if (ext === '.csv') {
      schools = parseCSV(filePath)
    } else if (ext === '.json') {
      schools = parseJSON(filePath)
    } else {
      console.error('Error: Unsupported file format. Use .csv or .json')
      process.exit(1)
    }
  } else if (sourceIndex !== -1 && args[sourceIndex + 1] === 'datagovsg') {
    // Fetch from data.gov.sg
    if (resourceIdIndex === -1 || !args[resourceIdIndex + 1]) {
      console.error('Error: --resource-id required when using --source datagovsg')
      process.exit(1)
    }
    const resourceId = args[resourceIdIndex + 1]
    schools = await fetchFromDataGovSG(resourceId)
  } else {
    console.error('Usage:')
    console.error('  node scripts/import-school-data.js --file <path/to/file.csv|file.json>')
    console.error('  node scripts/import-school-data.js --source datagovsg --resource-id <resource_id>')
    process.exit(1)
  }
  
  if (schools.length === 0) {
    console.error('Error: No schools found to import')
    process.exit(1)
  }
  
  // Geocode addresses if coordinates missing (optional, can be slow)
  console.log('Processing schools...')
  for (let i = 0; i < schools.length; i++) {
    const school = schools[i]
    if ((!school.latitude || !school.longitude) && school.address) {
      console.log(`Geocoding ${i + 1}/${schools.length}: ${school.school_name}`)
      const geo = await geocodeAddress(school.address)
      if (geo.lat && geo.lng) {
        school.latitude = geo.lat
        school.longitude = geo.lng
      }
      if (geo.planning_area && !school.planning_area) {
        school.planning_area = geo.planning_area
      }
      if (geo.postal_code && !school.postal_code) {
        school.postal_code = geo.postal_code
      }
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }
  
  // Import to Supabase
  await importSchools(schools)
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

module.exports = { parseCSV, parseJSON, importSchools }

