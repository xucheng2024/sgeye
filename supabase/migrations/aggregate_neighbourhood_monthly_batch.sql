-- Batch aggregation function to avoid timeout
-- Processes data month by month

CREATE OR REPLACE FUNCTION aggregate_neighbourhood_monthly_data_batch(
  p_start_month DATE DEFAULT NULL,
  p_end_month DATE DEFAULT NULL
)
RETURNS TABLE(
  month_processed DATE,
  records_inserted INTEGER
) AS $$
DECLARE
  current_month DATE;
  end_month DATE;
  records_count INTEGER;
BEGIN
  -- Determine date range
  IF p_start_month IS NULL THEN
    SELECT MIN(DATE_TRUNC('month', month)::DATE) INTO current_month
    FROM raw_resale_2017
    WHERE neighbourhood_id IS NOT NULL;
  ELSE
    current_month := DATE_TRUNC('month', p_start_month)::DATE;
  END IF;
  
  IF p_end_month IS NULL THEN
    SELECT MAX(DATE_TRUNC('month', month)::DATE) INTO end_month
    FROM raw_resale_2017
    WHERE neighbourhood_id IS NOT NULL;
  ELSE
    end_month := DATE_TRUNC('month', p_end_month)::DATE;
  END IF;
  
  -- Process month by month
  WHILE current_month <= end_month LOOP
    -- Insert/Update aggregated data for this month
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
      current_month as month,
      neighbourhood_id,
      flat_type,
      COUNT(*) as tx_count,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY resale_price) as median_price,
      PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY resale_price) as p25_price,
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY resale_price) as p75_price,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY resale_price / NULLIF(floor_area_sqm, 0)) as median_psm,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY parse_lease_years(remaining_lease)) as median_lease_years,
      AVG(floor_area_sqm) as avg_floor_area,
      NOW() as updated_at
    FROM raw_resale_2017
    WHERE DATE_TRUNC('month', month)::DATE = current_month
      AND resale_price IS NOT NULL
      AND resale_price > 0
      AND floor_area_sqm IS NOT NULL
      AND floor_area_sqm > 0
      AND remaining_lease IS NOT NULL
      AND remaining_lease != ''
      AND neighbourhood_id IS NOT NULL
    GROUP BY neighbourhood_id, flat_type
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
    
    GET DIAGNOSTICS records_count = ROW_COUNT;
    
    RETURN QUERY SELECT current_month, records_count;
    
    -- Move to next month
    current_month := current_month + INTERVAL '1 month';
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

