-- Migration: Fix critical misclassifications based on verified facts
-- Description: Correct zone_type and rating_mode for neighbourhoods that were incorrectly classified

BEGIN;

-- ============================================
-- 1. MANDAI ESTATE: Industrial + nature fringe (not residential)
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
  short_note = 'Mandai Estate is primarily an industrial/nature-adjacent zone with very limited residential stock. Not suitable for neighbourhood living comparisons.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name = 'MANDAI ESTATE';

-- ============================================
-- 2. MANDAI EAST: Same as Mandai Estate
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
  short_note = 'Mandai East is primarily an industrial/nature-adjacent zone with very limited residential stock. Not suitable for neighbourhood living comparisons.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name = 'MANDAI EAST';

-- ============================================
-- 3. PULAU SELETAR: Offshore island (not residential)
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'offshore',
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Pulau Seletar is a non-residential offshore island. It is not part of Singapore''s mainstream housing or HDB living environment.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name = 'PULAU SELETAR';

-- ============================================
-- 4. NEE SOON: Military/restricted uses (not residential)
-- Note: Using 'nature' as closest zone_type since 'military' doesn't exist
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
  short_note = 'Nee Soon is dominated by military and restricted land uses. It does not function as a residential neighbourhood and should not be compared for living comfort.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name = 'NEE SOON';

-- ============================================
-- 5. CLEMENTI WEST: Standard HDB residential (was incorrectly industrial)
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'residential',
  rating_mode = 'residential_scored',
  noise_density_rating = 'good',
  daily_convenience_rating = 'mixed',
  green_outdoor_rating = 'good',
  crowd_vibe_rating = 'good',
  long_term_comfort_rating = 'good',
  short_note = 'Residential layout with good long-term family living potential.',
  drivers = ARRAY(
    SELECT DISTINCT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['residential', 'family_friendly']) AS elem
    WHERE elem NOT IN ('industrial', 'port_logistics', 'heavy_vehicles')
  ),
  review_status = 'auto_ok',
  review_reason = NULL,
  updated_at = NOW()
WHERE neighbourhood_name = 'CLEMENTI WEST';

-- ============================================
-- 6. ONE NORTH: Update short_note only (zone_type and rating_mode already correct)
-- ============================================
UPDATE neighbourhood_living_notes
SET
  short_note = 'One-North is primarily a business and research park with adjacent residential pockets. It does not function as a typical neighbourhood for HDB living comparisons, so living comfort is not scored.',
  updated_at = NOW()
WHERE neighbourhood_name = 'ONE NORTH';

-- ============================================
-- 7. SIMPANG NORTH: Future development zone
-- Note: Using 'residential' but marking as not_scored (no 'future_development' type exists)
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'residential',  -- Keep as residential but mark clearly as future development
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Simpang is a long-term future development zone with no committed residential timeline. It should not be treated as a current housing option.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name = 'SIMPANG NORTH';

-- ============================================
-- 8. SIMPANG SOUTH: Same as Simpang North
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'residential',  -- Keep as residential but mark clearly as future development
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Simpang is a long-term future development zone with no committed residential timeline. It should not be treated as a current housing option.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name = 'SIMPANG SOUTH';

-- ============================================
-- 9. STRAITS VIEW: Future residential (not yet established)
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
  short_note = 'Straits View is an emerging waterfront development area without an established residential living baseline. Living comfort is not scored at this stage.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name = 'STRAITS VIEW';

-- ============================================
-- 10. LORONG HALUS NORTH: Adjust ratings (LRT-only access)
-- ============================================
UPDATE neighbourhood_living_notes
SET
  daily_convenience_rating = 'mixed',
  long_term_comfort_rating = 'mixed',
  short_note = 'Family-friendly newer estate with strong outdoor access, but daily routines and commutes are longer due to LRT-only access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'LORONG HALUS NORTH';

-- ============================================
-- 11. SIGLAP: Remove heavy_vehicles driver (conflicts with low-density description)
-- ============================================
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('heavy_vehicles')
  ),
  updated_at = NOW()
WHERE neighbourhood_name = 'SIGLAP'
  AND 'heavy_vehicles' = ANY(drivers);

-- Ensure SIGLAP has correct drivers
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(
    SELECT DISTINCT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['outdoor_access', 'low_density']) AS elem
  ),
  updated_at = NOW()
WHERE neighbourhood_name = 'SIGLAP';

COMMIT;

-- ============================================
-- Verification queries
-- ============================================
SELECT 
  neighbourhood_name,
  zone_type,
  rating_mode,
  short_note,
  drivers
FROM neighbourhood_living_notes
WHERE neighbourhood_name IN (
  'MANDAI ESTATE',
  'MANDAI EAST',
  'PULAU SELETAR',
  'NEE SOON',
  'CLEMENTI WEST',
  'ONE NORTH',
  'SIMPANG NORTH',
  'SIMPANG SOUTH',
  'STRAITS VIEW',
  'LORONG HALUS NORTH',
  'SIGLAP'
)
ORDER BY neighbourhood_name;

