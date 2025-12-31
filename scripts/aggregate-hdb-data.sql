-- ============================================
-- HDB Data Aggregation Script (DEPRECATED)
-- ============================================
-- ⚠️ WARNING: This script aggregates by TOWN, which creates averaging illusions
-- 
-- ✅ USE THIS INSTEAD: aggregate_neighbourhood_monthly_data() function
--    Defined in: supabase/migrations/create_agg_neighbourhood_monthly.sql
--    Run: SELECT * FROM aggregate_neighbourhood_monthly_data();
--
-- This script is kept for reference only. New code should use neighbourhood-based aggregation.

-- ============================================
-- DEPRECATED: Town-based aggregation (creates averaging illusions)
-- ============================================
-- Step 1: Clear existing aggregated data (optional, comment out if you want to keep old data)
-- TRUNCATE TABLE agg_monthly;

-- Step 2: Insert/Update aggregated monthly data (DEPRECATED - aggregates by town)
-- ⚠️ This creates averaging illusions - use aggregate_neighbourhood_monthly_data() instead
INSERT INTO agg_monthly (month, town, flat_type, tx_count, median_price, p25_price, p75_price, median_psm, median_lease_years, avg_floor_area)
SELECT 
  DATE_TRUNC('month', month)::DATE as month,
  town,
  flat_type,
  COUNT(*) as tx_count,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY resale_price) as median_price,
  PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY resale_price) as p25_price,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY resale_price) as p75_price,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY resale_price / NULLIF(floor_area_sqm, 0)) as median_psm,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY parse_lease_years(remaining_lease)) as median_lease_years,
  AVG(floor_area_sqm) as avg_floor_area
FROM raw_resale_2017
WHERE resale_price IS NOT NULL
  AND resale_price > 0
  AND floor_area_sqm IS NOT NULL
  AND floor_area_sqm > 0
  AND remaining_lease IS NOT NULL
  AND remaining_lease != ''
GROUP BY DATE_TRUNC('month', month)::DATE, town, flat_type
ON CONFLICT (month, town, flat_type) 
DO UPDATE SET
  tx_count = EXCLUDED.tx_count,
  median_price = EXCLUDED.median_price,
  p25_price = EXCLUDED.p25_price,
  p75_price = EXCLUDED.p75_price,
  median_psm = EXCLUDED.median_psm,
  median_lease_years = EXCLUDED.median_lease_years,
  avg_floor_area = EXCLUDED.avg_floor_area,
  created_at = NOW();

-- Step 3: Verify aggregation results
SELECT 
  COUNT(*) as total_aggregated_records,
  MIN(month) as earliest_month,
  MAX(month) as latest_month,
  SUM(tx_count) as total_transactions
FROM agg_monthly;

-- Step 4: Check sample aggregated data
SELECT * 
FROM agg_monthly 
ORDER BY month DESC, town, flat_type 
LIMIT 20;

