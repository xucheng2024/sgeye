-- Verify if the 7 missing neighbourhoods now have summary data

SELECT 
  n.id,
  n.name,
  ns.tx_12m,
  ns.median_price_12m,
  ns.median_lease_years_12m,
  CASE 
    WHEN ns.neighbourhood_id IS NOT NULL THEN '✅ Has summary'
    ELSE '❌ Still missing'
  END as status
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

-- Also check total count now
SELECT 
  COUNT(*) as total_summaries,
  (SELECT COUNT(*) FROM neighbourhoods) as total_neighbourhoods,
  COUNT(*) * 100.0 / (SELECT COUNT(*) FROM neighbourhoods) as coverage_percentage
FROM neighbourhood_summary;

