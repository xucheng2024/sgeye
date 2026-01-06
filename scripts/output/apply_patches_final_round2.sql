-- Auto-generated SQL from lint suggested patches
-- Review these changes before applying!

BEGIN;

-- ANG MO KIO: Change to not_scored (non-residential zone)
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  updated_at = NOW()
WHERE neighbourhood_name = 'ANG MO KIO';

-- BOON LAY PLACE: Change to not_scored (non-residential zone)
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  updated_at = NOW()
WHERE neighbourhood_name = 'BOON LAY PLACE';

-- CLEANTECH: Change to not_scored (non-residential zone)
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  updated_at = NOW()
WHERE neighbourhood_name = 'CLEANTECH';

-- GEYLANG BAHRU: Change to not_scored (non-residential zone)
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  updated_at = NOW()
WHERE neighbourhood_name = 'GEYLANG BAHRU';

-- KALLANG BAHRU: Change to not_scored (non-residential zone)
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  updated_at = NOW()
WHERE neighbourhood_name = 'KALLANG BAHRU';

-- KRANJI: Change to not_scored (non-residential zone)
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  updated_at = NOW()
WHERE neighbourhood_name = 'KRANJI';

-- PENJURU CRESCENT: Change to not_scored (non-residential zone)
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  updated_at = NOW()
WHERE neighbourhood_name = 'PENJURU CRESCENT';

-- PLAB: Change to not_scored (non-residential zone)
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  updated_at = NOW()
WHERE neighbourhood_name = 'PLAB';

-- SAFTI: Change to not_scored (non-residential zone)
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  updated_at = NOW()
WHERE neighbourhood_name = 'SAFTI';

-- SAMULUN: Change to not_scored (non-residential zone)
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  updated_at = NOW()
WHERE neighbourhood_name = 'SAMULUN';

-- TENGEH: Change to not_scored (non-residential zone)
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  updated_at = NOW()
WHERE neighbourhood_name = 'TENGEH';

-- TUKANG: Change to not_scored (non-residential zone)
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  updated_at = NOW()
WHERE neighbourhood_name = 'TUKANG';

COMMIT;

-- Review the changes above before committing!