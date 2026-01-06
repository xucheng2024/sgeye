-- Migration: Fix zone_type logic consistency and unify city core messaging
-- Description: 
--   1. Add future_development and leisure to zone_type enum
--   2. Fix SIMPANG NORTH/SOUTH: change from residential to future_development
--   3. Fix ONE NORTH: improve short_note to clarify "has residential but not comparable"
--   4. Fix LAKESIDE (LEISURE): change from residential to leisure
--   5. Unify CITY CORE short_note messaging

-- Step 1: Add future_development and leisure to zone_type constraint
ALTER TABLE neighbourhood_living_notes
DROP CONSTRAINT IF EXISTS neighbourhood_living_notes_zone_type_check;

ALTER TABLE neighbourhood_living_notes
ADD CONSTRAINT neighbourhood_living_notes_zone_type_check 
CHECK (zone_type IN ('residential', 'city_fringe', 'city_core', 'industrial', 'nature', 'offshore', 'business_park', 'future_development', 'leisure'));

-- Step 2: Fix SIMPANG NORTH - Change zone_type from residential to future_development
UPDATE neighbourhood_living_notes
SET 
  zone_type = 'future_development',
  short_note = 'Long-term future development zone with no current residential stock. Not a present-day housing option.',
  rating_mode = 'not_scored',
  updated_at = NOW()
WHERE neighbourhood_name = 'SIMPANG NORTH'
  AND zone_type = 'residential';

-- Step 3: Fix SIMPANG SOUTH - Change zone_type from residential to future_development
UPDATE neighbourhood_living_notes
SET 
  zone_type = 'future_development',
  short_note = 'Long-term future development zone with no current residential stock. Not a present-day housing option.',
  rating_mode = 'not_scored',
  updated_at = NOW()
WHERE neighbourhood_name = 'SIMPANG SOUTH'
  AND zone_type = 'residential';

-- Step 4: Fix ONE NORTH - Improve short_note to clarify it has residential but is not comparable
UPDATE neighbourhood_living_notes
SET 
  short_note = 'Primarily a business and research park with small residential pockets. Residential experience varies widely and is not comparable to standard HDB neighbourhoods.',
  updated_at = NOW()
WHERE neighbourhood_name = 'ONE NORTH'
  AND zone_type = 'business_park'
  AND rating_mode = 'not_scored';

-- Step 5: Fix LAKESIDE (LEISURE) - Change zone_type from residential to leisure
UPDATE neighbourhood_living_notes
SET 
  zone_type = 'leisure',
  short_note = 'Leisure-focused zone around Jurong Lake Gardens. Residential living is secondary and not assessed as a neighbourhood baseline.',
  rating_mode = 'not_scored',
  updated_at = NOW()
WHERE neighbourhood_name = 'LAKESIDE (LEISURE)'
  AND zone_type = 'residential';

-- Step 6: Unify CITY CORE short_note messaging
-- Core principle: "Scoring is excluded not because people cannot live here, but because the area does not function as a neighbourhood."
UPDATE neighbourhood_living_notes
SET 
  short_note = 'City-core district with heavy transit, tourism, or nightlife activity. While some residential units exist, the area does not function as a stable neighbourhood and is excluded from living comfort scoring.',
  updated_at = NOW()
WHERE zone_type = 'city_core'
  AND rating_mode = 'not_scored'
  AND (
    short_note IS NULL 
    OR short_note NOT ILIKE '%does not function as a stable neighbourhood%'
  );

-- Verify changes
SELECT 
  neighbourhood_name,
  zone_type,
  rating_mode,
  short_note
FROM neighbourhood_living_notes
WHERE neighbourhood_name IN ('SIMPANG NORTH', 'SIMPANG SOUTH', 'ONE NORTH', 'LAKESIDE (LEISURE)')
   OR (zone_type = 'city_core' AND rating_mode = 'not_scored')
ORDER BY neighbourhood_name;

