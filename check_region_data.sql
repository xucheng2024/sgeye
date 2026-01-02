-- Check if region data exists in planning_areas table

-- Check region distribution
SELECT 
  region,
  COUNT(*) as count
FROM planning_areas
GROUP BY region
ORDER BY 
  CASE region
    WHEN 'CCR' THEN 1
    WHEN 'RCR' THEN 2
    WHEN 'OCR' THEN 3
  END;

-- Check if region is NULL
SELECT 
  COUNT(*) as total_planning_areas,
  COUNT(region) as planning_areas_with_region,
  COUNT(*) - COUNT(region) as planning_areas_without_region
FROM planning_areas;

-- Sample planning areas with their regions
SELECT 
  id,
  name,
  region
FROM planning_areas
ORDER BY name
LIMIT 20;

