-- Check current status of boundaries
SELECT 
  'planning_areas' as table_name,
  COUNT(*) as total_count,
  COUNT(geom) as with_geometry
FROM planning_areas
UNION ALL
SELECT 
  'subzones' as table_name,
  COUNT(*) as total_count,
  COUNT(geom) as with_geometry
FROM subzones
UNION ALL
SELECT 
  'neighbourhoods (sealed)' as table_name,
  COUNT(*) as total_count,
  COUNT(geom) as with_geometry
FROM neighbourhoods
WHERE type = 'sealed';
