-- Force create summary for neighbourhoods with ANY data in last 12 months
-- This will handle the 7 missing neighbourhoods

-- First, let's see what the actual latest month is and check the 7 missing ones
WITH date_range AS (
  SELECT 
    MAX(month) as end_date,
    MAX(month) - INTERVAL '12 months' as start_date
  FROM agg_neighbourhood_monthly
)
SELECT 
  n.id,
  n.name,
  dr.end_date as latest_month,
  dr.start_date as start_date,
  COUNT(anm.id) as records_in_12m,
  SUM(anm.tx_count) as total_tx_12m
FROM neighbourhoods n
CROSS JOIN date_range dr
LEFT JOIN agg_neighbourhood_monthly anm ON anm.neighbourhood_id = n.id
  AND anm.month >= dr.start_date
  AND anm.month <= dr.end_date
LEFT JOIN neighbourhood_summary ns ON ns.neighbourhood_id = n.id
WHERE n.id IN (
  'pasir-panjang-2',
  'tyersall',
  'kampong-bugis',
  'pasir-panjang-1',
  'swiss-club',
  'gali-batu',
  'greenwood-park'
)
GROUP BY n.id, n.name, dr.end_date, dr.start_date
ORDER BY total_tx_12m DESC NULLS LAST;

-- Manual insert for these 7 neighbourhoods if they have data
INSERT INTO neighbourhood_summary (
  neighbourhood_id,
  tx_12m,
  median_price_12m,
  median_psm_12m,
  median_lease_years_12m,
  updated_at
)
SELECT 
  neighbourhood_id,
  SUM(tx_count)::INTEGER as tx_12m,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY median_price) as median_price_12m,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY median_psm) as median_psm_12m,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY median_lease_years) as median_lease_years_12m,
  NOW() as updated_at
FROM agg_neighbourhood_monthly
WHERE neighbourhood_id IN (
  'pasir-panjang-2',
  'tyersall',
  'kampong-bugis',
  'pasir-panjang-1',
  'swiss-club',
  'gali-batu',
  'greenwood-park'
)
  AND month >= (SELECT MAX(month) - INTERVAL '12 months' FROM agg_neighbourhood_monthly)
  AND month <= (SELECT MAX(month) FROM agg_neighbourhood_monthly)
GROUP BY neighbourhood_id
ON CONFLICT (neighbourhood_id) 
DO UPDATE SET
  tx_12m = EXCLUDED.tx_12m,
  median_price_12m = EXCLUDED.median_price_12m,
  median_psm_12m = EXCLUDED.median_psm_12m,
  median_lease_years_12m = EXCLUDED.median_lease_years_12m,
  updated_at = EXCLUDED.updated_at;

