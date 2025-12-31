-- Fix aggregate_neighbourhood_monthly_data() function
-- Remove dependency on parse_lease_years() and use direct calculation

CREATE OR REPLACE FUNCTION aggregate_neighbourhood_monthly_data()
RETURNS TABLE(
  total_records INTEGER,
  earliest_month DATE,
  latest_month DATE,
  total_transactions BIGINT
) AS $$
BEGIN
  -- Insert/Update aggregated monthly data by neighbourhood
  INSERT INTO agg_neighbourhood_monthly (
    month,
    neighbourhood_id,
    flat_type,
    tx_count,
    median_price,
    p25_price,
    p75_price,
    median_psm,
    median_lease_years,
    avg_floor_area,
    updated_at
  )
  SELECT 
    DATE_TRUNC('month', month)::DATE as month,
    neighbourhood_id,
    flat_type,
    COUNT(*) as tx_count,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY resale_price) as median_price,
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY resale_price) as p25_price,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY resale_price) as p75_price,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY resale_price / NULLIF(floor_area_sqm, 0)) as median_psm,
    -- Calculate lease years using parse_lease_years function
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY parse_lease_years(remaining_lease)) as median_lease_years,
    AVG(floor_area_sqm) as avg_floor_area,
    NOW() as updated_at
  FROM raw_resale_2017
  WHERE resale_price IS NOT NULL
    AND resale_price > 0
    AND floor_area_sqm IS NOT NULL
    AND floor_area_sqm > 0
    AND remaining_lease IS NOT NULL
    AND remaining_lease != ''
    AND neighbourhood_id IS NOT NULL
  GROUP BY DATE_TRUNC('month', month)::DATE, neighbourhood_id, flat_type
  ON CONFLICT (month, neighbourhood_id, flat_type) 
  DO UPDATE SET
    tx_count = EXCLUDED.tx_count,
    median_price = EXCLUDED.median_price,
    p25_price = EXCLUDED.p25_price,
    p75_price = EXCLUDED.p75_price,
    median_psm = EXCLUDED.median_psm,
    median_lease_years = EXCLUDED.median_lease_years,
    avg_floor_area = EXCLUDED.avg_floor_area,
    updated_at = EXCLUDED.updated_at;

  -- Return summary statistics
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_records,
    MIN(month) as earliest_month,
    MAX(month) as latest_month,
    SUM(tx_count)::BIGINT as total_transactions
  FROM agg_neighbourhood_monthly;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

