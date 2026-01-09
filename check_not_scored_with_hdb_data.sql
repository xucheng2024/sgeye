-- Check if there are other neighbourhoods marked as 'not_scored' but have HDB resale data
-- If they have HDB data, they should be scored (because there are HDB flats there)

-- 1. Find all neighbourhoods marked as not_scored but have HDB transaction data
SELECT 
  n.id,
  n.name,
  n.planning_area_id,
  pa.name as planning_area_name,
  nln.zone_type,
  nln.rating_mode,
  nln.short_note,
  COUNT(DISTINCT r.id) as total_transactions,
  COUNT(DISTINCT CASE WHEN r.month >= CURRENT_DATE - INTERVAL '12 months' THEN r.id END) as tx_12m,
  ns.tx_12m as summary_tx_12m,
  ns.median_price_12m,
  ns.median_lease_years_12m
FROM neighbourhoods n
INNER JOIN neighbourhood_living_notes nln ON UPPER(TRIM(n.name)) = UPPER(TRIM(nln.neighbourhood_name))
LEFT JOIN planning_areas pa ON n.planning_area_id = pa.id
LEFT JOIN raw_resale_2017 r ON n.id = r.neighbourhood_id
LEFT JOIN neighbourhood_summary ns ON n.id = ns.neighbourhood_id
WHERE nln.rating_mode = 'not_scored'
  AND n.non_residential = false  -- Only check residential neighbourhoods
  AND (
    -- Has raw transaction data
    r.id IS NOT NULL
    OR 
    -- Has summary data with transactions
    (ns.tx_12m IS NOT NULL AND ns.tx_12m > 0)
  )
GROUP BY n.id, n.name, n.planning_area_id, pa.name, nln.zone_type, nln.rating_mode, nln.short_note, ns.tx_12m, ns.median_price_12m, ns.median_lease_years_12m
ORDER BY total_transactions DESC, tx_12m DESC, n.name;

-- 2. Summary: Count how many not_scored neighbourhoods have HDB data
SELECT 
  COUNT(DISTINCT n.id) as total_not_scored_residential,
  COUNT(DISTINCT CASE WHEN r.id IS NOT NULL OR (ns.tx_12m IS NOT NULL AND ns.tx_12m > 0) THEN n.id END) as not_scored_with_hdb_data,
  COUNT(DISTINCT CASE WHEN r.id IS NULL AND (ns.tx_12m IS NULL OR ns.tx_12m = 0) THEN n.id END) as not_scored_without_hdb_data
FROM neighbourhoods n
INNER JOIN neighbourhood_living_notes nln ON UPPER(TRIM(n.name)) = UPPER(TRIM(nln.neighbourhood_name))
LEFT JOIN raw_resale_2017 r ON n.id = r.neighbourhood_id
LEFT JOIN neighbourhood_summary ns ON n.id = ns.neighbourhood_id
WHERE nln.rating_mode = 'not_scored'
  AND n.non_residential = false;

-- 3. Check by zone_type to see which types have this issue
SELECT 
  nln.zone_type,
  COUNT(DISTINCT n.id) as total_not_scored,
  COUNT(DISTINCT CASE WHEN r.id IS NOT NULL OR (ns.tx_12m IS NOT NULL AND ns.tx_12m > 0) THEN n.id END) as with_hdb_data,
  COUNT(DISTINCT CASE WHEN r.id IS NULL AND (ns.tx_12m IS NULL OR ns.tx_12m = 0) THEN n.id END) as without_hdb_data
FROM neighbourhoods n
INNER JOIN neighbourhood_living_notes nln ON UPPER(TRIM(n.name)) = UPPER(TRIM(nln.neighbourhood_name))
LEFT JOIN raw_resale_2017 r ON n.id = r.neighbourhood_id
LEFT JOIN neighbourhood_summary ns ON n.id = ns.neighbourhood_id
WHERE nln.rating_mode = 'not_scored'
  AND n.non_residential = false
GROUP BY nln.zone_type
ORDER BY with_hdb_data DESC, total_not_scored DESC;
