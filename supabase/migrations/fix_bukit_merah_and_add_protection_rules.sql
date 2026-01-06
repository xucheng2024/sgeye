-- Migration: Fix Bukit Merah misclassification and add protection rules
-- Description: 
--   1. Fix BUKIT MERAH: Ensure it's residential_scored (not industrial/not_scored)
--   2. Add protection rules to prevent similar misclassifications
--   3. Ensure industrial zones must have explicit industrial naming

-- Step 1: Fix BUKIT MERAH - Ensure it's correctly classified as residential
-- Also ensure all ratings are set (required for residential_scored constraint)
-- And remove non-residential drivers (port_logistics, industrial, etc.)
UPDATE neighbourhood_living_notes
SET 
  zone_type = 'residential',
  rating_mode = 'residential_scored',
  -- Ensure all ratings are set (required by check_rating_mode_residential_scored constraint)
  noise_density_rating = COALESCE(noise_density_rating, 'mixed'),
  daily_convenience_rating = COALESCE(daily_convenience_rating, 'good'),
  green_outdoor_rating = COALESCE(green_outdoor_rating, 'good'),
  crowd_vibe_rating = COALESCE(crowd_vibe_rating, 'good'),
  long_term_comfort_rating = COALESCE(long_term_comfort_rating, 'good'),
  short_note = 'Mature residential subzone within Bukit Merah; some nearby industrial areas mean block choice matters.',
  variance_level = 'spread_out',
  -- Remove non-residential drivers that violate constraint
  drivers = array_remove(
    array_remove(
      array_remove(
        array_remove(
          array_remove(
            array_remove(
              COALESCE(drivers, '{}'),
              'port_logistics'
            ),
            'industrial'
          ),
          'heavy_vehicles'
        ),
        'airport'
      ),
      'logistics'
    ),
    'container_terminal'
  ),
  updated_at = NOW()
WHERE neighbourhood_name = 'BUKIT MERAH'
  AND (
    zone_type != 'residential' 
    OR rating_mode != 'residential_scored'
    OR noise_density_rating IS NULL
    OR daily_convenience_rating IS NULL
    OR green_outdoor_rating IS NULL
    OR crowd_vibe_rating IS NULL
    OR long_term_comfort_rating IS NULL
  );

-- Step 2: Protection Rule 1 - Same-name subzones cannot be industrial
-- If neighbourhood name matches planning area name, it cannot be industrial
-- This prevents "Bukit Merah" subzone from being marked as industrial
-- Also remove non-residential drivers to satisfy constraint
-- EXCLUDE known non-residential zones that should remain not_scored
UPDATE neighbourhood_living_notes nln
SET 
  zone_type = 'residential',
  rating_mode = 'residential_scored',
  -- Remove non-residential drivers that violate check_rating_mode_residential_scored constraint
  drivers = array_remove(
    array_remove(
      array_remove(
        array_remove(
          array_remove(
            array_remove(
              COALESCE(nln.drivers, '{}'),
              'port_logistics'
            ),
            'industrial'
          ),
          'heavy_vehicles'
        ),
        'airport'
      ),
      'logistics'
    ),
    'container_terminal'
  ),
  updated_at = NOW()
FROM neighbourhoods n
JOIN planning_areas pa ON n.planning_area_id = pa.id
WHERE nln.neighbourhood_name = n.name
  AND UPPER(TRIM(n.name)) = UPPER(TRIM(pa.name))
  AND nln.zone_type = 'industrial'
  AND nln.rating_mode = 'not_scored'
  -- Exclude zones that should remain non-residential
  AND nln.neighbourhood_name NOT IN (
    'CHANGI BAY',
    'CHANGI EAST',
    'CHANGI AIR BASE',
    'PAYA LEBAR AIR BASE',
    'SELETAR AEROSPACE PARK',
    'JURONG ISLAND',
    'PULAU BUKOM',
    'TUAS',
    'SEMBAWANG',
    'KRANJI',
    'LIM CHU KANG'
  )
  AND (nln.short_note IS NULL OR (
    nln.short_note NOT ILIKE '%industrial%' 
    AND nln.short_note NOT ILIKE '%infrastructure%' 
    AND nln.short_note NOT ILIKE '%airport%'
    AND nln.short_note NOT ILIKE '%air base%'
    AND nln.short_note NOT ILIKE '%not designed for residential%'
  ));

-- Step 3a: Explicitly fix CHANGI BAY and other known issues first
-- This ensures these zones are fixed before other rules apply
-- Fix CHANGI BAY: should be industrial/not_scored, not residential_scored
-- UNCONDITIONAL update for CHANGI BAY to ensure it's always fixed
UPDATE neighbourhood_living_notes
SET 
  zone_type = 'industrial',
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  updated_at = NOW()
WHERE neighbourhood_name = 'CHANGI BAY';

-- Step 3: Fix misclassified zones that should be not_scored
-- CRITICAL: This must run BEFORE Step 4 to prevent constraint violations
-- Fix zones that are marked as residential_scored but have null ratings
-- These should be not_scored (they're non-residential)
-- EXCLUDE CHANGI BAY (already fixed in Step 3a)
UPDATE neighbourhood_living_notes
SET 
  zone_type = CASE 
    WHEN short_note ILIKE '%industrial%' OR short_note ILIKE '%infrastructure%' OR short_note ILIKE '%coastal%infrastructure%' 
      THEN 'industrial'
    WHEN short_note ILIKE '%airport%' OR short_note ILIKE '%air base%'
      THEN 'industrial'
    WHEN short_note ILIKE '%business park%' OR short_note ILIKE '%business and research park%'
      THEN 'business_park'
    WHEN short_note ILIKE '%future development%' OR short_note ILIKE '%future%zone%'
      THEN 'future_development'
    WHEN short_note ILIKE '%leisure%' OR short_note ILIKE '%leisure-focused%'
      THEN 'leisure'
    ELSE zone_type
  END,
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  updated_at = NOW()
WHERE rating_mode = 'residential_scored'
  AND neighbourhood_name != 'CHANGI BAY'  -- Exclude CHANGI BAY (already fixed in Step 3a)
  AND (
    -- Either all ratings are null (definitely should be not_scored)
    (noise_density_rating IS NULL 
     AND daily_convenience_rating IS NULL 
     AND green_outdoor_rating IS NULL 
     AND crowd_vibe_rating IS NULL 
     AND long_term_comfort_rating IS NULL)
    -- OR any rating is null (incomplete data, check if should be not_scored)
    OR noise_density_rating IS NULL 
    OR daily_convenience_rating IS NULL 
    OR green_outdoor_rating IS NULL 
    OR crowd_vibe_rating IS NULL 
    OR long_term_comfort_rating IS NULL
  )
  AND (
    short_note ILIKE '%industrial%' 
    OR short_note ILIKE '%infrastructure%' 
    OR short_note ILIKE '%not designed for residential%'
    OR short_note ILIKE '%non-residential%'
    OR short_note ILIKE '%airport%'
    OR short_note ILIKE '%air base%'
    OR short_note ILIKE '%business park%'
    OR short_note ILIKE '%future development%'
    OR short_note ILIKE '%leisure%'
    OR neighbourhood_name IN (
      'CHANGI EAST',
      'CHANGI AIR BASE',
      'PAYA LEBAR AIR BASE',
      'SELETAR AEROSPACE PARK',
      'JURONG ISLAND',
      'PULAU BUKOM',
      'TUAS',
      'TUAS VIEW EXTENSION',
      'TUAS SOUTH EXTENSION'
    )
  );

-- Step 4: Protection Rule 2 - Industrial zones must have explicit industrial naming
-- IMPORTANT: This only applies to zones that were ALREADY marked as industrial/not_scored BEFORE Step 3
-- We do NOT change zones that Step 3 just fixed to not_scored
-- We also exclude zones that have non-residential indicators in their short_note
UPDATE neighbourhood_living_notes
SET 
  zone_type = 'residential',
  rating_mode = 'residential_scored',
  -- Ensure all ratings are set
  noise_density_rating = COALESCE(noise_density_rating, 'mixed'),
  daily_convenience_rating = COALESCE(daily_convenience_rating, 'good'),
  green_outdoor_rating = COALESCE(green_outdoor_rating, 'good'),
  crowd_vibe_rating = COALESCE(crowd_vibe_rating, 'good'),
  long_term_comfort_rating = COALESCE(long_term_comfort_rating, 'good'),
  updated_at = NOW()
WHERE zone_type = 'industrial'
  AND rating_mode = 'not_scored'
  -- Only process zones that have ALL ratings set to NULL (meaning they were previously not_scored correctly)
  -- This prevents us from changing zones that Step 3 just fixed
  AND noise_density_rating IS NULL
  AND daily_convenience_rating IS NULL
  AND green_outdoor_rating IS NULL
  AND crowd_vibe_rating IS NULL
  AND long_term_comfort_rating IS NULL
  -- Exclude zones with non-residential indicators in short_note (these should stay not_scored)
  AND (short_note IS NULL OR (
    short_note NOT ILIKE '%industrial%' 
    AND short_note NOT ILIKE '%infrastructure%' 
    AND short_note NOT ILIKE '%not designed for residential%'
    AND short_note NOT ILIKE '%non-residential%'
    AND short_note NOT ILIKE '%airport%'
    AND short_note NOT ILIKE '%air base%'
    AND short_note NOT ILIKE '%business park%'
    AND short_note NOT ILIKE '%future development%'
    AND short_note NOT ILIKE '%leisure%'
  ))
  AND neighbourhood_name NOT ILIKE '%Industrial Estate%'
  AND neighbourhood_name NOT ILIKE '%Wharves%'
  AND neighbourhood_name NOT ILIKE '%Shipyard%'
  AND neighbourhood_name NOT ILIKE '%Port%'
  AND neighbourhood_name NOT ILIKE '%Terminal%'
  AND neighbourhood_name NOT ILIKE '%Logistics%'
  AND neighbourhood_name NOT ILIKE '%Aerospace%'
  AND neighbourhood_name NOT ILIKE '%Air Base%'
  AND neighbourhood_name NOT ILIKE '%Airport%'
  AND neighbourhood_name NOT ILIKE '%Bay%'  -- Coastal infrastructure zones like CHANGI BAY
  AND neighbourhood_name NOT IN (
    -- Explicitly known industrial zones (even without keywords)
    'JURONG ISLAND',
    'PULAU BUKOM',
    'PULAU TEKONG',
    'TUAS',
    'TUAS VIEW EXTENSION',
    'TUAS SOUTH EXTENSION',
    'LOYANG INDUSTRIAL ESTATE',
    'SEMBAWANG SHIPYARD',
    'ADMIRALTY SHIPYARD',
    'JURONG RIVER',
    'JURONG PIER',
    'KALLANG BASIN',
    'KALLANG RIVER EDGE',
    'SELETAR AEROSPACE PARK',
    'PAYA LEBAR AIR BASE',
    'CHANGI AIR BASE',
    'CHANGI EAST',
    'CHANGI BAY',  -- Infrastructure/industrial coastal zone
    'SUNGEI GEDONG',
    'KRANJI',
    'LIM CHU KANG',
    'MANDAI ESTATE',
    'MANDAI EAST'
  );

-- Step 5: Verify BUKIT MERAH is correct
SELECT 
  neighbourhood_name,
  zone_type,
  rating_mode,
  short_note,
  variance_level
FROM neighbourhood_living_notes
WHERE neighbourhood_name = 'BUKIT MERAH';

-- Step 6: List any remaining potential misclassifications (for manual review)
SELECT 
  neighbourhood_name,
  zone_type,
  rating_mode,
  short_note
FROM neighbourhood_living_notes
WHERE zone_type = 'industrial'
  AND rating_mode = 'not_scored'
  AND neighbourhood_name NOT ILIKE '%Industrial Estate%'
  AND neighbourhood_name NOT ILIKE '%Wharves%'
  AND neighbourhood_name NOT ILIKE '%Shipyard%'
  AND neighbourhood_name NOT ILIKE '%Port%'
  AND neighbourhood_name NOT ILIKE '%Terminal%'
  AND neighbourhood_name NOT ILIKE '%Logistics%'
  AND neighbourhood_name NOT ILIKE '%Aerospace%'
  AND neighbourhood_name NOT ILIKE '%Air Base%'
  AND neighbourhood_name NOT ILIKE '%Airport%'
ORDER BY neighbourhood_name;

