-- Migration: Create Neighbourhood Summary by Flat Type Table
-- Description: Pre-calculated 12-month summary with p25, median, p75 from raw transaction data
-- This ensures statistical consistency: p25 <= median <= p75
-- Calculated directly from raw_resale_2017 for accuracy

-- ============================================
-- Neighbourhood Summary by Flat Type Table
-- ============================================
CREATE TABLE IF NOT EXISTS neighbourhood_summary_by_flat_type (
  neighbourhood_id TEXT NOT NULL REFERENCES neighbourhoods(id) ON DELETE CASCADE,
  flat_type VARCHAR(50) NOT NULL,
  tx_12m INTEGER NOT NULL DEFAULT 0,
  p25_price_12m NUMERIC,
  median_price_12m NUMERIC,
  p75_price_12m NUMERIC,
  median_psm_12m NUMERIC,
  median_lease_years_12m NUMERIC,
  avg_floor_area_12m NUMERIC,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (neighbourhood_id, flat_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_neighbourhood_summary_flat_type_tx ON neighbourhood_summary_by_flat_type(tx_12m);
CREATE INDEX IF NOT EXISTS idx_neighbourhood_summary_flat_type_price ON neighbourhood_summary_by_flat_type(median_price_12m);
CREATE INDEX IF NOT EXISTS idx_neighbourhood_summary_flat_type_neighbourhood ON neighbourhood_summary_by_flat_type(neighbourhood_id);

-- Enable Row Level Security (RLS)
ALTER TABLE neighbourhood_summary_by_flat_type ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
DROP POLICY IF EXISTS "Allow public read access" ON neighbourhood_summary_by_flat_type;
CREATE POLICY "Allow public read access" ON neighbourhood_summary_by_flat_type FOR SELECT USING (true);

-- ============================================
-- Function to parse lease years from remaining_lease string
-- ============================================
CREATE OR REPLACE FUNCTION parse_lease_years(remaining_lease TEXT)
RETURNS NUMERIC AS $$
BEGIN
  IF remaining_lease IS NULL OR remaining_lease = '' THEN
    RETURN NULL;
  END IF;
  
  -- Extract years from strings like "60 years 0 months" or "60 years"
  RETURN (
    SELECT (regexp_match(remaining_lease, '(\d+)\s*years?'))[1]::NUMERIC
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- Function to update neighbourhood summary by flat type
-- ============================================
CREATE OR REPLACE FUNCTION update_neighbourhood_summary_by_flat_type()
RETURNS TABLE(
  updated_count INTEGER,
  total_records INTEGER
) AS $$
DECLARE
  start_date DATE;
  end_date DATE;
BEGIN
  -- Get the latest month from raw_resale_2017
  SELECT MAX(DATE_TRUNC('month', month)::DATE) INTO end_date FROM raw_resale_2017;
  
  -- Calculate start date (12 months ago from latest month)
  start_date := end_date - INTERVAL '12 months';
  
  -- Insert/Update summary data calculated directly from raw transaction data
  -- This ensures p25, median, p75 are from the same dataset and maintain logical consistency
  INSERT INTO neighbourhood_summary_by_flat_type (
    neighbourhood_id,
    flat_type,
    tx_12m,
    p25_price_12m,
    median_price_12m,
    p75_price_12m,
    median_psm_12m,
    median_lease_years_12m,
    avg_floor_area_12m,
    updated_at
  )
  SELECT 
    neighbourhood_id,
    flat_type,
    COUNT(*)::INTEGER as tx_12m,
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY resale_price) as p25_price_12m,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY resale_price) as median_price_12m,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY resale_price) as p75_price_12m,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY resale_price / NULLIF(floor_area_sqm, 0)) as median_psm_12m,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY parse_lease_years(remaining_lease)) as median_lease_years_12m,
    AVG(floor_area_sqm) as avg_floor_area_12m,
    NOW() as updated_at
  FROM raw_resale_2017
  WHERE DATE_TRUNC('month', month)::DATE >= start_date
    AND DATE_TRUNC('month', month)::DATE <= end_date
    AND neighbourhood_id IS NOT NULL
    AND flat_type IS NOT NULL
    AND resale_price IS NOT NULL
    AND resale_price > 0
  GROUP BY neighbourhood_id, flat_type
  HAVING COUNT(*) > 0
  ON CONFLICT (neighbourhood_id, flat_type) 
  DO UPDATE SET
    tx_12m = EXCLUDED.tx_12m,
    p25_price_12m = EXCLUDED.p25_price_12m,
    median_price_12m = EXCLUDED.median_price_12m,
    p75_price_12m = EXCLUDED.p75_price_12m,
    median_psm_12m = EXCLUDED.median_psm_12m,
    median_lease_years_12m = EXCLUDED.median_lease_years_12m,
    avg_floor_area_12m = EXCLUDED.avg_floor_area_12m,
    updated_at = EXCLUDED.updated_at;
  
  -- Return summary statistics
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM neighbourhood_summary_by_flat_type WHERE updated_at >= NOW() - INTERVAL '1 minute')::INTEGER as updated_count,
    (SELECT COUNT(*) FROM neighbourhood_summary_by_flat_type)::INTEGER as total_records;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Initial population
SELECT update_neighbourhood_summary_by_flat_type();

