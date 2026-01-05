/**
 * Migration Script: Populate neighbourhood_living_notes from static file
 * 
 * This script reads the static data from lib/neighbourhood-living-notes.ts
 * and inserts it into the database.
 * 
 * Usage: node scripts/migrate-living-notes-to-db.js
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

// Read and parse the static file
function extractNotesFromFile() {
  const filePath = path.join(__dirname, '..', 'lib', 'neighbourhood-living-notes.ts')
  const content = fs.readFileSync(filePath, 'utf-8')
  
  // Extract the NOTES_BY_KEY object using regex
  const match = content.match(/const NOTES_BY_KEY:\s*Record<string,\s*LivingNotes>\s*=\s*({[\s\S]*?});/)
  if (!match) {
    throw new Error('Could not find NOTES_BY_KEY in file')
  }
  
  // Evaluate the object (safe because it's our own file)
  // We'll use a safer approach: parse it manually
  const notesObj = {}
  const entries = match[1]
  
  // Simple parser for the object structure
  // This is a simplified parser - for production, consider using a proper TypeScript parser
  const keyValueRegex = /(\w+(?:\s+\w+)*):\s*{([^}]+)}/g
  let entry
  
  // More robust parsing: find each neighbourhood entry
  const neighbourhoodRegex = /(['"]?)([A-Z][A-Z\s]+?)\1:\s*{([^}]+?noiseDensity[^}]+?dailyConvenience[^}]+?greenOutdoor[^}]+?crowdVibe[^}]+?longTermComfort[^}]+?)}/gs
  
  while ((entry = neighbourhoodRegex.exec(entries)) !== null) {
    const key = entry[2].trim().toUpperCase()
    const valueBlock = entry[3]
    
    // Parse each dimension
    const parseDimension = (dimName) => {
      const dimRegex = new RegExp(`${dimName}:\\s*{\\s*rating:\\s*['"](\\w+)['"],\\s*note:\\s*['"]([^'"]+)['"]`, 'g')
      const match = dimRegex.exec(valueBlock)
      if (match) {
        return {
          rating: match[1],
          note: match[2]
        }
      }
      return null
    }
    
    const noiseDensity = parseDimension('noiseDensity')
    const dailyConvenience = parseDimension('dailyConvenience')
    const greenOutdoor = parseDimension('greenOutdoor')
    const crowdVibe = parseDimension('crowdVibe')
    const longTermComfort = parseDimension('longTermComfort')
    
    if (noiseDensity && dailyConvenience && greenOutdoor && crowdVibe && longTermComfort) {
      notesObj[key] = {
        noiseDensity,
        dailyConvenience,
        greenOutdoor,
        crowdVibe,
        longTermComfort
      }
    }
  }
  
  return notesObj
}

async function migrateNotes() {
  console.log('Extracting notes from static file...')
  const notes = extractNotesFromFile()
  console.log(`Found ${Object.keys(notes).length} neighbourhood notes`)
  
  console.log('Inserting notes into database...')
  let successCount = 0
  let errorCount = 0
  
  for (const [name, noteData] of Object.entries(notes)) {
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
        console.error(`Error inserting ${name}:`, error.message)
        errorCount++
      } else {
        successCount++
        if (successCount % 50 === 0) {
          console.log(`  Processed ${successCount} notes...`)
        }
      }
    } catch (err) {
      console.error(`Error processing ${name}:`, err.message)
      errorCount++
    }
  }
  
  console.log(`\nMigration complete!`)
  console.log(`  Success: ${successCount}`)
  console.log(`  Errors: ${errorCount}`)
}

// Run migration
migrateNotes().catch(console.error)

