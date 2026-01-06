-- Migration: Auto-set review_status based on hard rules
-- Description: Automatically set review_status and review_reason for items that need review
--              Run this periodically to catch new issues

-- ============================================
-- Rule 3: residential but has non-residential drivers → needs_review
-- ============================================
UPDATE neighbourhood_living_notes
SET
  review_status = 'needs_review',
  review_reason = 'ZONE_TYPE_RATING_MODE_CONFLICT: residential zone_type but has non-residential drivers',
  updated_at = NOW()
WHERE zone_type = 'residential'
  AND rating_mode = 'residential_scored'
  AND drivers && ARRAY['heavy_vehicles', 'port_logistics', 'airport', 'industrial', 'container_terminal', 'shipyard', 'logistics']
  AND (review_status IS NULL OR review_status = 'auto_ok');

-- ============================================
-- Rule 4: short_note contradicts ratings → needs_review
-- ============================================
UPDATE neighbourhood_living_notes
SET
  review_status = 'needs_review',
  review_reason = 'SHORT_NOTE_CONTRADICTS_RATINGS: short_note contains positive phrases but ratings are bad',
  updated_at = NOW()
WHERE rating_mode = 'residential_scored'
  AND long_term_comfort_rating = 'bad'
  AND (
    short_note ILIKE '%balanced%' OR
    short_note ILIKE '%family-friendly%' OR
    short_note ILIKE '%comfortable%'
  )
  AND (review_status IS NULL OR review_status = 'auto_ok');

-- ============================================
-- Rule 5: Missing drivers based on note keywords → needs_review
-- ============================================
-- This is harder to do in pure SQL, so we'll flag obvious cases
-- The lint script handles the full keyword matching

UPDATE neighbourhood_living_notes
SET
  review_status = 'needs_review',
  review_reason = 'DRIVERS_MISSING_CORE_KEYWORDS: notes mention keywords but drivers missing',
  updated_at = NOW()
WHERE rating_mode = 'residential_scored'
  AND (
    (noise_density_note ILIKE '%logistics%' OR daily_convenience_note ILIKE '%logistics%') 
    AND NOT (drivers && ARRAY['logistics', 'port_logistics'])
  )
  OR (
    (noise_density_note ILIKE '%nightlife%' OR crowd_vibe_note ILIKE '%nightlife%')
    AND NOT (drivers && ARRAY['nightlife_belt', 'nightlife_nearby'])
  )
  OR (
    (noise_density_note ILIKE '%arterial%' OR noise_density_note ILIKE '%main road%')
    AND NOT (drivers && ARRAY['arterial_roads'])
  )
  AND (review_status IS NULL OR review_status = 'auto_ok');

-- ============================================
-- Rule 6: Template pollution → needs_review
-- ============================================
UPDATE neighbourhood_living_notes
SET
  review_status = 'needs_review',
  review_reason = 'TEMPLATE_POLLUTION: generic template or forbidden phrases in short_note',
  updated_at = NOW()
WHERE rating_mode = 'residential_scored'
  AND (
    short_note IN ('Residential area.', 'Residential area: expect higher street activity/noise.', 'Residential area with balanced characteristics.')
    OR short_note ILIKE '%industrial/logistics zone%'
    OR short_note ILIKE '%not designed for residential routines%'
  )
  AND (review_status IS NULL OR review_status = 'auto_ok');

-- ============================================
-- Summary: Show what was flagged
-- ============================================
SELECT 
  review_reason,
  COUNT(*) as count
FROM neighbourhood_living_notes
WHERE review_status = 'needs_review'
GROUP BY review_reason
ORDER BY count DESC;

