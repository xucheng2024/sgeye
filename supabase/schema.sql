-- Singapore Data Tables Schema

-- Population Data
CREATE TABLE IF NOT EXISTS population_data (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  total NUMERIC,
  citizens NUMERIC,
  permanent NUMERIC,
  non_resident NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Housing Data
CREATE TABLE IF NOT EXISTS housing_data (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  hdb_percentage NUMERIC,
  private_percentage NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employment Data
CREATE TABLE IF NOT EXISTS employment_data (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  unemployment_rate NUMERIC,
  employment_rate NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Income Data
CREATE TABLE IF NOT EXISTS income_data (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  median_income NUMERIC,
  mean_income NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Healthcare Data
CREATE TABLE IF NOT EXISTS healthcare_data (
  id SERIAL PRIMARY KEY,
  facility_type VARCHAR(100) NOT NULL,
  percentage NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Education Data
CREATE TABLE IF NOT EXISTS education_data (
  id SERIAL PRIMARY KEY,
  level VARCHAR(100) NOT NULL,
  enrollment_rate NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data (matching current static data)
INSERT INTO population_data (year, total, citizens, permanent, non_resident) VALUES
  (2018, 5638, 3503, 527, 1608),
  (2019, 5704, 3525, 532, 1647),
  (2020, 5686, 3520, 505, 1661),
  (2021, 5454, 3500, 490, 1464),
  (2022, 5637, 3550, 518, 1569),
  (2023, 5917, 3610, 538, 1769)
ON CONFLICT DO NOTHING;

INSERT INTO housing_data (year, hdb_percentage, private_percentage) VALUES
  (2018, 82.5, 17.5),
  (2019, 82.3, 17.7),
  (2020, 82.1, 17.9),
  (2021, 81.9, 18.1),
  (2022, 81.7, 18.3),
  (2023, 81.5, 18.5)
ON CONFLICT DO NOTHING;

INSERT INTO employment_data (year, unemployment_rate, employment_rate) VALUES
  (2018, 2.1, 97.9),
  (2019, 2.3, 97.7),
  (2020, 3.0, 97.0),
  (2021, 2.7, 97.3),
  (2022, 2.1, 97.9),
  (2023, 1.9, 98.1)
ON CONFLICT DO NOTHING;

INSERT INTO income_data (year, median_income, mean_income) VALUES
  (2018, 4434, 5850),
  (2019, 4563, 6020),
  (2020, 4534, 5950),
  (2021, 4680, 6150),
  (2022, 5070, 6650),
  (2023, 5197, 6820)
ON CONFLICT DO NOTHING;

INSERT INTO healthcare_data (facility_type, percentage) VALUES
  ('Public Hospitals', 65),
  ('Private Hospitals', 20),
  ('Community Hospitals', 10),
  ('Specialty Centers', 5)
ON CONFLICT DO NOTHING;

INSERT INTO education_data (level, enrollment_rate) VALUES
  ('Primary', 95.2),
  ('Secondary', 97.8),
  ('Post-Secondary', 92.5),
  ('University', 45.3)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS) - allow public read access
ALTER TABLE population_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE housing_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE employment_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_data ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access (drop if exists first)
DROP POLICY IF EXISTS "Allow public read access" ON population_data;
CREATE POLICY "Allow public read access" ON population_data FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON housing_data;
CREATE POLICY "Allow public read access" ON housing_data FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON employment_data;
CREATE POLICY "Allow public read access" ON employment_data FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON income_data;
CREATE POLICY "Allow public read access" ON income_data FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON healthcare_data;
CREATE POLICY "Allow public read access" ON healthcare_data FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON education_data;
CREATE POLICY "Allow public read access" ON education_data FOR SELECT USING (true);

-- ============================================
-- HDB Resale Price & Affordability Tables
-- ============================================

-- Raw resale transaction data (from data.gov.sg, 2017 onwards)
CREATE TABLE IF NOT EXISTS raw_resale_2017 (
  id SERIAL PRIMARY KEY,
  month DATE NOT NULL,
  town VARCHAR(100),
  flat_type VARCHAR(50),
  block VARCHAR(20),
  street_name VARCHAR(200),
  storey_range VARCHAR(50),
  floor_area_sqm NUMERIC,
  flat_model VARCHAR(100),
  lease_commence_date INTEGER,
  remaining_lease VARCHAR(100),
  resale_price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month, town, block, street_name, flat_type, resale_price)
);

-- Aggregated monthly data (for fast queries)
CREATE TABLE IF NOT EXISTS agg_monthly (
  id SERIAL PRIMARY KEY,
  month DATE NOT NULL,
  town VARCHAR(100),
  flat_type VARCHAR(50),
  tx_count INTEGER,
  median_price NUMERIC,
  p25_price NUMERIC,
  p75_price NUMERIC,
  median_psm NUMERIC,
  median_lease_years NUMERIC,
  avg_floor_area NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month, town, flat_type)
);

-- HDB Rental Statistics (from data.gov.sg)
CREATE TABLE IF NOT EXISTS hdb_rental_stats (
  id SERIAL PRIMARY KEY,
  month DATE NOT NULL,
  town VARCHAR(100),
  flat_type VARCHAR(50),
  median_rent NUMERIC,
  number_of_rental_contracts INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month, town, flat_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_raw_resale_month ON raw_resale_2017(month);
CREATE INDEX IF NOT EXISTS idx_raw_resale_town ON raw_resale_2017(town);
CREATE INDEX IF NOT EXISTS idx_raw_resale_flat_type ON raw_resale_2017(flat_type);
CREATE INDEX IF NOT EXISTS idx_agg_monthly_month ON agg_monthly(month);
CREATE INDEX IF NOT EXISTS idx_agg_monthly_town ON agg_monthly(town);
CREATE INDEX IF NOT EXISTS idx_agg_monthly_flat_type ON agg_monthly(flat_type);
CREATE INDEX IF NOT EXISTS idx_rental_month ON hdb_rental_stats(month);
CREATE INDEX IF NOT EXISTS idx_rental_town ON hdb_rental_stats(town);
CREATE INDEX IF NOT EXISTS idx_rental_flat_type ON hdb_rental_stats(flat_type);

-- Enable RLS
ALTER TABLE raw_resale_2017 ENABLE ROW LEVEL SECURITY;
ALTER TABLE agg_monthly ENABLE ROW LEVEL SECURITY;
ALTER TABLE hdb_rental_stats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON raw_resale_2017 FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON agg_monthly FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON hdb_rental_stats FOR SELECT USING (true);

-- Function to parse remaining_lease to years (numeric)
-- DROP FUNCTION IF EXISTS parse_lease_years(TEXT);
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
  
  -- Extract years (e.g., "84 years 3 months" -> 84)
  years_part := (regexp_match(lease_text, '(\d+)\s*years?'))[1];
  IF years_part IS NOT NULL THEN
    years_num := years_part::NUMERIC;
  END IF;
  
  -- Extract months (e.g., "84 years 3 months" -> 3)
  months_part := (regexp_match(lease_text, '(\d+)\s*months?'))[1];
  IF months_part IS NOT NULL THEN
    months_num := months_part::NUMERIC;
  END IF;
  
  RETURN years_num + (months_num / 12.0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get middle storey from range (e.g., "10 TO 12" -> 11)
-- DROP FUNCTION IF EXISTS get_middle_storey(TEXT);
CREATE OR REPLACE FUNCTION get_middle_storey(storey_range TEXT)
RETURNS INTEGER AS $$
DECLARE
  lower_storey INTEGER;
  upper_storey INTEGER;
BEGIN
  IF storey_range IS NULL OR storey_range = '' THEN
    RETURN NULL;
  END IF;
  
  -- Extract numbers from range like "10 TO 12" or "01 TO 05"
  lower_storey := (regexp_match(storey_range, '(\d+)'))[1]::INTEGER;
  upper_storey := (regexp_match(storey_range, 'TO\s*(\d+)'))[1]::INTEGER;
  
  IF lower_storey IS NULL OR upper_storey IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN (lower_storey + upper_storey) / 2;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to aggregate monthly data (can be called from API)
CREATE OR REPLACE FUNCTION aggregate_monthly_data()
RETURNS TABLE(
  total_records INTEGER,
  earliest_month DATE,
  latest_month DATE,
  total_transactions BIGINT
) AS $$
BEGIN
  -- Insert/Update aggregated monthly data
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

  -- Return summary statistics
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_records,
    MIN(month) as earliest_month,
    MAX(month) as latest_month,
    SUM(tx_count)::BIGINT as total_transactions
  FROM agg_monthly;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


