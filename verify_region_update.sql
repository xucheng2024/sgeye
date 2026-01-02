-- Verify region data was updated correctly

-- Check region distribution
SELECT 
  region,
  COUNT(*) as count,
  STRING_AGG(name, ', ' ORDER BY name) as sample_names
FROM planning_areas
GROUP BY region
ORDER BY 
  CASE region
    WHEN 'CCR' THEN 1
    WHEN 'RCR' THEN 2
    WHEN 'OCR' THEN 3
    WHEN NULL THEN 4
  END;

-- Check neighbourhoods with their planning area regions
SELECT 
  n.id as neighbourhood_id,
  n.name as neighbourhood_name,
  pa.name as planning_area_name,
  pa.region,
  pa.id as planning_area_id
FROM neighbourhoods n
JOIN planning_areas pa ON pa.id = n.planning_area_id
WHERE pa.region IS NOT NULL
ORDER BY pa.region, n.name
LIMIT 20;

