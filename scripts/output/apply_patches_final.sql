-- Auto-generated SQL from lint suggested patches
-- Review these changes before applying!

BEGIN;

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
WHERE neighbourhood_name = 'BUKIT MERAH';

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
WHERE neighbourhood_name = 'CHANGI WEST';

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
WHERE neighbourhood_name = 'GALI BATU';

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
WHERE neighbourhood_name = 'GUL BASIN';

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
WHERE neighbourhood_name = 'GUL CIRCLE';

-- MARITIME SQUARE: Change to not_scored (non-residential zone); Fix short_note to match ratings (avoid contradictions)
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  zone_type = 'industrial',
  short_note = 'Not a comfortable long-term residential environment.',
  updated_at = NOW()
WHERE neighbourhood_name = 'MARITIME SQUARE';

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
WHERE neighbourhood_name = 'PORT';

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
WHERE neighbourhood_name = 'SHIPYARD';

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
WHERE neighbourhood_name = 'THE WHARVES';

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
WHERE neighbourhood_name = 'TUAS PROMENADE';

COMMIT;

-- Review the changes above before committing!