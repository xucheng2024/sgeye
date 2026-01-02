-- Test direct query to see if data exists
-- Run this in Supabase SQL Editor

-- Check if ADMIRALTY has summary and access data
SELECT 
  n.id,
  n.name,
  ns.tx_12m,
  ns.median_price_12m,
  na.mrt_access_type,
  na.mrt_station_count
FROM neighbourhoods n
LEFT JOIN neighbourhood_summary ns ON ns.neighbourhood_id = n.id
LEFT JOIN neighbourhood_access na ON na.neighbourhood_id = n.id
WHERE n.id = 'admiralty';

-- Check a few more with known data
SELECT 
  n.id,
  n.name,
  ns.tx_12m,
  ns.median_price_12m,
  na.mrt_access_type
FROM neighbourhoods n
LEFT JOIN neighbourhood_summary ns ON ns.neighbourhood_id = n.id
LEFT JOIN neighbourhood_access na ON na.neighbourhood_id = n.id
WHERE n.id IN ('admiralty', 'alexandra-hill', 'aljunied')
ORDER BY n.name;

