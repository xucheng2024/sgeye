-- Migration: Add non_residential flag to neighbourhoods table
-- Description: Mark non-residential areas (industrial, business parks, airports, etc.) to exclude from explore/compare

-- Add non_residential column
ALTER TABLE neighbourhoods 
ADD COLUMN IF NOT EXISTS non_residential BOOLEAN DEFAULT FALSE;

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_neighbourhoods_non_residential ON neighbourhoods(non_residential) WHERE non_residential = TRUE;

-- Add comment
COMMENT ON COLUMN neighbourhoods.non_residential IS 'Mark non-residential areas (industrial, business parks, airports, etc.) to exclude from explore/compare pages';

