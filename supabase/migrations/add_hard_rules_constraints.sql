-- Migration: Add hard rules as database constraints
-- Description: Enforces the 6 hard rules at database level
--              Prevents invalid data from being inserted/updated

-- ============================================
-- Rule 1: rating_mode=not_scored → all ratings must be null
-- ============================================
-- Already enforced by check_rating_mode_residential_scored
-- (This is already in add_living_notes_constraints.sql)

-- ============================================
-- Rule 2: Industrial/port/airport/nature → must be not_scored
-- ============================================
-- Already enforced by check_zone_type_rating_mode
-- (Updated to include business_park in add_living_notes_constraints.sql)

-- ============================================
-- Rule 4: short_note must match main conclusion
-- ============================================
-- Constraint: If long_term_comfort_rating = bad, short_note cannot contain positive phrases

ALTER TABLE neighbourhood_living_notes
DROP CONSTRAINT IF EXISTS check_short_note_matches_ratings;

ALTER TABLE neighbourhood_living_notes
ADD CONSTRAINT check_short_note_matches_ratings
CHECK (
  (rating_mode = 'residential_scored' AND long_term_comfort_rating = 'bad' AND
   short_note NOT ILIKE '%balanced%' AND
   short_note NOT ILIKE '%family-friendly%' AND
   short_note NOT ILIKE '%comfortable%' AND
   short_note NOT ILIKE '%great%' AND
   short_note NOT ILIKE '%good%')
  OR
  (rating_mode = 'residential_scored' AND long_term_comfort_rating != 'bad')
  OR
  rating_mode = 'not_scored'
);

-- Constraint: If not_scored, short_note should indicate non-residential
-- (Soft rule - warning only, not enforced as hard constraint)

-- ============================================
-- Add comments
-- ============================================

COMMENT ON CONSTRAINT check_short_note_matches_ratings ON neighbourhood_living_notes IS 
'Rule 4: Prevents short_note from containing positive phrases when long_term_comfort_rating is bad';

