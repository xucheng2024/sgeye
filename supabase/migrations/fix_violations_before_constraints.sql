-- Migration: Fix existing data violations before applying constraints
-- Description: Find and fix records that violate the new constraints
--              Run this BEFORE applying add_content_consistency_constraints.sql

-- ============================================
-- Step 1: Find violations of check_short_note_not_generic
-- ============================================
-- This constraint requires residential_scored entries to have:
-- - short_note length > 20
-- - Not be generic templates like "Residential area."

SELECT 
  neighbourhood_name,
  rating_mode,
  short_note,
  length(trim(short_note)) as note_length,
  'Violates check_short_note_not_generic' as issue
FROM neighbourhood_living_notes
WHERE rating_mode = 'residential_scored'
  AND (
    short_note IS NULL
    OR length(trim(short_note)) <= 20
    OR short_note IN ('Residential area.', 'Residential area: expect higher street activity/noise.')
  )
ORDER BY neighbourhood_name;

-- ============================================
-- Step 2: Fix generic short_notes
-- ============================================
-- Auto-generate better short_notes based on ratings and zone_type

UPDATE neighbourhood_living_notes
SET
  short_note = CASE
    -- If daily convenience is good, emphasize that
    WHEN daily_convenience_rating = 'good' AND green_outdoor_rating = 'good' THEN
      'Family-friendly area: great daily convenience and strong outdoor access.'
    WHEN daily_convenience_rating = 'good' THEN
      'Convenience-first area: great daily convenience.'
    WHEN green_outdoor_rating = 'good' THEN
      'Family-friendly area: strong outdoor access.'
    WHEN noise_density_rating = 'good' THEN
      'Quieter residential area with calmer nights.'
    WHEN long_term_comfort_rating = 'good' THEN
      'Comfortable long-term residential area.'
    WHEN zone_type = 'city_core' THEN
      'Downtown lifestyle: commute-first convenience with higher activity levels.'
    WHEN zone_type = 'residential' THEN
      'Residential area with balanced convenience and comfort.'
    ELSE
      'Residential area with mixed characteristics.'
  END,
  updated_at = NOW()
WHERE rating_mode = 'residential_scored'
  AND (
    short_note IS NULL
    OR length(trim(short_note)) <= 20
    OR short_note IN ('Residential area.', 'Residential area: expect higher street activity/noise.')
  );

-- ============================================
-- Step 3: Find violations of check_short_note_no_forbidden_phrases
-- ============================================
SELECT 
  neighbourhood_name,
  rating_mode,
  short_note,
  'Violates check_short_note_no_forbidden_phrases' as issue
FROM neighbourhood_living_notes
WHERE rating_mode = 'residential_scored'
  AND (
    short_note ILIKE '%industrial/logistics zone%'
    OR short_note ILIKE '%not designed for residential routines%'
    OR short_note ILIKE '%we don''t score living comfort here%'
    OR short_note ILIKE '%not a residential neighbourhood%'
  )
ORDER BY neighbourhood_name;

-- ============================================
-- Step 4: Fix forbidden phrases (use existing short_note from fixed data if available)
-- ============================================
-- For now, generate based on zone_type and ratings
UPDATE neighbourhood_living_notes
SET
  short_note = CASE
    WHEN zone_type = 'city_core' THEN
      'Downtown lifestyle: commute-first convenience with higher activity levels.'
    WHEN zone_type = 'residential' AND daily_convenience_rating = 'good' AND green_outdoor_rating = 'good' THEN
      'Family-friendly area: great daily convenience and strong outdoor access.'
    WHEN zone_type = 'residential' AND daily_convenience_rating = 'good' THEN
      'Convenience-first heartland: great daily convenience.'
    WHEN zone_type = 'residential' THEN
      'Residential area with balanced characteristics.'
    ELSE
      'Residential area.'
  END,
  updated_at = NOW()
WHERE rating_mode = 'residential_scored'
  AND (
    short_note ILIKE '%industrial/logistics zone%'
    OR short_note ILIKE '%not designed for residential routines%'
    OR short_note ILIKE '%we don''t score living comfort here%'
    OR short_note ILIKE '%not a residential neighbourhood%'
  );

-- ============================================
-- Step 5: Find violations of check_drivers_not_generic
-- ============================================
SELECT 
  neighbourhood_name,
  rating_mode,
  drivers,
  array_length(drivers, 1) as driver_count,
  'Violates check_drivers_not_generic' as issue
FROM neighbourhood_living_notes
WHERE rating_mode = 'residential_scored'
  AND (
    array_length(drivers, 1) IS NULL
    OR array_length(drivers, 1) = 0
    OR (array_length(drivers, 1) = 1 AND drivers[1] = 'residential')
  )
ORDER BY neighbourhood_name;

-- ============================================
-- Step 6: Fix generic drivers
-- ============================================
-- Auto-generate drivers based on zone_type and ratings
UPDATE neighbourhood_living_notes
SET
  drivers = (
    SELECT ARRAY_AGG(DISTINCT driver)
    FROM (
      -- Zone type drivers
      SELECT CASE
        WHEN zone_type = 'city_core' THEN 'downtown'
        WHEN zone_type = 'business_park' THEN 'business_park'
        ELSE NULL
      END as driver
      FROM neighbourhood_living_notes n2
      WHERE n2.neighbourhood_name = neighbourhood_living_notes.neighbourhood_name
      
      UNION
      
      -- Rating-based drivers
      SELECT CASE
        WHEN daily_convenience_rating = 'good' THEN 'amenity_access'
        WHEN green_outdoor_rating = 'good' THEN 'outdoor_access'
        WHEN noise_density_rating = 'bad' OR crowd_vibe_rating = 'bad' THEN 'high_activity'
        WHEN long_term_comfort_rating = 'mixed' AND daily_convenience_rating = 'good' THEN 'tradeoffs_for_convenience'
        ELSE NULL
      END
      FROM neighbourhood_living_notes n2
      WHERE n2.neighbourhood_name = neighbourhood_living_notes.neighbourhood_name
    ) drivers_list
    WHERE driver IS NOT NULL
  ),
  updated_at = NOW()
WHERE rating_mode = 'residential_scored'
  AND (
    array_length(drivers, 1) IS NULL
    OR array_length(drivers, 1) = 0
    OR (array_length(drivers, 1) = 1 AND drivers[1] = 'residential')
  );

-- If still empty after auto-generation, add at least one meaningful driver
UPDATE neighbourhood_living_notes
SET
  drivers = CASE
    WHEN zone_type = 'city_core' THEN ARRAY['downtown', 'amenity_access']
    WHEN zone_type = 'residential' AND daily_convenience_rating = 'good' THEN ARRAY['amenity_access', 'residential']
    WHEN zone_type = 'residential' THEN ARRAY['residential', 'family_friendly']
    ELSE ARRAY['residential']
  END,
  updated_at = NOW()
WHERE rating_mode = 'residential_scored'
  AND (
    array_length(drivers, 1) IS NULL
    OR array_length(drivers, 1) = 0
  );

-- ============================================
-- Step 7: Verify fixes
-- ============================================
-- Check if there are any remaining violations
SELECT 
  'Remaining violations' as check_type,
  COUNT(*) as count
FROM neighbourhood_living_notes
WHERE rating_mode = 'residential_scored'
  AND (
    short_note IS NULL
    OR length(trim(short_note)) <= 20
    OR short_note IN ('Residential area.', 'Residential area: expect higher street activity/noise.')
    OR short_note ILIKE '%industrial/logistics zone%'
    OR array_length(drivers, 1) IS NULL
    OR (array_length(drivers, 1) = 1 AND drivers[1] = 'residential')
  );

-- Show fixed records
SELECT 
  neighbourhood_name,
  rating_mode,
  short_note,
  drivers,
  'Fixed' as status
FROM neighbourhood_living_notes
WHERE rating_mode = 'residential_scored'
  AND updated_at > NOW() - INTERVAL '1 minute'
ORDER BY neighbourhood_name;

