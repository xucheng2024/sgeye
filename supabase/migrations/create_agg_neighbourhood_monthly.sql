-- Migration: Create Neighbourhood-Based Aggregation Table
-- Description: Replaces town-based agg_monthly with neighbourhood-based aggregation
-- This is the new source of truth for all price metrics

-- ============================================
-- Neighbourhood Monthly Aggregation Table
-- ============================================
CREATE TABLE IF NOT EXISTS agg_neighbourhood_monthly (
  id SERIAL PRIMARY KEY,
  month DATE NOT NULL,
  neighbourhood_id TEXT NOT NULL REFERENCES neighbourhoods(id) ON DELETE CASCADE,
  flat_type VARCHAR(50) NOT NULL,
  tx_count INTEGER NOT NULL DEFAULT 0,
  median_price NUMERIC,
  p25_price NUMERIC,
  p75_price NUMERIC,
  median_psm NUMERIC,
  median_lease_years NUMERIC,
  avg_floor_area NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month, neighbourhood_id, flat_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agg_neighbourhood_monthly_month ON agg_neighbourhood_monthly(month);
CREATE INDEX IF NOT EXISTS idx_agg_neighbourhood_monthly_neighbourhood ON agg_neighbourhood_monthly(neighbourhood_id);
CREATE INDEX IF NOT EXISTS idx_agg_neighbourhood_monthly_flat_type ON agg_neighbourhood_monthly(flat_type);
CREATE INDEX IF NOT EXISTS idx_agg_neighbourhood_monthly_composite ON agg_neighbourhood_monthly(month, neighbourhood_id, flat_type);

-- Enable Row Level Security (RLS)
ALTER TABLE agg_neighbourhood_monthly ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
DROP POLICY IF EXISTS "Allow public read access" ON agg_neighbourhood_monthly;
CREATE POLICY "Allow public read access" ON agg_neighbourhood_monthly FOR SELECT USING (true);

-- ============================================
-- Function to aggregate monthly data by neighbourhood
-- ============================================
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

