-- Migration: Fix neighbourhoods marked as not_scored but have HDB resale data
-- Description: If a neighbourhood has HDB resale data, it means there are HDB flats there,
--              so it should be marked as residential_scored, not not_scored
-- 
-- Affected neighbourhoods:
-- 1. BUGIS - city_core, has 5 transactions
-- 2. CITY HALL - city_core, has 11 transactions  
-- 3. THE WHARVES - industrial, has 8 transactions
-- 4. LAKESIDE (LEISURE) - residential, has 2 transactions

BEGIN;

-- IMPORTANT: The constraint check_rating_mode_residential_scored requires:
-- - If rating_mode = 'residential_scored', ALL ratings must be non-null
-- - If rating_mode = 'not_scored', ALL ratings must be null
-- 
-- We must update ALL fields (ratings + rating_mode) in a SINGLE UPDATE statement
-- to avoid violating the constraint during the update

-- BUGIS: Update all fields at once (ratings + rating_mode)
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'residential_scored',
  noise_density_rating = 'bad',  -- City core intensity
  daily_convenience_rating = 'good',  -- Excellent convenience
  green_outdoor_rating = 'mixed',  -- Some nearby parks
  crowd_vibe_rating = 'bad',  -- Tourist/office crowd
  long_term_comfort_rating = 'mixed',  -- Depends on tolerance for city core living
  short_note = 'City core area with HDB flats. High convenience but intense activity and tourist/office crowds. Not ideal for families seeking quiet residential living.',
  review_status = 'needs_review',
  review_reason = 'HAD_HDB_DATA_BUT_NOT_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name = 'BUGIS'
  AND rating_mode = 'not_scored';

-- CITY HALL: Update all fields at once
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'residential_scored',
  noise_density_rating = 'bad',  -- Civic/downtown core
  daily_convenience_rating = 'good',  -- Excellent convenience
  green_outdoor_rating = 'mixed',  -- Some nearby parks
  crowd_vibe_rating = 'bad',  -- Tourist/office crowd
  long_term_comfort_rating = 'mixed',  -- CBD zone, not ideal for families
  short_note = 'CBD zone with HDB flats. Excellent convenience but intense activity. Not ideal for families seeking quiet residential living.',
  review_status = 'needs_review',
  review_reason = 'HAD_HDB_DATA_BUT_NOT_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name = 'CITY HALL'
  AND rating_mode = 'not_scored';

-- THE WHARVES: Industrial area but has HDB - Update all fields at once
-- Note: Must change zone_type from 'industrial' to 'residential' because constraint
--       check_zone_type_rating_mode requires industrial zones to be not_scored
--       But since it has HDB data, it should be residential_scored
UPDATE neighbourhood_living_notes
SET
  zone_type = 'residential',  -- Change from 'industrial' to 'residential' to allow residential_scored
  rating_mode = 'residential_scored',
  noise_density_rating = 'bad',  -- Industrial zone with heavy vehicles
  daily_convenience_rating = 'mixed',  -- Limited amenities
  green_outdoor_rating = 'bad',  -- Industrial setting
  crowd_vibe_rating = 'mixed',  -- Industrial area
  long_term_comfort_rating = 'bad',  -- Not ideal for residential
  short_note = 'Port/logistics zone with HDB flats. Heavy vehicle traffic and industrial activity. Not ideal for residential living.',
  review_status = 'needs_review',
  review_reason = 'HAD_HDB_DATA_BUT_NOT_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name = 'THE WHARVES'
  AND rating_mode = 'not_scored';

-- LAKESIDE (LEISURE): Leisure zone but has HDB - Update all fields at once
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'residential_scored',
  noise_density_rating = 'mixed',  -- Leisure area, can be busy
  daily_convenience_rating = 'good',  -- Near Jurong East amenities
  green_outdoor_rating = 'good',  -- Near Jurong Lake Gardens
  crowd_vibe_rating = 'mixed',  -- Leisure crowds
  long_term_comfort_rating = 'mixed',  -- Leisure-focused, not standard residential
  short_note = 'Leisure-adjacent zone with HDB flats. Near Jurong Lake Gardens but dominated by recreational use. Not a standard residential neighbourhood.',
  review_status = 'needs_review',
  review_reason = 'HAD_HDB_DATA_BUT_NOT_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name = 'LAKESIDE (LEISURE)'
  AND rating_mode = 'not_scored';

COMMIT;

-- Verification: Check the updated neighbourhoods
SELECT 
  nln.neighbourhood_name,
  nln.zone_type,
  nln.rating_mode,
  nln.review_status,
  nln.review_reason,
  ns.tx_12m,
  ns.median_price_12m,
  nln.short_note
FROM neighbourhood_living_notes nln
INNER JOIN neighbourhoods n ON UPPER(TRIM(n.name)) = UPPER(TRIM(nln.neighbourhood_name))
LEFT JOIN neighbourhood_summary ns ON n.id = ns.neighbourhood_id
WHERE nln.neighbourhood_name IN ('BUGIS', 'CITY HALL', 'THE WHARVES', 'LAKESIDE (LEISURE)')
ORDER BY nln.neighbourhood_name;
