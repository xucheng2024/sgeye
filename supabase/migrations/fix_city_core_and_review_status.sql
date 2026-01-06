-- Migration: Fix city core misclassifications and review status cleanup
-- Description: 
--   A类: Fix city core areas (Dhoby Ghaut, Clarke Quay, etc.) and cleanup review status
--   B类: Unify One North note, fix Lakeside Leisure, fix Lorong Halus North drivers
--   C类: Detail optimizations (Bedok Reservoir, Kallang Bahru, Tampines)

BEGIN;

-- ============================================
-- A类 1: Dhoby Ghaut / Clarke Quay / Boat Quay / Bayfront Subzone
-- City core districts (not residential neighbourhoods)
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'city_core',
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'City-core district with heavy transit, nightlife, or tourist activity. Not scored as a residential neighbourhood.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name IN ('DHOBY GHAUT', 'CLARKE QUAY', 'BOAT QUAY', 'BAYFRONT SUBZONE')
  AND rating_mode = 'residential_scored';

-- ============================================
-- A类 2: Newton Circus - Interchange/arterial junction (not residential)
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'city_core',
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'City-core district with heavy transit, nightlife, or tourist activity. Not scored as a residential neighbourhood.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name = 'NEWTON CIRCUS'
  AND rating_mode = 'residential_scored';

-- ============================================
-- A类 3: Cleanup review status for correctly classified non-residential zones
-- ============================================
UPDATE neighbourhood_living_notes
SET
  review_status = 'auto_ok',
  review_reason = NULL,
  updated_at = NOW()
WHERE neighbourhood_name IN ('SOUTHERN GROUP', 'MANDAI ESTATE', 'MANDAI EAST', 'NEE SOON', 'KRANJI')
  AND rating_mode = 'not_scored'
  AND review_status = 'needs_review'
  AND review_reason = 'NON_RESIDENTIAL_SCORED';

-- ============================================
-- B类 4: One North - Tighten note language
-- ============================================
UPDATE neighbourhood_living_notes
SET
  short_note = 'One-North is primarily a business and research park with limited residential pockets. It is excluded from neighbourhood living comparisons.',
  updated_at = NOW()
WHERE neighbourhood_name = 'ONE NORTH'
  AND short_note != 'One-North is primarily a business and research park with limited residential pockets. It is excluded from neighbourhood living comparisons.';

-- ============================================
-- B类 5: Lakeside (Leisure) - Option A (recommended): not_scored
-- ============================================
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Leisure-focused zone around Jurong Lake Gardens. Not treated as a standard residential neighbourhood.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name = 'LAKESIDE (LEISURE)'
  AND rating_mode = 'residential_scored';

-- ============================================
-- B类 6: Lorong Halus North - Fix drivers (remove downtown, keep existing good ones)
-- ============================================
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(
    SELECT DISTINCT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'outdoor_access', 'planned_estate', 'family_friendly']) AS elem
    WHERE elem NOT IN ('downtown')
  ),
  updated_at = NOW()
WHERE neighbourhood_name = 'LORONG HALUS NORTH'
  AND 'downtown' = ANY(drivers);

-- ============================================
-- C类 7: Bedok Reservoir - Remove heavy_vehicles driver
-- ============================================
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(
    SELECT DISTINCT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['outdoor_access', 'park_adjacent']) AS elem
    WHERE elem NOT IN ('heavy_vehicles')
  ),
  updated_at = NOW()
WHERE neighbourhood_name = 'BEDOK RESERVOIR'
  AND 'heavy_vehicles' = ANY(drivers);

-- ============================================
-- C类 8: Kallang Bahru - Update variance_level to spread_out
-- ============================================
UPDATE neighbourhood_living_notes
SET
  variance_level = 'spread_out',
  updated_at = NOW()
WHERE neighbourhood_name = 'KALLANG BAHRU'
  AND variance_level != 'spread_out';

-- ============================================
-- C类 9: Tampines East / Tampines North - Differentiate short_note
-- ============================================
-- Tampines East: Emphasize higher maturity / closer to town
UPDATE neighbourhood_living_notes
SET
  short_note = 'Livability depends heavily on commute tolerance. Daily routines are noticeably longer than town-centre estates, with LRT-only or bus-heavy access patterns. East areas are relatively more mature and closer to the town centre.',
  updated_at = NOW()
WHERE neighbourhood_name = 'TAMPINES EAST'
  AND short_note ILIKE '%Livability depends heavily on commute tolerance%';

-- Tampines North: Emphasize newer / emptier / more remote
UPDATE neighbourhood_living_notes
SET
  short_note = 'Livability depends heavily on commute tolerance. Daily routines are noticeably longer than town-centre estates, with LRT-only or bus-heavy access patterns. North areas are newer developments with more limited amenities and greater distance from the town centre.',
  updated_at = NOW()
WHERE neighbourhood_name = 'TAMPINES NORTH'
  AND short_note ILIKE '%Livability depends heavily on commute tolerance%';

COMMIT;

-- ============================================
-- Verification queries
-- ============================================
SELECT 
  neighbourhood_name,
  zone_type,
  rating_mode,
  review_status,
  review_reason,
  drivers,
  variance_level,
  short_note
FROM neighbourhood_living_notes
WHERE neighbourhood_name IN (
  'DHOBY GHAUT',
  'CLARKE QUAY',
  'BOAT QUAY',
  'BAYFRONT SUBZONE',
  'NEWTON CIRCUS',
  'SOUTHERN GROUP',
  'MANDAI ESTATE',
  'MANDAI EAST',
  'NEE SOON',
  'KRANJI',
  'ONE NORTH',
  'LORONG HALUS NORTH',
  'BEDOK RESERVOIR',
  'KALLANG BAHRU',
  'TAMPINES EAST',
  'TAMPINES NORTH'
)
OR neighbourhood_name ILIKE '%LAKESIDE%LEISURE%'
ORDER BY neighbourhood_name;

