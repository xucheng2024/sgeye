-- Check if the 7 missing neighbourhoods have data in the last 12 months

WITH latest_month AS (
  SELECT MAX(month) as max_month FROM agg_neighbourhood_monthly
),
last_12m AS (
  SELECT 
    anm.neighbourhood_id,
    n.name,
    SUM(anm.tx_count) as total_tx_12m,
    COUNT(DISTINCT anm.month) as months_with_data,
    MIN(anm.month) as earliest_in_12m,
    MAX(anm.month) as latest_in_12m
  FROM agg_neighbourhood_monthly anm
  CROSS JOIN latest_month lm
  INNER JOIN neighbourhoods n ON n.id = anm.neighbourhood_id
  WHERE anm.month >= lm.max_month - INTERVAL '12 months'
    AND anm.month <= lm.max_month
    AND anm.neighbourhood_id IN (
      'pasir-panjang-2',
      'tyersall',
      'kampong-bugis',
      'pasir-panjang-1',
      'swiss-club',
      'gali-batu',
      'greenwood-park'
    )
  GROUP BY anm.neighbourhood_id, n.name
)
SELECT 
  l12m.*,
  lm.max_month as latest_available_month,
  CASE 
    WHEN l12m.total_tx_12m > 0 THEN '✅ Has data in last 12m'
    ELSE '❌ No data in last 12m'
  END as status
FROM last_12m l12m
CROSS JOIN latest_month lm
ORDER BY l12m.total_tx_12m DESC;

-- Also check what the latest month is
SELECT 
  MAX(month) as latest_month,
  COUNT(DISTINCT neighbourhood_id) as neighbourhoods_with_data
FROM agg_neighbourhood_monthly;

