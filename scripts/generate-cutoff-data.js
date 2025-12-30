/**
 * Generate PSLE Cut-off Data Based on School Popularity
 * 
 * This script generates cut-off data for all schools based on:
 * 1. Known popular schools (high cut-off)
 * 2. School location and reputation
 * 3. General patterns
 * 
 * Note: This is estimated data based on school popularity patterns,
 * not official MOE data.
 */

const fs = require('fs')

// Read schools from CSV
function readSchools() {
  const content = fs.readFileSync('data/schools-complete.csv', 'utf-8')
  const lines = content.split('\n').filter(line => line.trim())
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase())
  
  const schools = []
  for (let i = 1; i < lines.length; i++) {
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

// Determine cut-off band based on school name patterns
function getCutoffBand(schoolName) {
  const name = schoolName.toLowerCase()
  
  // High-demand schools (known popular schools)
  const highDemandPatterns = [
    'nanyang', 'raffles', 'catholic high', 'henry park', 'methodist girls',
    'anglo-chinese', 'tao nan', 'singapore chinese girls', 'st. joseph',
    'st joseph', 'chij st. nicholas', 'pei hwa', 'kuo chuan', 'nan hua',
    'roswith', 'roswith school', 'st. hilda', 'st hilda', 'maris stella',
    'st. anthony', 'st anthony', 'st. gabriel', 'st gabriel', 'st. stephen',
    'st stephen', 'holy innocents', 'paya lebar methodist', 'montfort',
    'canossa', 'st. margaret', 'st margaret', 'st andrew', 'st. andrew'
  ]
  
  // Mid-demand schools
  const midDemandPatterns = [
    'ang mo kio', 'clementi', 'tampines', 'queenstown', 'toa payoh',
    'bishan', 'serangoon', 'hougang', 'jurong', 'bedok', 'geylang',
    'kallang', 'bukit timah', 'bukit merah', 'marine parade', 'ngee ann',
    'hong wen', 'kong hwa', 'maha bodhi', 'red swastika', 'changkat',
    'chongzheng', 'yumin', 'poi ching', 'st. anthony canossian'
  ]
  
  for (const pattern of highDemandPatterns) {
    if (name.includes(pattern)) {
      return { range: '≥251', min: 251, max: 260 }
    }
  }
  
  for (const pattern of midDemandPatterns) {
    if (name.includes(pattern)) {
      return { range: '231-250', min: 231, max: 250 }
    }
  }
  
  // Default: lower demand
  return { range: '≤230', min: 220, max: 230 }
}

// Generate cut-off data
function generateCutoffData() {
  const schools = readSchools()
  const currentYear = new Date().getFullYear()
  const years = [currentYear - 1, currentYear - 2, currentYear - 3]
  
  console.log('school_name,year,cutoff_range,cutoff_min,cutoff_max,source_note')
  
  schools.forEach(school => {
    const cutoff = getCutoffBand(school.school_name)
    
    years.forEach(year => {
      console.log(`"${school.school_name}",${year},"${cutoff.range}",${cutoff.min},${cutoff.max},"Estimated based on school popularity patterns"`)
    })
  })
}

generateCutoffData()

