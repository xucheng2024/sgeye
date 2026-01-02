-- Fix neighbourhood_summary to use transaction-weighted median price
-- Current issue: mixing all flat_types (3 ROOM, 4 ROOM, 5 ROOM) together gives misleading median
-- Problem: 3 ROOM (~$400k) and 4 ROOM (~$600k) have very different prices
-- Solution: Weight by transaction count to reflect actual market activity

CREATE OR REPLACE FUNCTION update_neighbourhood_summary()
RETURNS TABLE(
  updated_count INTEGER,
  total_neighbourhoods INTEGER
) AS $$
DECLARE
  start_date DATE;
  end_date DATE;
BEGIN
  -- Get the latest month from agg_neighbourhood_monthly
  SELECT MAX(month) INTO end_date FROM agg_neighbourhood_monthly;
  
  -- Calculate start date (12 months ago from latest month)
  start_date := end_date - INTERVAL '12 months';
  
  -- Insert/Update summary data for last 12 months
  -- Use transaction-weighted approach: expand each median_price by tx_count
  -- This gives more weight to flat_types/months with more transactions
  INSERT INTO neighbourhood_summary (
    neighbourhood_id,
    tx_12m,
    median_price_12m,
    median_psm_12m,
    median_lease_years_12m,
    updated_at
  )
  WITH expanded_prices AS (
    -- Expand each month's median_price by its transaction count
    -- This creates a weighted representation where high-transaction months/flat_types have more influence
    SELECT 
      neighbourhood_id,
      median_price,
      median_psm,
      median_lease_years,
      tx_count
    FROM agg_neighbourhood_monthly
    WHERE month >= start_date
      AND month <= end_date
      AND median_price IS NOT NULL
      AND tx_count > 0
  ),
  weighted_values AS (
    -- For each neighbourhood, create weighted price list
    -- Each median_price appears tx_count times
    SELECT 
      neighbourhood_id,
      UNNEST(ARRAY(SELECT median_price FROM generate_series(1, tx_count::INTEGER))) as price,
      UNNEST(ARRAY(SELECT median_psm FROM generate_series(1, tx_count::INTEGER))) as psm,
      UNNEST(ARRAY(SELECT median_lease_years FROM generate_series(1, tx_count::INTEGER))) as lease
    FROM expanded_prices
  )
  SELECT 
    neighbourhood_id,
    SUM(tx_count)::INTEGER as tx_12m,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price) as median_price_12m,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY psm) as median_psm_12m,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY lease) as median_lease_years_12m,
    NOW() as updated_at
  FROM weighted_values
  GROUP BY neighbourhood_id
  ON CONFLICT (neighbourhood_id) 
  DO UPDATE SET
    tx_12m = EXCLUDED.tx_12m,
    median_price_12m = EXCLUDED.median_price_12m,
    median_psm_12m = EXCLUDED.median_psm_12m,
    median_lease_years_12m = EXCLUDED.median_lease_years_12m,
    updated_at = EXCLUDED.updated_at;
  
  -- Return summary statistics
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM neighbourhood_summary WHERE updated_at >= NOW() - INTERVAL '1 minute')::INTEGER as updated_count,
    (SELECT COUNT(*) FROM neighbourhood_summary)::INTEGER as total_neighbourhoods;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
