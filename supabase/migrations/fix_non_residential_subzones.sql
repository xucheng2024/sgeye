-- Migration: Fix non-residential subzones with accurate descriptions
-- Description: Update subzones that are nature parks, offshore islands, or future development areas
--              with accurate descriptions based on verified information

BEGIN;

-- ============================================
-- 1. CONEY ISLAND: Nature park (not residential)
-- ============================================
-- Coney Island is a nature park focused on habitat restoration.
-- Great for cycling/walks, but not a residential neighbourhood.
UPDATE neighbourhood_living_notes
SET
  zone_type = 'nature',
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Coney Island is a nature park focused on habitat restoration. Great for cycling/walks, but not a residential neighbourhood—exclude from HDB resale comparisons.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name = 'CONEY ISLAND'
  AND rating_mode != 'not_scored';

-- ============================================
-- 2. SIMPANG NORTH / SIMPANG SOUTH: Future development (timeline not committed)
-- ============================================
-- Simpang is earmarked for potential future development, but there is no committed timeline.
-- Treat current market signals and amenities as limited.
-- Note: These should be not_scored due to sparse transaction data
UPDATE neighbourhood_living_notes
SET
  zone_type = 'residential',  -- Keep as residential but mark as not_scored
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Simpang is earmarked for potential future development, but there is no committed timeline. Not designed for residential comparison — treat current market signals and amenities as limited; avoid strong conclusions from sparse data.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name IN ('SIMPANG NORTH', 'SIMPANG SOUTH')
  AND rating_mode != 'not_scored';

-- ============================================
-- 3. SOUTHERN GROUP / SOUTHERN ISLANDS: Offshore leisure islands
-- ============================================
-- Southern Islands are primarily leisure getaways accessed by ferry.
-- Not comparable to mainstream HDB neighbourhood living.
UPDATE neighbourhood_living_notes
SET
  zone_type = 'offshore',
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Southern Islands are primarily leisure getaways accessed by ferry. Non-residential zone — not comparable to mainstream HDB neighbourhood living (commute, schools, daily amenities).',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name = 'SOUTHERN GROUP'
  AND rating_mode != 'not_scored';

-- ============================================
-- 4. KUSU ISLAND: Ferry day-trip island (tourism)
-- ============================================
-- Kusu Island is a ferry-access day-trip destination with cultural sites.
-- Exclude from residential scoring and HDB comparison.
UPDATE neighbourhood_living_notes
SET
  zone_type = 'offshore',
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  short_note = 'Kusu Island is a ferry-access day-trip destination with cultural sites; exclude from residential scoring and HDB comparison.',
  drivers = ARRAY(
    SELECT elem
    FROM unnest(COALESCE(drivers, ARRAY[]::text[])) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  review_status = 'needs_review',
  review_reason = 'NON_RESIDENTIAL_SCORED',
  updated_at = NOW()
WHERE neighbourhood_name = 'KUSU ISLAND'
  AND rating_mode != 'not_scored';

-- ============================================
-- 5. NEE SOON: Military/restricted uses nearby (non-typical residential)
-- ============================================
-- Nee Soon is closely associated with major military land uses.
-- Treat it as non-typical for family 'neighbourhood living' comparisons.
UPDATE neighbourhood_living_notes
SET
  short_note = 'Nee Soon is closely associated with major military land uses (e.g., Nee Soon Camp). Treat it as non-typical for family "neighbourhood living" comparisons unless you have clear residential stock + transaction data.',
  review_status = 'needs_review',
  review_reason = 'CONTENT_INCONSISTENCY',
  updated_at = NOW()
WHERE neighbourhood_name = 'NEE SOON'
  AND (short_note IS NULL OR short_note NOT ILIKE '%military%');

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
  'CONEY ISLAND',
  'SIMPANG NORTH',
  'SIMPANG SOUTH',
  'SOUTHERN GROUP',
  'KUSU ISLAND',
  'NEE SOON'
)
ORDER BY neighbourhood_name;

