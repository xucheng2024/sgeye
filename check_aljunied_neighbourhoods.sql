-- Check if there are neighbourhoods in aljunied subzone
-- First, check the subzone ID format
SELECT 
  id,
  name,
  planning_area_id,
  region
FROM subzones
WHERE LOWER(name) LIKE '%aljunied%' OR LOWER(id) LIKE '%aljunied%'
ORDER BY name;

-- Then check neighbourhoods with this subzone as parent
WITH aljunied_subzones AS (
  SELECT id, name
  FROM subzones
  WHERE LOWER(name) LIKE '%aljunied%' OR LOWER(id) LIKE '%aljunied%'
)
SELECT 
  n.id,
  n.name,
  n.parent_subzone_id,
  n.planning_area_id,
  sz.name as subzone_name,
  COUNT(am.neighbourhood_id) as flat_type_count,
  SUM(am.tx_count) as total_tx_12m
FROM neighbourhoods n
LEFT JOIN aljunied_subzones sz ON n.parent_subzone_id = sz.id
LEFT JOIN agg_neighbourhood_monthly am ON n.id = am.neighbourhood_id
  AND am.month >= CURRENT_DATE - INTERVAL '12 months'
WHERE n.parent_subzone_id IN (SELECT id FROM aljunied_subzones)
GROUP BY n.id, n.name, n.parent_subzone_id, n.planning_area_id, sz.name
ORDER BY total_tx_12m DESC NULLS LAST;

-- Also check if any neighbourhoods match by name
SELECT 
  n.id,
  n.name,
  n.parent_subzone_id,
  n.planning_area_id
FROM neighbourhoods n
WHERE LOWER(n.name) LIKE '%geylang%' OR LOWER(n.name) LIKE '%aljunied%'
ORDER BY n.name;
