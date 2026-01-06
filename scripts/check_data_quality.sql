-- Data Quality Checks for Living Notes
-- Run these queries to identify data quality issues

-- ============================================
-- Check 1: Non-residential zones incorrectly scored (Rule A violation)
-- ============================================
-- Should return 0 rows
SELECT 
  neighbourhood_name,
  zone_type,
  rating_mode,
  'ERROR: Non-residential zone marked as residential_scored' as issue
FROM neighbourhood_living_notes
WHERE zone_type IN ('industrial', 'nature', 'offshore', 'business_park')
  AND rating_mode = 'residential_scored';

-- ============================================
-- Check 2: Template pollution in short_note (Rule C violation)
-- ============================================
-- Should return 0 rows
SELECT 
  neighbourhood_name,
  rating_mode,
  short_note,
  'ERROR: Generic template short_note' as issue
FROM neighbourhood_living_notes
WHERE rating_mode = 'residential_scored'
  AND (
    short_note IN ('Residential area.', 'Residential area: expect higher street activity/noise.')
    OR short_note ILIKE '%industrial/logistics zone%'
    OR short_note ILIKE '%not designed for residential routines%'
    OR short_note ILIKE '%we don''t score living comfort here%'
  );

-- ============================================
-- Check 3: Generic drivers (Rule C violation)
-- ============================================
-- Should return 0 rows
SELECT 
  neighbourhood_name,
  rating_mode,
  drivers,
  'ERROR: Generic drivers array' as issue
FROM neighbourhood_living_notes
WHERE rating_mode = 'residential_scored'
  AND (
    array_length(drivers, 1) = 1 AND drivers[1] = 'residential'
    OR array_length(drivers, 1) IS NULL
    OR array_length(drivers, 1) = 0
  );

-- ============================================
-- Check 4: Content inconsistency (zone_type vs notes)
-- ============================================
-- Flags items where zone_type doesn't match the description
SELECT 
  neighbourhood_name,
  zone_type,
  rating_mode,
  short_note,
  CASE 
    WHEN zone_type = 'residential' AND (
      short_note ILIKE '%business park%' OR
      short_note ILIKE '%industrial%' OR
      short_note ILIKE '%port%' OR
      short_note ILIKE '%logistics%'
    ) THEN 'ERROR: residential zone_type but non-residential description'
    WHEN zone_type = 'business_park' AND rating_mode = 'residential_scored' THEN 'WARNING: business_park marked as residential_scored (should usually be not_scored)'
    ELSE 'OK'
  END as issue
FROM neighbourhood_living_notes
WHERE (
  (zone_type = 'residential' AND (
    short_note ILIKE '%business park%' OR
    short_note ILIKE '%industrial%' OR
    short_note ILIKE '%port%' OR
    short_note ILIKE '%logistics%'
  ))
  OR
  (zone_type = 'business_park' AND rating_mode = 'residential_scored')
)
ORDER BY issue DESC, neighbourhood_name;

-- ============================================
-- Check 5: Rating mode consistency
-- ============================================
-- Should return 0 rows
SELECT 
  neighbourhood_name,
  rating_mode,
  noise_density_rating,
  daily_convenience_rating,
  green_outdoor_rating,
  crowd_vibe_rating,
  long_term_comfort_rating,
  'ERROR: Rating mode inconsistency' as issue
FROM neighbourhood_living_notes
WHERE (
  (rating_mode = 'residential_scored' AND (
    noise_density_rating IS NULL OR
    daily_convenience_rating IS NULL OR
    green_outdoor_rating IS NULL OR
    crowd_vibe_rating IS NULL OR
    long_term_comfort_rating IS NULL
  ))
  OR
  (rating_mode = 'not_scored' AND (
    noise_density_rating IS NOT NULL OR
    daily_convenience_rating IS NOT NULL OR
    green_outdoor_rating IS NOT NULL OR
    crowd_vibe_rating IS NOT NULL OR
    long_term_comfort_rating IS NOT NULL
  ))
);

-- ============================================
-- Check 6: Items needing review
-- ============================================
SELECT 
  neighbourhood_name,
  display_name,
  zone_type,
  rating_mode,
  review_status,
  review_reason,
  short_note
FROM neighbourhood_living_notes
WHERE review_status = 'needs_review'
ORDER BY neighbourhood_name;

-- ============================================
-- Check 7: Business parks marked as residential_scored (Rule B)
-- ============================================
SELECT 
  neighbourhood_name,
  zone_type,
  rating_mode,
  short_note,
  drivers,
  'WARNING: business_park marked as residential_scored' as issue
FROM neighbourhood_living_notes
WHERE zone_type = 'business_park'
  AND rating_mode = 'residential_scored'
ORDER BY neighbourhood_name;

-- ============================================
-- Summary: Count issues by type
-- ============================================
SELECT 
  'Non-residential zones incorrectly scored' as check_type,
  COUNT(*) as issue_count
FROM neighbourhood_living_notes
WHERE zone_type IN ('industrial', 'nature', 'offshore', 'business_park')
  AND rating_mode = 'residential_scored'
UNION ALL
SELECT 
  'Template pollution in short_note',
  COUNT(*)
FROM neighbourhood_living_notes
WHERE rating_mode = 'residential_scored'
  AND (
    short_note IN ('Residential area.', 'Residential area: expect higher street activity/noise.')
    OR short_note ILIKE '%industrial/logistics zone%'
  )
UNION ALL
SELECT 
  'Generic drivers array',
  COUNT(*)
FROM neighbourhood_living_notes
WHERE rating_mode = 'residential_scored'
  AND (
    array_length(drivers, 1) = 1 AND drivers[1] = 'residential'
    OR array_length(drivers, 1) IS NULL
  )
UNION ALL
SELECT 
  'Rating mode inconsistency',
  COUNT(*)
FROM neighbourhood_living_notes
WHERE (
  (rating_mode = 'residential_scored' AND (
    noise_density_rating IS NULL OR
    daily_convenience_rating IS NULL
  ))
  OR
  (rating_mode = 'not_scored' AND noise_density_rating IS NOT NULL)
)
UNION ALL
SELECT 
  'Items needing review',
  COUNT(*)
FROM neighbourhood_living_notes
WHERE review_status = 'needs_review';

