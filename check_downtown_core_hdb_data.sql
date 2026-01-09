-- Check HDB resale data for Downtown Core neighbourhoods
-- If a neighbourhood has HDB resale data, it means there are HDB flats there
-- So it shouldn't be filtered out just because it's city_core

-- 1. Check which Downtown Core neighbourhoods have HDB resale data
SELECT 
  n.id,
  n.name,
  n.non_residential,
  nln.zone_type,
  COUNT(DISTINCT r.id) as total_transactions,
  COUNT(DISTINCT CASE WHEN r.month >= CURRENT_DATE - INTERVAL '12 months' THEN r.id END) as tx_12m,
  MIN(r.month) as first_transaction,
  MAX(r.month) as last_transaction
FROM neighbourhoods n
INNER JOIN planning_areas pa ON n.planning_area_id = pa.id
LEFT JOIN raw_resale_2017 r ON n.id = r.neighbourhood_id
LEFT JOIN neighbourhood_living_notes nln ON UPPER(TRIM(n.name)) = UPPER(TRIM(nln.neighbourhood_name))
WHERE UPPER(pa.name) = 'DOWNTOWN CORE'
  AND n.non_residential = false
GROUP BY n.id, n.name, n.non_residential, nln.zone_type
ORDER BY total_transactions DESC, n.name;

-- 2. Check summary data (aggregated monthly data)
SELECT 
  n.id,
  n.name,
  nln.zone_type,
  ns.tx_12m,
  ns.median_price_12m,
  ns.median_lease_years_12m
FROM neighbourhoods n
INNER JOIN planning_areas pa ON n.planning_area_id = pa.id
LEFT JOIN neighbourhood_summary ns ON n.id = ns.neighbourhood_id
LEFT JOIN neighbourhood_living_notes nln ON UPPER(TRIM(n.name)) = UPPER(TRIM(nln.neighbourhood_name))
WHERE UPPER(pa.name) = 'DOWNTOWN CORE'
  AND n.non_residential = false
ORDER BY ns.tx_12m DESC NULLS LAST, n.name;

-- 3. Summary: How many Downtown Core neighbourhoods have HDB data?
SELECT 
  COUNT(DISTINCT n.id) as total_residential_neighbourhoods,
  COUNT(DISTINCT CASE WHEN r.id IS NOT NULL THEN n.id END) as neighbourhoods_with_hdb_data,
  COUNT(DISTINCT CASE WHEN nln.zone_type = 'city_core' THEN n.id END) as city_core_neighbourhoods,
  COUNT(DISTINCT CASE WHEN nln.zone_type = 'city_core' AND r.id IS NOT NULL THEN n.id END) as city_core_with_hdb_data
FROM neighbourhoods n
INNER JOIN planning_areas pa ON n.planning_area_id = pa.id
LEFT JOIN raw_resale_2017 r ON n.id = r.neighbourhood_id
LEFT JOIN neighbourhood_living_notes nln ON UPPER(TRIM(n.name)) = UPPER(TRIM(nln.neighbourhood_name))
WHERE UPPER(pa.name) = 'DOWNTOWN CORE'
  AND n.non_residential = false;
