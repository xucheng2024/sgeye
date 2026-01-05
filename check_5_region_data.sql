-- Check 5 Major Regions data in subzones table

-- Check region distribution
SELECT 
  region,
  COUNT(*) as count
FROM subzones
GROUP BY region
ORDER BY 
  CASE region
    WHEN 'Central' THEN 1
    WHEN 'East' THEN 2
    WHEN 'North' THEN 3
    WHEN 'North-East' THEN 4
    WHEN 'West' THEN 5
    WHEN NULL THEN 6
  END;

-- Check if region is NULL
SELECT 
  COUNT(*) as total_subzones,
  COUNT(region) as subzones_with_region,
  COUNT(*) - COUNT(region) as subzones_without_region
FROM subzones;

-- Sample subzones with their regions
SELECT 
  id,
  name,
  region,
  planning_area_id
FROM subzones
WHERE region IS NOT NULL
ORDER BY region, name
LIMIT 20;

-- Check neighbourhoods with their subzone regions
SELECT 
  n.id as neighbourhood_id,
  n.name as neighbourhood_name,
  s.name as subzone_name,
  s.region,
  pa.name as planning_area_name,
  pa.region as planning_area_ura_region
FROM neighbourhoods n
LEFT JOIN subzones s ON s.id = n.parent_subzone_id
LEFT JOIN planning_areas pa ON pa.id = n.planning_area_id
WHERE s.region IS NOT NULL
ORDER BY s.region, n.name
LIMIT 20;

