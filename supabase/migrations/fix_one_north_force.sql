-- Migration: Force fix ONE NORTH to not_scored
-- Description: ONE NORTH is a business park and must be not_scored

BEGIN;

UPDATE neighbourhood_living_notes
SET
  zone_type = 'business_park',
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Business park zone. Not designed for everyday home routines — we don''t score living comfort here.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name = 'ONE NORTH';

COMMIT;

SELECT 
  neighbourhood_name,
  zone_type,
  rating_mode,
  short_note
FROM neighbourhood_living_notes
WHERE neighbourhood_name = 'ONE NORTH';

