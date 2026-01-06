-- Final Verification: All Quality Rules Applied
-- Run this to verify everything is working correctly

-- ============================================
-- 1. Verify Rule A: Non-residential zones are not_scored
-- ============================================
SELECT 
  'Rule A Check' as check_name,
  COUNT(*) as violations,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM neighbourhood_living_notes
WHERE zone_type IN ('industrial', 'nature', 'offshore', 'business_park')
  AND rating_mode != 'not_scored';

-- ============================================
-- 2. Verify Rule B: business_park consistency
-- ============================================
SELECT 
  'Rule B Check' as check_name,
  COUNT(*) as business_parks_scored,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '⚠️ REVIEW NEEDED' END as status
FROM neighbourhood_living_notes
WHERE zone_type = 'business_park'
  AND rating_mode = 'residential_scored';

-- Show which ones (if any)
SELECT 
  neighbourhood_name,
  display_name,
  review_status,
  short_note
FROM neighbourhood_living_notes
WHERE zone_type = 'business_park'
  AND rating_mode = 'residential_scored';

-- ============================================
-- 3. Verify Rule C: Content consistency
-- ============================================
-- Check 3a: Generic short_notes
SELECT 
  'Rule C - Generic short_notes' as check_name,
  COUNT(*) as violations,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM neighbourhood_living_notes
WHERE rating_mode = 'residential_scored'
  AND (
    short_note IS NULL
    OR length(trim(short_note)) <= 20
    OR short_note IN ('Residential area.', 'Residential area: expect higher street activity/noise.')
  );

-- Check 3b: Forbidden phrases
SELECT 
  'Rule C - Forbidden phrases' as check_name,
  COUNT(*) as violations,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM neighbourhood_living_notes
WHERE rating_mode = 'residential_scored'
  AND (
    short_note ILIKE '%industrial/logistics zone%'
    OR short_note ILIKE '%not designed for residential routines%'
    OR short_note ILIKE '%we don''t score living comfort here%'
    OR short_note ILIKE '%not a residential neighbourhood%'
  );

-- Check 3c: Generic drivers
SELECT 
  'Rule C - Generic drivers' as check_name,
  COUNT(*) as violations,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM neighbourhood_living_notes
WHERE rating_mode = 'residential_scored'
  AND (
    array_length(drivers, 1) IS NULL
    OR array_length(drivers, 1) = 0
    OR (array_length(drivers, 1) = 1 AND drivers[1] = 'residential')
  );

-- ============================================
-- 4. Verify rating_mode consistency
-- ============================================
SELECT 
  'Rating mode consistency' as check_name,
  COUNT(*) as violations,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
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
-- 5. Review status summary
-- ============================================
SELECT 
  review_status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM neighbourhood_living_notes
GROUP BY review_status
ORDER BY count DESC;

-- ============================================
-- 6. Overall summary
-- ============================================
SELECT 
  'Total neighbourhoods' as metric,
  COUNT(*)::text as value
FROM neighbourhood_living_notes
UNION ALL
SELECT 
  'Residential scored',
  COUNT(*)::text
FROM neighbourhood_living_notes
WHERE rating_mode = 'residential_scored'
UNION ALL
SELECT 
  'Not scored',
  COUNT(*)::text
FROM neighbourhood_living_notes
WHERE rating_mode = 'not_scored'
UNION ALL
SELECT 
  'Auto approved',
  COUNT(*)::text
FROM neighbourhood_living_notes
WHERE review_status = 'auto_ok'
UNION ALL
SELECT 
  'Needs review',
  COUNT(*)::text
FROM neighbourhood_living_notes
WHERE review_status = 'needs_review'
UNION ALL
SELECT 
  'Reviewed (not_scored)',
  COUNT(*)::text
FROM neighbourhood_living_notes
WHERE review_status = 'reviewed_not_scored';

-- ============================================
-- 7. Check constraints are active
-- ============================================
SELECT 
  conname as constraint_name,
  CASE 
    WHEN conname LIKE 'check_%' THEN '✅ Active'
    ELSE 'Other constraint'
  END as status
FROM pg_constraint
WHERE conrelid = 'neighbourhood_living_notes'::regclass
  AND conname LIKE 'check_%'
ORDER BY conname;

