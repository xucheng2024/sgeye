#!/usr/bin/env ts-node
/**
 * Generate SQL UPSERT statements from fixed JSON data
 * Usage: npx ts-node scripts/generate-upsert-sql.ts [fixed.json] [output.sql]
 */

import * as fs from 'fs';

interface LivingNotesData {
  neighbourhood_name: string;
  noise_density_rating: string | null;
  noise_density_note: string;
  daily_convenience_rating: string | null;
  daily_convenience_note: string;
  green_outdoor_rating: string | null;
  green_outdoor_note: string;
  crowd_vibe_rating: string | null;
  crowd_vibe_note: string;
  long_term_comfort_rating: string | null;
  long_term_comfort_note: string;
  zone_type: string;
  rating_mode: string;
  drivers: string[];
  variance_level: string;
  short_note: string;
  display_name: string;
}

function escapeSqlString(str: string): string {
  return str.replace(/'/g, "''").replace(/\n/g, ' ');
}

function generateUpsert(data: LivingNotesData[]): string {
  const sql: string[] = [];
  
  sql.push('-- Generated UPSERT statements for neighbourhood_living_notes');
  sql.push('-- Run this script to update the database with fixed data');
  sql.push('');
  sql.push('BEGIN;');
  sql.push('');

  for (const item of data) {
    const driversArray = `ARRAY[${item.drivers.map(d => `'${escapeSqlString(d)}'`).join(', ')}]`;
    
    sql.push(`-- ${item.display_name} (${item.neighbourhood_name})`);
    sql.push(`INSERT INTO neighbourhood_living_notes (
  neighbourhood_name,
  noise_density_rating,
  noise_density_note,
  daily_convenience_rating,
  daily_convenience_note,
  green_outdoor_rating,
  green_outdoor_note,
  crowd_vibe_rating,
  crowd_vibe_note,
  long_term_comfort_rating,
  long_term_comfort_note,
  zone_type,
  rating_mode,
  drivers,
  variance_level,
  short_note,
  display_name,
  updated_at
) VALUES (
  '${escapeSqlString(item.neighbourhood_name)}',
  ${item.noise_density_rating ? `'${item.noise_density_rating}'` : 'NULL'},
  '${escapeSqlString(item.noise_density_note)}',
  ${item.daily_convenience_rating ? `'${item.daily_convenience_rating}'` : 'NULL'},
  '${escapeSqlString(item.daily_convenience_note)}',
  ${item.green_outdoor_rating ? `'${item.green_outdoor_rating}'` : 'NULL'},
  '${escapeSqlString(item.green_outdoor_note)}',
  ${item.crowd_vibe_rating ? `'${item.crowd_vibe_rating}'` : 'NULL'},
  '${escapeSqlString(item.crowd_vibe_note)}',
  ${item.long_term_comfort_rating ? `'${item.long_term_comfort_rating}'` : 'NULL'},
  '${escapeSqlString(item.long_term_comfort_note)}',
  '${item.zone_type}',
  '${item.rating_mode}',
  ${driversArray},
  '${item.variance_level}',
  '${escapeSqlString(item.short_note)}',
  '${escapeSqlString(item.display_name)}',
  NOW()
)
ON CONFLICT (neighbourhood_name) DO UPDATE SET
  noise_density_rating = EXCLUDED.noise_density_rating,
  noise_density_note = EXCLUDED.noise_density_note,
  daily_convenience_rating = EXCLUDED.daily_convenience_rating,
  daily_convenience_note = EXCLUDED.daily_convenience_note,
  green_outdoor_rating = EXCLUDED.green_outdoor_rating,
  green_outdoor_note = EXCLUDED.green_outdoor_note,
  crowd_vibe_rating = EXCLUDED.crowd_vibe_rating,
  crowd_vibe_note = EXCLUDED.crowd_vibe_note,
  long_term_comfort_rating = EXCLUDED.long_term_comfort_rating,
  long_term_comfort_note = EXCLUDED.long_term_comfort_note,
  zone_type = EXCLUDED.zone_type,
  rating_mode = EXCLUDED.rating_mode,
  drivers = EXCLUDED.drivers,
  variance_level = EXCLUDED.variance_level,
  short_note = EXCLUDED.short_note,
  display_name = EXCLUDED.display_name,
  updated_at = EXCLUDED.updated_at;
`);
    sql.push('');
  }

  sql.push('COMMIT;');
  sql.push('');
  sql.push('-- Done!');

  return sql.join('\n');
}

function main() {
  const inputFile = process.argv[2] || './scripts/output/neighbourhoods.fixed.json';
  const outputFile = process.argv[3] || './scripts/output/upsert.sql';

  if (!fs.existsSync(inputFile)) {
    console.error(`Error: Input file '${inputFile}' not found`);
    console.log('Usage: npx ts-node scripts/generate-upsert-sql.ts [fixed.json] [output.sql]');
    process.exit(1);
  }

  console.log('Reading fixed data from:', inputFile);
  const data: LivingNotesData[] = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  
  console.log(`Generating SQL for ${data.length} neighbourhoods...`);
  const sql = generateUpsert(data);

  fs.writeFileSync(outputFile, sql);
  console.log(`✓ SQL written to: ${outputFile}`);
  console.log(`  Total statements: ${data.length}`);
}

if (require.main === module) {
  main();
}

