-- Migration: Fix new town / edge development areas with more conservative language
-- Description: Update short_note to emphasize commute tolerance and real limitations
--              Not changing ratings, but making language more accurate to prevent user misguidance

BEGIN;

-- ============================================
-- New Town / Edge Development Areas
-- ============================================
-- These areas have "mixed" ratings but the language should emphasize
-- commute tolerance and real limitations, not just "mixed characteristics"

-- TAMPINES NORTH: Edge development area
UPDATE neighbourhood_living_notes
SET
  short_note = 'Livability depends heavily on commute tolerance. Daily routines are noticeably longer than town-centre estates, with LRT-only or bus-heavy access patterns.',
  updated_at = NOW()
WHERE neighbourhood_name = 'TAMPINES NORTH'
  AND short_note ILIKE '%Mixed characteristics%';

-- TAMPINES EAST: Edge development area
UPDATE neighbourhood_living_notes
SET
  short_note = 'Livability depends heavily on commute tolerance. Daily routines are noticeably longer than town-centre estates, with LRT-only or bus-heavy access patterns.',
  updated_at = NOW()
WHERE neighbourhood_name = 'TAMPINES EAST'
  AND short_note ILIKE '%Mixed characteristics%';

-- PUNGGOL CANAL: Edge development area
UPDATE neighbourhood_living_notes
SET
  short_note = 'Livability depends heavily on commute tolerance. Daily routines are noticeably longer than town-centre estates, with LRT-only or bus-heavy access patterns.',
  updated_at = NOW()
WHERE neighbourhood_name = 'PUNGGOL CANAL'
  AND short_note ILIKE '%Mixed characteristics%';

-- SENGKANG WEST: Edge development area
UPDATE neighbourhood_living_notes
SET
  short_note = 'Livability depends heavily on commute tolerance. Daily routines are noticeably longer than town-centre estates, with LRT-only or bus-heavy access patterns.',
  updated_at = NOW()
WHERE neighbourhood_name = 'SENGKANG WEST'
  AND short_note ILIKE '%Mixed characteristics%';

-- LORONG HALUS NORTH: Edge development area
UPDATE neighbourhood_living_notes
SET
  short_note = 'Livability depends heavily on commute tolerance. Daily routines are noticeably longer than town-centre estates, with LRT-only or bus-heavy access patterns.',
  updated_at = NOW()
WHERE neighbourhood_name = 'LORONG HALUS NORTH'
  AND short_note ILIKE '%Mixed characteristics%';

-- BAYSHORE: Edge development area (if it has mixed characteristics)
UPDATE neighbourhood_living_notes
SET
  short_note = 'Livability depends heavily on commute tolerance. Daily routines are noticeably longer than town-centre estates, with LRT-only or bus-heavy access patterns.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BAYSHORE'
  AND short_note ILIKE '%Mixed characteristics%';

COMMIT;

-- ============================================
-- Verification query
-- ============================================
SELECT 
  neighbourhood_name,
  zone_type,
  rating_mode,
  long_term_comfort_rating,
  short_note
FROM neighbourhood_living_notes
WHERE neighbourhood_name IN (
  'TAMPINES NORTH',
  'TAMPINES EAST',
  'PUNGGOL CANAL',
  'SENGKANG WEST',
  'LORONG HALUS NORTH',
  'BAYSHORE'
)
ORDER BY neighbourhood_name;

