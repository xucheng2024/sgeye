-- Migration: Fix ONE NORTH and review CHANGI WEST
-- Description: Apply Rule B fixes for business_park and review suspicious residential_scored items

-- ============================================
-- ONE NORTH: Decision needed
-- ============================================
-- ONE NORTH is a business park but has residential components
-- Options:
-- 1. Change to not_scored (if it's primarily business park)
-- 2. Change zone_type to mixed_use_residential (if it has significant residential)
-- 
-- Current: zone_type = business_park, rating_mode = residential_scored
-- 
-- Recommendation: If it has stable HDB/residential transactions and daily life,
--                 change zone_type to 'residential' and keep residential_scored.
--                 Otherwise, change to not_scored.

-- Option 1: Change to not_scored (if primarily business park)
-- Uncomment if ONE NORTH should be not_scored:
/*
UPDATE neighbourhood_living_notes
SET
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'One North is primarily a business park (Biomedical Hub). Not a residential neighbourhood baseline; we don''t score Living Comfort here.',
  drivers = ARRAY['business_park', 'biomedical_hub', 'workday_peak'],
  review_status = 'reviewed_not_scored',
  review_reason = 'Business park - changed to not_scored per Rule B',
  reviewed_at = NOW(),
  updated_at = NOW()
WHERE neighbourhood_name = 'ONE NORTH';
*/

-- Option 2: Change zone_type to residential (if it has significant residential)
-- Uncomment if ONE NORTH has stable residential life:
/*
UPDATE neighbourhood_living_notes
SET
  zone_type = 'residential',
  short_note = 'Mixed-use area with business park and residential components. Convenience is good with nearby amenities; decent transit access. Green access is good around the central-west belt. Mix of families and professionals; busier near business park.',
  drivers = ARRAY['mixed_use', 'business_park_adjacent', 'amenity_access', 'outdoor_access'],
  review_status = 'reviewed_ok',
  review_reason = 'Changed zone_type to residential - has stable residential components',
  reviewed_at = NOW(),
  updated_at = NOW()
WHERE neighbourhood_name = 'ONE NORTH';
*/

-- ============================================
-- CHANGI WEST: Review and potentially fix
-- ============================================
-- CHANGI WEST has:
-- - daily_convenience_rating = "bad"
-- - long_term_comfort_rating = "bad"
-- - short_note says "Generally not a comfortable long-term residential environment"
-- 
-- This suggests it might not be a proper residential area.
-- Check if it has HDB transactions - if not, should be not_scored.

-- Check current state
SELECT 
  neighbourhood_name,
  zone_type,
  rating_mode,
  daily_convenience_rating,
  long_term_comfort_rating,
  short_note,
  'Review needed: All bad ratings suggest non-residential' as note
FROM neighbourhood_living_notes
WHERE neighbourhood_name = 'CHANGI WEST';

-- If CHANGI WEST has no HDB transactions, change to not_scored:
-- (Uncomment after verifying no HDB transactions)
/*
UPDATE neighbourhood_living_notes
SET
  zone_type = 'industrial',
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'More logistics/arterial influence; not amenity-dense. Not a residential neighbourhood baseline; we don''t score Living Comfort here.',
  drivers = ARRAY['industrial', 'logistics', 'arterial_roads'],
  review_status = 'reviewed_not_scored',
  review_reason = 'No stable residential baseline - changed to not_scored',
  reviewed_at = NOW(),
  updated_at = NOW()
WHERE neighbourhood_name = 'CHANGI WEST';
*/

-- ============================================
-- Summary query: Check all business_park items
-- ============================================
SELECT 
  neighbourhood_name,
  zone_type,
  rating_mode,
  review_status,
  short_note
FROM neighbourhood_living_notes
WHERE zone_type = 'business_park'
ORDER BY neighbourhood_name;

