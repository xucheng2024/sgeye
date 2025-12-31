-- Migration: Create Neighbourhood Summary Table
-- Description: Provides current state summary for frontend (last 12 months)
-- This is the primary data source for list/card/compare pages

-- ============================================
-- Neighbourhood Summary Table
-- ============================================
CREATE TABLE IF NOT EXISTS neighbourhood_summary (
  neighbourhood_id TEXT PRIMARY KEY REFERENCES neighbourhoods(id) ON DELETE CASCADE,
  tx_12m INTEGER NOT NULL DEFAULT 0, -- Transaction count in last 12 months
  median_price_12m NUMERIC, -- Median price in last 12 months
  median_psm_12m NUMERIC, -- Median price per sqm in last 12 months
  median_lease_years_12m NUMERIC, -- Median lease years in last 12 months
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_neighbourhood_summary_tx_12m ON neighbourhood_summary(tx_12m);
CREATE INDEX IF NOT EXISTS idx_neighbourhood_summary_median_price ON neighbourhood_summary(median_price_12m);

-- Enable Row Level Security (RLS)
ALTER TABLE neighbourhood_summary ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
DROP POLICY IF EXISTS "Allow public read access" ON neighbourhood_summary;
CREATE POLICY "Allow public read access" ON neighbourhood_summary FOR SELECT USING (true);

-- ============================================
-- Function to update neighbourhood summary
-- ============================================
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
  INSERT INTO neighbourhood_summary (
    neighbourhood_id,
    tx_12m,
    median_price_12m,
    median_psm_12m,
    median_lease_years_12m,
    updated_at
  )
  SELECT 
    neighbourhood_id,
    SUM(tx_count)::INTEGER as tx_12m,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY median_price) as median_price_12m,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY median_psm) as median_psm_12m,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY median_lease_years) as median_lease_years_12m,
    NOW() as updated_at
  FROM agg_neighbourhood_monthly
  WHERE month >= start_date
    AND month <= end_date
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

-- Initial population
SELECT update_neighbourhood_summary();

