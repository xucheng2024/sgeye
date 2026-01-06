-- Migration: Fix missing critical patches
-- Description: Add drivers for CENTRAL SUBZONE, BRAS BASAH, BUGIS, CLIFFORD PIER
--              Fix CLARKE QUAY short_note contradiction
--              Uses UNION merge for drivers (doesn't overwrite existing)

-- ============================================
-- CENTRAL SUBZONE: Add tourist_crowd
-- ============================================
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['tourist_crowd']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'CENTRAL SUBZONE'
  AND NOT (drivers && ARRAY['tourist_crowd']);

-- ============================================
-- BRAS BASAH: Add tourist_crowd + nightlife_nearby
-- ============================================
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['tourist_crowd', 'nightlife_nearby']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'BRAS BASAH'
  AND (NOT (drivers && ARRAY['tourist_crowd']) OR NOT (drivers && ARRAY['nightlife_belt', 'nightlife_nearby']));

-- ============================================
-- BUGIS: Add tourist_crowd
-- ============================================
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['tourist_crowd']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'BUGIS'
  AND NOT (drivers && ARRAY['tourist_crowd']);

-- ============================================
-- CLIFFORD PIER: Add tourist_crowd
-- ============================================
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['tourist_crowd']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'CLIFFORD PIER'
  AND NOT (drivers && ARRAY['tourist_crowd']);

-- ============================================
-- CLARKE QUAY: Fix short_note contradiction
-- ============================================
UPDATE neighbourhood_living_notes
SET
  short_note = 'High activity and crowds can limit long-term comfort.',
  updated_at = NOW()
WHERE neighbourhood_name = 'CLARKE QUAY'
  AND long_term_comfort_rating = 'bad';

-- ============================================
-- Verify fixes
-- ============================================
SELECT 
  neighbourhood_name,
  drivers,
  short_note,
  long_term_comfort_rating
FROM neighbourhood_living_notes
WHERE neighbourhood_name IN ('CENTRAL SUBZONE', 'BRAS BASAH', 'BUGIS', 'CLIFFORD PIER', 'CLARKE QUAY')
ORDER BY neighbourhood_name;

