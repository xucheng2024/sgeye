-- Migration: Fix airport, military, and industrial zone misclassifications (batch 3)
-- Description: Correct zone_type and rating_mode for airport, military, and industrial areas

BEGIN;

-- ============================================
-- 21. SELETAR AEROSPACE PARK: Airport/aviation industrial (not residential)
-- Note: Using 'industrial' as closest since 'airport' doesn't exist
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'industrial',  -- Closest to airport/aviation (no 'airport' type exists)
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Seletar Aerospace Park is an aviation and industrial zone centered around Seletar Airport. It is not a residential neighbourhood.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name ILIKE '%SELETAR AEROSPACE%'
  AND rating_mode != 'not_scored';

-- ============================================
-- 22. PAYA LEBAR AIR BASE: Military airport (not residential)
-- Note: Using 'nature' as closest since 'military' doesn't exist
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'nature',  -- Closest to military/restricted (no 'military' type exists)
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Paya Lebar Air Base is a military airport zone. It is not a residential area.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name ILIKE '%PAYA LEBAR AIR BASE%'
  AND rating_mode != 'not_scored';

-- ============================================
-- 23. CHANGI AIR BASE / CHANGI WEST: Military zones (not residential)
-- Note: Using 'nature' as closest since 'military' doesn't exist
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'nature',  -- Closest to military/restricted (no 'military' type exists)
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Changi Air Base areas are military zones and should not be confused with nearby residential Changi Village.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE (neighbourhood_name ILIKE '%CHANGI AIR BASE%' OR neighbourhood_name = 'CHANGI WEST');

-- ============================================
-- 24. CHANGI EAST: Future airport expansion (not yet residential)
-- Note: Using 'residential' but marking as not_scored (no 'future_development' type exists)
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'residential',  -- Keep as residential but mark as future development
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Changi East is primarily reserved for future airport and infrastructure expansion, not residential living.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name = 'CHANGI EAST'
  AND rating_mode != 'not_scored';

-- ============================================
-- 25. JURONG ISLAND: Petrochemical island (completely non-residential)
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'industrial',
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Jurong Island is a petrochemical industrial zone. It is not a residential area.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name = 'JURONG ISLAND'
  AND rating_mode != 'not_scored';

-- ============================================
-- 26. SUNGEI GEDONG: Military camp area (not residential)
-- Note: Using 'nature' as closest since 'military' doesn't exist
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'nature',  -- Closest to military/restricted (no 'military' type exists)
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Sungei Gedong is a military camp area with no residential housing options.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name ILIKE '%SUNGEI GEDONG%'
  AND rating_mode != 'not_scored';

-- ============================================
-- 27. LOYANG INDUSTRIAL ESTATE: Industrial zone (not residential)
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'industrial',
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Loyang Industrial Estate is an industrial zone, distinct from nearby residential Loyang Point and Pasir Ris.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name ILIKE '%LOYANG INDUSTRIAL%'
  AND rating_mode != 'not_scored';

-- ============================================
-- 28. WOODLANDS NORTH COAST: Future transformation (not yet residential)
-- Note: Using 'residential' but marking as not_scored (no 'future_development' type exists)
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'residential',  -- Keep as residential but mark as future development
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Woodlands North Coast is undergoing long-term transformation and does not yet function as a residential neighbourhood.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name = 'WOODLANDS NORTH COAST'
  AND rating_mode != 'not_scored';

-- ============================================
-- 29. JURONG RIVER / JURONG PIER: Port/industrial zone (not residential)
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'industrial',
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Jurong River and Jurong Pier areas are port and industrial zones, distinct from residential Jurong East.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name IN ('JURONG RIVER', 'JURONG PIER')
  AND rating_mode != 'not_scored';

-- ============================================
-- 30. TUAS SOUTH EXTENSION: Port expansion (not residential)
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'industrial',
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Tuas South Extension is a port expansion zone. It is not a residential area.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name = 'TUAS SOUTH EXTENSION'
  AND rating_mode != 'not_scored';

-- ============================================
-- 31. MARINA SOUTH: Future residential (not yet established)
-- Note: Using 'residential' but marking as not_scored (no 'future_residential' type exists)
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'residential',  -- Keep as residential but mark as future/emerging
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Marina South is a planned future residential zone without an established living environment yet.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name = 'MARINA SOUTH'
  AND rating_mode != 'not_scored';

-- ============================================
-- 32. KALLANG BASIN / KALLANG RIVER EDGE: Mixed-use commercial (not typical HDB)
-- Note: Using 'city_core' as closest since 'mixed_use' doesn't exist
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'city_core',  -- Closest to mixed-use commercial (no 'mixed_use' type exists)
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Kallang Basin and Kallang River Edge are mixed-use commercial and planning zones, not typical HDB neighbourhoods.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name IN ('KALLANG BASIN', 'KALLANG RIVER EDGE')
  AND rating_mode != 'not_scored';

COMMIT;

-- ============================================
-- Verification queries
-- ============================================
SELECT 
  neighbourhood_name,
  zone_type,
  rating_mode,
  short_note
FROM neighbourhood_living_notes
WHERE neighbourhood_name ILIKE '%SELETAR AEROSPACE%'
   OR neighbourhood_name ILIKE '%PAYA LEBAR AIR BASE%'
   OR neighbourhood_name ILIKE '%CHANGI AIR BASE%'
   OR neighbourhood_name = 'CHANGI WEST'
   OR neighbourhood_name = 'CHANGI EAST'
   OR neighbourhood_name = 'JURONG ISLAND'
   OR neighbourhood_name ILIKE '%SUNGEI GEDONG%'
   OR neighbourhood_name ILIKE '%LOYANG INDUSTRIAL%'
   OR neighbourhood_name = 'WOODLANDS NORTH COAST'
   OR neighbourhood_name IN ('JURONG RIVER', 'JURONG PIER')
   OR neighbourhood_name = 'TUAS SOUTH EXTENSION'
   OR neighbourhood_name = 'MARINA SOUTH'
   OR neighbourhood_name IN ('KALLANG BASIN', 'KALLANG RIVER EDGE')
ORDER BY neighbourhood_name;

