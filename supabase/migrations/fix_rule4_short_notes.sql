-- Migration: Fix Rule 4 warnings for SIMPANG and SOUTHERN GROUP
-- Description: Update short_note to include required phrases for not_scored entries

BEGIN;

-- ============================================
-- SIMPANG NORTH / SIMPANG SOUTH: Add required phrase
-- ============================================
UPDATE neighbourhood_living_notes
SET
  short_note = 'Simpang is earmarked for potential future development, but there is no committed timeline. Not designed for residential comparison — treat current market signals and amenities as limited; avoid strong conclusions from sparse data.',
  updated_at = NOW()
WHERE neighbourhood_name IN ('SIMPANG NORTH', 'SIMPANG SOUTH')
  AND rating_mode = 'not_scored'
  AND short_note NOT ILIKE '%not designed for residential%';

-- ============================================
-- SOUTHERN GROUP: Add required phrase
-- ============================================
UPDATE neighbourhood_living_notes
SET
  short_note = 'Southern Islands are primarily leisure getaways accessed by ferry. Non-residential zone — not comparable to mainstream HDB neighbourhood living (commute, schools, daily amenities).',
  updated_at = NOW()
WHERE neighbourhood_name = 'SOUTHERN GROUP'
  AND rating_mode = 'not_scored'
  AND short_note NOT ILIKE '%non-residential%';

COMMIT;

-- ============================================
-- Verification query
-- ============================================
SELECT 
  neighbourhood_name,
  rating_mode,
  short_note
FROM neighbourhood_living_notes
WHERE neighbourhood_name IN (
  'SIMPANG NORTH',
  'SIMPANG SOUTH',
  'SOUTHERN GROUP'
)
ORDER BY neighbourhood_name;

