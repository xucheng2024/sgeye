/**
 * Download boundaries using data.gov.sg new API
 */

const fs = require('fs')
const path = require('path')

// Dataset IDs from the website
const DATASETS = {
  planningAreas: {
    id: 'd_cc2f9c99c2a7cb55a54ad0f522016011', // Planning Boundary Area
    outputFile: 'planning-areas.geojson'
  },
  // Need to find subzones dataset ID
  subzones: {
    id: 'd_8594ae9ff96d0c708bc2af633048edfb', // Master Plan 2019 Subzone Boundary (No Sea) (GEOJSON)
    outputFile: 'subzones.geojson'
  }
}

async function downloadViaAPI(datasetId, outputFile) {
  console.log(`\nDownloading ${outputFile}...`)
  
  try {
    // Step 1: Get download URL
    const pollUrl = `https://api-open.data.gov.sg/v1/public/api/datasets/${datasetId}/poll-download`
    console.log(`  Polling: ${pollUrl}`)
    
    const pollResponse = await fetch(pollUrl)
    const pollData = await pollResponse.json()
    
    if (pollData.code !== 0) {
      console.error(`  ✗ API Error: ${pollData.errMsg || 'Unknown error'}`)
      return false
    }
    
    const downloadUrl = pollData.data?.url
    if (!downloadUrl) {
      console.error(`  ✗ No download URL in response`)
      return false
    }
    
    console.log(`  Download URL: ${downloadUrl.substring(0, 80)}...`)
    
    // Step 2: Download the file
    const fileResponse = await fetch(downloadUrl)
    if (!fileResponse.ok) {
      console.error(`  ✗ Download failed: ${fileResponse.status}`)
      return false
    }
    
    const fileData = await fileResponse.text()
    
    // Check if it's GeoJSON
    let geojson
    try {
      geojson = JSON.parse(fileData)
      if (geojson.type === 'FeatureCollection') {
        fs.writeFileSync(outputFile, JSON.stringify(geojson, null, 2))
        console.log(`  ✓ Downloaded ${geojson.features.length} features`)
        return true
      }
    } catch (e) {
      // Not JSON, might be KML or other format
      console.log(`  ⚠️  File is not GeoJSON, saving as-is`)
      fs.writeFileSync(outputFile, fileData)
      return true
    }
    
    fs.writeFileSync(outputFile, fileData)
    console.log(`  ✓ Downloaded`)
    return true
    
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`)
    return false
  }
}

async function searchForSubzones() {
  console.log('\nSearching for Subzones dataset...')
  
  try {
    // Try searching for subzone dataset
    const searchUrl = 'https://api-open.data.gov.sg/v1/public/api/datasets?q=subzone&limit=10'
    const response = await fetch(searchUrl)
    const data = await response.json()
    
    if (data.code === 0 && data.data && data.data.length > 0) {
      // Look for subzone boundary dataset
      const subzoneDataset = data.data.find(d => 
        d.title && d.title.toLowerCase().includes('subzone') && 
        d.title.toLowerCase().includes('boundary')
      )
      
      if (subzoneDataset) {
        console.log(`  Found: ${subzoneDataset.title} (${subzoneDataset.id})`)
        return subzoneDataset.id
      }
    }
  } catch (error) {
    console.log(`  Search failed: ${error.message}`)
  }
  
  return null
}

async function main() {
  const dataDir = path.join(__dirname, '..', 'data')
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  
  process.chdir(dataDir)
  
  console.log('='.repeat(60))
  console.log('Downloading URA Master Plan 2019 Boundaries')
  console.log('='.repeat(60))
  
  // Download Planning Areas
  const paSuccess = await downloadViaAPI(DATASETS.planningAreas.id, DATASETS.planningAreas.outputFile)
  
  // Download Subzones
  const subzoneSuccess = await downloadViaAPI(DATASETS.subzones.id, DATASETS.subzones.outputFile)
  
  console.log('\n' + '='.repeat(60))
  if (paSuccess) {
    console.log('✓ Planning Areas downloaded')
  }
  if (subzoneSuccess) {
    console.log('✓ Subzones downloaded')
  }
  console.log('='.repeat(60))
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

