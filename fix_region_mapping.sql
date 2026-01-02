-- Check and fix region mapping
-- First, let's see what planning_area IDs actually exist

-- Check actual planning area IDs
SELECT 
  id,
  name,
  region
FROM planning_areas
ORDER BY name
LIMIT 30;

-- Check how many neighbourhoods have planning_area_id
SELECT 
  COUNT(*) as total_neighbourhoods,
  COUNT(planning_area_id) as neighbourhoods_with_planning_area,
  COUNT(*) - COUNT(planning_area_id) as neighbourhoods_without_planning_area
FROM neighbourhoods;

-- Check a sample of neighbourhoods and their planning areas
SELECT 
  n.id as neighbourhood_id,
  n.name as neighbourhood_name,
  n.planning_area_id,
  pa.name as planning_area_name,
  pa.region
FROM neighbourhoods n
LEFT JOIN planning_areas pa ON pa.id = n.planning_area_id
ORDER BY pa.region NULLS LAST, n.name
LIMIT 30;

-- Show which planning areas are most used
SELECT 
  pa.id,
  pa.name,
  pa.region,
  COUNT(n.id) as neighbourhood_count
FROM planning_areas pa
LEFT JOIN neighbourhoods n ON n.planning_area_id = pa.id
GROUP BY pa.id, pa.name, pa.region
ORDER BY neighbourhood_count DESC, pa.name
LIMIT 30;

