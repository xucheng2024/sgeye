-- Check for street names containing "dairy" or "farm"
SELECT DISTINCT 
  street_name,
  COUNT(*) as transaction_count,
  COUNT(DISTINCT neighbourhood_id) as neighbourhood_count
FROM raw_resale_2017
WHERE 
  street_name ILIKE '%dairy%' 
  OR street_name ILIKE '%farm%'
  OR street_name ILIKE '%diary%'
GROUP BY street_name
ORDER BY transaction_count DESC
LIMIT 20;

-- Also check what street names exist in general (sample)
SELECT DISTINCT street_name
FROM raw_resale_2017
WHERE street_name IS NOT NULL
  AND neighbourhood_id IS NOT NULL
ORDER BY street_name
LIMIT 50;
