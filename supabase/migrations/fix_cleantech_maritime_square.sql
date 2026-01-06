-- Migration: Fix CLEANTECH and MARITIME SQUARE - change to not_scored
-- Description: These are business/commercial hubs, not residential neighbourhoods
--              They should not have residential comfort ratings

-- ============================================
-- Fix CLEANTECH
-- ============================================
-- JTC CleanTech Park is an eco-business park (Jurong Innovation District)
-- Not a residential neighbourhood baseline
UPDATE neighbourhood_living_notes
SET
  zone_type = 'business_park',
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'JTC CleanTech Park is an eco-business park (Jurong Innovation District). Not a residential neighbourhood baseline; we don''t score Living Comfort here.',
  drivers = ARRAY['business_park', 'jtc', 'workday_peak'],
  updated_at = NOW()
WHERE neighbourhood_name = 'CLEANTECH';

-- ============================================
-- Fix MARITIME SQUARE
-- ============================================
-- HarbourFront commercial/transport hub (HarbourFront Centre / MRT interchange)
-- Not a residential neighbourhood baseline
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'HarbourFront commercial/transport hub (HarbourFront Centre / MRT interchange). Not a residential neighbourhood baseline; we don''t score Living Comfort here.',
  drivers = ARRAY['commercial_hub', 'transport_hub', 'mrt_interchange'],
  updated_at = NOW()
WHERE neighbourhood_name = 'MARITIME SQUARE';

-- Verify the changes
SELECT 
  neighbourhood_name,
  zone_type,
  rating_mode,
  short_note,
  drivers
FROM neighbourhood_living_notes
WHERE neighbourhood_name IN ('CLEANTECH', 'MARITIME SQUARE');

