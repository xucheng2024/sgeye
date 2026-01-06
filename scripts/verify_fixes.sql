-- Verification queries for living notes fixes
-- Run these to verify the migrations were applied correctly

-- ============================================
-- 1. Check review_status distribution
-- ============================================
SELECT 
  review_status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM neighbourhood_living_notes
GROUP BY review_status
ORDER BY count DESC;

-- ============================================
-- 2. Verify CLEANTECH and MARITIME SQUARE fixes
-- ============================================
SELECT 
  neighbourhood_name,
  zone_type,
  rating_mode,
  review_status,
  short_note,
  drivers
FROM neighbourhood_living_notes
WHERE neighbourhood_name IN ('CLEANTECH', 'MARITIME SQUARE')
ORDER BY neighbourhood_name;

-- ============================================
-- 3. Check for any remaining content errors
-- ============================================
-- Should return 0 rows if all fixes applied correctly
SELECT 
  neighbourhood_name,
  rating_mode,
  short_note
FROM neighbourhood_living_notes
WHERE rating_mode = 'residential_scored'
  AND (
    short_note ILIKE '%industrial/logistics zone%'
    OR short_note ILIKE '%not designed for residential routines%'
    OR short_note ILIKE '%we don''t score living comfort here%'
  );

-- ============================================
-- 4. Check rating_mode consistency
-- ============================================
-- Should return 0 rows if constraints are working
SELECT 
  neighbourhood_name,
  rating_mode,
  noise_density_rating,
  daily_convenience_rating,
  green_outdoor_rating,
  crowd_vibe_rating,
  long_term_comfort_rating
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
-- 5. Check zone_type and rating_mode consistency
-- ============================================
-- Should return 0 rows
SELECT 
  neighbourhood_name,
  zone_type,
  rating_mode
FROM neighbourhood_living_notes
WHERE zone_type IN ('industrial', 'nature', 'offshore')
  AND rating_mode != 'not_scored';

-- ============================================
-- 6. Check items needing review
-- ============================================
SELECT 
  neighbourhood_name,
  display_name,
  zone_type,
  rating_mode,
  review_status,
  review_reason
FROM neighbourhood_living_notes
WHERE review_status = 'needs_review'
ORDER BY neighbourhood_name;

-- ============================================
-- 7. Summary statistics
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

