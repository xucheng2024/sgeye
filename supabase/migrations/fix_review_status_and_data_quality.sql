-- Migration: Fix review status, truncated notes, drivers cleanup, and variance_level consistency
-- Description: 
--   A: Cleanup review_status for correctly classified not_scored areas
--   B: Fix truncated long_term_comfort_note
--   C: Remove zone_type from drivers (keep only experience factors)
--   D: Unify city core variance_level to spread_out
--   E: Optimize short_note for landed/low-density areas

BEGIN;

-- ============================================
-- A: Cleanup review_status for correctly classified not_scored areas
-- Note: This should run AFTER the city core areas are changed to not_scored
-- ============================================
UPDATE neighbourhood_living_notes
SET
  review_status = 'auto_ok',
  review_reason = NULL,
  reviewed_at = NULL,
  reviewed_by = NULL,
  updated_at = NOW()
WHERE neighbourhood_name IN (
  'DHOBY GHAUT',
  'ONE NORTH',
  'CLARKE QUAY',
  'NEWTON CIRCUS',
  'BAYFRONT SUBZONE',
  'BUGIS',
  'LAKESIDE (LEISURE)',
  'SIMPANG NORTH',
  'SIMPANG SOUTH'
)
AND rating_mode = 'not_scored'
AND review_status = 'needs_review';

-- ============================================
-- B: Fix truncated long_term_comfort_note
-- ============================================
-- SEMBAWANG
UPDATE neighbourhood_living_notes
SET
  long_term_comfort_note = 'Comfortable if you prefer quieter north pockets and don''t mind travelling for central-city access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'SEMBAWANG'
  AND (long_term_comfort_note LIKE '%don\%' OR long_term_comfort_note LIKE '%don\\');

-- LOWER SELETAR
UPDATE neighbourhood_living_notes
SET
  long_term_comfort_note = 'Comfortable if you prefer quieter north pockets and don''t mind travelling for central-city access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'LOWER SELETAR'
  AND (long_term_comfort_note LIKE '%don\%' OR long_term_comfort_note LIKE '%don\\');

-- RESERVOIR VIEW
UPDATE neighbourhood_living_notes
SET
  long_term_comfort_note = 'Comfortable if you prefer quieter north pockets and don''t mind travelling for central-city access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'RESERVOIR VIEW'
  AND (long_term_comfort_note LIKE '%don\%' OR long_term_comfort_note LIKE '%don\\');

-- NEWTON CIRCUS - Fix truncated green_outdoor_note
UPDATE neighbourhood_living_notes
SET
  green_outdoor_note = 'More hard-city; greenery exists nearby, but the overall feel remains urban-core.',
  updated_at = NOW()
WHERE neighbourhood_name = 'NEWTON CIRCUS'
  AND (green_outdoor_note LIKE '%but not the%' OR green_outdoor_note LIKE '%but not the "%');

-- ============================================
-- C: Remove zone_type from drivers (keep only experience factors)
-- ============================================
-- Remove "residential" from drivers (it's redundant with zone_type)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential')
  ),
  updated_at = NOW()
WHERE 'residential' = ANY(drivers)
  AND zone_type = 'residential';

-- Remove "industrial" from drivers (it's redundant with zone_type)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('industrial')
  ),
  updated_at = NOW()
WHERE 'industrial' = ANY(drivers)
  AND zone_type = 'industrial';

-- For residential areas that only had "residential" driver, add appropriate experience factors
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(
    SELECT DISTINCT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['family_friendly', 'amenity_access']) AS elem
  ),
  updated_at = NOW()
WHERE zone_type = 'residential'
  AND (drivers IS NULL OR array_length(drivers, 1) = 0 OR drivers = ARRAY['residential']::text[]);

-- Remove "downtown" from drivers (it's a zone/area concept, not an experience factor)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem != 'downtown'
  ),
  updated_at = NOW()
WHERE 'downtown' = ANY(drivers)
  AND neighbourhood_name IN ('ALEXANDRA HILL', 'ANCHORVALE');

-- ============================================
-- D: Unify city core variance_level to spread_out
-- ============================================
UPDATE neighbourhood_living_notes
SET
  variance_level = 'spread_out',
  updated_at = NOW()
WHERE neighbourhood_name IN (
  'DHOBY GHAUT',
  'BUGIS',
  'CLARKE QUAY',
  'BAYFRONT SUBZONE',
  'NEWTON CIRCUS'
)
AND zone_type = 'city_core'
AND variance_level != 'spread_out';

-- ============================================
-- E: Optimize short_note for landed/low-density areas (optional but recommended)
-- ============================================
-- FRANKEL
UPDATE neighbourhood_living_notes
SET
  short_note = 'Low-density residential enclave with a quieter, owner-occupier feel. Daily convenience depends on nearby town hubs.',
  updated_at = NOW()
WHERE neighbourhood_name = 'FRANKEL'
  AND short_note ILIKE '%Comfortable residential area with balanced characteristics%';

-- SIGLAP
UPDATE neighbourhood_living_notes
SET
  short_note = 'Low-density residential enclave with a quieter, owner-occupier feel. Daily convenience depends on nearby town hubs.',
  updated_at = NOW()
WHERE neighbourhood_name = 'SIGLAP'
  AND short_note ILIKE '%Comfortable residential area with balanced characteristics%';

-- GREENWOOD PARK
UPDATE neighbourhood_living_notes
SET
  short_note = 'Low-density residential enclave with a quieter, owner-occupier feel. Daily convenience depends on nearby town hubs.',
  updated_at = NOW()
WHERE neighbourhood_name = 'GREENWOOD PARK'
  AND short_note ILIKE '%Comfortable residential area with balanced characteristics%';

-- CHATSWORTH
UPDATE neighbourhood_living_notes
SET
  short_note = 'Low-density residential enclave with a quieter, owner-occupier feel. Daily convenience depends on nearby town hubs.',
  updated_at = NOW()
WHERE neighbourhood_name = 'CHATSWORTH'
  AND short_note ILIKE '%Comfortable residential area with balanced characteristics%';

COMMIT;

-- ============================================
-- Verification queries
-- ============================================
-- Check review_status cleanup
SELECT 
  neighbourhood_name,
  rating_mode,
  review_status,
  review_reason
FROM neighbourhood_living_notes
WHERE neighbourhood_name IN (
  'DHOBY GHAUT',
  'ONE NORTH',
  'CLARKE QUAY',
  'NEWTON CIRCUS',
  'BAYFRONT SUBZONE',
  'BUGIS',
  'LAKESIDE (LEISURE)',
  'SIMPANG NORTH'
)
ORDER BY neighbourhood_name;

-- Check truncated notes fix
SELECT 
  neighbourhood_name,
  long_term_comfort_note
FROM neighbourhood_living_notes
WHERE neighbourhood_name IN (
  'SEMBAWANG',
  'LOWER SELETAR',
  'RESERVOIR VIEW'
)
ORDER BY neighbourhood_name;

-- Check drivers cleanup (sample)
SELECT 
  neighbourhood_name,
  zone_type,
  drivers
FROM neighbourhood_living_notes
WHERE zone_type = 'residential'
  AND 'residential' = ANY(drivers)
LIMIT 10;

-- Check variance_level consistency
SELECT 
  neighbourhood_name,
  zone_type,
  variance_level
FROM neighbourhood_living_notes
WHERE neighbourhood_name IN (
  'DHOBY GHAUT',
  'BUGIS',
  'CLARKE QUAY',
  'BAYFRONT SUBZONE',
  'NEWTON CIRCUS'
)
ORDER BY neighbourhood_name;

