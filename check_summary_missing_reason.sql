-- Check why some neighbourhoods are missing summary data

-- 1. Check if missing neighbourhoods have data in agg_neighbourhood_monthly
SELECT 
  n.id,
  n.name,
  COUNT(anm.id) as monthly_records_count,
  SUM(anm.tx_count) as total_transactions
FROM neighbourhoods n
LEFT JOIN neighbourhood_summary ns ON ns.neighbourhood_id = n.id
LEFT JOIN agg_neighbourhood_monthly anm ON anm.neighbourhood_id = n.id
WHERE ns.neighbourhood_id IS NULL
GROUP BY n.id, n.name
ORDER BY total_transactions DESC NULLS LAST
LIMIT 20;

-- 2. Check neighbourhoods with NO data in agg_neighbourhood_monthly at all
SELECT 
  n.id,
  n.name,
  'No data in agg_neighbourhood_monthly' as reason
FROM neighbourhoods n
LEFT JOIN agg_neighbourhood_monthly anm ON anm.neighbourhood_id = n.id
LEFT JOIN neighbourhood_summary ns ON ns.neighbourhood_id = n.id
WHERE anm.neighbourhood_id IS NULL 
  AND ns.neighbourhood_id IS NULL
ORDER BY n.name
LIMIT 20;

-- 3. Check neighbourhoods that HAVE data in agg_neighbourhood_monthly but NO summary
SELECT 
  n.id,
  n.name,
  COUNT(anm.id) as monthly_records,
  SUM(anm.tx_count) as total_tx,
  MIN(anm.month) as earliest_month,
  MAX(anm.month) as latest_month
FROM neighbourhoods n
INNER JOIN agg_neighbourhood_monthly anm ON anm.neighbourhood_id = n.id
LEFT JOIN neighbourhood_summary ns ON ns.neighbourhood_id = n.id
WHERE ns.neighbourhood_id IS NULL
GROUP BY n.id, n.name
HAVING SUM(anm.tx_count) > 0
ORDER BY total_tx DESC
LIMIT 20;

-- 4. Summary: Why summaries are missing
SELECT 
  'Neighbourhoods with NO monthly data' as category,
  COUNT(DISTINCT n.id) as count
FROM neighbourhoods n
LEFT JOIN agg_neighbourhood_monthly anm ON anm.neighbourhood_id = n.id
LEFT JOIN neighbourhood_summary ns ON ns.neighbourhood_id = n.id
WHERE anm.neighbourhood_id IS NULL 
  AND ns.neighbourhood_id IS NULL

UNION ALL

SELECT 
  'Neighbourhoods with monthly data but NO summary (needs update)' as category,
  COUNT(DISTINCT n.id) as count
FROM neighbourhoods n
INNER JOIN agg_neighbourhood_monthly anm ON anm.neighbourhood_id = n.id
LEFT JOIN neighbourhood_summary ns ON ns.neighbourhood_id = n.id
WHERE ns.neighbourhood_id IS NULL
  AND EXISTS (
    SELECT 1 FROM agg_neighbourhood_monthly anm2 
    WHERE anm2.neighbourhood_id = n.id 
    AND anm2.tx_count > 0
  );

