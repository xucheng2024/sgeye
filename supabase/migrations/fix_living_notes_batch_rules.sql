-- Migration: Batch rules to fill missing fields in neighbourhood_living_notes
-- Description: Auto-fill display_name, drivers (dedup + fallback), variance_level, short_note
--              Based on zone_type and existing data patterns

-- ============================================
-- 1. Generate display_name (remove parentheses, title case)
-- ============================================
UPDATE neighbourhood_living_notes
SET display_name = INITCAP(
  TRIM(
    REGEXP_REPLACE(neighbourhood_name, '\s*\([^)]*\)\s*$', '', 'g')
  )
)
WHERE display_name IS NULL OR display_name = '';

-- ============================================
-- 2. Deduplicate drivers arrays and add fallback
-- ============================================
-- First, deduplicate existing drivers arrays (using subquery approach)
UPDATE neighbourhood_living_notes
SET drivers = (
  SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::TEXT[])))
)
WHERE drivers IS NOT NULL AND array_length(drivers, 1) > 0;

-- Add fallback drivers based on zone_type
UPDATE neighbourhood_living_notes
SET drivers = ARRAY['heartland']
WHERE (drivers IS NULL OR array_length(drivers, 1) = 0)
  AND zone_type = 'residential';

UPDATE neighbourhood_living_notes
SET drivers = ARRAY['downtown', 'high_footfall']
WHERE (drivers IS NULL OR array_length(drivers, 1) = 0)
  AND zone_type = 'city_core';

UPDATE neighbourhood_living_notes
SET drivers = ARRAY['industrial', 'heavy_vehicles']
WHERE (drivers IS NULL OR array_length(drivers, 1) = 0)
  AND zone_type = 'industrial';

UPDATE neighbourhood_living_notes
SET drivers = ARRAY['nature_reserve']
WHERE (drivers IS NULL OR array_length(drivers, 1) = 0)
  AND zone_type = 'nature';

UPDATE neighbourhood_living_notes
SET drivers = ARRAY['offshore']
WHERE (drivers IS NULL OR array_length(drivers, 1) = 0)
  AND zone_type = 'offshore';

UPDATE neighbourhood_living_notes
SET drivers = ARRAY['business_park']
WHERE (drivers IS NULL OR array_length(drivers, 1) = 0)
  AND zone_type = 'business_park';

UPDATE neighbourhood_living_notes
SET drivers = ARRAY['city_fringe']
WHERE (drivers IS NULL OR array_length(drivers, 1) = 0)
  AND zone_type = 'city_fringe';

-- ============================================
-- 3. Auto-fill variance_level based on zone_type and drivers
-- ============================================
-- industrial/nature/offshore/business_park default to compact
UPDATE neighbourhood_living_notes
SET variance_level = 'compact'
WHERE variance_level IS NULL
  AND zone_type IN ('industrial', 'nature', 'offshore', 'business_park');

-- city_core default to moderate
UPDATE neighbourhood_living_notes
SET variance_level = 'moderate'
WHERE variance_level IS NULL
  AND zone_type = 'city_core';

-- city-fringe with specific drivers default to spread_out
UPDATE neighbourhood_living_notes
SET variance_level = 'spread_out'
WHERE variance_level IS NULL
  AND zone_type = 'city_fringe'
  AND (
    'nightlife' = ANY(drivers) OR
    'interchange' = ANY(drivers) OR
    'arterial_roads' = ANY(drivers) OR
    'dense_shophouses' = ANY(drivers) OR
    'pocket_variation_high' = ANY(drivers)
  );

-- city-fringe without specific drivers default to moderate
UPDATE neighbourhood_living_notes
SET variance_level = 'moderate'
WHERE variance_level IS NULL
  AND zone_type = 'city_fringe';

-- residential default to moderate (unless specified)
UPDATE neighbourhood_living_notes
SET variance_level = 'moderate'
WHERE variance_level IS NULL
  AND zone_type = 'residential';

-- ============================================
-- 4. Auto-fill short_note based on zone_type templates
-- ============================================
-- industrial
UPDATE neighbourhood_living_notes
SET short_note = 'Industrial/logistics zone. Not designed for residential routines.'
WHERE (short_note IS NULL OR short_note = '')
  AND zone_type = 'industrial';

-- nature/offshore
UPDATE neighbourhood_living_notes
SET short_note = 'Primarily non-residential. We don''t score Living Comfort here.'
WHERE (short_note IS NULL OR short_note = '')
  AND zone_type IN ('nature', 'offshore');

-- city_core
UPDATE neighbourhood_living_notes
SET short_note = 'Downtown lifestyle: commute-first convenience with higher activity levels.'
WHERE (short_note IS NULL OR short_note = '')
  AND zone_type = 'city_core';

-- business_park
UPDATE neighbourhood_living_notes
SET short_note = 'Business park area: weekday-focused convenience, quieter weekends.'
WHERE (short_note IS NULL OR short_note = '')
  AND zone_type = 'business_park';

-- residential (generic fallback - more specific ones should be patched manually)
UPDATE neighbourhood_living_notes
SET short_note = 'Residential neighbourhood with balanced amenities and access.'
WHERE (short_note IS NULL OR short_note = '')
  AND zone_type = 'residential';

-- city_fringe (generic fallback)
UPDATE neighbourhood_living_notes
SET short_note = 'City-fringe area: good convenience, but pocket variation can be high.'
WHERE (short_note IS NULL OR short_note = '')
  AND zone_type = 'city_fringe';

