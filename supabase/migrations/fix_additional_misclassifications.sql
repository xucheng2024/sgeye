-- Migration: Fix additional misclassifications (batch 2)
-- Description: Correct zone_type and rating_mode for more neighbourhoods that were incorrectly classified

BEGIN;

-- ============================================
-- 11. SOUTHERN GROUP: Ensure all are offshore + not_scored
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
  short_note = 'Southern Group areas consist mainly of offshore islands and resort developments. They are not part of Singapore''s residential neighbourhood system.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name ILIKE '%SOUTHERN%'
  AND (neighbourhood_name ILIKE '%GROUP%' OR neighbourhood_name ILIKE '%ISLAND%')
  AND rating_mode != 'not_scored';

-- ============================================
-- 12. CONEY ISLAND: Ensure all ratings are null and update short_note
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'nature',
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Coney Island is a protected nature area with no residential housing. It is excluded from neighbourhood living comparisons.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'auto_ok',
  review_reason = NULL,
  updated_at = NOW()
WHERE neighbourhood_name = 'CONEY ISLAND';

-- ============================================
-- 13. PULAU UBIN: Offshore island (if exists)
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
  short_note = 'Pulau Ubin is a heritage and nature island with no mainstream residential housing. It is not evaluated for living comfort.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name ILIKE '%PULAU UBIN%'
  AND rating_mode != 'not_scored';

-- ============================================
-- 14. KRANJI: Industrial/military/agricultural (not residential)
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
  short_note = 'Kranji is dominated by military, agricultural, and industrial uses. It does not function as a residential neighbourhood.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name = 'KRANJI';

-- ============================================
-- 15. LIM CHU KANG: Agricultural/military (if exists)
-- Note: Using 'industrial' as closest since 'agricultural' doesn't exist
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'industrial',  -- Closest to agricultural/military (no 'agricultural' type exists)
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Lim Chu Kang is primarily an agricultural and military zone with no residential housing options. It is not evaluated for living comfort.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name ILIKE '%LIM CHU KANG%'
  AND rating_mode != 'not_scored';

-- ============================================
-- 16. TENGAH NORTH / TENGAH PARK: Future development (not yet established)
-- Note: Tengah South / Garden should remain residential_scored
-- ============================================
UPDATE neighbourhood_living_notes
SET
  zone_type = 'residential',  -- Keep as residential but mark as future development
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Tengah is a new town still under active development. Living comfort patterns are not yet established.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name IN ('TENGAH NORTH', 'TENGAH PARK')
  AND rating_mode != 'not_scored';

-- ============================================
-- 17. BAYSHORE: Adjust ratings (developing area)
-- ============================================
UPDATE neighbourhood_living_notes
SET
  daily_convenience_rating = 'mixed',
  long_term_comfort_rating = 'mixed',
  short_note = 'Bayshore offers strong coastal access but remains a developing residential pocket with limited everyday amenities.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BAYSHORE';

-- ============================================
-- 18. PUNGGOL CANAL: Adjust ratings (LRT-only access)
-- ============================================
UPDATE neighbourhood_living_notes
SET
  daily_convenience_rating = 'mixed',
  long_term_comfort_rating = 'mixed',
  short_note = 'Scenic waterfront environment with family-friendly design, but daily routines and commutes are longer due to indirect transport access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'PUNGGOL CANAL';

-- ============================================
-- 19. SEMBAWANG NORTH: Adjust ratings (more remote)
-- ============================================
UPDATE neighbourhood_living_notes
SET
  daily_convenience_rating = 'mixed',
  long_term_comfort_rating = 'mixed',
  updated_at = NOW()
WHERE neighbourhood_name = 'SEMBAWANG NORTH'
  AND (daily_convenience_rating = 'good' OR long_term_comfort_rating = 'good');

-- ============================================
-- 20. TUAS VIEW / TUAS SOUTH: Industrial/port (not residential)
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
  short_note = 'Tuas is a major industrial and port zone. It does not function as a residential neighbourhood.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name IN ('TUAS VIEW', 'TUAS SOUTH')
  AND rating_mode != 'not_scored';

COMMIT;

-- ============================================
-- Verification queries
-- ============================================
SELECT 
  neighbourhood_name,
  zone_type,
  rating_mode,
  short_note,
  drivers
FROM neighbourhood_living_notes
WHERE neighbourhood_name IN (
  'SOUTHERN GROUP',
  'CONEY ISLAND',
  'PULAU UBIN',
  'KRANJI',
  'LIM CHU KANG',
  'TENGAH NORTH',
  'TENGAH PARK',
  'BAYSHORE',
  'PUNGGOL CANAL',
  'SEMBAWANG NORTH',
  'TUAS VIEW',
  'TUAS SOUTH'
)
OR neighbourhood_name ILIKE '%SOUTHERN%'
OR neighbourhood_name ILIKE '%PULAU UBIN%'
OR neighbourhood_name ILIKE '%LIM CHU KANG%'
ORDER BY neighbourhood_name;

