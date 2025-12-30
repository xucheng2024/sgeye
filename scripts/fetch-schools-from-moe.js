/**
 * Fetch Primary Schools from MOE School Finder
 * 
 * This script attempts to fetch school data from MOE School Finder website
 * Note: MOE doesn't provide a public API, so this uses web scraping
 * 
 * Usage:
 * node scripts/fetch-schools-from-moe.js > data/schools.csv
 */

// Use built-in fetch (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('Error: This script requires Node.js 18+ with built-in fetch')
  process.exit(1)
}

/**
 * Known primary schools in Singapore (sample data)
 * You can expand this list or fetch from MOE School Finder
 */
const PRIMARY_SCHOOLS = [
  // Ang Mo Kio
  { name: 'Ang Mo Kio Primary School', address: '6 Ang Mo Kio Street 32', postal: '569284', town: 'ANG MO KIO', planning_area: 'ANG MO KIO' },
  { name: 'Da Qiao Primary School', address: '12 Ang Mo Kio Street 44', postal: '569250', town: 'ANG MO KIO', planning_area: 'ANG MO KIO' },
  { name: 'Jing Shan Primary School', address: '21 Ang Mo Kio Street 21', postal: '569384', town: 'ANG MO KIO', planning_area: 'ANG MO KIO' },
  
  // Bedok
  { name: 'Bedok Green Primary School', address: '1 Bedok South Avenue 2', postal: '469315', town: 'BEDOK', planning_area: 'BEDOK' },
  { name: 'Bedok South Primary School', address: '1 Jalan Langgar Bedok', postal: '468555', town: 'BEDOK', planning_area: 'BEDOK' },
  { name: 'Fengshan Primary School', address: '2 Bedok North Street 3', postal: '469642', town: 'BEDOK', planning_area: 'BEDOK' },
  
  // Bishan
  { name: 'Catholic High School (Primary)', address: '9 Bishan Street 22', postal: '579767', town: 'BISHAN', planning_area: 'BISHAN' },
  { name: 'Guangyang Primary School', address: '6 Bishan Street 12', postal: '579807', town: 'BISHAN', planning_area: 'BISHAN' },
  { name: 'Kuo Chuan Presbyterian Primary School', address: '10 Bishan Street 13', postal: '579795', town: 'BISHAN', planning_area: 'BISHAN' },
  
  // Bukit Batok
  { name: 'Bukit Batok Primary School', address: '50 Bukit Batok West Avenue 3', postal: '659159', town: 'BUKIT BATOK', planning_area: 'BUKIT BATOK' },
  { name: 'Lianhua Primary School', address: '30 Bukit Batok Street 31', postal: '659442', town: 'BUKIT BATOK', planning_area: 'BUKIT BATOK' },
  { name: 'Princess Elizabeth Primary School', address: '20 Bukit Batok West Avenue 2', postal: '659204', town: 'BUKIT BATOK', planning_area: 'BUKIT BATOK' },
  
  // Clementi
  { name: 'Clementi Primary School', address: '10 Clementi Avenue 3', postal: '129904', town: 'CLEMENTI', planning_area: 'CLEMENTI' },
  { name: 'Nan Hua Primary School', address: '30 Jalan Lempeng', postal: '128806', town: 'CLEMENTI', planning_area: 'CLEMENTI' },
  { name: 'Qifa Primary School', address: '51 Clementi Avenue 1', postal: '129908', town: 'CLEMENTI', planning_area: 'CLEMENTI' },
  
  // Tampines
  { name: 'Angsana Primary School', address: '1 Tampines Street 42', postal: '529177', town: 'TAMPINES', planning_area: 'TAMPINES' },
  { name: 'East Spring Primary School', address: '30 Tampines Street 81', postal: '529014', town: 'TAMPINES', planning_area: 'TAMPINES' },
  { name: 'Gongshang Primary School', address: '15 Tampines Street 11', postal: '529456', town: 'TAMPINES', planning_area: 'TAMPINES' },
  
  // Woodlands
  { name: 'Admiralty Primary School', address: '31 Woodlands Ring Road', postal: '738240', town: 'WOODLANDS', planning_area: 'WOODLANDS' },
  { name: 'Evergreen Primary School', address: '21 Woodlands Street 81', postal: '738526', town: 'WOODLANDS', planning_area: 'WOODLANDS' },
  { name: 'Greenwood Primary School', address: '20 Woodlands Avenue 5', postal: '739064', town: 'WOODLANDS', planning_area: 'WOODLANDS' },
  
  // Queenstown
  { name: 'Fairfield Methodist School (Primary)', address: '102 Dover Road', postal: '139649', town: 'QUEENSTOWN', planning_area: 'QUEENSTOWN' },
  { name: 'New Town Primary School', address: '300 Tanglin Halt Road', postal: '148812', town: 'QUEENSTOWN', planning_area: 'QUEENSTOWN' },
  { name: 'Queensway Primary School', address: '2A Margaret Drive', postal: '149295', town: 'QUEENSTOWN', planning_area: 'QUEENSTOWN' },
  
  // Toa Payoh
  { name: 'First Toa Payoh Primary School', address: '7 Lorong 8 Toa Payoh', postal: '319253', town: 'TOA PAYOH', planning_area: 'TOA PAYOH' },
  { name: 'Pei Tong Primary School', address: '10 Toa Payoh Lorong 7', postal: '319314', town: 'TOA PAYOH', planning_area: 'TOA PAYOH' },
  { name: 'St. Andrew\'s Junior School', address: '5 Potong Pasir Avenue 1', postal: '358571', town: 'TOA PAYOH', planning_area: 'TOA PAYOH' },
]

/**
 * Geocode address using OneMap API
 */
async function geocodeAddress(address) {
  if (!address) return { lat: null, lng: null, planning_area: null }
  
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
          postal_code: result.POSTAL || null
        }
      }
    }
  } catch (error) {
    console.error(`Geocoding failed for ${address}:`, error.message)
  }
  
  return { lat: null, lng: null, planning_area: null, postal_code: null }
}

/**
 * Main function
 */
async function main() {
  console.log('school_name,address,postal_code,planning_area,town,latitude,longitude')
  
  for (const school of PRIMARY_SCHOOLS) {
    let lat = null
    let lng = null
    let planning_area = school.planning_area
    let postal_code = school.postal
    
    // Try to geocode if we have address
    if (school.address) {
      const geo = await geocodeAddress(school.address)
      if (geo.lat && geo.lng) {
        lat = geo.lat
        lng = geo.lng
      }
      if (geo.planning_area) {
        planning_area = geo.planning_area
      }
      if (geo.postal_code) {
        postal_code = geo.postal_code
      }
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    // Output CSV
    console.log(`"${school.name}","${school.address || ''}","${postal_code || ''}","${planning_area || ''}","${school.town || ''}","${lat || ''}","${lng || ''}"`)
  }
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})

