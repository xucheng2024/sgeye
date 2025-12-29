/**
 * Test script to verify rental data API access
 * This helps debug API issues before running the full import
 */

// Use built-in fetch (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('Error: This script requires Node.js 18+ with built-in fetch')
  process.exit(1)
}

const DATA_GOV_SG_DATASET_ID = 'd_c9f57187485a850908655db0e8cfe651'

async function testAPI() {
  console.log('Testing data.gov.sg API access...\n')
  
  // Test 1: Get resource ID from dataset
  console.log('1. Fetching resource ID from dataset...')
  const datasetUrl = `https://data.gov.sg/api/action/package_show?id=${DATA_GOV_SG_DATASET_ID}`
  
  try {
    const response = await fetch(datasetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success && data.result && data.result.resources && data.result.resources.length > 0) {
      const resourceId = data.result.resources[0].id
      console.log(`✅ Found resource ID: ${resourceId}`)
      console.log(`   Resource name: ${data.result.resources[0].name || 'N/A'}`)
      console.log(`   Resource format: ${data.result.resources[0].format || 'N/A'}`)
      
      // Test 2: Fetch sample data
      console.log('\n2. Fetching sample rental data...')
      const dataUrl = `https://data.gov.sg/api/action/datastore_search?resource_id=${resourceId}&limit=5`
      
      const dataResponse = await fetch(dataUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      })
      
      if (!dataResponse.ok) {
        throw new Error(`HTTP error! status: ${dataResponse.status}`)
      }
      
      const rentalData = await dataResponse.json()
      
      if (rentalData.success && rentalData.result && rentalData.result.records) {
        console.log(`✅ Successfully fetched ${rentalData.result.records.length} sample records`)
        console.log(`   Total records available: ${rentalData.result.total || 'unknown'}`)
        console.log('\n3. Sample record structure:')
        if (rentalData.result.records.length > 0) {
          console.log(JSON.stringify(rentalData.result.records[0], null, 2))
        }
        
        console.log('\n✅ API test successful! You can now run the import script.')
        return true
      } else {
        console.error('❌ Invalid response structure:', rentalData)
        return false
      }
    } else {
      console.error('❌ Could not find resources in dataset response')
      console.log('Response:', JSON.stringify(data, null, 2))
      return false
    }
  } catch (error) {
    console.error('❌ Error testing API:', error.message)
    console.error('\nNote: If you see Cloudflare blocking, the script should work fine in GitHub Actions.')
    console.error('For local testing, you may need to use a VPN or wait a moment.')
    return false
  }
}

testAPI()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

