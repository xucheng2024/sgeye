/**
 * Populate neighbourhood_living_notes table from static TypeScript file
 * 
 * Usage: node scripts/populate-living-notes.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Parse the TypeScript file to extract NOTES_BY_KEY
function parseNotesFromFile() {
  const filePath = path.join(__dirname, '..', 'lib', 'neighbourhood-living-notes.ts')
  const content = fs.readFileSync(filePath, 'utf-8')
  
  const notes = {}
  
  // Find the start of NOTES_BY_KEY
  const startMarker = 'const NOTES_BY_KEY: Record<string, LivingNotes> = {'
  const startIdx = content.indexOf(startMarker)
  if (startIdx === -1) {
    throw new Error('Could not find NOTES_BY_KEY definition')
  }
  
  // Extract the object content (everything between the opening and closing braces)
  let braceCount = 0
  let inString = false
  let stringChar = null
  let escapeNext = false
  let objContent = ''
  let i = startIdx + startMarker.length
  
  // Skip whitespace
  while (i < content.length && /\s/.test(content[i])) i++
  
  // Now parse the object
  while (i < content.length) {
    const char = content[i]
    const prevChar = i > 0 ? content[i - 1] : ''
    
    if (escapeNext) {
      objContent += char
      escapeNext = false
      i++
      continue
    }
    
    if (char === '\\' && inString) {
      escapeNext = true
      objContent += char
      i++
      continue
    }
    
    if (!inString && (char === '"' || char === "'")) {
      inString = true
      stringChar = char
      objContent += char
    } else if (inString && char === stringChar && prevChar !== '\\') {
      inString = false
      stringChar = null
      objContent += char
    } else if (!inString) {
      if (char === '{') {
        braceCount++
        objContent += char
      } else if (char === '}') {
        if (braceCount === 0) {
          // Found the closing brace of NOTES_BY_KEY
          break
        }
        braceCount--
        objContent += char
      } else {
        objContent += char
      }
    } else {
      objContent += char
    }
    i++
  }
  
  // Now parse the extracted object content
  // Pattern: 'NAME' or NAME: { ... }
  const entryPattern = /(['"]?)([A-Z][A-Z\s'\-()]+?)\1:\s*\{/g
  let match
  
  while ((match = entryPattern.exec(objContent)) !== null) {
    const name = match[2].trim().toUpperCase()
    const entryStart = match.index + match[0].length
    
    // Find the matching closing brace for this entry
    let entryBraceCount = 1
    let entryInString = false
    let entryStringChar = null
    let entryEscape = false
    let j = entryStart
    let entryContent = ''
    
    while (j < objContent.length && entryBraceCount > 0) {
      const char = objContent[j]
      const prevChar = j > 0 ? objContent[j - 1] : ''
      
      if (entryEscape) {
        entryContent += char
        entryEscape = false
        j++
        continue
      }
      
      if (char === '\\' && entryInString) {
        entryEscape = true
        entryContent += char
        j++
        continue
      }
      
      if (!entryInString && (char === '"' || char === "'")) {
        entryInString = true
        entryStringChar = char
        entryContent += char
      } else if (entryInString && char === entryStringChar && prevChar !== '\\') {
        entryInString = false
        entryStringChar = null
        entryContent += char
      } else if (!entryInString) {
        if (char === '{') {
          entryBraceCount++
          entryContent += char
        } else if (char === '}') {
          entryBraceCount--
          if (entryBraceCount > 0) {
            entryContent += char
          }
        } else {
          entryContent += char
        }
      } else {
        entryContent += char
      }
      j++
    }
    
    // Extract dimensions from entry content
    const extractDimension = (dimName) => {
      // Pattern: dimName: { rating: '...', note: '...' }
      const regex = new RegExp(`${dimName}:\\s*{\\s*rating:\\s*['"](\\w+)['"],\\s*note:\\s*['"]([^'"]*(?:\\\\.[^'"]*)*)['"]`, 's')
      const dimMatch = regex.exec(entryContent)
      if (dimMatch) {
        return {
          rating: dimMatch[1],
          note: dimMatch[2]
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\')
            .replace(/\\n/g, '\n')
        }
      }
      return null
    }
    
    const noiseDensity = extractDimension('noiseDensity')
    const dailyConvenience = extractDimension('dailyConvenience')
    const greenOutdoor = extractDimension('greenOutdoor')
    const crowdVibe = extractDimension('crowdVibe')
    const longTermComfort = extractDimension('longTermComfort')
    
    if (noiseDensity && dailyConvenience && greenOutdoor && crowdVibe && longTermComfort) {
      notes[name] = {
        noiseDensity,
        dailyConvenience,
        greenOutdoor,
        crowdVibe,
        longTermComfort
      }
    } else {
      console.warn(`Warning: Could not parse all dimensions for ${name}`)
    }
  }
  
  return notes
}

async function populateDatabase() {
  console.log('Parsing notes from TypeScript file...')
  let notes
  try {
    notes = parseNotesFromFile()
  } catch (error) {
    console.error('Error parsing file:', error.message)
    process.exit(1)
  }
  
  console.log(`Found ${Object.keys(notes).length} neighbourhood notes\n`)
  
  if (Object.keys(notes).length === 0) {
    console.error('No notes found! Check the parsing logic.')
    process.exit(1)
  }
  
  console.log('Inserting notes into database...')
  let successCount = 0
  let errorCount = 0
  const errors = []
  
  // Process in batches to avoid overwhelming the database
  const batchSize = 50
  const entries = Object.entries(notes)
  
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize)
    const batchPromises = batch.map(async ([name, noteData]) => {
      try {
        const { error } = await supabase
          .from('neighbourhood_living_notes')
          .upsert({
            neighbourhood_name: name,
            noise_density_rating: noteData.noiseDensity.rating,
            noise_density_note: noteData.noiseDensity.note,
            daily_convenience_rating: noteData.dailyConvenience.rating,
            daily_convenience_note: noteData.dailyConvenience.note,
            green_outdoor_rating: noteData.greenOutdoor.rating,
            green_outdoor_note: noteData.greenOutdoor.note,
            crowd_vibe_rating: noteData.crowdVibe.rating,
            crowd_vibe_note: noteData.crowdVibe.note,
            long_term_comfort_rating: noteData.longTermComfort.rating,
            long_term_comfort_note: noteData.longTermComfort.note,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'neighbourhood_name'
          })
        
        if (error) {
          errors.push({ name, error: error.message })
          errorCount++
          return false
        }
        successCount++
        return true
      } catch (err) {
        errors.push({ name, error: err.message })
        errorCount++
        return false
      }
    })
    
    await Promise.all(batchPromises)
    
    if (i + batchSize < entries.length) {
      console.log(`  Processed ${Math.min(i + batchSize, entries.length)}/${entries.length} notes...`)
    }
  }
  
  console.log(`\nMigration complete!`)
  console.log(`  ✅ Success: ${successCount}`)
  console.log(`  ❌ Errors: ${errorCount}`)
  
  if (errors.length > 0) {
    console.log(`\nErrors encountered:`)
    errors.slice(0, 10).forEach(({ name, error }) => {
      console.log(`  - ${name}: ${error}`)
    })
    if (errors.length > 10) {
      console.log(`  ... and ${errors.length - 10} more errors`)
    }
  }
  
  // Verify the data
  console.log('\nVerifying data...')
  const { count, error: countError } = await supabase
    .from('neighbourhood_living_notes')
    .select('*', { count: 'exact', head: true })
  
  if (!countError) {
    console.log(`  Total records in database: ${count}`)
  }
}

// Run the migration
populateDatabase().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
