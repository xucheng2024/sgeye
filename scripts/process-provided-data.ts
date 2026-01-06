#!/usr/bin/env ts-node
/**
 * Process the provided JSON data from user
 * This script takes the JSON data and runs it through the fixer
 */

import * as fs from 'fs';
import { processData } from './fix-living-notes-data';

// The provided JSON data
const providedData = [
  {
    "neighbourhood_name": "CHIN BEE",
    "noise_density_rating": null,
    "noise_density_note": "Industrial zone; heavy vehicles and operations can be noisy.",
    "daily_convenience_rating": null,
    "daily_convenience_note": "Not amenity-dense; residential errands require travel.",
    "green_outdoor_rating": null,
    "green_outdoor_note": "Hardscape-heavy with limited daily green space.",
    "crowd_vibe_rating": null,
    "crowd_vibe_note": "Workforce-heavy feel.",
    "long_term_comfort_rating": null,
    "long_term_comfort_note": "Not a comfortable long-term residential environment.",
    "created_at": "2026-01-05 15:37:10.202894+00",
    "updated_at": "2026-01-05 15:37:08.499+00",
    "zone_type": "industrial",
    "rating_mode": "not_scored",
    "drivers": ["industrial", "heavy_vehicles"],
    "variance_level": "compact",
    "short_note": "Primarily an industrial/logistics zone. Not designed for residential routines.",
    "display_name": "Chin Bee"
  },
  // ... rest of data would go here, but for now we'll read from a file
];

function main() {
  const inputFile = process.argv[2] || 'neighbourhoods-input.json';
  const outputDir = process.argv[3] || './scripts/output';

  console.log('Reading input file:', inputFile);
  
  if (!fs.existsSync(inputFile)) {
    console.error(`Error: Input file '${inputFile}' not found`);
    console.log('Please provide the JSON data as a file, or pipe it in');
    process.exit(1);
  }

  const inputData = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  console.log(`Processing ${inputData.length} neighbourhoods...`);

  const result = processData(inputData);

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write fixed data
  const fixedFile = `${outputDir}/neighbourhoods.fixed.json`;
  fs.writeFileSync(fixedFile, JSON.stringify(result.fixed, null, 2));
  console.log(`\n✓ Fixed data written to: ${fixedFile}`);

  // Write errors
  if (result.errors.length > 0) {
    const errorsFile = `${outputDir}/errors.json`;
    fs.writeFileSync(errorsFile, JSON.stringify(result.errors, null, 2));
    console.log(`⚠ Errors found: ${result.errors.length} (written to ${errorsFile})`);
    
    // Print summary of errors
    const errorByField: Record<string, number> = {};
    result.errors.forEach(e => {
      errorByField[e.field] = (errorByField[e.field] || 0) + 1;
    });
    console.log('\nError breakdown:');
    Object.entries(errorByField).forEach(([field, count]) => {
      console.log(`  ${field}: ${count}`);
    });
  } else {
    console.log('✓ No validation errors found');
  }

  // Write review list
  if (result.review_list.length > 0) {
    const reviewFile = `${outputDir}/review_list.json`;
    fs.writeFileSync(reviewFile, JSON.stringify(result.review_list, null, 2));
    console.log(`\n⚠ Review needed: ${result.review_list.length} items (written to ${reviewFile})`);
    
    // Print review items
    console.log('\nItems needing review:');
    result.review_list.forEach(item => {
      console.log(`  - ${item.display_name} (${item.neighbourhood_name}): ${item.reason}`);
    });
  } else {
    console.log('✓ No items need manual review');
  }

  // Write duplicates
  if (Object.keys(result.display_name_duplicates).length > 0) {
    const dupesFile = `${outputDir}/display_name_duplicates.json`;
    fs.writeFileSync(dupesFile, JSON.stringify(result.display_name_duplicates, null, 2));
    console.log(`\n⚠ Display name duplicates found: ${Object.keys(result.display_name_duplicates).length}`);
    Object.entries(result.display_name_duplicates).forEach(([name, neighbourhoods]) => {
      console.log(`  "${name}": ${neighbourhoods.join(', ')}`);
    });
  } else {
    console.log('✓ No display name duplicates');
  }

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Total processed: ${inputData.length}`);
  console.log(`Fixed: ${result.fixed.length}`);
  console.log(`Errors: ${result.errors.length}`);
  console.log(`Needs review: ${result.review_list.length}`);
  console.log(`Display name duplicates: ${Object.keys(result.display_name_duplicates).length}`);
}

if (require.main === module) {
  main();
}

