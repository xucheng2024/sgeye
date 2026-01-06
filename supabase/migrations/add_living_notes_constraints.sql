-- Migration: Add data integrity constraints to neighbourhood_living_notes
-- Description: Enforces data contracts and validation rules at database level
--              Prevents invalid data from being inserted/updated

-- ============================================
-- Constraint 1: rating_mode consistency with ratings
-- ============================================
-- Rule: If rating_mode = 'residential_scored', all 5 ratings must be non-null
-- Rule: If rating_mode = 'not_scored', all 5 ratings must be null

ALTER TABLE neighbourhood_living_notes
DROP CONSTRAINT IF EXISTS check_rating_mode_residential_scored;

ALTER TABLE neighbourhood_living_notes
ADD CONSTRAINT check_rating_mode_residential_scored
CHECK (
  (rating_mode = 'residential_scored' AND
   noise_density_rating IS NOT NULL AND
   daily_convenience_rating IS NOT NULL AND
   green_outdoor_rating IS NOT NULL AND
   crowd_vibe_rating IS NOT NULL AND
   long_term_comfort_rating IS NOT NULL)
  OR
  (rating_mode = 'not_scored' AND
   noise_density_rating IS NULL AND
   daily_convenience_rating IS NULL AND
   green_outdoor_rating IS NULL AND
   crowd_vibe_rating IS NULL AND
   long_term_comfort_rating IS NULL)
);

-- ============================================
-- Constraint 2: zone_type and rating_mode consistency (Rule A)
-- ============================================
-- Rule A: Non-residential zones MUST be not_scored
-- industrial, nature, offshore, business_park zones must be not_scored

ALTER TABLE neighbourhood_living_notes
DROP CONSTRAINT IF EXISTS check_zone_type_rating_mode;

ALTER TABLE neighbourhood_living_notes
ADD CONSTRAINT check_zone_type_rating_mode
CHECK (
  (zone_type IN ('industrial', 'nature', 'offshore', 'business_park') AND rating_mode = 'not_scored')
  OR
  zone_type NOT IN ('industrial', 'nature', 'offshore', 'business_park')
);

-- ============================================
-- Constraint 3: drivers array for residential_scored
-- ============================================
-- Rule: residential_scored should have at least one driver
-- Note: This is a soft rule, we'll enforce via application logic
-- But we can add a check to ensure drivers is not empty for residential_scored

ALTER TABLE neighbourhood_living_notes
DROP CONSTRAINT IF EXISTS check_drivers_residential_scored;

ALTER TABLE neighbourhood_living_notes
ADD CONSTRAINT check_drivers_residential_scored
CHECK (
  (rating_mode = 'residential_scored' AND array_length(drivers, 1) >= 1)
  OR
  rating_mode = 'not_scored'
);

-- ============================================
-- Constraint 4: short_note validation
-- ============================================
-- Rule: residential_scored should not contain industrial template phrases
-- Note: This is complex to enforce in SQL, so we'll do it in application logic
-- But we can ensure short_note is not empty for residential_scored

ALTER TABLE neighbourhood_living_notes
DROP CONSTRAINT IF EXISTS check_short_note_residential_scored;

ALTER TABLE neighbourhood_living_notes
ADD CONSTRAINT check_short_note_residential_scored
CHECK (
  (rating_mode = 'residential_scored' AND short_note IS NOT NULL AND length(trim(short_note)) > 0)
  OR
  rating_mode = 'not_scored'
);

-- ============================================
-- Add comments
-- ============================================

COMMENT ON CONSTRAINT check_rating_mode_residential_scored ON neighbourhood_living_notes IS 
'Ensures rating_mode and ratings are consistent: residential_scored requires all ratings non-null, not_scored requires all null';

COMMENT ON CONSTRAINT check_zone_type_rating_mode ON neighbourhood_living_notes IS 
'Ensures industrial, nature, and offshore zones are marked as not_scored';

COMMENT ON CONSTRAINT check_drivers_residential_scored ON neighbourhood_living_notes IS 
'Ensures residential_scored entries have at least one driver tag';

COMMENT ON CONSTRAINT check_short_note_residential_scored ON neighbourhood_living_notes IS 
'Ensures residential_scored entries have a non-empty short_note';

