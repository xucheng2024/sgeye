-- Migration: Add 5 Major Regions to Subzones Table
-- Description: Adds Singapore's 5 major regions (Central, East, North, North-East, West) to subzones
-- This is different from URA's CCR/RCR/OCR classification which is at planning area level

-- Add region column to subzones table
ALTER TABLE subzones 
ADD COLUMN IF NOT EXISTS region TEXT CHECK (region IN ('Central', 'East', 'North', 'North-East', 'West'));

-- Create index for region filtering
CREATE INDEX IF NOT EXISTS idx_subzones_region ON subzones(region);

-- Add comment to column
COMMENT ON COLUMN subzones.region IS 'Singapore 5 Major Regions: Central, East, North, North-East, West';

