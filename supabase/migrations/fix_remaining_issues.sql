-- Migration: Fix remaining lint issues
-- Description: 
--   1. Rule 2/3: Change industrial zones to not_scored (10 neighbourhoods)
--   2. Rule 5: Add missing drivers using union merge (23 neighbourhoods)
--   3. Rule 4: Fix MARITIME SQUARE short_note (already in Rule 2/3 fix)
-- 
-- Uses UNION merge for drivers (doesn't overwrite existing)

BEGIN;

-- ============================================
-- Part 1: Rule 2/3 - Change to not_scored
-- ============================================

-- BUKIT MERAH: Change to not_scored (non-residential zone)
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  zone_type = 'industrial',
  short_note = 'Industrial/logistics zone. Not designed for residential routines.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BUKIT MERAH'
  AND rating_mode = 'residential_scored';

-- CHANGI WEST: Change to not_scored (non-residential zone)
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  zone_type = 'industrial',
  short_note = 'Industrial/logistics zone. Not designed for residential routines.',
  updated_at = NOW()
WHERE neighbourhood_name = 'CHANGI WEST'
  AND rating_mode = 'residential_scored';

-- GALI BATU: Change to not_scored (non-residential zone)
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  zone_type = 'industrial',
  short_note = 'Industrial/logistics zone. Not designed for residential routines.',
  updated_at = NOW()
WHERE neighbourhood_name = 'GALI BATU'
  AND rating_mode = 'residential_scored';

-- GUL BASIN: Change to not_scored (non-residential zone)
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  zone_type = 'industrial',
  short_note = 'Industrial/logistics zone. Not designed for residential routines.',
  updated_at = NOW()
WHERE neighbourhood_name = 'GUL BASIN'
  AND rating_mode = 'residential_scored';

-- GUL CIRCLE: Change to not_scored (non-residential zone)
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  zone_type = 'industrial',
  short_note = 'Industrial/logistics zone. Not designed for residential routines.',
  updated_at = NOW()
WHERE neighbourhood_name = 'GUL CIRCLE'
  AND rating_mode = 'residential_scored';

-- MARITIME SQUARE: Change to not_scored + fix short_note
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  zone_type = 'industrial',
  short_note = 'Industrial/logistics zone. Not designed for residential routines.',
  updated_at = NOW()
WHERE neighbourhood_name = 'MARITIME SQUARE'
  AND rating_mode = 'residential_scored';

-- PORT: Change to not_scored (non-residential zone)
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  zone_type = 'industrial',
  short_note = 'Industrial/logistics zone. Not designed for residential routines.',
  updated_at = NOW()
WHERE neighbourhood_name = 'PORT'
  AND rating_mode = 'residential_scored';

-- SHIPYARD: Change to not_scored (non-residential zone)
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  zone_type = 'industrial',
  short_note = 'Industrial/logistics zone. Not designed for residential routines.',
  updated_at = NOW()
WHERE neighbourhood_name = 'SHIPYARD'
  AND rating_mode = 'residential_scored';

-- THE WHARVES: Change to not_scored (non-residential zone)
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  zone_type = 'industrial',
  short_note = 'Industrial/logistics zone. Not designed for residential routines.',
  updated_at = NOW()
WHERE neighbourhood_name = 'THE WHARVES'
  AND rating_mode = 'residential_scored';

-- TUAS PROMENADE: Change to not_scored (non-residential zone)
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  zone_type = 'industrial',
  short_note = 'Industrial/logistics zone. Not designed for residential routines.',
  updated_at = NOW()
WHERE neighbourhood_name = 'TUAS PROMENADE'
  AND rating_mode = 'residential_scored';

-- ============================================
-- Part 2: Rule 5 - Add missing drivers (union merge)
-- ============================================
-- Note: Only add drivers for residential_scored entries
--       Industrial zones (not_scored) don't need these drivers

-- ANG MO KIO: Add industrial
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['industrial']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'ANG MO KIO'
  AND rating_mode = 'residential_scored'
  AND NOT (drivers && ARRAY['industrial']);

-- BEDOK RESERVOIR: Add heavy_vehicles
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['heavy_vehicles']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'BEDOK RESERVOIR'
  AND rating_mode = 'residential_scored'
  AND NOT (drivers && ARRAY['heavy_vehicles']);

-- BOON LAY PLACE: Add industrial
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['industrial']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'BOON LAY PLACE'
  AND rating_mode = 'residential_scored'
  AND NOT (drivers && ARRAY['industrial']);

-- CLEANTECH: Add industrial
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['industrial']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'CLEANTECH'
  AND rating_mode = 'residential_scored'
  AND NOT (drivers && ARRAY['industrial']);

-- CLEMENTI WEST: Add heavy_vehicles
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['heavy_vehicles']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'CLEMENTI WEST'
  AND rating_mode = 'residential_scored'
  AND NOT (drivers && ARRAY['heavy_vehicles']);

-- GEYLANG BAHRU: Add industrial
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['industrial']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'GEYLANG BAHRU'
  AND rating_mode = 'residential_scored'
  AND NOT (drivers && ARRAY['industrial']);

-- KALLANG BAHRU: Add industrial
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['industrial']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'KALLANG BAHRU'
  AND rating_mode = 'residential_scored'
  AND NOT (drivers && ARRAY['industrial']);

-- KRANJI: Add industrial
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['industrial']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'KRANJI'
  AND rating_mode = 'residential_scored'
  AND NOT (drivers && ARRAY['industrial']);

-- NEWTON CIRCUS: Add high_footfall
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['high_footfall']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'NEWTON CIRCUS'
  AND rating_mode = 'residential_scored'
  AND NOT (drivers && ARRAY['high_footfall']);

-- PENJURU CRESCENT: Add industrial
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['industrial']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'PENJURU CRESCENT'
  AND rating_mode = 'residential_scored'
  AND NOT (drivers && ARRAY['industrial']);

-- PLAB: Add industrial
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['industrial']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'PLAB'
  AND rating_mode = 'residential_scored'
  AND NOT (drivers && ARRAY['industrial']);

-- SAFTI: Add industrial
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['industrial']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'SAFTI'
  AND rating_mode = 'residential_scored'
  AND NOT (drivers && ARRAY['industrial']);

-- SAMULUN: Add industrial
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['industrial']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'SAMULUN'
  AND rating_mode = 'residential_scored'
  AND NOT (drivers && ARRAY['industrial']);

-- SIGLAP: Add heavy_vehicles
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['heavy_vehicles']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'SIGLAP'
  AND rating_mode = 'residential_scored'
  AND NOT (drivers && ARRAY['heavy_vehicles']);

-- TENGEH: Add industrial
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['industrial']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'TENGEH'
  AND rating_mode = 'residential_scored'
  AND NOT (drivers && ARRAY['industrial']);

-- TUKANG: Add industrial
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['industrial']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'TUKANG'
  AND rating_mode = 'residential_scored'
  AND NOT (drivers && ARRAY['industrial']);

-- UPPER THOMSON: Add heavy_vehicles
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['heavy_vehicles']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'UPPER THOMSON'
  AND rating_mode = 'residential_scored'
  AND NOT (drivers && ARRAY['heavy_vehicles']);

COMMIT;

-- ============================================
-- Verification queries
-- ============================================

-- Check Rule 2/3 fixes
SELECT 
  neighbourhood_name,
  rating_mode,
  zone_type,
  short_note
FROM neighbourhood_living_notes
WHERE neighbourhood_name IN (
  'BUKIT MERAH', 'CHANGI WEST', 'GALI BATU', 'GUL BASIN', 'GUL CIRCLE',
  'MARITIME SQUARE', 'PORT', 'SHIPYARD', 'THE WHARVES', 'TUAS PROMENADE'
)
ORDER BY neighbourhood_name;

-- Check Rule 5 fixes (sample)
SELECT 
  neighbourhood_name,
  drivers,
  rating_mode
FROM neighbourhood_living_notes
WHERE neighbourhood_name IN (
  'ANG MO KIO', 'BEDOK RESERVOIR', 'NEWTON CIRCUS', 'SIGLAP', 'UPPER THOMSON'
)
ORDER BY neighbourhood_name;

