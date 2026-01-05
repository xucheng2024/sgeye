-- Query to get all neighbourhood names from database
-- Compare with existing data in lib/neighbourhood-living-notes.ts

SELECT 
  name,
  id,
  planning_area_id
FROM neighbourhoods
ORDER BY name;

