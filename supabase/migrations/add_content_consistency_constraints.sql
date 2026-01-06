-- Migration: Add content consistency constraints (Rule C)
-- Description: Ensure short_note, drivers, and zone_type are consistent
--              Prevents template pollution and misleading labels
--
-- IMPORTANT: Run fix_violations_before_constraints.sql FIRST to fix existing data
--            Otherwise this migration will fail due to existing violations

-- ============================================
-- Constraint: Prevent template pollution in short_note
-- ============================================
-- Rule: residential_scored entries cannot have generic/empty short_notes
--       that don't match their actual zone_type

ALTER TABLE neighbourhood_living_notes
DROP CONSTRAINT IF EXISTS check_short_note_not_generic;

ALTER TABLE neighbourhood_living_notes
ADD CONSTRAINT check_short_note_not_generic
CHECK (
  (rating_mode = 'residential_scored' AND 
   short_note IS NOT NULL AND
   length(trim(short_note)) > 20 AND
   short_note NOT IN ('Residential area.', 'Residential area: expect higher street activity/noise.'))
  OR
  rating_mode = 'not_scored'
);

-- ============================================
-- Constraint: Prevent forbidden phrases in residential_scored
-- ============================================
-- Rule: residential_scored cannot contain non-residential phrases

ALTER TABLE neighbourhood_living_notes
DROP CONSTRAINT IF EXISTS check_short_note_no_forbidden_phrases;

ALTER TABLE neighbourhood_living_notes
ADD CONSTRAINT check_short_note_no_forbidden_phrases
CHECK (
  (rating_mode = 'residential_scored' AND
   short_note NOT ILIKE '%industrial/logistics zone%' AND
   short_note NOT ILIKE '%not designed for residential routines%' AND
   short_note NOT ILIKE '%we don''t score living comfort here%' AND
   short_note NOT ILIKE '%not a residential neighbourhood%')
  OR
  rating_mode = 'not_scored'
);

-- ============================================
-- Constraint: Drivers must not be empty for residential_scored
-- ============================================
-- Rule: residential_scored must have meaningful drivers (not just ["residential"])

ALTER TABLE neighbourhood_living_notes
DROP CONSTRAINT IF EXISTS check_drivers_not_generic;

ALTER TABLE neighbourhood_living_notes
ADD CONSTRAINT check_drivers_not_generic
CHECK (
  (rating_mode = 'residential_scored' AND
   array_length(drivers, 1) >= 1 AND
   NOT (array_length(drivers, 1) = 1 AND drivers[1] = 'residential'))
  OR
  rating_mode = 'not_scored'
);

-- Add comments
COMMENT ON CONSTRAINT check_short_note_not_generic ON neighbourhood_living_notes IS 
'Prevents generic template short_notes like "Residential area." in residential_scored entries';

COMMENT ON CONSTRAINT check_short_note_no_forbidden_phrases ON neighbourhood_living_notes IS 
'Prevents non-residential phrases in residential_scored short_notes';

COMMENT ON CONSTRAINT check_drivers_not_generic ON neighbourhood_living_notes IS 
'Prevents generic drivers array ["residential"] - must have specific drivers';

