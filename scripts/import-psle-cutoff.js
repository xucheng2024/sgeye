/**
 * PSLE Cut-off Data Import Script
 * 
 * Imports PSLE cut-off data into psle_cutoff table
 * 
 * Note: MOE does not publish official cut-off data.
 * This data needs to be collected from community sources (KiasuParents, Schoolbell, etc.)
 * 
 * Usage:
 * 1. Prepare CSV file with cut-off data
 * 2. Set environment variables:
 *    - SUPABASE_URL=your_supabase_url
 *    - SUPABASE_SERVICE_KEY=your_service_role_key
 * 3. Run: node scripts/import-psle-cutoff.js --file path/to/cutoff-data.csv
 * 
 * CSV Format:
 * school_name,year,cutoff_range,cutoff_min,cutoff_max,source_note
 * "Ang Mo Kio Primary School",2023,"231-250",231,250,"Community aggregated"
 * 
 * Or JSON Format:
 * [
 *   {
 *     "school_name": "Ang Mo Kio Primary School",
 *     "year": 2023,
 *     "cutoff_range": "231-250",
 *     "cutoff_min": 231,
 *     "cutoff_max": 250,
 *     "source_note": "Community aggregated"
 *   }
 * ]
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

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
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase())
  
  const cutoffs = []
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
    
    const cutoff = {}
    headers.forEach((header, index) => {
      const value = values[index] || ''
      switch (header) {
        case 'school_name':
        case 'name':
          cutoff.school_name = value
          break
        case 'year':
          cutoff.year = parseInt(value) || null
          break
        case 'cutoff_range':
        case 'range':
          cutoff.cutoff_range = value || null
          break
        case 'cutoff_min':
        case 'min':
          cutoff.cutoff_min = value ? parseInt(value) : null
          break
        case 'cutoff_max':
        case 'max':
          cutoff.cutoff_max = value ? parseInt(value) : null
          break
        case 'source_note':
        case 'source':
        case 'note':
          cutoff.source_note = value || 'Community aggregated'
          break
      }
    })
    
    if (cutoff.school_name && cutoff.year) {
      cutoffs.push(cutoff)
    }
  }
  
  return cutoffs
}

/**
 * Parse JSON file
 */
function parseJSON(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const data = JSON.parse(content)
  
  return (Array.isArray(data) ? data : [data]).map(item => ({
    school_name: item.school_name || item.name,
    year: item.year,
    cutoff_range: item.cutoff_range || item.range || null,
    cutoff_min: item.cutoff_min || item.min || null,
    cutoff_max: item.cutoff_max || item.max || null,
    source_note: item.source_note || item.source || item.note || 'Community aggregated'
  })).filter(c => c.school_name && c.year)
}

/**
 * Import cutoffs to Supabase
 */
async function importCutoffs(cutoffs) {
  console.log(`\nImporting ${cutoffs.length} cut-off records...`)
  
  let imported = 0
  let updated = 0
  let errors = 0
  
  for (const cutoff of cutoffs) {
    try {
      // Find school by name
      const { data: schools, error: schoolError } = await supabase
        .from('primary_schools')
        .select('id')
        .ilike('school_name', `%${cutoff.school_name}%`)
        .limit(1)
      
      if (schoolError) throw schoolError
      if (!schools || schools.length === 0) {
        console.error(`School not found: ${cutoff.school_name}`)
        errors++
        continue
      }
      
      const schoolId = schools[0].id
      
      // Check if cutoff already exists
      const { data: existing } = await supabase
        .from('psle_cutoff')
        .select('id')
        .eq('school_id', schoolId)
        .eq('year', cutoff.year)
        .limit(1)
      
      if (existing && existing.length > 0) {
        // Update existing
        const { error } = await supabase
          .from('psle_cutoff')
          .update({
            cutoff_range: cutoff.cutoff_range,
            cutoff_min: cutoff.cutoff_min,
            cutoff_max: cutoff.cutoff_max,
            source_note: cutoff.source_note
          })
          .eq('id', existing[0].id)
        
        if (error) throw error
        updated++
      } else {
        // Insert new
        const { error } = await supabase
          .from('psle_cutoff')
          .insert([{
            school_id: schoolId,
            year: cutoff.year,
            cutoff_range: cutoff.cutoff_range,
            cutoff_min: cutoff.cutoff_min,
            cutoff_max: cutoff.cutoff_max,
            source_note: cutoff.source_note
          }])
        
        if (error) throw error
        imported++
      }
    } catch (error) {
      console.error(`Error importing cutoff for ${cutoff.school_name} (${cutoff.year}):`, error.message)
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
  const fileIndex = args.indexOf('--file')
  
  if (fileIndex === -1 || !args[fileIndex + 1]) {
    console.error('Usage: node scripts/import-psle-cutoff.js --file <path/to/cutoff-data.csv|cutoff-data.json>')
    process.exit(1)
  }
  
  const filePath = args[fileIndex + 1]
  const ext = filePath.split('.').pop().toLowerCase()
  
  let cutoffs = []
  if (ext === 'csv') {
    cutoffs = parseCSV(filePath)
  } else if (ext === 'json') {
    cutoffs = parseJSON(filePath)
  } else {
    console.error('Error: Unsupported file format. Use .csv or .json')
    process.exit(1)
  }
  
  if (cutoffs.length === 0) {
    console.error('Error: No cut-off data found to import')
    process.exit(1)
  }
  
  await importCutoffs(cutoffs)
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

module.exports = { parseCSV, parseJSON, importCutoffs }


