-- Migration: Fix resort, commercial, and CBD zone misclassifications (batch 4)
-- Description: Correct zone_type and rating_mode for resort islands, commercial cores, and CBD areas

BEGIN;

-- ============================================
-- 33. SENTOSA: Resort island (not HDB neighbourhood)
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'offshore',
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Sentosa is a resort and private residential island, not part of Singapore''s public housing neighbourhood system.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name ILIKE '%SENTOSA%'
  AND rating_mode != 'not_scored';

-- ============================================
-- 34. SELETAR HILLS / SELETAR WEST: Landed-only enclave (not typical HDB)
-- Note: Using 'residential' but marking as not_scored (no 'landed_only' type exists)
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'residential',  -- Keep as residential but mark as landed-only
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Seletar Hills is a landed-only residential enclave and does not represent a typical HDB neighbourhood for comparison.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name IN ('SELETAR HILLS', 'SELETAR WEST')
  AND rating_mode = 'residential_scored';

-- ============================================
-- 35. NOVENA MEDICAL HUB: Healthcare/commercial zone (not residential neighbourhood)
-- Note: Using 'city_core' as closest since 'mixed_use' doesn't exist
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'city_core',  -- Closest to mixed-use commercial (no 'mixed_use' type exists)
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Novena Medical Hub is primarily a healthcare and commercial zone, not a self-contained residential neighbourhood.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name ILIKE '%NOVENA MEDICAL HUB%'
  AND rating_mode != 'not_scored';

-- ============================================
-- 36. ORCHARD ROAD CORE: Commercial core (not family residential)
-- Note: Using 'city_core' as closest since 'commercial_core' doesn't exist
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'city_core',  -- Closest to commercial core (no 'commercial_core' type exists)
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Orchard Road Core is a commercial shopping district, not a family residential neighbourhood.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name ILIKE '%ORCHARD ROAD CORE%'
  AND rating_mode != 'not_scored';

-- ============================================
-- 37. BUGIS / BRAS BASAH CORE: Cultural/commercial core (not family neighbourhood)
-- Note: Using 'city_core' as closest since 'commercial_core' doesn't exist
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'city_core',  -- Closest to commercial core (no 'commercial_core' type exists)
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Bugis and Bras Basah Core are cultural and commercial districts, not family residential neighbourhoods.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name IN ('BUGIS', 'BRAS BASAH')
  AND rating_mode = 'residential_scored';

-- ============================================
-- 38. CITY HALL / RAFFLES PLACE: CBD (not neighbourhood)
-- Note: Using 'city_core' as closest since 'cbd' doesn't exist
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'city_core',  -- Closest to CBD (no 'cbd' type exists)
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'City Hall and Raffles Place are CBD zones, not residential neighbourhoods.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name IN ('CITY HALL', 'RAFFLES PLACE')
  AND rating_mode = 'residential_scored';

-- ============================================
-- 39. MARINA BAY CORE: CBD extension (not neighbourhood)
-- Note: Using 'city_core' as closest since 'cbd' doesn't exist
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'city_core',  -- Closest to CBD (no 'cbd' type exists)
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Marina Bay Core is a CBD extension, not a residential neighbourhood.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name = 'MARINA BAY CORE'
  AND rating_mode != 'not_scored';

-- ============================================
-- 40. HOLLAND VILLAGE CORE: Nightlife/retail core (not neighbourhood)
-- Note: Using 'city_core' as closest since 'mixed_use_core' doesn't exist
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'city_core',  -- Closest to mixed-use core (no 'mixed_use_core' type exists)
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Holland Village Core is a nightlife and retail district, distinct from surrounding residential areas like Holland Drive and Ghim Moh.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name = 'HOLLAND VILLAGE CORE'
  AND rating_mode != 'not_scored';

-- ============================================
-- 41. PULAU BUKOM / BUKOM ISLAND: Petrochemical island (if exists)
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'industrial',
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Pulau Bukom is a petrochemical industrial island. It is not a residential area.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name ILIKE '%PULAU BUKOM%' OR neighbourhood_name ILIKE '%BUKOM ISLAND%'
  AND rating_mode != 'not_scored';

-- ============================================
-- 42. PULAU TEKONG: Military training island (if exists)
-- Note: Using 'nature' as closest since 'military' doesn't exist
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'nature',  -- Closest to military/restricted (no 'military' type exists)
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Pulau Tekong is a military training island with no residential housing.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name ILIKE '%PULAU TEKONG%'
  AND rating_mode != 'not_scored';

-- ============================================
-- 43. SEMBAWANG SHIPYARD / ADMIRALTY SHIPYARD: Industrial shipyard (if exists as subarea)
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'industrial',
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Sembawang Shipyard and Admiralty Shipyard are industrial zones, distinct from nearby residential Admiralty areas.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name ILIKE '%SEMBAWANG SHIPYARD%' OR neighbourhood_name ILIKE '%ADMIRALTY SHIPYARD%'
  AND rating_mode != 'not_scored';

-- ============================================
-- 44. PASIR PANJANG TERMINAL / PSA ZONE: Port zone (if exists as subarea)
-- Note: Using 'industrial' as closest since 'port' doesn't exist
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'industrial',  -- Closest to port (no 'port' type exists)
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Pasir Panjang Terminal and PSA zones are port areas, not residential neighbourhoods.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name ILIKE '%PASIR PANJANG TERMINAL%' OR neighbourhood_name ILIKE '%PSA ZONE%'
  AND rating_mode != 'not_scored';

-- ============================================
-- 45. TUAS VIEW EXTENSION: Industrial port extension (if exists)
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'industrial',
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Tuas View Extension is an industrial port zone. It is not a residential area.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name = 'TUAS VIEW EXTENSION'
  AND rating_mode != 'not_scored';

COMMIT;

-- ============================================
-- Verification queries
-- ============================================
SELECT 
  neighbourhood_name,
  zone_type,
  rating_mode,
  short_note
FROM neighbourhood_living_notes
WHERE neighbourhood_name ILIKE '%SENTOSA%'
   OR neighbourhood_name IN ('SELETAR HILLS', 'SELETAR WEST')
   OR neighbourhood_name ILIKE '%NOVENA MEDICAL HUB%'
   OR neighbourhood_name ILIKE '%ORCHARD ROAD CORE%'
   OR neighbourhood_name IN ('BUGIS', 'BRAS BASAH')
   OR neighbourhood_name IN ('CITY HALL', 'RAFFLES PLACE')
   OR neighbourhood_name = 'MARINA BAY CORE'
   OR neighbourhood_name = 'HOLLAND VILLAGE CORE'
   OR neighbourhood_name ILIKE '%PULAU BUKOM%'
   OR neighbourhood_name ILIKE '%BUKOM ISLAND%'
   OR neighbourhood_name ILIKE '%PULAU TEKONG%'
   OR neighbourhood_name ILIKE '%SEMBAWANG SHIPYARD%'
   OR neighbourhood_name ILIKE '%ADMIRALTY SHIPYARD%'
   OR neighbourhood_name ILIKE '%PASIR PANJANG TERMINAL%'
   OR neighbourhood_name ILIKE '%PSA ZONE%'
   OR neighbourhood_name = 'TUAS VIEW EXTENSION'
ORDER BY neighbourhood_name;

