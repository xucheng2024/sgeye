#!/usr/bin/env ts-node
/**
 * Living Notes Linter - Comprehensive Data Quality Checker
 * 
 * Detects and suggests fixes for:
 * - Zone type / rating mode mismatches
 * - Template pollution
 * - Content inconsistencies
 * - Missing drivers
 * - Review status issues
 */

import * as fs from 'fs';

// ============================================
// Type Definitions
// ============================================

type ZoneType = 'residential' | 'city_core' | 'business_park' | 'industrial' | 'nature' | 'offshore';
type RatingMode = 'residential_scored' | 'not_scored';
type Rating = 'good' | 'mixed' | 'bad' | null;
type VarianceLevel = 'compact' | 'moderate' | 'spread_out';
type ReviewReason = 
  | 'ZONE_TYPE_RATING_MODE_CONFLICT'
  | 'NON_RESIDENTIAL_SCORED'
  | 'SHORT_NOTE_CONTRADICTS_RATINGS'
  | 'DRIVERS_MISSING_CORE_KEYWORDS'
  | 'TEMPLATE_POLLUTION'
  | 'GENERIC_DRIVERS'
  | 'CONTENT_INCONSISTENCY'
  | 'INDUSTRIAL_WITH_RESIDENTIAL_DRIVERS'
  | 'MISCLASSIFIED_RESIDENTIAL_AREA';

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
  zone_type: ZoneType;
  rating_mode: RatingMode;
  drivers: string[];
  variance_level: VarianceLevel;
  short_note: string;
  display_name: string;
  review_status?: string;
  review_reason?: string;
}

interface Issue {
  neighbourhood_name: string;
  rule: string;
  severity: 'error' | 'warning';
  message: string;
  field: string;
  reason: ReviewReason;
}

interface SuggestedPatch {
  neighbourhood_name: string;
  changes: Record<string, unknown>;
  reason: string;
}

interface LintResult {
  issues: Issue[];
  suggested_patches: SuggestedPatch[];
  summary: {
    total: number;
    errors: number;
    warnings: number;
    needs_review: number;
  };
}

// ============================================
// Hard Rules Implementation
// ============================================

// Rule 1: rating_mode=not_scored → all ratings must be null
function checkRule1(data: LivingNotesData): Issue[] {
  const issues: Issue[] = [];
  
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
        issues.push({
          neighbourhood_name: data.neighbourhood_name,
          rule: 'Rule 1',
          severity: 'error',
          message: `not_scored entry has ${rating.name} = ${rating.value} (must be null)`,
          field: rating.name,
          reason: 'ZONE_TYPE_RATING_MODE_CONFLICT',
        });
      }
    }
  }
  
  return issues;
}

// Rule 2: Industrial/port/airport/nature/business_park → must be not_scored
function checkRule2(data: LivingNotesData): Issue[] {
  const issues: Issue[] = [];
  
  const nonResidentialZones = ['industrial', 'nature', 'offshore', 'business_park'];
  
  // Check zone_type
  if (nonResidentialZones.includes(data.zone_type) && data.rating_mode !== 'not_scored') {
    issues.push({
      neighbourhood_name: data.neighbourhood_name,
      rule: 'Rule 2',
      severity: 'error',
      message: `${data.zone_type} zone_type must have rating_mode = not_scored`,
      field: 'zone_type',
      reason: 'NON_RESIDENTIAL_SCORED',
    });
  }
  
  // Business Park special case: should be not_scored unless explicitly confirmed as residential
  if (data.zone_type === 'business_park' && data.rating_mode === 'residential_scored') {
    issues.push({
      neighbourhood_name: data.neighbourhood_name,
      rule: 'Rule 2',
      severity: 'error',
      message: `Business park zone_type should be not_scored unless residential stock is confirmed`,
      field: 'zone_type',
      reason: 'NON_RESIDENTIAL_SCORED',
    });
  }
  
  // Check drivers for non-residential keywords
  // Split into hard triggers (error) and soft warnings (warning)
  // Hard triggers: explicit non-residential zones
  const hardNonResidentialDrivers = [
    'airport',
    'port_logistics',
    'container_terminal',
    'shipyard',
    'industrial',
  ];
  
  const hasHardNonResidentialDriver = data.drivers.some(d => 
    hardNonResidentialDrivers.includes(d) ||
    d === 'airport' ||
    d === 'port_logistics'
  );
  
  // Soft warnings: descriptive drivers that might indicate proximity
  const softNonResidentialDrivers = [
    'heavy_vehicles',
    'logistics',
    'logistics_nearby',
  ];
  
  const hasSoftNonResidentialDriver = data.drivers.some(d => 
    softNonResidentialDrivers.includes(d) ||
    (d.includes('logistics') && !d.includes('logistics_nearby'))
  );
  
  if (hasHardNonResidentialDriver && data.rating_mode === 'residential_scored') {
    issues.push({
      neighbourhood_name: data.neighbourhood_name,
      rule: 'Rule 2',
      severity: 'error',
      message: `Has explicit non-residential drivers (${data.drivers.filter(d => hardNonResidentialDrivers.includes(d) || d === 'airport' || d === 'port_logistics').join(', ')}) but rating_mode = residential_scored (should be not_scored)`,
      field: 'drivers',
      reason: 'NON_RESIDENTIAL_SCORED',
    });
  } else if (hasSoftNonResidentialDriver && data.rating_mode === 'residential_scored') {
    issues.push({
      neighbourhood_name: data.neighbourhood_name,
      rule: 'Rule 2',
      severity: 'warning',
      message: `Has drivers indicating proximity to industrial/logistics (${data.drivers.filter(d => softNonResidentialDrivers.includes(d) || (d.includes('logistics') && !d.includes('logistics_nearby'))).join(', ')}) - may need review`,
      field: 'drivers',
      reason: 'NON_RESIDENTIAL_SCORED',
    });
  }
  
  return issues;
}

// Rule 3: residential but has non-residential drivers → needs_review
function checkRule3(data: LivingNotesData): Issue[] {
  const issues: Issue[] = [];
  
  if (data.zone_type === 'residential' && data.rating_mode === 'residential_scored') {
    const nonResidentialDrivers = [
      'heavy_vehicles',
      'port_logistics',
      'airport',
      'industrial',
      'container_terminal',
      'shipyard',
      'logistics',
    ];
    
    const hasNonResidentialDriver = data.drivers.some(d => 
      nonResidentialDrivers.includes(d)
    );
    
    if (hasNonResidentialDriver) {
      issues.push({
        neighbourhood_name: data.neighbourhood_name,
        rule: 'Rule 3',
        severity: 'warning',
        message: `residential zone_type but has non-residential drivers: ${data.drivers.filter(d => nonResidentialDrivers.includes(d)).join(', ')}`,
        field: 'drivers',
        reason: 'ZONE_TYPE_RATING_MODE_CONFLICT',
      });
    }
  }
  
  return issues;
}

// Rule 4: short_note must match main conclusion
function checkRule4(data: LivingNotesData): Issue[] {
  const issues: Issue[] = [];
  
  if (data.rating_mode === 'residential_scored') {
    const shortNoteLower = data.short_note.toLowerCase();
    
    // If long_term_comfort_rating is bad, short_note shouldn't say "balanced/family-friendly/comfortable"
    if (data.long_term_comfort_rating === 'bad') {
      const positivePhrases = ['balanced', 'family-friendly', 'comfortable', 'good', 'great'];
      if (positivePhrases.some(phrase => shortNoteLower.includes(phrase))) {
        issues.push({
          neighbourhood_name: data.neighbourhood_name,
          rule: 'Rule 4',
          severity: 'error',
          message: `long_term_comfort_rating = bad but short_note contains positive phrases`,
          field: 'short_note',
          reason: 'SHORT_NOTE_CONTRADICTS_RATINGS',
        });
      }
    }
    
    // Check if all ratings are bad but short_note is positive
    const allBad = [
      data.noise_density_rating,
      data.daily_convenience_rating,
      data.green_outdoor_rating,
      data.crowd_vibe_rating,
      data.long_term_comfort_rating,
    ].every(r => r === 'bad');
    
    if (allBad && (shortNoteLower.includes('balanced') || shortNoteLower.includes('comfortable'))) {
      issues.push({
        neighbourhood_name: data.neighbourhood_name,
        rule: 'Rule 4',
        severity: 'error',
        message: `All ratings are bad but short_note suggests positive characteristics`,
        field: 'short_note',
        reason: 'SHORT_NOTE_CONTRADICTS_RATINGS',
      });
    }
  }
  
  if (data.rating_mode === 'not_scored') {
    const shortNoteLower = data.short_note.toLowerCase();
    const requiredPhrases = [
      'not designed for residential',
      'non-residential',
      'we don\'t score',
      'not a residential',
    ];
    
    if (!requiredPhrases.some(phrase => shortNoteLower.includes(phrase))) {
      issues.push({
        neighbourhood_name: data.neighbourhood_name,
        rule: 'Rule 4',
        severity: 'warning',
        message: `not_scored entry should contain phrase like "not designed for residential" or "non-residential"`,
        field: 'short_note',
        reason: 'CONTENT_INCONSISTENCY',
      });
    }
  }
  
  return issues;
}

// Rule 5: Drivers coverage - must match note keywords (with word boundaries)
function checkRule5(data: LivingNotesData): Issue[] {
  const issues: Issue[] = [];
  
  if (data.rating_mode === 'residential_scored') {
    const allNotes = `${data.noise_density_note} ${data.daily_convenience_note} ${data.green_outdoor_note} ${data.crowd_vibe_note} ${data.long_term_comfort_note} ${data.short_note}`;
    const driversLower = data.drivers.map(d => d.toLowerCase());
    
    // Keyword mapping with word boundary regex: note keyword → required driver
    // Note: CBD/downtown mappings now include cbd_edge for consistency with patches
    const keywordMappings: Array<{pattern: RegExp, drivers: string[], name: string}> = [
      { pattern: /\bport\b/i, drivers: ['port_logistics'], name: 'port' },
      { pattern: /\blogistics?\b/i, drivers: ['logistics', 'port_logistics'], name: 'logistics' },
      { pattern: /\bindustrial\b/i, drivers: ['industrial'], name: 'industrial' },
      { pattern: /\barterial\b/i, drivers: ['arterial_roads'], name: 'arterial' },
      { pattern: /\bcbd\b/i, drivers: ['cbd', 'downtown', 'cbd_edge'], name: 'cbd' },
      { pattern: /\bdowntown\b/i, drivers: ['downtown', 'cbd', 'cbd_edge'], name: 'downtown' },
      { pattern: /\bnightlife\b/i, drivers: ['nightlife_belt', 'nightlife_nearby'], name: 'nightlife' },
      { pattern: /\btourist(s)?\b/i, drivers: ['tourist_crowd'], name: 'tourist' },
      { pattern: /\bheavy (vehicles|trucks|traffic)\b/i, drivers: ['heavy_vehicles'], name: 'heavy vehicles' },
      { pattern: /\binterchange\b/i, drivers: ['interchange'], name: 'interchange' },
      { pattern: /\bhigh footfall\b/i, drivers: ['high_footfall'], name: 'high footfall' },
    ];
    
    for (const mapping of keywordMappings) {
      if (mapping.pattern.test(allNotes)) {
        const hasRequiredDriver = mapping.drivers.some(rd => 
          driversLower.includes(rd.toLowerCase())
        );
        
        if (!hasRequiredDriver) {
          issues.push({
            neighbourhood_name: data.neighbourhood_name,
            rule: 'Rule 5',
            severity: 'warning',
            message: `Notes mention "${mapping.name}" but drivers missing: ${mapping.drivers.join(' or ')}`,
            field: 'drivers',
            reason: 'DRIVERS_MISSING_CORE_KEYWORDS',
          });
        }
      }
    }
  }
  
  return issues;
}

// Rule 6: Template pollution and generic content
function checkRule6(data: LivingNotesData): Issue[] {
  const issues: Issue[] = [];
  
  if (data.rating_mode === 'residential_scored') {
    // Check for generic templates using regex patterns (more flexible than exact match)
    const genericPatterns = [
      /^Residential area\.\s*$/i,
      /^Residential area: expect higher street activity\/noise\.\s*$/i,
      /^Residential area with balanced characteristics\.\s*$/i,
    ];
    
    const trimmedNote = data.short_note.trim();
    if (genericPatterns.some(pattern => pattern.test(trimmedNote))) {
      issues.push({
        neighbourhood_name: data.neighbourhood_name,
        rule: 'Rule 6',
        severity: 'error',
        message: `Generic template short_note: "${data.short_note}"`,
        field: 'short_note',
        reason: 'TEMPLATE_POLLUTION',
      });
    }
    
    // Check for forbidden phrases
    const forbiddenPhrases = [
      'industrial/logistics zone',
      'not designed for residential routines',
      'we don\'t score living comfort here',
    ];
    
    const shortNoteLower = data.short_note.toLowerCase();
    for (const phrase of forbiddenPhrases) {
      if (shortNoteLower.includes(phrase.toLowerCase())) {
        issues.push({
          neighbourhood_name: data.neighbourhood_name,
          rule: 'Rule 6',
          severity: 'error',
          message: `Forbidden phrase in short_note: "${phrase}"`,
          field: 'short_note',
          reason: 'TEMPLATE_POLLUTION',
        });
      }
    }
    
    // Check for generic drivers
    if (data.drivers.length === 1 && data.drivers[0] === 'residential') {
      issues.push({
        neighbourhood_name: data.neighbourhood_name,
        rule: 'Rule 6',
        severity: 'error',
        message: `Generic drivers array: ["residential"]`,
        field: 'drivers',
        reason: 'GENERIC_DRIVERS',
      });
    }
  }
  
  return issues;
}

// Rule 7: Industrial zones should not have residential/family_friendly drivers
function checkRule7(data: LivingNotesData): Issue[] {
  const issues: Issue[] = [];
  
  if (data.zone_type === 'industrial' || data.rating_mode === 'not_scored') {
    const residentialDrivers = ['residential', 'family_friendly'];
    const hasResidentialDriver = data.drivers.some(d => 
      residentialDrivers.includes(d.toLowerCase())
    );
    
    if (hasResidentialDriver) {
      issues.push({
        neighbourhood_name: data.neighbourhood_name,
        rule: 'Rule 7',
        severity: 'error',
        message: `Industrial zone has contradictory drivers: ${data.drivers.filter(d => residentialDrivers.includes(d.toLowerCase())).join(', ')}`,
        field: 'drivers',
        reason: 'INDUSTRIAL_WITH_RESIDENTIAL_DRIVERS',
      });
    }
  }
  
  return issues;
}

// Rule 8: Known residential areas should not be marked as industrial
function checkRule8(data: LivingNotesData): Issue[] {
  const issues: Issue[] = [];
  
  // Known residential towns/areas that should not be industrial
  const knownResidentialAreas = [
    'ANG MO KIO',  // Mature residential town
    'SIGLAP',      // Residential area
    'UPPER THOMSON', // Residential area along Thomson Road
    'BEDOK RESERVOIR', // Residential area with reservoir park
    'BOON LAY PLACE', // Residential area with HDB
    'GEYLANG BAHRU', // Residential area with HDB
    'KALLANG BAHRU', // Residential area with HDB
  ];
  
  if (knownResidentialAreas.includes(data.neighbourhood_name.toUpperCase())) {
    if (data.zone_type === 'industrial' || data.rating_mode === 'not_scored') {
      issues.push({
        neighbourhood_name: data.neighbourhood_name,
        rule: 'Rule 8',
        severity: 'error',
        message: `Known residential area incorrectly marked as industrial/not_scored`,
        field: 'zone_type',
        reason: 'MISCLASSIFIED_RESIDENTIAL_AREA',
      });
    }
  }
  
  return issues;
}

// Rule 9: New town / edge development areas - commute sensitivity warning
// This is a soft rule that adds warning tags, not errors
function checkRule9(data: LivingNotesData): Issue[] {
  const issues: Issue[] = [];
  
  if (data.rating_mode === 'residential_scored') {
    // Known new town / edge development areas
    const newTownEdgeAreas = [
      'TAMPINES NORTH',
      'TAMPINES EAST',
      'PUNGGOL CANAL',
      'SENGKANG WEST',
      'LORONG HALUS NORTH',
      'BAYSHORE',
    ];
    
    if (newTownEdgeAreas.includes(data.neighbourhood_name.toUpperCase())) {
      // Check if short_note uses generic "mixed characteristics" language
      const shortNoteLower = data.short_note.toLowerCase();
      if (shortNoteLower.includes('mixed characteristics') || 
          shortNoteLower.includes('some conveniences and limitations')) {
        issues.push({
          neighbourhood_name: data.neighbourhood_name,
          rule: 'Rule 9',
          severity: 'warning',
          message: `New town/edge area should emphasize commute tolerance and real limitations, not just "mixed characteristics"`,
          field: 'short_note',
          reason: 'CONTENT_INCONSISTENCY',
        });
      }
    }
  }
  
  return issues;
}

// ============================================
// Auto-Fix Suggestions
// ============================================

function mergeDrivers(existing: string[] = [], mustHave: string[] = []): string[] {
  return Array.from(new Set([...(existing || []), ...(mustHave || [])]));
}

function generateSuggestedPatches(data: LivingNotesData, issues: Issue[]): SuggestedPatch[] {
  const patches: SuggestedPatch[] = [];
  const changes: Record<string, unknown> = {};
  const reasons: string[] = [];
  const driversToAdd: string[] = [];
  
  // ============================================
  // Priority 1: Handle not_scored cases FIRST (short-circuit)
  // ============================================
  // Once we decide to switch to not_scored, we should NOT continue with
  // Rule 4/5/6 residential-style fixes to avoid contradictory patches
  
  // Only treat Rule 2 ERROR as hard trigger (not warnings)
  const hasRule2Hard = issues.some(
    i => i.rule === 'Rule 2' && i.reason === 'NON_RESIDENTIAL_SCORED' && i.severity === 'error'
  );
  const targetNotScored = data.rating_mode === 'not_scored' || hasRule2Hard;
  
  if (targetNotScored) {
    // Force not_scored cleanup
    changes.rating_mode = 'not_scored';
    changes.noise_density_rating = null;
    changes.daily_convenience_rating = null;
    changes.green_outdoor_rating = null;
    changes.crowd_vibe_rating = null;
    changes.long_term_comfort_rating = null;
    
    // Update zone_type if needed (based on drivers or existing zone_type)
    // Only use hard drivers to infer zone_type (not proximity drivers like logistics_nearby)
    if (data.zone_type === 'industrial' || data.zone_type === 'nature' || data.zone_type === 'offshore') {
      changes.zone_type = data.zone_type;
    } else {
      // Only hard non-residential drivers should trigger zone_type change
      // proximity drivers (like logistics_nearby) should NOT change zone_type
      const hardNonResidentialDrivers = new Set([
        'airport',
        'port_logistics',
        'container_terminal',
        'shipyard',
        'industrial',
      ]);
      
      if (data.drivers.some(d => hardNonResidentialDrivers.has(d))) {
        changes.zone_type = 'industrial';
      }
    }
    
    // Set stable not_scored short_note (avoid template pollution but be clear)
    // Note: Avoid phrases that match Rule6 forbidden phrases to prevent conflicts
    changes.short_note = 'Non-residential zone — living comfort isn\'t scored here.';
    
    // Clean up contradictory drivers
    const forbidden = new Set(['residential', 'family_friendly']);
    changes.drivers = (data.drivers || []).filter(d => !forbidden.has(d.toLowerCase()));
    
    // Set review status - use the most severe issue's reason (not hardcoded)
    const priorityIssue = issues.find(i => i.severity === 'error') ?? issues[0];
    if (priorityIssue) {
      changes.review_status = 'needs_review';
      changes.review_reason = priorityIssue.reason;
    }
    
    reasons.push('Force not_scored cleanup (non-residential)');
    
    if (Object.keys(changes).length > 0) {
      patches.push({
        neighbourhood_name: data.neighbourhood_name,
        changes,
        reason: reasons.join('; '),
      });
    }
    
    // CRITICAL: Return early to avoid Rule 4/5/6 residential-style fixes
    return patches;
  }
  
  // Fix Rule 1 violations (only for already not_scored entries)
  if (issues.some(i => i.rule === 'Rule 1')) {
    changes.noise_density_rating = null;
    changes.daily_convenience_rating = null;
    changes.green_outdoor_rating = null;
    changes.crowd_vibe_rating = null;
    changes.long_term_comfort_rating = null;
    reasons.push('Clear all ratings for not_scored entries');
  }
  
  // Fix Rule 4 violations (short_note contradictions) - More nuanced fixes
  const rule4Issues = issues.filter(i => i.rule === 'Rule 4' && i.reason === 'SHORT_NOTE_CONTRADICTS_RATINGS');
  if (rule4Issues.length > 0) {
    // Generate appropriate short_note based on ratings - avoid overly positive for bad ratings
    const allBad = [
      data.noise_density_rating,
      data.daily_convenience_rating,
      data.green_outdoor_rating,
      data.crowd_vibe_rating,
      data.long_term_comfort_rating,
    ].every(r => r === 'bad');
    
    if (allBad) {
      changes.short_note = 'Not a comfortable long-term residential environment.';
    } else if (data.long_term_comfort_rating === 'bad') {
      // Bad long-term but might have some conveniences
      if (data.daily_convenience_rating === 'good') {
        changes.short_note = 'Convenient on paper, but daily comfort is limited long term.';
      } else if (data.noise_density_rating === 'bad' || data.crowd_vibe_rating === 'bad') {
        // Noisy/crowded areas - specific fix for CLARKE QUAY style
        if (data.zone_type === 'city_core' && data.crowd_vibe_rating === 'bad') {
          changes.short_note = 'High activity and crowds can limit long-term comfort.';
        } else if (data.zone_type === 'city_core') {
          changes.short_note = 'Lively nights, but loud and crowded — not ideal for long-term home comfort.';
        } else {
          changes.short_note = 'Active area with higher noise and crowds — limited long-term comfort.';
        }
      } else {
        changes.short_note = 'Limited long-term comfort despite some conveniences.';
      }
    }
    
    reasons.push('Fix short_note to match ratings (avoid contradictions)');
  }
  
  // Fix Rule 5 violations (missing drivers) - ONLY for truly mentioned keywords
  const rule5Issues = issues.filter(i => i.rule === 'Rule 5');
  if (rule5Issues.length > 0) {
    // Match checkRule5: include all note fields
    const allNotes = `${data.noise_density_note} ${data.daily_convenience_note} ${data.green_outdoor_note} ${data.crowd_vibe_note} ${data.long_term_comfort_note} ${data.short_note}`;
    
    // Only add drivers for keywords that are ACTUALLY mentioned (not template pollution)
    const hasTemplatePollution = 
      data.short_note.toLowerCase().includes('industrial/logistics zone') ||
      data.short_note.toLowerCase().includes('not designed for residential routines');
    
    if (!hasTemplatePollution) {
      // Use word boundary matching - minimal set only (strict matching)
      if (/\btourist(s)?\b/i.test(allNotes) && !data.drivers.includes('tourist_crowd')) {
        driversToAdd.push('tourist_crowd');
      }
      if (/\bnightlife\b/i.test(allNotes) && !data.drivers.some(d => d.includes('nightlife'))) {
        driversToAdd.push('nightlife_nearby');
      }
      if (/\barterial\b/i.test(allNotes) && !data.drivers.includes('arterial_roads')) {
        driversToAdd.push('arterial_roads');
      }
      // Heavy vehicles - only if explicitly mentioned (not inferred)
      if (/\bheavy (vehicles|trucks|hgv|container truck)\b/i.test(allNotes) && !data.drivers.includes('heavy_vehicles')) {
        driversToAdd.push('heavy_vehicles');
      }
      // CBD/Downtown - prefer downtown, only add cbd_edge if notes explicitly say "edge"
      // Also check for cbd_edge in existing drivers to avoid duplicates
      if (/\bdowntown\b/i.test(allNotes) && 
          !data.drivers.some(d => ['downtown', 'cbd', 'cbd_edge'].includes(d))) {
        driversToAdd.push('downtown');
      } else if (/\bcbd\b/i.test(allNotes) && 
                 !data.drivers.some(d => ['downtown', 'cbd', 'cbd_edge'].includes(d))) {
        // Only add cbd_edge if notes say "edge", otherwise downtown
        if (allNotes.match(/\bcbd\s+edge\b/i)) {
          driversToAdd.push('cbd_edge');
        } else {
          driversToAdd.push('downtown');
        }
      }
      // Port/Logistics - only if explicitly mentioned (not from "transport")
      if (/\bport\b/i.test(allNotes) && !allNotes.match(/\btransport\b/i) && 
          !data.drivers.some(d => d.includes('port'))) {
        driversToAdd.push('port_logistics');
      }
      // Logistics - only if explicitly mentioned (warehouse/distribution/terminal)
      if (/\b(logistics|warehouse|distribution|terminal)\b/i.test(allNotes) && 
          !allNotes.match(/\btransport\b/i) &&
          !data.drivers.some(d => d.includes('logistics'))) {
        driversToAdd.push('logistics');
      }
      // Interchange
      if (/\binterchange\b/i.test(allNotes) && !data.drivers.includes('interchange')) {
        driversToAdd.push('interchange');
      }
    }
    
    if (driversToAdd.length > 0) {
      // Use mergeDrivers to preserve existing drivers (union merge)
      changes.drivers = mergeDrivers(data.drivers, driversToAdd);
      reasons.push('Add missing drivers based on note keywords (minimal set, union merge)');
    }
  }
  
  // Fix Rule 6 violations (template pollution) - Generate neutral, rating-appropriate short_note
  const rule6Issues = issues.filter(i => i.rule === 'Rule 6');
  if (rule6Issues.length > 0) {
    // Generate short_note based on ratings - avoid overly positive phrases for bad ratings
    const longTermRating = data.long_term_comfort_rating;
    const dailyRating = data.daily_convenience_rating;
    const greenRating = data.green_outdoor_rating;
    
    if (longTermRating === 'bad') {
      // Bad rating: be honest but not overly negative
      if (dailyRating === 'good') {
        changes.short_note = 'Convenient on paper, but daily comfort is limited long term.';
      } else {
        changes.short_note = 'Limited long-term comfort and daily convenience.';
      }
    } else if (longTermRating === 'mixed') {
      // Mixed rating: acknowledge trade-offs
      if (dailyRating === 'good' && greenRating === 'good') {
        changes.short_note = 'Good access to essentials and outdoor spaces, with some daily trade-offs.';
      } else if (dailyRating === 'good') {
        changes.short_note = 'Good access to essentials, with a few daily trade-offs.';
      } else {
        changes.short_note = 'Mixed characteristics with some conveniences and limitations.';
      }
    } else if (longTermRating === 'good') {
      // Good rating: can be more positive but still specific
      if (dailyRating === 'good' && greenRating === 'good') {
        changes.short_note = 'Strong daily convenience with good outdoor access.';
      } else if (dailyRating === 'good') {
        changes.short_note = 'Strong daily convenience with a comfortable residential feel.';
      } else {
        changes.short_note = 'Comfortable residential area with balanced characteristics.';
      }
    } else {
      // Fallback for mixed ratings
      if (data.zone_type === 'city_core') {
        changes.short_note = 'Downtown lifestyle: commute-first convenience with higher activity levels.';
      } else {
        changes.short_note = 'Residential area with mixed characteristics.';
      }
    }
    
    reasons.push('Replace generic template with rating-appropriate description');
  }
  
  // Set review status if there are any issues
  if (issues.length > 0 && !changes.review_status) {
    // Find the most severe issue or highest priority reason
    const errorIssues = issues.filter(i => i.severity === 'error');
    const priorityIssue = errorIssues.length > 0 ? errorIssues[0] : issues[0];
    
    changes.review_status = 'needs_review';
    changes.review_reason = priorityIssue.reason;
  }
  
  if (Object.keys(changes).length > 0) {
    patches.push({
      neighbourhood_name: data.neighbourhood_name,
      changes,
      reason: reasons.join('; '),
    });
  }
  
  return patches;
}

// ============================================
// Main Linting Function
// ============================================

function lintData(inputData: LivingNotesData[]): LintResult {
  const allIssues: Issue[] = [];
  const allPatches: SuggestedPatch[] = [];
  
  for (const item of inputData) {
    const issues: Issue[] = [];
    
    // Run all rules
    issues.push(...checkRule1(item));
    issues.push(...checkRule2(item));
    issues.push(...checkRule3(item));
    issues.push(...checkRule4(item));
    issues.push(...checkRule5(item));
    issues.push(...checkRule6(item));
    issues.push(...checkRule7(item));
    issues.push(...checkRule8(item));
    issues.push(...checkRule9(item));
    
    if (issues.length > 0) {
      allIssues.push(...issues);
      
      // Generate suggested patches
      const patches = generateSuggestedPatches(item, issues);
      allPatches.push(...patches);
    }
  }
  
  const errors = allIssues.filter(i => i.severity === 'error').length;
  const warnings = allIssues.filter(i => i.severity === 'warning').length;
  const needsReview = new Set(allIssues.map(i => i.neighbourhood_name)).size;
  
  return {
    issues: allIssues,
    suggested_patches: allPatches,
    summary: {
      total: allIssues.length,
      errors,
      warnings,
      needs_review: needsReview,
    },
  };
}

// ============================================
// CLI
// ============================================

function main() {
  const args = process.argv.slice(2);
  const inputFile = args[0] || 'neighbourhoods.json';
  const outputDir = args[1] || './scripts/output';
  
  console.log('Running Living Notes Linter...');
  console.log('Reading input file:', inputFile);
  
  const inputData: LivingNotesData[] = JSON.parse(
    fs.readFileSync(inputFile, 'utf-8')
  );
  
  console.log(`Linting ${inputData.length} neighbourhoods...`);
  const result = lintData(inputData);
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write issues
  const issuesFile = `${outputDir}/lint_issues.json`;
  fs.writeFileSync(issuesFile, JSON.stringify(result.issues, null, 2));
  console.log(`\n⚠ Issues found: ${result.summary.total} (${result.summary.errors} errors, ${result.summary.warnings} warnings)`);
  console.log(`   Written to: ${issuesFile}`);
  
  // Write suggested patches
  if (result.suggested_patches.length > 0) {
    const patchesFile = `${outputDir}/suggested_patches.json`;
    fs.writeFileSync(patchesFile, JSON.stringify(result.suggested_patches, null, 2));
    console.log(`\n🔧 Suggested patches: ${result.suggested_patches.length}`);
    console.log(`   Written to: ${patchesFile}`);
  }
  
  // Write summary by rule
  const byRule: Record<string, number> = {};
  result.issues.forEach(i => {
    byRule[i.rule] = (byRule[i.rule] || 0) + 1;
  });
  
  console.log('\n=== Issues by Rule ===');
  Object.entries(byRule)
    .sort((a, b) => b[1] - a[1])
    .forEach(([rule, count]) => {
      console.log(`  ${rule}: ${count}`);
    });
  
  // Write summary by reason
  const byReason: Record<string, number> = {};
  result.issues.forEach(i => {
    byReason[i.reason] = (byReason[i.reason] || 0) + 1;
  });
  
  console.log('\n=== Issues by Reason ===');
  Object.entries(byReason)
    .sort((a, b) => b[1] - a[1])
    .forEach(([reason, count]) => {
      console.log(`  ${reason}: ${count}`);
    });
  
  // Show top issues
  console.log('\n=== Top Issues (by neighbourhood) ===');
  const byNeighbourhood: Record<string, Issue[]> = {};
  result.issues.forEach(i => {
    if (!byNeighbourhood[i.neighbourhood_name]) {
      byNeighbourhood[i.neighbourhood_name] = [];
    }
    byNeighbourhood[i.neighbourhood_name].push(i);
  });
  
  Object.entries(byNeighbourhood)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 10)
    .forEach(([name, issues]) => {
      console.log(`  ${name}: ${issues.length} issues`);
      issues.slice(0, 2).forEach(i => {
        console.log(`    - ${i.rule}: ${i.message}`);
      });
    });
  
  console.log('\n=== Summary ===');
  console.log(`Total issues: ${result.summary.total}`);
  console.log(`Errors: ${result.summary.errors}`);
  console.log(`Warnings: ${result.summary.warnings}`);
  console.log(`Neighbourhoods needing review: ${result.summary.needs_review}`);
  console.log(`Suggested patches: ${result.suggested_patches.length}`);
}

if (require.main === module) {
  main();
}

export { lintData, checkRule1, checkRule2, checkRule3, checkRule4, checkRule5, checkRule6 };

