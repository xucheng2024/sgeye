-- Check neighbourhood data availability
-- Run these queries in Supabase SQL Editor

-- 1. Check total neighbourhoods count
SELECT COUNT(*) as total_neighbourhoods
FROM neighbourhoods;

-- 2. Check neighbourhoods with summary data
SELECT 
  COUNT(DISTINCT n.id) as neighbourhoods_with_summary,
  COUNT(DISTINCT n.id) * 100.0 / (SELECT COUNT(*) FROM neighbourhoods) as percentage_with_summary
FROM neighbourhoods n
INNER JOIN neighbourhood_summary ns ON ns.neighbourhood_id = n.id;

-- 3. Check neighbourhoods with access data
SELECT 
  COUNT(DISTINCT n.id) as neighbourhoods_with_access,
  COUNT(DISTINCT n.id) * 100.0 / (SELECT COUNT(*) FROM neighbourhoods) as percentage_with_access
FROM neighbourhoods n
INNER JOIN neighbourhood_access na ON na.neighbourhood_id = n.id;

-- 4. Check sample neighbourhood data (first 10)
SELECT 
  n.id,
  n.name,
  n.planning_area_id,
  ns.tx_12m,
  ns.median_price_12m,
  ns.median_lease_years_12m,
  na.mrt_access_type,
  na.mrt_station_count
FROM neighbourhoods n
LEFT JOIN neighbourhood_summary ns ON ns.neighbourhood_id = n.id
LEFT JOIN neighbourhood_access na ON na.neighbourhood_id = n.id
LIMIT 10;

-- 5. Check summary data statistics
SELECT 
  COUNT(*) as total_summaries,
  COUNT(CASE WHEN tx_12m > 0 THEN 1 END) as with_transactions,
  COUNT(CASE WHEN median_price_12m IS NOT NULL THEN 1 END) as with_price,
  COUNT(CASE WHEN median_lease_years_12m IS NOT NULL THEN 1 END) as with_lease,
  AVG(tx_12m) as avg_transactions,
  AVG(median_price_12m) as avg_price,
  AVG(median_lease_years_12m) as avg_lease
FROM neighbourhood_summary;

-- 6. Check access data statistics
SELECT 
  COUNT(*) as total_access_records,
  COUNT(CASE WHEN mrt_access_type = 'high' THEN 1 END) as high_access,
  COUNT(CASE WHEN mrt_access_type = 'medium' THEN 1 END) as medium_access,
  COUNT(CASE WHEN mrt_access_type = 'low' THEN 1 END) as low_access,
  COUNT(CASE WHEN mrt_access_type = 'none' THEN 1 END) as no_access,
  AVG(mrt_station_count) as avg_stations,
  AVG(avg_distance_to_mrt) as avg_distance
FROM neighbourhood_access;

-- 7. Check neighbourhoods with both summary and access
SELECT 
  COUNT(DISTINCT n.id) as complete_data_count
FROM neighbourhoods n
INNER JOIN neighbourhood_summary ns ON ns.neighbourhood_id = n.id
INNER JOIN neighbourhood_access na ON na.neighbourhood_id = n.id
WHERE ns.tx_12m > 0 
  AND ns.median_price_12m IS NOT NULL
  AND na.mrt_access_type IS NOT NULL;

