-- Migration: Create Neighbourhood Growth Potential Assessment
-- Description: Calculates and stores growth potential labels for each neighbourhood × flat_type combination
-- Based on: Historical CAGR, Lease decay, and Stability metrics

-- ============================================
-- Neighbourhood Growth Assessment Table
-- ============================================
CREATE TABLE IF NOT EXISTS neighbourhood_growth_assessment (
  id SERIAL PRIMARY KEY,
  neighbourhood_id TEXT NOT NULL REFERENCES neighbourhoods(id) ON DELETE CASCADE,
  flat_type VARCHAR(50) NOT NULL,
  
  -- Historical growth metrics (5-8 years)
  historical_cagr NUMERIC, -- Compound Annual Growth Rate (% per year)
  price_start NUMERIC, -- Starting median price
  price_end NUMERIC, -- Ending median price
  years_analyzed NUMERIC, -- Number of years of data used
  
  -- Stability metrics
  positive_months_pct NUMERIC, -- Percentage of months with positive YoY growth
  volatility NUMERIC, -- Price volatility (coefficient of variation)
  trend_stability TEXT CHECK (trend_stability IN ('stable', 'volatile', 'insufficient')),
  
  -- Lease metrics
  median_lease_years NUMERIC, -- Current median lease
  lease_distribution JSONB, -- Distribution of lease buckets (≥90, 80-89, 70-79, 60-69, <60)
  weighted_lease_drag NUMERIC, -- Weighted annual lease decay rate (%)
  lease_risk TEXT CHECK (lease_risk IN ('green', 'amber', 'red')),
  
  -- Final assessment
  net_growth_rate NUMERIC, -- g_net = g_neigh - d_neigh (% per year)
  growth_potential TEXT CHECK (growth_potential IN ('high', 'medium', 'low', 'insufficient')),
  net_growth_score INTEGER, -- 0-100 score for sorting
  
  -- Transaction volume (for filtering)
  tx_count_5y INTEGER, -- Transaction count in last 5 years
  tx_count_24m INTEGER, -- Transaction count in last 24 months
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(neighbourhood_id, flat_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_growth_assessment_neighbourhood ON neighbourhood_growth_assessment(neighbourhood_id);
CREATE INDEX IF NOT EXISTS idx_growth_assessment_flat_type ON neighbourhood_growth_assessment(flat_type);
CREATE INDEX IF NOT EXISTS idx_growth_assessment_potential ON neighbourhood_growth_assessment(growth_potential);
CREATE INDEX IF NOT EXISTS idx_growth_assessment_score ON neighbourhood_growth_assessment(net_growth_score);

-- Enable RLS
ALTER TABLE neighbourhood_growth_assessment ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
DROP POLICY IF EXISTS "Allow public read access" ON neighbourhood_growth_assessment;
CREATE POLICY "Allow public read access" ON neighbourhood_growth_assessment FOR SELECT USING (true);

-- ============================================
-- Helper Function: Parse lease years from text
-- ============================================
CREATE OR REPLACE FUNCTION parse_lease_years(lease_text TEXT)
RETURNS NUMERIC AS $$
DECLARE
  years_part TEXT;
  months_part TEXT;
  years_num NUMERIC := 0;
  months_num NUMERIC := 0;
BEGIN
  IF lease_text IS NULL OR lease_text = '' THEN
    RETURN NULL;
  END IF;
  
  years_part := (regexp_match(lease_text, '(\d+)\s*years?'))[1];
  IF years_part IS NOT NULL THEN
    years_num := years_part::NUMERIC;
  END IF;
  
  months_part := (regexp_match(lease_text, '(\d+)\s*months?'))[1];
  IF months_part IS NOT NULL THEN
    months_num := months_part::NUMERIC;
  END IF;
  
  RETURN years_num + (months_num / 12.0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- Main Function: Calculate Growth Assessment
-- ============================================
CREATE OR REPLACE FUNCTION calculate_neighbourhood_growth_assessment()
RETURNS TABLE(
  calculated_count INTEGER,
  high_count INTEGER,
  medium_count INTEGER,
  low_count INTEGER,
  insufficient_count INTEGER
) AS $$
DECLARE
  start_date_5y DATE;
  end_date DATE;
  calculated INTEGER := 0;
  high INTEGER := 0;
  medium INTEGER := 0;
  low INTEGER := 0;
  insufficient INTEGER := 0;
BEGIN
  -- Get date range (last 5-8 years for analysis)
  SELECT MAX(month) INTO end_date FROM agg_neighbourhood_monthly;
  start_date_5y := end_date - INTERVAL '5 years';
  
  -- Calculate for each neighbourhood × flat_type combination
  INSERT INTO neighbourhood_growth_assessment (
    neighbourhood_id,
    flat_type,
    historical_cagr,
    price_start,
    price_end,
    years_analyzed,
    positive_months_pct,
    volatility,
    trend_stability,
    median_lease_years,
    lease_distribution,
    weighted_lease_drag,
    lease_risk,
    net_growth_rate,
    growth_potential,
    net_growth_score,
    tx_count_5y,
    tx_count_24m,
    updated_at
  )
  SELECT 
    agg.neighbourhood_id,
    agg.flat_type,
    
    -- Historical CAGR calculation
    CASE 
      WHEN start_price.median_price > 0 AND end_price.median_price > 0 THEN
        (POWER(end_price.median_price / start_price.median_price, 1.0 / NULLIF(years_span.years, 0)) - 1.0) * 100
      ELSE NULL
    END as historical_cagr,
    
    start_price.median_price as price_start,
    end_price.median_price as price_end,
    years_span.years as years_analyzed,
    
    -- Stability: percentage of positive months
    stability.positive_months_pct,
    
    -- Volatility: coefficient of variation
    CASE 
      WHEN price_avg.avg_price > 0 AND price_avg.std_price IS NOT NULL THEN
        (price_avg.std_price / price_avg.avg_price) * 100
      ELSE NULL
    END as volatility,
    
    -- Trend stability label
    CASE
      WHEN tx_5y.total_tx < 30 OR tx_24m.total_tx < 12 THEN 'insufficient'
      WHEN stability.positive_months_pct >= 55 AND price_avg.avg_price > 0 AND price_avg.std_price IS NOT NULL 
           AND (price_avg.std_price / price_avg.avg_price) < 0.15 THEN 'stable'
      ELSE 'volatile'
    END as trend_stability,
    
    -- Current median lease
    current_lease.median_lease as median_lease_years,
    
    -- Lease distribution (buckets: ≥90, 80-89, 70-79, 60-69, <60)
    lease_dist.lease_distribution,
    
    -- Weighted lease drag (annual decay rate)
    lease_drag.weighted_drag,
    
    -- Lease risk label
    CASE
      WHEN current_lease.median_lease >= 80 THEN 'green'
      WHEN current_lease.median_lease >= 70 THEN 'amber'
      ELSE 'red'
    END as lease_risk,
    
    -- Net growth rate = historical_cagr - weighted_lease_drag (convert drag to percentage)
    CASE 
      WHEN start_price.median_price > 0 AND end_price.median_price > 0 AND years_span.years > 0 THEN
        (POWER(end_price.median_price / start_price.median_price, 1.0 / NULLIF(GREATEST(years_span.years, 1), 1)) - 1.0) * 100 
        - COALESCE(lease_drag.weighted_drag, 0) * 100
      ELSE NULL
    END as net_growth_rate,
    
    -- Growth potential label
    CASE
      WHEN tx_5y.total_tx < 30 OR tx_24m.total_tx < 12 OR start_price.median_price IS NULL OR end_price.median_price IS NULL THEN 'insufficient'
      WHEN (POWER(end_price.median_price / start_price.median_price, 1.0 / NULLIF(GREATEST(years_span.years, 1), 1)) - 1.0) * 100 
           - COALESCE(lease_drag.weighted_drag, 0) * 100 >= 1.5 THEN 'high'
      WHEN (POWER(end_price.median_price / start_price.median_price, 1.0 / NULLIF(GREATEST(years_span.years, 1), 1)) - 1.0) * 100 
           - COALESCE(lease_drag.weighted_drag, 0) * 100 >= 0 THEN 'medium'
      ELSE 'low'
    END as growth_potential,
    
    -- Net growth score (0-100) for sorting
    CASE
      WHEN tx_5y.total_tx < 30 OR tx_24m.total_tx < 12 OR start_price.median_price IS NULL OR end_price.median_price IS NULL THEN 0
      ELSE LEAST(100, GREATEST(0, 
        ((POWER(end_price.median_price / start_price.median_price, 1.0 / NULLIF(GREATEST(years_span.years, 1), 1)) - 1.0) * 100 
         - COALESCE(lease_drag.weighted_drag, 0) * 100) * 10.0 + 50.0))
    END::INTEGER as net_growth_score,
    
    tx_5y.total_tx::INTEGER as tx_count_5y,
    tx_24m.total_tx::INTEGER as tx_count_24m,
    
    NOW() as updated_at
    
  FROM (
    SELECT DISTINCT neighbourhood_id, flat_type 
    FROM agg_neighbourhood_monthly
  ) agg
  
  -- Starting price (first year of data in 5-year window)
  LEFT JOIN LATERAL (
    SELECT median_price
    FROM agg_neighbourhood_monthly
    WHERE neighbourhood_id = agg.neighbourhood_id
      AND flat_type = agg.flat_type
      AND month >= start_date_5y
      AND median_price IS NOT NULL AND median_price > 0
    ORDER BY month ASC
    LIMIT 1
  ) start_price ON true
  
  -- Ending price (most recent)
  LEFT JOIN LATERAL (
    SELECT median_price
    FROM agg_neighbourhood_monthly
    WHERE neighbourhood_id = agg.neighbourhood_id
      AND flat_type = agg.flat_type
      AND month <= end_date
      AND median_price IS NOT NULL AND median_price > 0
    ORDER BY month DESC
    LIMIT 1
  ) end_price ON true
  
  -- Years spanned
  LEFT JOIN LATERAL (
    SELECT 
      CASE 
        WHEN MAX(month) IS NOT NULL AND MIN(month) IS NOT NULL THEN
          (MAX(month)::date - MIN(month)::date)::numeric / 365.25
        ELSE NULL
      END as years
    FROM agg_neighbourhood_monthly
    WHERE neighbourhood_id = agg.neighbourhood_id
      AND flat_type = agg.flat_type
      AND month >= start_date_5y
      AND median_price IS NOT NULL
  ) years_span ON true
  
  -- Transaction counts
  LEFT JOIN LATERAL (
    SELECT SUM(tx_count)::INTEGER as total_tx
    FROM agg_neighbourhood_monthly
    WHERE neighbourhood_id = agg.neighbourhood_id
      AND flat_type = agg.flat_type
      AND month >= start_date_5y
  ) tx_5y ON true
  
  LEFT JOIN LATERAL (
    SELECT SUM(tx_count)::INTEGER as total_tx
    FROM agg_neighbourhood_monthly
    WHERE neighbourhood_id = agg.neighbourhood_id
      AND flat_type = agg.flat_type
      AND month >= end_date - INTERVAL '24 months'
  ) tx_24m ON true
  
  -- Stability: positive months percentage
  LEFT JOIN LATERAL (
    WITH monthly_prices AS (
      SELECT 
        month,
        median_price,
        LAG(median_price) OVER (ORDER BY month) as prev_price
      FROM agg_neighbourhood_monthly
      WHERE neighbourhood_id = agg.neighbourhood_id
        AND flat_type = agg.flat_type
        AND month >= start_date_5y
        AND median_price IS NOT NULL AND median_price > 0
    ),
    positive_months AS (
      SELECT COUNT(*) FILTER (WHERE median_price > prev_price AND prev_price IS NOT NULL) as positive_count,
             COUNT(*) FILTER (WHERE prev_price IS NOT NULL) as total_count
      FROM monthly_prices
    )
    SELECT 
      CASE WHEN total_count > 0 THEN (positive_count::NUMERIC / total_count::NUMERIC) * 100 ELSE NULL END as positive_months_pct
    FROM positive_months
  ) stability ON true
  
  -- Price statistics for volatility
  LEFT JOIN LATERAL (
    SELECT 
      AVG(median_price) as avg_price,
      STDDEV(median_price) as std_price
    FROM agg_neighbourhood_monthly
    WHERE neighbourhood_id = agg.neighbourhood_id
      AND flat_type = agg.flat_type
      AND month >= start_date_5y
      AND median_price IS NOT NULL AND median_price > 0
  ) price_avg ON true
  
  -- Current median lease
  LEFT JOIN LATERAL (
    SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY median_lease_years) as median_lease
    FROM agg_neighbourhood_monthly
    WHERE neighbourhood_id = agg.neighbourhood_id
      AND flat_type = agg.flat_type
      AND month >= end_date - INTERVAL '24 months'
      AND median_lease_years IS NOT NULL
  ) current_lease ON true
  
  -- Lease distribution from raw data (last 24 months)
  LEFT JOIN LATERAL (
    WITH lease_buckets AS (
      SELECT 
        CASE
          WHEN parse_lease_years(remaining_lease) >= 90 THEN '≥90'
          WHEN parse_lease_years(remaining_lease) >= 80 THEN '80-89'
          WHEN parse_lease_years(remaining_lease) >= 70 THEN '70-79'
          WHEN parse_lease_years(remaining_lease) >= 60 THEN '60-69'
          ELSE '<60'
        END as bucket,
        COUNT(*) as tx_count
      FROM raw_resale_2017
      WHERE neighbourhood_id = agg.neighbourhood_id
        AND flat_type = agg.flat_type
        AND month >= end_date - INTERVAL '24 months'
        AND remaining_lease IS NOT NULL
      GROUP BY bucket
    )
    SELECT jsonb_object_agg(bucket, tx_count) as lease_distribution
    FROM lease_buckets
  ) lease_dist ON true
  
  -- Weighted lease drag (annual decay rate by bucket)
  LEFT JOIN LATERAL (
    WITH lease_drag_rates AS (
      SELECT 
        CASE
          WHEN parse_lease_years(remaining_lease) >= 90 THEN 0.0
          WHEN parse_lease_years(remaining_lease) >= 80 THEN 0.003
          WHEN parse_lease_years(remaining_lease) >= 70 THEN 0.008
          WHEN parse_lease_years(remaining_lease) >= 60 THEN 0.015
          ELSE 0.03
        END as drag_rate,
        COUNT(*) as tx_count
      FROM raw_resale_2017
      WHERE neighbourhood_id = agg.neighbourhood_id
        AND flat_type = agg.flat_type
        AND month >= end_date - INTERVAL '24 months'
        AND remaining_lease IS NOT NULL
      GROUP BY drag_rate
    )
    SELECT 
      CASE 
        WHEN SUM(tx_count) > 0 THEN
          SUM(drag_rate * tx_count) / SUM(tx_count)
        ELSE NULL
      END as weighted_drag
    FROM lease_drag_rates
  ) lease_drag ON true
  
  WHERE start_price.median_price IS NOT NULL 
    AND end_price.median_price IS NOT NULL
    AND tx_5y.total_tx IS NOT NULL
  
  ON CONFLICT (neighbourhood_id, flat_type) 
  DO UPDATE SET
    historical_cagr = EXCLUDED.historical_cagr,
    price_start = EXCLUDED.price_start,
    price_end = EXCLUDED.price_end,
    years_analyzed = EXCLUDED.years_analyzed,
    positive_months_pct = EXCLUDED.positive_months_pct,
    volatility = EXCLUDED.volatility,
    trend_stability = EXCLUDED.trend_stability,
    median_lease_years = EXCLUDED.median_lease_years,
    lease_distribution = EXCLUDED.lease_distribution,
    weighted_lease_drag = EXCLUDED.weighted_lease_drag,
    lease_risk = EXCLUDED.lease_risk,
    net_growth_rate = EXCLUDED.net_growth_rate,
    growth_potential = EXCLUDED.growth_potential,
    net_growth_score = EXCLUDED.net_growth_score,
    tx_count_5y = EXCLUDED.tx_count_5y,
    tx_count_24m = EXCLUDED.tx_count_24m,
    updated_at = EXCLUDED.updated_at;
  
  -- Count results
  SELECT COUNT(*) INTO calculated FROM neighbourhood_growth_assessment;
  SELECT COUNT(*) INTO high FROM neighbourhood_growth_assessment WHERE growth_potential = 'high';
  SELECT COUNT(*) INTO medium FROM neighbourhood_growth_assessment WHERE growth_potential = 'medium';
  SELECT COUNT(*) INTO low FROM neighbourhood_growth_assessment WHERE growth_potential = 'low';
  SELECT COUNT(*) INTO insufficient FROM neighbourhood_growth_assessment WHERE growth_potential = 'insufficient';
  
  RETURN QUERY SELECT calculated, high, medium, low, insufficient;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

