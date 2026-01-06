-- Migration: Fix business parks and non-residential areas
-- Description: Mark business parks and non-residential areas as not_scored
--              These should not be in residential_scored for HDB comparison

BEGIN;

-- ============================================
-- ONE NORTH: Business Park (should be not_scored)
-- ============================================
-- ONE NORTH is a business park, not a residential neighbourhood
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
WHERE neighbourhood_name = 'ONE NORTH'
  AND rating_mode != 'not_scored';

COMMIT;

-- ============================================
-- Verification query
-- ============================================
SELECT 
  neighbourhood_name,
  zone_type,
  rating_mode,
  short_note
FROM neighbourhood_living_notes
WHERE neighbourhood_name = 'ONE NORTH';

