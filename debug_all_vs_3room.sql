-- Compare what data is available for "All" vs "3 ROOM"

-- Count how many neighbourhoods have data for each flat type
SELECT 
  anm.flat_type,
  COUNT(DISTINCT anm.neighbourhood_id) AS nbhd_count
FROM agg_neighbourhood_monthly anm
WHERE anm.month >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY anm.flat_type
ORDER BY anm.flat_type;

-- Count neighbourhoods with ANY data (for "All")
SELECT 
  'ALL (any flat type)' AS flat_type,
  COUNT(DISTINCT anm.neighbourhood_id) AS nbhd_count
FROM agg_neighbourhood_monthly anm
WHERE anm.month >= CURRENT_DATE - INTERVAL '12 months';

