-- Singapore Data Tables Schema
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.
-- Use migration files in supabase/migrations/ for actual database setup.

-- ============================================
-- Core Spatial Hierarchy Tables
-- ============================================

-- Planning Areas (Container Level)
CREATE TABLE IF NOT EXISTS planning_areas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  geom GEOGRAPHY(POLYGON, 4326),
  bbox JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subzones (Official Smallest Geographic Base)
CREATE TABLE IF NOT EXISTS subzones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  planning_area_id TEXT REFERENCES planning_areas(id) ON DELETE SET NULL,
  geom GEOGRAPHY(POLYGON, 4326),
  bbox JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Neighbourhoods (Primary Decision Unit)
CREATE TABLE IF NOT EXISTS neighbourhoods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  planning_area_id TEXT REFERENCES planning_areas(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('sealed', 'split')),
  parent_subzone_id TEXT REFERENCES subzones(id) ON DELETE SET NULL,
  geom GEOGRAPHY(POLYGON, 4326),
  bbox JSONB,
  one_liner TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
  latitude NUMERIC,
  longitude NUMERIC,
  neighbourhood_id TEXT REFERENCES neighbourhoods(id) ON DELETE SET NULL
);

-- Aggregated monthly data by neighbourhood (NEW - Primary aggregation table)
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aggregated monthly data by town (REMOVED - Replaced by agg_neighbourhood_monthly)
-- This table has been dropped. All queries should use agg_neighbourhood_monthly instead.

-- ============================================
-- Transport & Access Tables
-- ============================================

-- MRT Stations
CREATE TABLE IF NOT EXISTS mrt_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_name TEXT NOT NULL UNIQUE,
  station_code TEXT,
  line_code TEXT,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  neighbourhood_id TEXT REFERENCES neighbourhoods(id) ON DELETE SET NULL
);

-- Bus Stops
CREATE TABLE IF NOT EXISTS bus_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_stop_code TEXT NOT NULL UNIQUE,
  bus_stop_name TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  road_name TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  neighbourhood_id TEXT REFERENCES neighbourhoods(id) ON DELETE SET NULL
);

-- Neighbourhood Access (Transport accessibility metrics)
CREATE TABLE IF NOT EXISTS neighbourhood_access (
  neighbourhood_id TEXT PRIMARY KEY REFERENCES neighbourhoods(id) ON DELETE CASCADE,
  mrt_access_type TEXT CHECK (mrt_access_type IN ('high', 'medium', 'low', 'none')),
  bus_dependency TEXT CHECK (bus_dependency IN ('high', 'medium', 'low')),
  transfer_complexity TEXT CHECK (transfer_complexity IN ('direct', '1_transfer', '2_plus')),
  mrt_station_count INTEGER DEFAULT 0,
  bus_stop_count INTEGER DEFAULT 0,
  avg_distance_to_mrt NUMERIC,
  avg_distance_to_bus NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PSLE & School Location Tables
-- ============================================

-- Primary Schools (from MOE School Directory)
CREATE TABLE IF NOT EXISTS primary_schools (
  id SERIAL PRIMARY KEY,
  school_name VARCHAR(200) NOT NULL,
  address TEXT,
  postal_code VARCHAR(10),
  planning_area VARCHAR(100),
  town VARCHAR(100),
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  neighbourhood_id TEXT REFERENCES neighbourhoods(id) ON DELETE SET NULL,
  UNIQUE(school_name, postal_code)
);

-- PSLE Cut-off Points
CREATE TABLE IF NOT EXISTS psle_cutoff (
  id SERIAL PRIMARY KEY,
  school_id INTEGER REFERENCES primary_schools(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  cutoff_range VARCHAR(20),
  cutoff_min INTEGER,
  cutoff_max INTEGER,
  source_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(school_id, year)
);

-- ============================================
-- General Statistics Tables
-- ============================================

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

-- ============================================
-- Indexes (for performance)
-- ============================================

-- Neighbourhoods indexes
CREATE INDEX IF NOT EXISTS idx_neighbourhoods_geom ON neighbourhoods USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_neighbourhoods_planning_area ON neighbourhoods(planning_area_id);
CREATE INDEX IF NOT EXISTS idx_neighbourhoods_name ON neighbourhoods(name);

-- Aggregation indexes
CREATE INDEX IF NOT EXISTS idx_agg_neighbourhood_monthly_month ON agg_neighbourhood_monthly(month);
CREATE INDEX IF NOT EXISTS idx_agg_neighbourhood_monthly_neighbourhood ON agg_neighbourhood_monthly(neighbourhood_id);
CREATE INDEX IF NOT EXISTS idx_agg_neighbourhood_monthly_flat_type ON agg_neighbourhood_monthly(flat_type);
CREATE INDEX IF NOT EXISTS idx_agg_neighbourhood_monthly_composite ON agg_neighbourhood_monthly(month, neighbourhood_id, flat_type);

-- Raw resale indexes
CREATE INDEX IF NOT EXISTS idx_raw_resale_month ON raw_resale_2017(month);
CREATE INDEX IF NOT EXISTS idx_raw_resale_town ON raw_resale_2017(town);
CREATE INDEX IF NOT EXISTS idx_raw_resale_neighbourhood ON raw_resale_2017(neighbourhood_id);
CREATE INDEX IF NOT EXISTS idx_raw_resale_flat_type ON raw_resale_2017(flat_type);

-- Transport indexes
CREATE INDEX IF NOT EXISTS idx_mrt_stations_neighbourhood ON mrt_stations(neighbourhood_id);
CREATE INDEX IF NOT EXISTS idx_bus_stops_neighbourhood ON bus_stops(neighbourhood_id);
CREATE INDEX IF NOT EXISTS idx_neighbourhood_access_neighbourhood ON neighbourhood_access(neighbourhood_id);

-- School indexes
CREATE INDEX IF NOT EXISTS idx_schools_neighbourhood ON primary_schools(neighbourhood_id);
CREATE INDEX IF NOT EXISTS idx_schools_town ON primary_schools(town);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE planning_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE subzones ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighbourhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_resale_2017 ENABLE ROW LEVEL SECURITY;
ALTER TABLE agg_neighbourhood_monthly ENABLE ROW LEVEL SECURITY;
-- agg_monthly table has been removed (replaced by agg_neighbourhood_monthly)
ALTER TABLE mrt_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighbourhood_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE primary_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE psle_cutoff ENABLE ROW LEVEL SECURITY;
ALTER TABLE population_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE housing_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE employment_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_data ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
DROP POLICY IF EXISTS "Allow public read access" ON planning_areas;
CREATE POLICY "Allow public read access" ON planning_areas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON subzones;
CREATE POLICY "Allow public read access" ON subzones FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON neighbourhoods;
CREATE POLICY "Allow public read access" ON neighbourhoods FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON raw_resale_2017;
CREATE POLICY "Allow public read access" ON raw_resale_2017 FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON agg_neighbourhood_monthly;
CREATE POLICY "Allow public read access" ON agg_neighbourhood_monthly FOR SELECT USING (true);

-- agg_monthly table has been removed (replaced by agg_neighbourhood_monthly)

DROP POLICY IF EXISTS "Allow public read access" ON mrt_stations;
CREATE POLICY "Allow public read access" ON mrt_stations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON bus_stops;
CREATE POLICY "Allow public read access" ON bus_stops FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON neighbourhood_access;
CREATE POLICY "Allow public read access" ON neighbourhood_access FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON primary_schools;
CREATE POLICY "Allow public read access" ON primary_schools FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON psle_cutoff;
CREATE POLICY "Allow public read access" ON psle_cutoff FOR SELECT USING (true);

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
-- Helper Functions
-- ============================================

-- Function to parse remaining_lease to years (numeric)
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

-- Function to aggregate monthly data by neighbourhood (PRIMARY FUNCTION)
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

-- Function to aggregate monthly data by town (DEPRECATED - Use aggregate_neighbourhood_monthly_data() instead)
-- Function aggregate_monthly_data() has been removed (replaced by aggregate_neighbourhood_monthly_data)
-- Use aggregate_neighbourhood_monthly_data() instead

-- Function to calculate neighbourhood access metrics
CREATE OR REPLACE FUNCTION calculate_neighbourhood_access()
RETURNS TABLE(
  neighbourhood_id TEXT,
  mrt_station_count BIGINT,
  bus_stop_count BIGINT
) AS $$
BEGIN
  INSERT INTO neighbourhood_access (
    neighbourhood_id,
    mrt_station_count,
    bus_stop_count,
    mrt_access_type,
    bus_dependency,
    updated_at
  )
  SELECT 
    n.id as neighbourhood_id,
    COALESCE(mrt_counts.station_count, 0)::INTEGER as mrt_station_count,
    COALESCE(bus_counts.stop_count, 0)::INTEGER as bus_stop_count,
    CASE
      WHEN COALESCE(mrt_counts.station_count, 0) >= 3 THEN 'high'
      WHEN COALESCE(mrt_counts.station_count, 0) >= 1 THEN 'medium'
      WHEN COALESCE(mrt_counts.station_count, 0) = 0 THEN 'none'
      ELSE 'low'
    END as mrt_access_type,
    CASE
      WHEN COALESCE(bus_counts.stop_count, 0) >= 10 THEN 'low'
      WHEN COALESCE(bus_counts.stop_count, 0) >= 5 THEN 'medium'
      ELSE 'high'
    END as bus_dependency,
    NOW() as updated_at
  FROM neighbourhoods n
  LEFT JOIN (
    SELECT neighbourhood_id, COUNT(*) as station_count
    FROM mrt_stations
    WHERE neighbourhood_id IS NOT NULL
    GROUP BY neighbourhood_id
  ) mrt_counts ON n.id = mrt_counts.neighbourhood_id
  LEFT JOIN (
    SELECT neighbourhood_id, COUNT(*) as stop_count
    FROM bus_stops
    WHERE neighbourhood_id IS NOT NULL
    GROUP BY neighbourhood_id
  ) bus_counts ON n.id = bus_counts.neighbourhood_id
  ON CONFLICT (neighbourhood_id)
  DO UPDATE SET
    mrt_station_count = EXCLUDED.mrt_station_count,
    bus_stop_count = EXCLUDED.bus_stop_count,
    mrt_access_type = EXCLUDED.mrt_access_type,
    bus_dependency = EXCLUDED.bus_dependency,
    updated_at = EXCLUDED.updated_at;

  RETURN QUERY
  SELECT 
    na.neighbourhood_id,
    na.mrt_station_count::BIGINT,
    na.bus_stop_count::BIGINT
  FROM neighbourhood_access na;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Notes
-- ============================================
-- 
-- This schema reflects the current database structure after migration to neighbourhood-based architecture.
-- 
-- Key changes:
-- 1. Added neighbourhoods, planning_areas, subzones tables for spatial hierarchy
-- 2. Added agg_neighbourhood_monthly as primary aggregation table (replaces agg_monthly)
-- 3. Added neighbourhood_access for transport metrics
-- 4. Added neighbourhood_id foreign keys to raw_resale_2017, mrt_stations, bus_stops, primary_schools
-- 5. agg_monthly has been removed (replaced by agg_neighbourhood_monthly)
-- 
-- For actual database setup, use migration files in supabase/migrations/ directory.
