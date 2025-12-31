/**
 * Download boundaries via data.gov.sg API
 */

const fs = require('fs')
const path = require('path')

const RESOURCES = {
  planningAreas: {
    resourceId: 'd_6c6d7361dd826d97b91bac914ca6b2ac',
    datasetId: 'master-plan-2019-planning-area-boundary-no-sea',
    outputFile: 'planning-areas.geojson'
  },
  subzones: {
    resourceId: 'd_8594ae9ff96d0c708bc2af633048edfb',
    datasetId: 'master-plan-2019-subzone-boundary-no-sea',
    outputFile: 'subzones.geojson'
  }
}

async function downloadViaAPI(resource) {
  console.log(`\nDownloading ${resource.outputFile}...`)
  
  // Try multiple download methods
  const urls = [
    // Method 1: Direct download from data.gov.sg
    `https://www.data.gov.sg/dataset/${resource.datasetId}/resource/${resource.resourceId}/download`,
    // Method 2: Alternative download URL
    `https://data.gov.sg/dataset/${resource.datasetId}/resource/${resource.resourceId}/download`,
    // Method 3: API endpoint
    `https://data.gov.sg/api/action/resource_show?id=${resource.resourceId}`,
  ]
  
  for (const url of urls) {
    try {
      console.log(`  Trying: ${url}`)
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      })
      
      if (response.ok) {
        const contentType = response.headers.get('content-type') || ''
        
        if (contentType.includes('application/json') || contentType.includes('application/geo+json')) {
          const data = await response.json()
          
          // Check if it's already GeoJSON
          if (data.type === 'FeatureCollection') {
            fs.writeFileSync(resource.outputFile, JSON.stringify(data, null, 2))
            console.log(`  ✓ Downloaded ${data.features.length} features`)
            return true
          }
          
          // Check if it's API response with download URL
          if (data.result && data.result.url) {
            const downloadUrl = data.result.url
            console.log(`  Found download URL: ${downloadUrl}`)
            const fileResponse = await fetch(downloadUrl)
            if (fileResponse.ok) {
              const fileData = await fileResponse.text()
              fs.writeFileSync(resource.outputFile, fileData)
              console.log(`  ✓ Downloaded via URL`)
              return true
            }
          }
        } else if (contentType.includes('text/plain') || url.includes('download')) {
          // Might be direct file download
          const text = await response.text()
          if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
            // Looks like JSON
            fs.writeFileSync(resource.outputFile, text)
            console.log(`  ✓ Downloaded (detected as JSON)`)
            return true
          }
        }
      }
    } catch (error) {
      console.log(`  ✗ Failed: ${error.message}`)
      continue
    }
  }
  
  return false
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
  
  let success = 0
  
  // Download Planning Areas
  if (await downloadViaAPI(RESOURCES.planningAreas)) {
    success++
  }
  
  // Download Subzones
  if (await downloadViaAPI(RESOURCES.subzones)) {
    success++
  }
  
  console.log('\n' + '='.repeat(60))
  if (success === 2) {
    console.log('✓ Both files downloaded successfully!')
    console.log('\nNext step: Run import scripts')
  } else {
    console.log(`⚠️  Downloaded ${success}/2 files`)
    console.log('\nIf download failed, please manually download from:')
    console.log('  Planning Areas: https://data.gov.sg/dataset/master-plan-2019-planning-area-boundary-no-sea')
    console.log('  Subzones: https://data.gov.sg/dataset/master-plan-2019-subzone-boundary-no-sea')
  }
  console.log('='.repeat(60))
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

