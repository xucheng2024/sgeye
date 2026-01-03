-- Migration: Add region (CCR/RCR/OCR) to planning_areas table
-- This follows URA's regional classification at the *planning area* level.
-- Note: this table contains 55 planning areas. Some commonly-seen names (e.g. estates/subzones)
-- are intentionally NOT listed here because they do not exist in `planning_areas` in this dataset.

-- Add region column to planning_areas table
ALTER TABLE planning_areas 
ADD COLUMN IF NOT EXISTS region TEXT CHECK (region IN ('CCR', 'RCR', 'OCR'));

-- Create index for region filtering
CREATE INDEX IF NOT EXISTS idx_planning_areas_region ON planning_areas(region);

-- Update planning areas with region classification
-- Use name-based matching (more reliable than ID matching since names are consistent)
-- CCR (Core Central Region) - Core downtown and prime areas
UPDATE planning_areas SET region = 'CCR' 
WHERE LOWER(TRIM(name)) IN (
  'downtown core', 'marina east', 'marina south', 'museum',
  'newton', 'novena', 'orchard', 'river valley',
  'rochor', 'singapore river', 'straits view', 'tanglin'
);

-- RCR (Rest of Central Region) - Fringe of central region
UPDATE planning_areas SET region = 'RCR' 
WHERE LOWER(TRIM(name)) IN (
  'bishan', 'bukit merah', 'bukit timah', 'clementi',
  'geylang', 'kallang', 'marine parade', 'outram',
  'queenstown', 'toa payoh'
);

-- OCR (Outside Central Region) - Outer areas
-- Set OCR for all remaining planning areas (everything not in CCR or RCR)
UPDATE planning_areas SET region = 'OCR' 
WHERE region IS NULL;

-- Add comment to column
COMMENT ON COLUMN planning_areas.region IS 'URA Regional Classification: CCR (Core Central Region), RCR (Rest of Central Region), OCR (Outside Central Region)';

