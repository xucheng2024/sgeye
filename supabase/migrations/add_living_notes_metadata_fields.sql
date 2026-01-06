-- Migration: Add metadata fields to neighbourhood_living_notes table
-- Description: Add zone_type, rating_mode, drivers, variance_level, short_note, display_name
--              to support differentiated display strategies for residential vs non-residential areas

-- Add zone_type field
ALTER TABLE neighbourhood_living_notes 
ADD COLUMN IF NOT EXISTS zone_type TEXT CHECK (zone_type IN ('residential', 'city_fringe', 'city_core', 'industrial', 'nature', 'offshore', 'business_park'));

-- Add rating_mode field
ALTER TABLE neighbourhood_living_notes 
ADD COLUMN IF NOT EXISTS rating_mode TEXT CHECK (rating_mode IN ('residential_scored', 'not_scored')) DEFAULT 'residential_scored';

-- Add drivers field (array of tags)
ALTER TABLE neighbourhood_living_notes 
ADD COLUMN IF NOT EXISTS drivers TEXT[] DEFAULT '{}';

-- Add variance_level field
ALTER TABLE neighbourhood_living_notes 
ADD COLUMN IF NOT EXISTS variance_level TEXT CHECK (variance_level IN ('compact', 'moderate', 'spread_out'));

-- Add short_note field (for card display, max ~140 chars)
ALTER TABLE neighbourhood_living_notes 
ADD COLUMN IF NOT EXISTS short_note TEXT;

-- Add display_name field (to handle parenthetical names like "LAKESIDE (BUSINESS)")
ALTER TABLE neighbourhood_living_notes 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS idx_neighbourhood_living_notes_zone_type ON neighbourhood_living_notes(zone_type);
CREATE INDEX IF NOT EXISTS idx_neighbourhood_living_notes_rating_mode ON neighbourhood_living_notes(rating_mode);
CREATE INDEX IF NOT EXISTS idx_neighbourhood_living_notes_drivers ON neighbourhood_living_notes USING GIN(drivers);

-- Add comments
COMMENT ON COLUMN neighbourhood_living_notes.zone_type IS 'Zone classification: residential, city_fringe, city_core, industrial, nature, offshore, business_park';
COMMENT ON COLUMN neighbourhood_living_notes.rating_mode IS 'Whether to use Good/Mixed/Bad ratings: residential_scored or not_scored';
COMMENT ON COLUMN neighbourhood_living_notes.drivers IS 'Array of tags for icons, filtering, and avoiding duplicate copy';
COMMENT ON COLUMN neighbourhood_living_notes.variance_level IS 'Variation level: compact (low), moderate, spread_out (high pocket variation)';
COMMENT ON COLUMN neighbourhood_living_notes.short_note IS 'Short sentence for card display (max ~140 characters)';
COMMENT ON COLUMN neighbourhood_living_notes.display_name IS 'Display name (handles parenthetical names like "LAKESIDE (BUSINESS)")';

