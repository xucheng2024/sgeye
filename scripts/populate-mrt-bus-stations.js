/**
 * Populate MRT Stations and Bus Stops from OneMap API
 * 
 * This script fetches MRT stations and bus stops data from OneMap API
 * and populates the reference tables.
 * 
 * Usage:
 * node scripts/populate-mrt-bus-stations.js
 * 
 * Environment variables:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_KEY
 * 
 * Note: OneMap API has rate limits (250 requests per minute)
 */

const { createClient } = require('@supabase/supabase-js')

// Try to load .env.local if available
try {
  require('dotenv').config({ path: '.env.local' })
} catch (e) {
  // dotenv not available, use process.env directly
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: Missing Supabase credentials')
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

/**
 * Search MRT stations using OneMap API
 * Note: OneMap API doesn't have a direct MRT station endpoint,
 * so we search for known MRT station names
 */
async function searchMRTStation(stationName) {
  try {
    const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(stationName + ' MRT')}&returnGeom=Y&getAddrDetails=Y`
    const response = await fetch(url)
    
    if (response.ok) {
      const data = await response.json()
      if (data.results && data.results.length > 0) {
        // Find result that looks like an MRT station
        const stationResult = data.results.find(r => 
          r.SEARCHVAL && r.SEARCHVAL.toUpperCase().includes('MRT')
        ) || data.results[0]
        
        return {
          lat: parseFloat(stationResult.LATITUDE) || null,
          lng: parseFloat(stationResult.LONGITUDE) || null,
          address: stationResult.ADDRESS || null,
        }
      }
    }
  } catch (error) {
    console.error(`Error searching MRT station ${stationName}:`, error.message)
  }
  
  return { lat: null, lng: null, address: null }
}

/**
 * Search bus stop using OneMap API
 */
async function searchBusStop(busStopCode) {
  try {
    // OneMap API search for bus stop by code
    const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(busStopCode)}&returnGeom=Y&getAddrDetails=Y`
    const response = await fetch(url)
    
    if (response.ok) {
      const data = await response.json()
      if (data.results && data.results.length > 0) {
        const result = data.results[0]
        return {
          lat: parseFloat(result.LATITUDE) || null,
          lng: parseFloat(result.LONGITUDE) || null,
          address: result.ADDRESS || null,
        }
      }
    }
  } catch (error) {
    console.error(`Error searching bus stop ${busStopCode}:`, error.message)
  }
  
  return { lat: null, lng: null, address: null }
}

/**
 * Known MRT stations list (major stations)
 * This is a simplified list. For full list, you may need to:
 * 1. Use LTA DataMall API (requires API key)
 * 2. Or manually maintain a complete CSV file
 */
const MRT_STATIONS = [
  // North-South Line
  { name: 'Jurong East', code: 'NS1', line: 'NS' },
  { name: 'Bukit Batok', code: 'NS2', line: 'NS' },
  { name: 'Bukit Gombak', code: 'NS3', line: 'NS' },
  { name: 'Choa Chu Kang', code: 'NS4', line: 'NS' },
  { name: 'Yew Tee', code: 'NS5', line: 'NS' },
  { name: 'Kranji', code: 'NS7', line: 'NS' },
  { name: 'Marsiling', code: 'NS8', line: 'NS' },
  { name: 'Woodlands', code: 'NS9', line: 'NS' },
  { name: 'Admiralty', code: 'NS10', line: 'NS' },
  { name: 'Sembawang', code: 'NS11', line: 'NS' },
  { name: 'Yishun', code: 'NS13', line: 'NS' },
  { name: 'Khatib', code: 'NS14', line: 'NS' },
  { name: 'Yio Chu Kang', code: 'NS15', line: 'NS' },
  { name: 'Ang Mo Kio', code: 'NS16', line: 'NS' },
  { name: 'Bishan', code: 'NS17', line: 'NS' },
  { name: 'Braddell', code: 'NS18', line: 'NS' },
  { name: 'Toa Payoh', code: 'NS19', line: 'NS' },
  { name: 'Novena', code: 'NS20', line: 'NS' },
  { name: 'Newton', code: 'NS21', line: 'NS' },
  { name: 'Orchard', code: 'NS22', line: 'NS' },
  { name: 'Somerset', code: 'NS23', line: 'NS' },
  { name: 'Dhoby Ghaut', code: 'NS24', line: 'NS' },
  { name: 'City Hall', code: 'NS25', line: 'NS' },
  { name: 'Raffles Place', code: 'NS26', line: 'NS' },
  { name: 'Marina Bay', code: 'NS27', line: 'NS' },
  { name: 'Marina South Pier', code: 'NS28', line: 'NS' },
  
  // East-West Line (selected stations)
  { name: 'Pasir Ris', code: 'EW1', line: 'EW' },
  { name: 'Tampines', code: 'EW2', line: 'EW' },
  { name: 'Simei', code: 'EW3', line: 'EW' },
  { name: 'Tanah Merah', code: 'EW4', line: 'EW' },
  { name: 'Bedok', code: 'EW5', line: 'EW' },
  { name: 'Kembangan', code: 'EW6', line: 'EW' },
  { name: 'Eunos', code: 'EW7', line: 'EW' },
  { name: 'Paya Lebar', code: 'EW8', line: 'EW' },
  { name: 'Aljunied', code: 'EW9', line: 'EW' },
  { name: 'Kallang', code: 'EW10', line: 'EW' },
  { name: 'Lavender', code: 'EW11', line: 'EW' },
  { name: 'Bugis', code: 'EW12', line: 'EW' },
  { name: 'Tanjong Pagar', code: 'EW15', line: 'EW' },
  { name: 'Outram Park', code: 'EW16', line: 'EW' },
  { name: 'Tiong Bahru', code: 'EW17', line: 'EW' },
  { name: 'Redhill', code: 'EW18', line: 'EW' },
  { name: 'Queenstown', code: 'EW19', line: 'EW' },
  { name: 'Commonwealth', code: 'EW20', line: 'EW' },
  { name: 'Buona Vista', code: 'EW21', line: 'EW' },
  { name: 'Dover', code: 'EW22', line: 'EW' },
  { name: 'Clementi', code: 'EW23', line: 'EW' },
  { name: 'Jurong East', code: 'EW24', line: 'EW' },
  { name: 'Chinese Garden', code: 'EW25', line: 'EW' },
  { name: 'Lakeside', code: 'EW26', line: 'EW' },
  { name: 'Boon Lay', code: 'EW27', line: 'EW' },
  { name: 'Pioneer', code: 'EW28', line: 'EW' },
  { name: 'Joo Koon', code: 'EW29', line: 'EW' },
  
  // North-East Line (selected)
  { name: 'HarbourFront', code: 'NE1', line: 'NE' },
  { name: 'Outram Park', code: 'NE3', line: 'NE' },
  { name: 'Chinatown', code: 'NE4', line: 'NE' },
  { name: 'Clarke Quay', code: 'NE5', line: 'NE' },
  { name: 'Dhoby Ghaut', code: 'NE6', line: 'NE' },
  { name: 'Little India', code: 'NE7', line: 'NE' },
  { name: 'Farrer Park', code: 'NE8', line: 'NE' },
  { name: 'Boon Keng', code: 'NE9', line: 'NE' },
  { name: 'Potong Pasir', code: 'NE10', line: 'NE' },
  { name: 'Woodleigh', code: 'NE11', line: 'NE' },
  { name: 'Serangoon', code: 'NE12', line: 'NE' },
  { name: 'Kovan', code: 'NE13', line: 'NE' },
  { name: 'Hougang', code: 'NE14', line: 'NE' },
  { name: 'Buangkok', code: 'NE15', line: 'NE' },
  { name: 'Sengkang', code: 'NE16', line: 'NE' },
  { name: 'Punggol', code: 'NE17', line: 'NE' },
  
  // Circle Line (selected)
  { name: 'Dhoby Ghaut', code: 'CC1', line: 'CC' },
  { name: 'Bras Basah', code: 'CC2', line: 'CC' },
  { name: 'Esplanade', code: 'CC3', line: 'CC' },
  { name: 'Promenade', code: 'CC4', line: 'CC' },
  { name: 'Nicoll Highway', code: 'CC5', line: 'CC' },
  { name: 'Stadium', code: 'CC6', line: 'CC' },
  { name: 'Mountbatten', code: 'CC7', line: 'CC' },
  { name: 'Dakota', code: 'CC8', line: 'CC' },
  { name: 'Paya Lebar', code: 'CC9', line: 'CC' },
  { name: 'MacPherson', code: 'CC10', line: 'CC' },
  { name: 'Tai Seng', code: 'CC11', line: 'CC' },
  { name: 'Bartley', code: 'CC12', line: 'CC' },
  { name: 'Serangoon', code: 'CC13', line: 'CC' },
  { name: 'Lorong Chuan', code: 'CC14', line: 'CC' },
  { name: 'Bishan', code: 'CC15', line: 'CC' },
  
  // Downtown Line (selected)
  { name: 'Bukit Panjang', code: 'DT1', line: 'DT' },
  { name: 'Cashew', code: 'DT2', line: 'DT' },
  { name: 'Hillview', code: 'DT3', line: 'DT' },
  { name: 'Beauty World', code: 'DT5', line: 'DT' },
  { name: 'King Albert Park', code: 'DT6', line: 'DT' },
  { name: 'Sixth Avenue', code: 'DT7', line: 'DT' },
  { name: 'Tan Kah Kee', code: 'DT8', line: 'DT' },
  { name: 'Botanic Gardens', code: 'DT9', line: 'DT' },
  { name: 'Stevens', code: 'DT10', line: 'DT' },
  { name: 'Newton', code: 'DT11', line: 'DT' },
  { name: 'Little India', code: 'DT12', line: 'NE' },
  { name: 'Rochor', code: 'DT13', line: 'DT' },
  { name: 'Bugis', code: 'DT14', line: 'DT' },
  { name: 'Promenade', code: 'DT15', line: 'DT' },
  { name: 'Bayfront', code: 'DT16', line: 'DT' },
  { name: 'Downtown', code: 'DT17', line: 'DT' },
  { name: 'Telok Ayer', code: 'DT18', line: 'DT' },
  { name: 'Chinatown', code: 'DT19', line: 'DT' },
  { name: 'Fort Canning', code: 'DT20', line: 'DT' },
  { name: 'Bencoolen', code: 'DT21', line: 'DT' },
  { name: 'Jalan Besar', code: 'DT22', line: 'DT' },
  { name: 'Bendemeer', code: 'DT23', line: 'DT' },
  { name: 'Geylang Bahru', code: 'DT24', line: 'DT' },
  { name: 'Mattar', code: 'DT25', line: 'DT' },
  { name: 'MacPherson', code: 'DT26', line: 'DT' },
  { name: 'Ubi', code: 'DT27', line: 'DT' },
  { name: 'Kaki Bukit', code: 'DT28', line: 'DT' },
  { name: 'Bedok North', code: 'DT29', line: 'DT' },
  { name: 'Bedok Reservoir', code: 'DT30', line: 'DT' },
  { name: 'Tampines West', code: 'DT31', line: 'DT' },
  { name: 'Tampines', code: 'DT32', line: 'DT' },
  { name: 'Tampines East', code: 'DT33', line: 'DT' },
  { name: 'Upper Changi', code: 'DT34', line: 'DT' },
  { name: 'Expo', code: 'DT35', line: 'DT' },
]

/**
 * Populate MRT Stations
 */
async function populateMRTStations() {
  console.log('Populating MRT stations...')
  console.log(`Total stations: ${MRT_STATIONS.length}\n`)
  
  let successCount = 0
  let errorCount = 0
  let skippedCount = 0
  
  for (let i = 0; i < MRT_STATIONS.length; i++) {
    const station = MRT_STATIONS[i]
    
    try {
      // Check if station already exists
      const { data: existing } = await supabase
        .from('mrt_stations')
        .select('id')
        .eq('station_name', station.name)
        .single()
      
      if (existing) {
        console.log(`  [${i + 1}/${MRT_STATIONS.length}] ${station.name} (${station.code}) - Already exists`)
        skippedCount++
        continue
      }
      
      // Search for coordinates
      console.log(`  [${i + 1}/${MRT_STATIONS.length}] Searching: ${station.name}...`)
      const geo = await searchMRTStation(station.name)
      
      if (geo.lat && geo.lng) {
        const { error } = await supabase
          .from('mrt_stations')
          .insert({
            station_name: station.name,
            station_code: station.code,
            line_code: station.line,
            latitude: geo.lat,
            longitude: geo.lng,
            address: geo.address,
            updated_at: new Date().toISOString(),
          })
        
        if (error) {
          console.error(`    Error inserting: ${error.message}`)
          errorCount++
        } else {
          console.log(`    ✓ Inserted: ${geo.lat}, ${geo.lng}`)
          successCount++
        }
      } else {
        console.log(`    ✗ No coordinates found`)
        errorCount++
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 300))
    } catch (err) {
      console.error(`  Error processing ${station.name}:`, err.message)
      errorCount++
    }
  }
  
  console.log('\n=== MRT Stations Summary ===')
  console.log(`Successfully inserted: ${successCount}`)
  console.log(`Already exists: ${skippedCount}`)
  console.log(`Errors: ${errorCount}`)
  
  return successCount > 0 || skippedCount > 0
}

/**
 * Search bus stop using OneMap API by bus stop code
 * Note: OneMap API can search by bus stop code (5 digits)
 */
async function searchBusStopByCode(busStopCode) {
  try {
    // OneMap API search
    const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(busStopCode)}&returnGeom=Y&getAddrDetails=Y`
    const response = await fetch(url)
    
    if (response.ok) {
      const data = await response.json()
      if (data.results && data.results.length > 0) {
        const result = data.results[0]
        return {
          lat: parseFloat(result.LATITUDE) || null,
          lng: parseFloat(result.LONGITUDE) || null,
          address: result.ADDRESS || null,
          name: result.SEARCHVAL || null,
        }
      }
    }
  } catch (error) {
    console.error(`Error searching bus stop ${busStopCode}:`, error.message)
  }
  
  return { lat: null, lng: null, address: null, name: null }
}

/**
 * Populate Bus Stops
 * 
 * Note: For comprehensive bus stops data, you should:
 * 1. Use LTA DataMall API (free, requires registration at https://www.mytransport.sg/content/mytransport/home/dataMall.html)
 * 2. Download the CSV file and import it
 * 
 * This implementation uses OneMap API to search for bus stops by code,
 * but it's limited as we need to know the bus stop codes beforehand.
 * 
 * For now, we'll use a sampling approach: search for bus stops near MRT stations
 * as a starting point. For full coverage, use LTA DataMall API.
 */
async function populateBusStops() {
  console.log('\nPopulating bus stops...')
  console.log('Note: This uses OneMap API to search for bus stops.')
  console.log('For comprehensive data, use LTA DataMall API.\n')
  
  // Strategy: Search for bus stops near major MRT stations
  // We'll search for common bus stop codes near MRT stations
  // Note: This is a sampling approach. For full coverage, use LTA DataMall API.
  
  // Get MRT stations to search nearby bus stops
  const { data: mrtStations } = await supabase
    .from('mrt_stations')
    .select('station_name, latitude, longitude')
    .limit(20) // Sample major stations
  
  if (!mrtStations || mrtStations.length === 0) {
    console.log('No MRT stations found. Please populate MRT stations first.')
    return false
  }
  
  console.log(`Searching bus stops near ${mrtStations.length} MRT stations...`)
  console.log('Note: OneMap API search is limited. For comprehensive data, use LTA DataMall API.\n')
  
  let successCount = 0
  let errorCount = 0
  let skippedCount = 0
  
  // Search for bus stops using OneMap's nearby search
  // OneMap API doesn't have a direct "nearby bus stops" endpoint,
  // but we can try searching by common patterns
  
  // Alternative: Search for bus stops by trying common bus stop code patterns
  // Note: This is a simplified approach. Real implementation should use LTA DataMall API
  
  // For now, we'll search for bus stops by trying to find them near MRT stations
  // using OneMap's search with "bus stop" keyword
  for (let i = 0; i < Math.min(mrtStations.length, 10); i++) {
    const station = mrtStations[i]
    
    try {
      // Search for bus stops near this MRT station
      // Format: search for "bus stop" near station name
      const searchQuery = `${station.station_name} bus stop`
      const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(searchQuery)}&returnGeom=Y&getAddrDetails=Y&pageNum=1&returnGeom=Y`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        if (data.results && data.results.length > 0) {
          // Process results that look like bus stops
          for (const result of data.results.slice(0, 5)) { // Limit to 5 per station
            if (result.SEARCHVAL && (
              result.SEARCHVAL.toUpperCase().includes('BUS') ||
              result.SEARCHVAL.match(/\d{5}/) // 5-digit bus stop code pattern
            )) {
              const busStopCode = result.SEARCHVAL.match(/\d{5}/)?.[0] || null
              const busStopName = result.SEARCHVAL.replace(/\d{5}/, '').trim() || result.SEARCHVAL
              
              if (busStopCode) {
                // Check if already exists
                const { data: existing } = await supabase
                  .from('bus_stops')
                  .select('id')
                  .eq('bus_stop_code', busStopCode)
                  .single()
                
                if (!existing) {
                  const { error } = await supabase
                    .from('bus_stops')
                    .insert({
                      bus_stop_code: busStopCode,
                      bus_stop_name: busStopName,
                      latitude: parseFloat(result.LATITUDE) || null,
                      longitude: parseFloat(result.LONGITUDE) || null,
                      road_name: result.ROAD_NAME || null,
                      description: result.SEARCHVAL,
                      updated_at: new Date().toISOString(),
                    })
                  
                  if (error) {
                    // Skip if duplicate or other error
                    if (!error.message.includes('duplicate')) {
                      console.warn(`  Error inserting bus stop ${busStopCode}: ${error.message}`)
                    }
                    skippedCount++
                  } else {
                    successCount++
                    if (successCount % 10 === 0) {
                      console.log(`  Inserted ${successCount} bus stops...`)
                    }
                  }
                } else {
                  skippedCount++
                }
              }
            }
          }
        }
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (err) {
      console.error(`  Error processing bus stops near ${station.station_name}:`, err.message)
      errorCount++
    }
  }
  
  console.log('\n=== Bus Stops Summary ===')
  console.log(`Successfully inserted: ${successCount}`)
  console.log(`Already exists/Skipped: ${skippedCount}`)
  console.log(`Errors: ${errorCount}`)
  console.log('\n⚠️  Note: This is a limited sample. For comprehensive bus stops data,')
  console.log('   please use LTA DataMall API or import from CSV file.')
  
  return successCount > 0 || skippedCount > 0
}

/**
 * Main function
 */
async function main() {
  console.log('Starting MRT and Bus stations population...')
  console.log(`Time: ${new Date().toISOString()}\n`)
  
  try {
    const mrtSuccess = await populateMRTStations()
    
    // Bus stops - placeholder for now
    await populateBusStops()
    
    console.log('\n' + '='.repeat(50))
    if (mrtSuccess) {
      console.log('✅ MRT stations population completed!')
    } else {
      console.log('⚠️  MRT stations population had errors. Check logs above.')
    }
    console.log('='.repeat(50))
    process.exit(0)
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

main()

