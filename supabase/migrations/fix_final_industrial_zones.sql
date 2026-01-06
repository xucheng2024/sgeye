-- Migration: Fix final industrial zones (Rule 2/3)
-- Description: Change remaining neighbourhoods with industrial/heavy_vehicles drivers to not_scored
-- These neighbourhoods have non-residential characteristics but are still marked as residential_scored

BEGIN;

-- ANG MO KIO: Change to not_scored (has industrial driver)
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
WHERE neighbourhood_name = 'ANG MO KIO'
  AND rating_mode = 'residential_scored';

-- BEDOK RESERVOIR: Change to not_scored (has heavy_vehicles driver)
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
WHERE neighbourhood_name = 'BEDOK RESERVOIR'
  AND rating_mode = 'residential_scored';

-- BOON LAY PLACE: Change to not_scored (has industrial driver)
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
WHERE neighbourhood_name = 'BOON LAY PLACE'
  AND rating_mode = 'residential_scored';

-- CLEANTECH: Change to not_scored (has industrial driver)
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
WHERE neighbourhood_name = 'CLEANTECH'
  AND rating_mode = 'residential_scored';

-- CLEMENTI WEST: Change to not_scored (has heavy_vehicles driver)
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
WHERE neighbourhood_name = 'CLEMENTI WEST'
  AND rating_mode = 'residential_scored';

-- GEYLANG BAHRU: Change to not_scored (has industrial driver)
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
WHERE neighbourhood_name = 'GEYLANG BAHRU'
  AND rating_mode = 'residential_scored';

-- KALLANG BAHRU: Change to not_scored (has industrial driver)
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
WHERE neighbourhood_name = 'KALLANG BAHRU'
  AND rating_mode = 'residential_scored';

-- KRANJI: Change to not_scored (has industrial driver)
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
WHERE neighbourhood_name = 'KRANJI'
  AND rating_mode = 'residential_scored';

-- PENJURU CRESCENT: Change to not_scored (has heavy_vehicles, industrial drivers)
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
WHERE neighbourhood_name = 'PENJURU CRESCENT'
  AND rating_mode = 'residential_scored';

-- PLAB: Change to not_scored (has heavy_vehicles, industrial drivers)
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
WHERE neighbourhood_name = 'PLAB'
  AND rating_mode = 'residential_scored';

-- SAFTI: Change to not_scored (has heavy_vehicles, industrial drivers)
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
WHERE neighbourhood_name = 'SAFTI'
  AND rating_mode = 'residential_scored';

-- SAMULUN: Change to not_scored (has heavy_vehicles, industrial drivers)
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
WHERE neighbourhood_name = 'SAMULUN'
  AND rating_mode = 'residential_scored';

-- SIGLAP: Change to not_scored (has heavy_vehicles driver)
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
WHERE neighbourhood_name = 'SIGLAP'
  AND rating_mode = 'residential_scored';

-- TENGEH: Change to not_scored (has industrial driver)
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
WHERE neighbourhood_name = 'TENGEH'
  AND rating_mode = 'residential_scored';

-- TUKANG: Change to not_scored (has industrial driver)
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
WHERE neighbourhood_name = 'TUKANG'
  AND rating_mode = 'residential_scored';

-- UPPER THOMSON: Change to not_scored (has heavy_vehicles driver)
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
WHERE neighbourhood_name = 'UPPER THOMSON'
  AND rating_mode = 'residential_scored';

COMMIT;

-- ============================================
-- Verification query
-- ============================================
SELECT 
  neighbourhood_name,
  rating_mode,
  zone_type,
  drivers,
  short_note
FROM neighbourhood_living_notes
WHERE neighbourhood_name IN (
  'ANG MO KIO', 'BEDOK RESERVOIR', 'BOON LAY PLACE', 'CLEANTECH', 'CLEMENTI WEST',
  'GEYLANG BAHRU', 'KALLANG BAHRU', 'KRANJI', 'PENJURU CRESCENT', 'PLAB',
  'SAFTI', 'SAMULUN', 'SIGLAP', 'TENGEH', 'TUKANG', 'UPPER THOMSON'
)
ORDER BY neighbourhood_name;

