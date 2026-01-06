#!/usr/bin/env ts-node
/**
 * Apply suggested patches from lint results
 * Converts suggested_patches.json to SQL UPDATE statements
 */

import * as fs from 'fs';

interface SuggestedPatch {
  neighbourhood_name: string;
  changes: Record<string, any>;
  reason: string;
}

function generateUpdateSQL(patches: SuggestedPatch[]): string {
  const sql: string[] = [];
  
  sql.push('-- Auto-generated SQL from lint suggested patches');
  sql.push('-- Review these changes before applying!');
  sql.push('');
  sql.push('BEGIN;');
  sql.push('');

  for (const patch of patches) {
    sql.push(`-- ${patch.neighbourhood_name}: ${patch.reason}`);
    sql.push(`UPDATE neighbourhood_living_notes`);
    sql.push('SET');
    
    const setClauses: string[] = [];
    
    for (const [key, value] of Object.entries(patch.changes)) {
      if (value === null) {
        setClauses.push(`  ${key} = NULL`);
      } else if (Array.isArray(value) && key === 'drivers') {
        // For drivers, use UNION to merge with existing (don't overwrite)
        const arrayStr = `ARRAY[${value.map(v => `'${v.replace(/'/g, "''")}'`).join(', ')}]`;
        setClauses.push(`  ${key} = ARRAY(SELECT DISTINCT unnest(COALESCE(${key}, ARRAY[]::text[]) || ${arrayStr}) ORDER BY 1)`);
      } else if (typeof value === 'string') {
        setClauses.push(`  ${key} = '${value.replace(/'/g, "''")}'`);
      } else {
        setClauses.push(`  ${key} = ${value}`);
      }
    }
    
    setClauses.push('  updated_at = NOW()');
    
    sql.push(setClauses.join(',\n'));
    sql.push(`WHERE neighbourhood_name = '${patch.neighbourhood_name.replace(/'/g, "''")}';`);
    sql.push('');
  }

  sql.push('COMMIT;');
  sql.push('');
  sql.push('-- Review the changes above before committing!');

  return sql.join('\n');
}

function main() {
  const args = process.argv.slice(2);
  const inputFile = args[0] || './scripts/output/suggested_patches.json';
  const outputFile = args[1] || './scripts/output/apply_patches.sql';

  if (!fs.existsSync(inputFile)) {
    console.error(`Error: Input file '${inputFile}' not found`);
    console.log('Run the linter first: npx tsx scripts/lint-living-notes.ts input.json output/');
    process.exit(1);
  }

  console.log('Reading suggested patches from:', inputFile);
  const patches: SuggestedPatch[] = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  
  console.log(`Generating SQL for ${patches.length} patches...`);
  const sql = generateUpdateSQL(patches);

  fs.writeFileSync(outputFile, sql);
  console.log(`✓ SQL written to: ${outputFile}`);
  console.log(`\n⚠ Review the SQL before applying!`);
  console.log(`  Then run: psql -f ${outputFile}`);
}

if (require.main === module) {
  main();
}

