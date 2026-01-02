-- Simple fix: Create summary for the 7 missing neighbourhoods
-- Run this in Supabase SQL Editor

-- Step 1: Check current status
SELECT 
  n.id,
  n.name,
  CASE WHEN ns.neighbourhood_id IS NOT NULL THEN '✅ Has summary' ELSE '❌ Missing' END as status,
  (SELECT COUNT(*) FROM agg_neighbourhood_monthly anm 
   WHERE anm.neighbourhood_id = n.id 
   AND anm.month >= (SELECT MAX(month) - INTERVAL '12 months' FROM agg_neighbourhood_monthly)
   AND anm.month <= (SELECT MAX(month) FROM agg_neighbourhood_monthly)) as records_in_12m
FROM neighbourhoods n
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
ORDER BY n.name;

-- Step 2: Create/Update summary for these 7 neighbourhoods
INSERT INTO neighbourhood_summary (
  neighbourhood_id,
  tx_12m,
  median_price_12m,
  median_psm_12m,
  median_lease_years_12m,
  updated_at
)
SELECT 
  anm.neighbourhood_id,
  SUM(anm.tx_count)::INTEGER as tx_12m,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY anm.median_price) as median_price_12m,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY anm.median_psm) as median_psm_12m,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY anm.median_lease_years) as median_lease_years_12m,
  NOW() as updated_at
FROM agg_neighbourhood_monthly anm
WHERE anm.neighbourhood_id IN (
  'pasir-panjang-2',
  'tyersall',
  'kampong-bugis',
  'pasir-panjang-1',
  'swiss-club',
  'gali-batu',
  'greenwood-park'
)
  AND anm.month >= (SELECT MAX(month) - INTERVAL '12 months' FROM agg_neighbourhood_monthly)
  AND anm.month <= (SELECT MAX(month) FROM agg_neighbourhood_monthly)
  AND anm.tx_count > 0
GROUP BY anm.neighbourhood_id
HAVING SUM(anm.tx_count) > 0
ON CONFLICT (neighbourhood_id) 
DO UPDATE SET
  tx_12m = EXCLUDED.tx_12m,
  median_price_12m = EXCLUDED.median_price_12m,
  median_psm_12m = EXCLUDED.median_psm_12m,
  median_lease_years_12m = EXCLUDED.median_lease_years_12m,
  updated_at = EXCLUDED.updated_at;

-- Step 3: Verify the fix
SELECT 
  COUNT(*) as total_summaries_after_fix,
  (SELECT COUNT(*) FROM neighbourhoods) as total_neighbourhoods
FROM neighbourhood_summary;

