-- Check which tables have missing data
-- Run these queries in Supabase SQL Editor

-- 1. Check neighbourhoods count
SELECT 
  'neighbourhoods' as table_name,
  COUNT(*) as total_records
FROM neighbourhoods;

-- 2. Check neighbourhood_summary coverage
SELECT 
  'neighbourhood_summary' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT neighbourhood_id) as unique_neighbourhoods,
  (SELECT COUNT(*) FROM neighbourhoods) as total_neighbourhoods,
  ROUND(COUNT(DISTINCT neighbourhood_id) * 100.0 / (SELECT COUNT(*) FROM neighbourhoods), 2) as coverage_percentage
FROM neighbourhood_summary;

-- 3. Check neighbourhood_access coverage
SELECT 
  'neighbourhood_access' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT neighbourhood_id) as unique_neighbourhoods,
  (SELECT COUNT(*) FROM neighbourhoods) as total_neighbourhoods,
  ROUND(COUNT(DISTINCT neighbourhood_id) * 100.0 / (SELECT COUNT(*) FROM neighbourhoods), 2) as coverage_percentage
FROM neighbourhood_access;

-- 4. Find neighbourhoods WITHOUT summary data
SELECT 
  n.id,
  n.name,
  n.planning_area_id,
  'Missing summary data' as missing_data_type
FROM neighbourhoods n
LEFT JOIN neighbourhood_summary ns ON ns.neighbourhood_id = n.id
WHERE ns.neighbourhood_id IS NULL
ORDER BY n.name
LIMIT 20;

-- 5. Find neighbourhoods WITHOUT access data
SELECT 
  n.id,
  n.name,
  n.planning_area_id,
  'Missing access data' as missing_data_type
FROM neighbourhoods n
LEFT JOIN neighbourhood_access na ON na.neighbourhood_id = n.id
WHERE na.neighbourhood_id IS NULL
ORDER BY n.name
LIMIT 20;

-- 6. Find neighbourhoods with BOTH missing summary and access
SELECT 
  n.id,
  n.name,
  n.planning_area_id,
  'Missing both summary and access data' as missing_data_type
FROM neighbourhoods n
LEFT JOIN neighbourhood_summary ns ON ns.neighbourhood_id = n.id
LEFT JOIN neighbourhood_access na ON na.neighbourhood_id = n.id
WHERE ns.neighbourhood_id IS NULL AND na.neighbourhood_id IS NULL
ORDER BY n.name;

-- 7. Check summary data completeness (NULL values)
SELECT 
  COUNT(*) as total_summaries,
  COUNT(CASE WHEN tx_12m IS NULL OR tx_12m = 0 THEN 1 END) as missing_tx,
  COUNT(CASE WHEN median_price_12m IS NULL THEN 1 END) as missing_price,
  COUNT(CASE WHEN median_lease_years_12m IS NULL THEN 1 END) as missing_lease,
  COUNT(CASE WHEN tx_12m IS NOT NULL AND tx_12m > 0 
             AND median_price_12m IS NOT NULL 
             AND median_lease_years_12m IS NOT NULL THEN 1 END) as complete_records
FROM neighbourhood_summary;

-- 8. Check access data completeness (NULL values)
SELECT 
  COUNT(*) as total_access,
  COUNT(CASE WHEN mrt_access_type IS NULL THEN 1 END) as missing_mrt_type,
  COUNT(CASE WHEN mrt_station_count IS NULL THEN 1 END) as missing_station_count,
  COUNT(CASE WHEN mrt_access_type IS NOT NULL 
             AND mrt_station_count IS NOT NULL THEN 1 END) as complete_records
FROM neighbourhood_access;

-- 9. Summary: Data coverage overview
SELECT 
  (SELECT COUNT(*) FROM neighbourhoods) as total_neighbourhoods,
  (SELECT COUNT(DISTINCT neighbourhood_id) FROM neighbourhood_summary) as with_summary,
  (SELECT COUNT(DISTINCT neighbourhood_id) FROM neighbourhood_access) as with_access,
  (SELECT COUNT(DISTINCT n.id) 
   FROM neighbourhoods n
   INNER JOIN neighbourhood_summary ns ON ns.neighbourhood_id = n.id
   INNER JOIN neighbourhood_access na ON na.neighbourhood_id = n.id) as with_both,
  (SELECT COUNT(*) 
   FROM neighbourhoods n
   LEFT JOIN neighbourhood_summary ns ON ns.neighbourhood_id = n.id
   LEFT JOIN neighbourhood_access na ON na.neighbourhood_id = n.id
   WHERE ns.neighbourhood_id IS NULL AND na.neighbourhood_id IS NULL) as missing_both;

