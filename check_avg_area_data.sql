-- Check average floor area data by neighbourhood and flat type
-- This shows if we can display avg area for each flat type in each neighbourhood

-- 1. Check data availability: average area by neighbourhood and flat type (last 12 months)
SELECT 
  n.name AS neighbourhood_name,
  anm.flat_type,
  COUNT(*) AS month_count,
  AVG(anm.avg_floor_area) AS avg_area_sqm,
  MIN(anm.avg_floor_area) AS min_avg_area,
  MAX(anm.avg_floor_area) AS max_avg_area,
  SUM(anm.tx_count) AS total_transactions
FROM agg_neighbourhood_monthly anm
JOIN neighbourhoods n ON anm.neighbourhood_id = n.id
WHERE anm.month >= CURRENT_DATE - INTERVAL '12 months'
  AND anm.avg_floor_area IS NOT NULL
  AND anm.avg_floor_area > 0
GROUP BY n.id, n.name, anm.flat_type
ORDER BY n.name, anm.flat_type
LIMIT 50;

-- 2. Summary: How many neighbourhoods have area data for each flat type?
SELECT 
  anm.flat_type,
  COUNT(DISTINCT anm.neighbourhood_id) AS neighbourhoods_with_data,
  AVG(anm.avg_floor_area) AS overall_avg_area,
  MIN(anm.avg_floor_area) AS min_area,
  MAX(anm.avg_floor_area) AS max_area
FROM agg_neighbourhood_monthly anm
WHERE anm.month >= CURRENT_DATE - INTERVAL '12 months'
  AND anm.avg_floor_area IS NOT NULL
  AND anm.avg_floor_area > 0
GROUP BY anm.flat_type
ORDER BY anm.flat_type;

-- 3. Example: Get average area for a specific neighbourhood and flat type
-- Replace 'NEIGHBOURHOOD_ID' and '3 ROOM' with actual values
SELECT 
  n.name AS neighbourhood_name,
  anm.flat_type,
  AVG(anm.avg_floor_area) AS avg_area_sqm,
  COUNT(*) AS months_with_data,
  SUM(anm.tx_count) AS total_transactions
FROM agg_neighbourhood_monthly anm
JOIN neighbourhoods n ON anm.neighbourhood_id = n.id
WHERE anm.neighbourhood_id = 'NEIGHBOURHOOD_ID'  -- Replace with actual ID
  AND anm.flat_type = '3 ROOM'  -- Replace with desired flat type
  AND anm.month >= CURRENT_DATE - INTERVAL '12 months'
  AND anm.avg_floor_area IS NOT NULL
GROUP BY n.id, n.name, anm.flat_type;

