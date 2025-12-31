/**
 * Download boundaries using browser automation
 * This uses Puppeteer to access data.gov.sg and download files
 */

// Note: This requires puppeteer to be installed
// npm install puppeteer

const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

async function downloadWithBrowser() {
  console.log('Starting browser to download files...')
  
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  
  const dataDir = path.join(__dirname, '..', 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  
  // Set up download path
  await page._client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: dataDir
  })
  
  try {
    // Download Planning Areas
    console.log('\nDownloading Planning Areas...')
    await page.goto('https://data.gov.sg/dataset/master-plan-2019-planning-area-boundary-no-sea', {
      waitUntil: 'networkidle2'
    })
    
    // Wait for download button and click
    await page.waitForSelector('a[href*="download"], button[aria-label*="Download"]', { timeout: 10000 })
    await page.click('a[href*="download"], button[aria-label*="Download"]')
    
    // Wait for download
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // Download Subzones
    console.log('Downloading Subzones...')
    await page.goto('https://data.gov.sg/dataset/master-plan-2019-subzone-boundary-no-sea', {
      waitUntil: 'networkidle2'
    })
    
    await page.waitForSelector('a[href*="download"], button[aria-label*="Download"]', { timeout: 10000 })
    await page.click('a[href*="download"], button[aria-label*="Download"]')
    
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    console.log('✓ Downloads initiated')
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await browser.close()
  }
}

// Check if puppeteer is available
try {
  require('puppeteer')
  downloadWithBrowser().catch(console.error)
} catch (e) {
  console.log('Puppeteer not installed. Installing...')
  console.log('Run: npm install puppeteer')
  console.log('Then run this script again')
}

