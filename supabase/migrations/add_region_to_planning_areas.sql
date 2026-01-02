-- Migration: Add region (CCR/RCR/OCR) to planning_areas table
-- This follows URA's standard regional classification

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
  'orchard', 'river valley', 'newton', 'dover', 'marina east', 
  'marina south', 'marina bay', 'downtown core', 'museum', 
  'rochor', 'singapore river', 'straits view',
  'bukit timah'
);

-- RCR (Rest of Central Region) - Fringe of central region
UPDATE planning_areas SET region = 'RCR' 
WHERE LOWER(TRIM(name)) IN (
  'queenstown', 'bishan', 'toa payoh', 'kallang', 'whampoa',
  'geylang', 'marine parade', 'mountbatten', 'joo chiat',
  'pasir ris', 'tampines', 'bedok', 'hougang', 'sengkang',
  'punggol', 'serangoon', 'ang mo kio', 'yio chu kang',
  'novena', 'bukit merah', 'clementi',
  'pasir panjang', 'telok blangah', 'redhill', 'queensway',
  'alexandra', 'boon lay', 'pioneer', 'tuas', 'jurong east',
  'jurong west', 'choa chu kang', 'bukit panjang', 'woodlands',
  'sembawang', 'yishun', 'lim chu kang', 'sungei gedong',
  'mandai', 'seletar'
);

-- OCR (Outside Central Region) - Outer areas
-- Note: Some areas above might need adjustment based on actual URA classification
-- This is a general mapping - you may want to refine based on official URA data

-- Additional OCR areas (most outer areas default to OCR if not specified above)
UPDATE planning_areas SET region = 'OCR' 
WHERE region IS NULL 
  AND id NOT IN (
    SELECT id FROM planning_areas WHERE region IN ('CCR', 'RCR')
  );

-- Add comment to column
COMMENT ON COLUMN planning_areas.region IS 'URA Regional Classification: CCR (Core Central Region), RCR (Rest of Central Region), OCR (Outside Central Region)';

