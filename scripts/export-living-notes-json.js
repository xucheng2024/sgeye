/**
 * Export living notes to JSON for migration
 * 
 * This script extracts the NOTES_BY_KEY data and exports it as JSON
 * which can then be imported into the database.
 * 
 * Usage: node scripts/export-living-notes-json.js > data/living-notes.json
 */

const fs = require('fs')
const path = require('path')

// Read the TypeScript file
const filePath = path.join(__dirname, '..', 'lib', 'neighbourhood-living-notes.ts')
const content = fs.readFileSync(filePath, 'utf-8')

// Extract the NOTES_BY_KEY object by finding the content between the braces
// We'll use a more robust approach: find the object definition and extract it
const startMarker = 'const NOTES_BY_KEY: Record<string, LivingNotes> = {'
const endMarker = '}'

const startIdx = content.indexOf(startMarker)
if (startIdx === -1) {
  console.error('Could not find NOTES_BY_KEY definition')
  process.exit(1)
}

// Find the matching closing brace
let braceCount = 0
let inString = false
let stringChar = null
let i = startIdx + startMarker.length
let objStart = i

while (i < content.length) {
  const char = content[i]
  const prevChar = i > 0 ? content[i - 1] : ''
  
  if (!inString && (char === '"' || char === "'")) {
    inString = true
    stringChar = char
  } else if (inString && char === stringChar && prevChar !== '\\') {
    inString = false
    stringChar = null
  } else if (!inString) {
    if (char === '{') braceCount++
    if (char === '}') {
      if (braceCount === 0) {
        // Found the closing brace
        const objContent = content.substring(objStart, i).trim()
        
        // Now we need to parse this TypeScript object into JSON
        // This is complex, so we'll use a simpler approach:
        // Convert the TypeScript object syntax to valid JSON
        
        // Replace TypeScript syntax with JSON syntax
        let jsonStr = objContent
          // Remove trailing commas
          .replace(/,(\s*[}\]])/g, '$1')
          // Fix property names (remove quotes if they're valid identifiers, add if needed)
          .replace(/(['"]?)([A-Z_][A-Z0-9_\s]*)\1:\s*{/g, (match, quote, name) => {
            const cleanName = name.trim().replace(/\s+/g, ' ')
            return `"${cleanName}": {`
          })
          // Fix nested object structure
          .replace(/(\w+):\s*{\s*rating:\s*['"]([^'"]+)['"],\s*note:\s*['"]([^'"]+)['"]\s*}/g, 
            (match, key, rating, note) => {
              return `${key}: { "rating": "${rating}", "note": "${note.replace(/"/g, '\\"')}" }`
            })
        
        // This approach is too fragile. Let's use a different strategy:
        // We'll output instructions for manual migration or use a TypeScript compiler
        
        console.error('Automatic parsing is complex. Please use the TypeScript approach.')
        console.error('Alternative: Manually export the NOTES_BY_KEY object as JSON')
        process.exit(1)
      }
      braceCount--
    }
  }
  i++
}

console.error('Could not find closing brace')
process.exit(1)

