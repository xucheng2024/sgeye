#!/usr/bin/env ts-node
/**
 * Living Notes Data Validator and Auto-Fixer
 * 
 * Validates and auto-fixes neighbourhood living notes data according to:
 * - Data contracts (allowed values)
 * - Hard validation rules (rating_mode consistency, zone_type rules)
 * - Auto-fix rules (short_note, drivers, variance_level)
 * - Manual review detection
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================
// Type Definitions
// ============================================

type ZoneType = 'residential' | 'city_core' | 'business_park' | 'industrial' | 'nature' | 'offshore';
type RatingMode = 'residential_scored' | 'not_scored';
type Rating = 'good' | 'mixed' | 'bad' | null;
type VarianceLevel = 'compact' | 'moderate' | 'spread_out';

interface LivingNotesData {
  neighbourhood_name: string;
  noise_density_rating: Rating;
  noise_density_note: string;
  daily_convenience_rating: Rating;
  daily_convenience_note: string;
  green_outdoor_rating: Rating;
  green_outdoor_note: string;
  crowd_vibe_rating: Rating;
  crowd_vibe_note: string;
  long_term_comfort_rating: Rating;
  long_term_comfort_note: string;
  created_at?: string;
  updated_at?: string;
  zone_type: ZoneType;
  rating_mode: RatingMode;
  drivers: string[];
  variance_level: VarianceLevel;
  short_note: string;
  display_name: string;
}

interface ValidationError {
  neighbourhood_name: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

interface ReviewItem {
  neighbourhood_name: string;
  display_name: string;
  reason: string;
  current_data: Partial<LivingNotesData>;
}

interface FixResult {
  fixed: LivingNotesData[];
  errors: ValidationError[];
  review_list: ReviewItem[];
  display_name_duplicates: Record<string, string[]>;
}

// ============================================
// Validation Rules
// ============================================

function validateRatingModeConsistency(data: LivingNotesData): ValidationError[] {
  const errors: ValidationError[] = [];
  const ratings = [
    data.noise_density_rating,
    data.daily_convenience_rating,
    data.green_outdoor_rating,
    data.crowd_vibe_rating,
    data.long_term_comfort_rating,
  ];

  if (data.rating_mode === 'residential_scored') {
    const hasNull = ratings.some(r => r === null);
    if (hasNull) {
      errors.push({
        neighbourhood_name: data.neighbourhood_name,
        field: 'rating_mode',
        message: 'residential_scored requires all ratings to be non-null',
        severity: 'error',
      });
    }
  } else if (data.rating_mode === 'not_scored') {
    const hasNonNull = ratings.some(r => r !== null);
    if (hasNonNull) {
      errors.push({
        neighbourhood_name: data.neighbourhood_name,
        field: 'rating_mode',
        message: 'not_scored requires all ratings to be null',
        severity: 'error',
      });
    }
  }

  return errors;
}

function validateZoneTypeRules(data: LivingNotesData): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Rule A: Non-residential zones MUST be not_scored
  const nonResidentialZones = ['industrial', 'nature', 'offshore', 'business_park'];
  if (nonResidentialZones.includes(data.zone_type)) {
    if (data.rating_mode !== 'not_scored') {
      errors.push({
        neighbourhood_name: data.neighbourhood_name,
        field: 'zone_type',
        message: `Rule A violation: ${data.zone_type} zone_type must have rating_mode = not_scored`,
        severity: 'error',
      });
    }
  }

  // Rule B: business_park should usually be not_scored (unless explicitly mixed-use residential)
  if (data.zone_type === 'business_park' && data.rating_mode === 'residential_scored') {
    errors.push({
      neighbourhood_name: data.neighbourhood_name,
      field: 'zone_type',
      message: `Rule B violation: business_park marked as residential_scored (should usually be not_scored unless it's explicitly mixed-use residential)`,
      severity: 'warning',
    });
  }

  return errors;
}

function validateContentConsistency(data: LivingNotesData): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Rule C: Content consistency - short_note/drivers must match zone_type
  
  // Check 1: Template pollution in short_note
  if (data.rating_mode === 'residential_scored') {
    const forbiddenPhrases = [
      'industrial/logistics zone',
      'not designed for residential routines',
      'we don\'t score living comfort here',
      'not a residential neighbourhood',
    ];
    
    const genericTemplates = [
      'Residential area.',
      'Residential area: expect higher street activity/noise.',
    ];
    
    const text = data.short_note.toLowerCase();
    for (const phrase of forbiddenPhrases) {
      if (text.includes(phrase.toLowerCase())) {
        errors.push({
          neighbourhood_name: data.neighbourhood_name,
          field: 'short_note',
          message: `Rule C violation: residential_scored entry contains forbidden phrase: "${phrase}"`,
          severity: 'error',
        });
      }
    }
    
    // Check for generic templates
    if (genericTemplates.includes(data.short_note)) {
      errors.push({
        neighbourhood_name: data.neighbourhood_name,
        field: 'short_note',
        message: `Rule C violation: Generic template short_note: "${data.short_note}"`,
        severity: 'error',
      });
    }
    
    // Check 2: Generic drivers
    if (data.drivers.length === 1 && data.drivers[0] === 'residential') {
      errors.push({
        neighbourhood_name: data.neighbourhood_name,
        field: 'drivers',
        message: `Rule C violation: Generic drivers array ["residential"] - must have specific drivers`,
        severity: 'error',
      });
    }
    
    // Check 3: Content vs zone_type mismatch
    const textLower = data.short_note.toLowerCase();
    if (data.zone_type === 'residential' && (
      textLower.includes('business park') ||
      textLower.includes('industrial') ||
      textLower.includes('port') ||
      textLower.includes('logistics')
    )) {
      errors.push({
        neighbourhood_name: data.neighbourhood_name,
        field: 'short_note',
        message: `Rule C violation: residential zone_type but short_note contains non-residential keywords`,
        severity: 'error',
      });
    }
  }

  // Rule: not_scored should have all ratings as null
  if (data.rating_mode === 'not_scored') {
    const ratings = [
      { name: 'noise_density_rating', value: data.noise_density_rating },
      { name: 'daily_convenience_rating', value: data.daily_convenience_rating },
      { name: 'green_outdoor_rating', value: data.green_outdoor_rating },
      { name: 'crowd_vibe_rating', value: data.crowd_vibe_rating },
      { name: 'long_term_comfort_rating', value: data.long_term_comfort_rating },
    ];
    
    for (const rating of ratings) {
      if (rating.value !== null) {
        errors.push({
          neighbourhood_name: data.neighbourhood_name,
          field: rating.name,
          message: `not_scored entry must have ${rating.name} = null, but got ${rating.value}`,
          severity: 'error',
        });
      }
    }
  }

  return errors;
}

function checkNeedsReview(data: LivingNotesData): boolean {
  // Rule A: Auto-approve non-residential zones that are correctly marked as not_scored
  // These should NOT trigger review - they are correctly classified
  if (['industrial', 'nature', 'offshore'].includes(data.zone_type) && 
      data.rating_mode === 'not_scored') {
    return false; // Auto-approved, no review needed
  }

  // Rule B: Flag business_park that are marked as residential_scored (suspicious)
  if (data.zone_type === 'business_park' && data.rating_mode === 'residential_scored') {
    return true; // Needs review - business parks should usually be not_scored
  }

  const text = `${data.short_note} ${data.long_term_comfort_note} ${data.noise_density_note}`.toLowerCase();
  
  // Rule C: Flag residential_scored entries with non-residential keywords
  if (data.rating_mode === 'residential_scored') {
    const reviewKeywords = [
      'not designed for residential routines',
      'not a residential neighbourhood',
      'not a comfortable long-term residential base',
      'workforce/logistics environment',
      'not suitable as a primary residential base',
      'commercial/transport hub',
      'business park',
    ];

    if (reviewKeywords.some(keyword => text.includes(keyword))) {
      return true; // Suspicious - residential_scored but mentions non-residential
    }

    // Check for all-bad ratings (might indicate non-residential)
    const ratings = [
      data.noise_density_rating,
      data.daily_convenience_rating,
      data.green_outdoor_rating,
      data.crowd_vibe_rating,
      data.long_term_comfort_rating,
    ];
    if (ratings.every(r => r === 'bad')) {
      return true; // All bad ratings might indicate it's not actually residential
    }
  }

  return false;
}

// ============================================
// Auto-Fix Logic
// ============================================

function fixShortNote(data: LivingNotesData): string {
  // Check if it's the wrong template
  const wrongTemplate = /industrial|logistics|not designed for residential routines/i;
  if (data.rating_mode === 'residential_scored' && wrongTemplate.test(data.short_note)) {
    // Auto-generate based on zone_type, ratings, and drivers
    return generateShortNote(data);
  }
  return data.short_note;
}

function generateShortNote(data: LivingNotesData): string {
  const parts: string[] = [];
  
  // Type phrase
  if (data.zone_type === 'city_core') {
    parts.push('Downtown lifestyle');
  } else if (data.zone_type === 'business_park') {
    parts.push('Mixed-use business park');
  } else if (data.green_outdoor_rating === 'good') {
    parts.push('Family-friendly pocket');
  } else if (data.daily_convenience_rating === 'good') {
    parts.push('Convenience-first heartland');
  } else {
    parts.push('Residential area');
  }

  // Strength
  const strengths: string[] = [];
  if (data.daily_convenience_rating === 'good') {
    strengths.push('great daily convenience');
  }
  if (data.green_outdoor_rating === 'good') {
    strengths.push('strong outdoor access');
  }
  if (data.noise_density_rating === 'good') {
    strengths.push('calmer nights');
  }
  
  if (strengths.length > 0) {
    parts.push(strengths[0]);
  }

  // Tradeoff
  const tradeoffs: string[] = [];
  if (data.noise_density_rating === 'bad') {
    tradeoffs.push('expect higher street activity/noise');
  }
  if (data.crowd_vibe_rating === 'bad') {
    tradeoffs.push('high churn/crowds');
  }
  if (data.green_outdoor_rating === 'bad') {
    tradeoffs.push('limited daily greenery feel');
  }
  if (data.long_term_comfort_rating === 'mixed' && data.daily_convenience_rating === 'good') {
    tradeoffs.push('tradeoffs for convenience');
  }

  if (tradeoffs.length > 0) {
    parts.push(tradeoffs[0]);
  }

  return parts.join(': ') + '.';
}

function fixDrivers(data: LivingNotesData): string[] {
  const drivers = new Set<string>(data.drivers || []);

  // Zone type drivers
  if (data.zone_type === 'city_core') {
    drivers.add('downtown');
  }
  if (data.zone_type === 'business_park') {
    drivers.add('business_park');
  }

  // Rating-based drivers
  if (data.daily_convenience_rating === 'good') {
    drivers.add('amenity_access');
  }
  if (data.green_outdoor_rating === 'good') {
    drivers.add('outdoor_access');
  }
  if (data.noise_density_rating === 'bad' || data.crowd_vibe_rating === 'bad') {
    drivers.add('high_activity');
  }
  if (data.long_term_comfort_rating === 'mixed' && data.daily_convenience_rating === 'good') {
    drivers.add('tradeoffs_for_convenience');
  }
  if (data.variance_level === 'spread_out') {
    drivers.add('pocket_choice_matters');
  }

  // Ensure at least one driver for residential_scored
  if (data.rating_mode === 'residential_scored' && drivers.size === 0) {
    drivers.add('residential');
  }

  return Array.from(drivers);
}

function calculateVarianceLevel(data: LivingNotesData): VarianceLevel {
  // Check drivers for high-variance indicators
  const highVarianceDrivers = [
    'pocket_variation_high',
    'arterial_roads',
    'nightlife_belt',
    'high_footfall',
    'pocket_choice_matters',
  ];

  if (data.drivers.some(d => highVarianceDrivers.includes(d))) {
    return 'spread_out';
  }

  // City core is usually spread_out
  if (data.zone_type === 'city_core') {
    return 'spread_out';
  }

  // Check notes for variation keywords
  const notes = `${data.noise_density_note} ${data.crowd_vibe_note} ${data.long_term_comfort_note}`.toLowerCase();
  if (notes.includes('varies by pocket') || notes.includes('main road vs interior') || notes.includes('nightlife adjacency')) {
    return 'spread_out';
  }

  // Convenience good but noise/crowd mixed/bad = moderate
  if (data.daily_convenience_rating === 'good' && 
      (data.noise_density_rating === 'mixed' || data.crowd_vibe_rating === 'mixed' || 
       data.noise_density_rating === 'bad' || data.crowd_vibe_rating === 'bad')) {
    return 'moderate';
  }

  // Not scored = compact
  if (data.rating_mode === 'not_scored') {
    return 'compact';
  }

  // Default to moderate for most residential areas
  return 'moderate';
}

function fixDisplayName(data: LivingNotesData, duplicates: Record<string, string[]>): string {
  const current = data.display_name || data.neighbourhood_name;
  
  // Check if this display_name is duplicated
  if (duplicates[current] && duplicates[current].length > 1) {
    // Add suffix based on neighbourhood_name pattern first
    if (data.neighbourhood_name.includes('(LEISURE)')) {
      return `${current} (Leisure)`;
    }
    if (data.neighbourhood_name.includes('(BUSINESS)')) {
      return `${current} (Business Park)`;
    }
    // Use zone_type as fallback
    if (data.zone_type === 'business_park') {
      return `${current} (Business Park)`;
    }
    if (data.zone_type === 'industrial') {
      return `${current} (Industrial)`;
    }
    if (data.zone_type === 'nature') {
      return `${current} (Nature)`;
    }
    // Last resort: use neighbourhood_name suffix if it has parentheses
    const match = data.neighbourhood_name.match(/\(([^)]+)\)/);
    if (match) {
      return `${current} (${match[1]})`;
    }
  }
  
  return current;
}

// ============================================
// Main Processing
// ============================================

function processData(inputData: LivingNotesData[]): FixResult {
  const errors: ValidationError[] = [];
  const review_list: ReviewItem[] = [];
  const fixed: LivingNotesData[] = [];
  
  // Find display_name duplicates
  const displayNameMap: Record<string, string[]> = {};
  inputData.forEach(item => {
    const dn = item.display_name || item.neighbourhood_name;
    if (!displayNameMap[dn]) {
      displayNameMap[dn] = [];
    }
    displayNameMap[dn].push(item.neighbourhood_name);
  });
  const duplicates: Record<string, string[]> = {};
  Object.keys(displayNameMap).forEach(dn => {
    if (displayNameMap[dn].length > 1) {
      duplicates[dn] = displayNameMap[dn];
    }
  });

  for (const item of inputData) {
    const fixedItem = { ...item };

    // Step 1: Basic validation (before fixes)
    errors.push(...validateRatingModeConsistency(fixedItem));
    errors.push(...validateZoneTypeRules(fixedItem));

    // Step 2: Auto-fix
    fixedItem.short_note = fixShortNote(fixedItem);
    fixedItem.drivers = fixDrivers(fixedItem);
    fixedItem.variance_level = calculateVarianceLevel(fixedItem);
    fixedItem.display_name = fixDisplayName(fixedItem, duplicates);

    // Step 3: Content consistency validation (after fixes)
    errors.push(...validateContentConsistency(fixedItem));

    // Check for review (with improved logic)
    if (checkNeedsReview(fixedItem)) {
      let reason = 'Needs manual review';
      
      // More specific reasons
      if (fixedItem.zone_type === 'business_park' && fixedItem.rating_mode === 'residential_scored') {
        reason = 'Business park marked as residential_scored (should usually be not_scored)';
      } else if (fixedItem.rating_mode === 'residential_scored') {
        const text = `${fixedItem.short_note} ${fixedItem.long_term_comfort_note}`.toLowerCase();
        if (text.includes('not a residential') || text.includes('commercial/transport hub')) {
          reason = 'Residential_scored but contains non-residential keywords';
        } else {
          const ratings = [
            fixedItem.noise_density_rating,
            fixedItem.daily_convenience_rating,
            fixedItem.green_outdoor_rating,
            fixedItem.crowd_vibe_rating,
            fixedItem.long_term_comfort_rating,
          ];
          if (ratings.every(r => r === 'bad')) {
            reason = 'All ratings are bad (might indicate non-residential)';
          }
        }
      }
      
      review_list.push({
        neighbourhood_name: fixedItem.neighbourhood_name,
        display_name: fixedItem.display_name,
        reason,
        current_data: {
          zone_type: fixedItem.zone_type,
          rating_mode: fixedItem.rating_mode,
          short_note: fixedItem.short_note,
          long_term_comfort_rating: fixedItem.long_term_comfort_rating,
        },
      });
    }

    fixed.push(fixedItem);
  }

  return {
    fixed,
    errors,
    review_list,
    display_name_duplicates: duplicates,
  };
}

// ============================================
// CLI
// ============================================

function main() {
  const args = process.argv.slice(2);
  const inputFile = args[0] || 'neighbourhoods.json';
  const outputDir = args[1] || './scripts/output';

  console.log('Reading input file:', inputFile);
  const inputData: LivingNotesData[] = JSON.parse(
    fs.readFileSync(inputFile, 'utf-8')
  );

  console.log(`Processing ${inputData.length} neighbourhoods...`);
  const result = processData(inputData);

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write fixed data
  const fixedFile = path.join(outputDir, 'neighbourhoods.fixed.json');
  fs.writeFileSync(fixedFile, JSON.stringify(result.fixed, null, 2));
  console.log(`\n✓ Fixed data written to: ${fixedFile}`);

  // Write errors
  if (result.errors.length > 0) {
    const errorsFile = path.join(outputDir, 'errors.json');
    fs.writeFileSync(errorsFile, JSON.stringify(result.errors, null, 2));
    console.log(`⚠ Errors found: ${result.errors.length} (written to ${errorsFile})`);
  } else {
    console.log('✓ No validation errors found');
  }

  // Write review list
  if (result.review_list.length > 0) {
    const reviewFile = path.join(outputDir, 'review_list.json');
    fs.writeFileSync(reviewFile, JSON.stringify(result.review_list, null, 2));
    console.log(`⚠ Review needed: ${result.review_list.length} items (written to ${reviewFile})`);
  } else {
    console.log('✓ No items need manual review');
  }

  // Write duplicates
  if (Object.keys(result.display_name_duplicates).length > 0) {
    const dupesFile = path.join(outputDir, 'display_name_duplicates.json');
    fs.writeFileSync(dupesFile, JSON.stringify(result.display_name_duplicates, null, 2));
    console.log(`⚠ Display name duplicates found: ${Object.keys(result.display_name_duplicates).length} (written to ${dupesFile})`);
  } else {
    console.log('✓ No display name duplicates');
  }

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Total processed: ${inputData.length}`);
  console.log(`Errors: ${result.errors.length}`);
  console.log(`Needs review: ${result.review_list.length}`);
  console.log(`Display name duplicates: ${Object.keys(result.display_name_duplicates).length}`);
}

if (require.main === module) {
  main();
}

export { processData, validateRatingModeConsistency, validateZoneTypeRules, validateContentConsistency, fixShortNote, fixDrivers, calculateVarianceLevel, checkNeedsReview };

