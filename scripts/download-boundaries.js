/**
 * Download URA Master Plan 2019 boundaries from data.gov.sg
 */

const fs = require('fs')
const path = require('path')

// Data.gov.sg resource IDs
const RESOURCES = {
  planningAreas: 'd_6c6d7361dd826d97b91bac914ca6b2ac',
  subzones: 'd_8594ae9ff96d0c708bc2af633048edfb'
}

async function downloadGeoJSON(resourceId, outputFile) {
  console.log(`Downloading ${outputFile}...`)
  
  // Try direct download URL first
  const directUrl = `https://data.gov.sg/api/action/datastore_search?resource_id=${resourceId}&limit=10000`
  
  try {
    const response = await fetch(directUrl)
    const data = await response.json()
    
    if (data.success && data.result && data.result.records) {
      // Convert records to GeoJSON format
      const features = data.result.records.map(record => ({
        type: 'Feature',
        properties: record,
        geometry: record.geometry || null
      }))
      
      const geojson = {
        type: 'FeatureCollection',
        features: features
      }
      
      fs.writeFileSync(outputFile, JSON.stringify(geojson, null, 2))
      console.log(`✓ Downloaded ${features.length} features to ${outputFile}`)
      return true
    } else {
      console.log('API response format different, trying alternative method...')
      // Save raw response for inspection
      fs.writeFileSync(outputFile + '.raw.json', JSON.stringify(data, null, 2))
      return false
    }
  } catch (error) {
    console.error(`Error downloading ${outputFile}:`, error.message)
    return false
  }
}

async function main() {
  const dataDir = path.join(__dirname, '..', 'data')
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  
  console.log('='.repeat(60))
  console.log('Downloading URA Master Plan 2019 Boundaries')
  console.log('='.repeat(60))
  
  // Download Planning Areas
  const paFile = path.join(dataDir, 'planning-areas.geojson')
  await downloadGeoJSON(RESOURCES.planningAreas, paFile)
  
  // Download Subzones
  const szFile = path.join(dataDir, 'subzones.geojson')
  await downloadGeoJSON(RESOURCES.subzones, szFile)
  
  console.log('\n' + '='.repeat(60))
  console.log('Download complete!')
  console.log('='.repeat(60))
  console.log('\nNote: If direct API download fails, please manually download from:')
  console.log('  Planning Areas: https://data.gov.sg/datasets/d_6c6d7361dd826d97b91bac914ca6b2ac')
  console.log('  Subzones: https://data.gov.sg/datasets/d_8594ae9ff96d0c708bc2af633048edfb')
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

