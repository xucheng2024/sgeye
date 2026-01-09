-- Check how many neighbourhoods are in Downtown Core planning area
-- and list them

-- First, find the planning area ID for Downtown Core
SELECT 
  id,
  name,
  region
FROM planning_areas
WHERE UPPER(name) = 'DOWNTOWN CORE';

-- Count neighbourhoods in Downtown Core
SELECT 
  COUNT(*) as total_neighbourhoods,
  COUNT(CASE WHEN non_residential = false THEN 1 END) as residential_neighbourhoods,
  COUNT(CASE WHEN non_residential = true THEN 1 END) as non_residential_neighbourhoods
FROM neighbourhoods n
INNER JOIN planning_areas pa ON n.planning_area_id = pa.id
WHERE UPPER(pa.name) = 'DOWNTOWN CORE';

-- List all neighbourhoods in Downtown Core
SELECT 
  n.id,
  n.name,
  n.type,
  n.non_residential,
  n.one_liner,
  pa.name as planning_area_name,
  pa.region
FROM neighbourhoods n
INNER JOIN planning_areas pa ON n.planning_area_id = pa.id
WHERE UPPER(pa.name) = 'DOWNTOWN CORE'
ORDER BY n.name;
