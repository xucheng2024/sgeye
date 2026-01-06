-- Migration: Fix template pollution FIRST (Step A)
-- Description: Remove template pollution from short_note and notes BEFORE fixing drivers
--              This prevents false positives in Rule 5 keyword detection

-- ============================================
-- Step 1: Find and fix template pollution in short_note
-- ============================================
-- Replace generic/forbidden templates with rating-appropriate descriptions

UPDATE neighbourhood_living_notes
SET
  short_note = CASE
    -- Bad ratings: honest but not overly negative
    WHEN long_term_comfort_rating = 'bad' AND daily_convenience_rating = 'good' THEN
      'Convenient on paper, but daily comfort is limited long term.'
    WHEN long_term_comfort_rating = 'bad' AND (noise_density_rating = 'bad' OR crowd_vibe_rating = 'bad') THEN
      'Active area with higher noise and crowds — limited long-term comfort.'
    WHEN long_term_comfort_rating = 'bad' THEN
      'Limited long-term comfort despite some conveniences.'
    
    -- Mixed ratings: acknowledge trade-offs
    WHEN long_term_comfort_rating = 'mixed' AND daily_convenience_rating = 'good' AND green_outdoor_rating = 'good' THEN
      'Good access to essentials and outdoor spaces, with some daily trade-offs.'
    WHEN long_term_comfort_rating = 'mixed' AND daily_convenience_rating = 'good' THEN
      'Good access to essentials, with a few daily trade-offs.'
    WHEN long_term_comfort_rating = 'mixed' THEN
      'Mixed characteristics with some conveniences and limitations.'
    
    -- Good ratings: can be positive but specific
    WHEN long_term_comfort_rating = 'good' AND daily_convenience_rating = 'good' AND green_outdoor_rating = 'good' THEN
      'Strong daily convenience with good outdoor access.'
    WHEN long_term_comfort_rating = 'good' AND daily_convenience_rating = 'good' THEN
      'Strong daily convenience with a comfortable residential feel.'
    WHEN long_term_comfort_rating = 'good' THEN
      'Comfortable residential area with balanced characteristics.'
    
    -- City core special case
    WHEN zone_type = 'city_core' THEN
      'Downtown lifestyle: commute-first convenience with higher activity levels.'
    
    -- Fallback
    ELSE 'Residential area with mixed characteristics.'
  END,
  updated_at = NOW()
WHERE rating_mode = 'residential_scored'
  AND (
    -- Generic templates
    short_note IN ('Residential area.', 'Residential area: expect higher street activity/noise.', 'Residential area with balanced characteristics.')
    -- Forbidden phrases
    OR short_note ILIKE '%industrial/logistics zone%'
    OR short_note ILIKE '%not designed for residential routines%'
    OR short_note ILIKE '%we don''t score living comfort here%'
  );

-- ============================================
-- Step 2: Fix specific cases with contradictions
-- ============================================
-- CLARKE QUAY: bad ratings but positive short_note
UPDATE neighbourhood_living_notes
SET
  short_note = 'Lively nights, but loud and crowded — not ideal for long-term home comfort.',
  updated_at = NOW()
WHERE neighbourhood_name = 'CLARKE QUAY'
  AND long_term_comfort_rating = 'bad';

-- ============================================
-- Step 3: Verify fixes
-- ============================================
SELECT 
  neighbourhood_name,
  long_term_comfort_rating,
  short_note,
  'Fixed' as status
FROM neighbourhood_living_notes
WHERE rating_mode = 'residential_scored'
  AND updated_at > NOW() - INTERVAL '1 minute'
ORDER BY neighbourhood_name;

-- ============================================
-- Step 4: Count remaining template pollution
-- ============================================
SELECT 
  COUNT(*) as remaining_template_pollution
FROM neighbourhood_living_notes
WHERE rating_mode = 'residential_scored'
  AND (
    short_note IN ('Residential area.', 'Residential area: expect higher street activity/noise.', 'Residential area with balanced characteristics.')
    OR short_note ILIKE '%industrial/logistics zone%'
    OR short_note ILIKE '%not designed for residential routines%'
  );

