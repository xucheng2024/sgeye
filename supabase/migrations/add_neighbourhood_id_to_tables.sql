-- Migration: Add Coordinates and Neighbourhood ID to Existing Tables
-- Description: Adds spatial columns to raw data tables for neighbourhood-based analysis
-- This is the critical step to move from town-based to neighbourhood-based data

-- ============================================
-- 1. raw_resale_2017: Add coordinates + neighbourhood_id
-- ============================================
ALTER TABLE raw_resale_2017
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS neighbourhood_id TEXT REFERENCES neighbourhoods(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_raw_resale_lat_lng ON raw_resale_2017(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_raw_resale_neighbourhood ON raw_resale_2017(neighbourhood_id);

-- ============================================
-- 2. primary_schools: Add neighbourhood_id
-- ============================================
ALTER TABLE primary_schools
ADD COLUMN IF NOT EXISTS neighbourhood_id TEXT REFERENCES neighbourhoods(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_schools_neighbourhood ON primary_schools(neighbourhood_id);

-- ============================================
-- 3. mrt_stations: Add neighbourhood_id
-- ============================================
ALTER TABLE mrt_stations
ADD COLUMN IF NOT EXISTS neighbourhood_id TEXT REFERENCES neighbourhoods(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_mrt_neighbourhood ON mrt_stations(neighbourhood_id);

-- ============================================
-- 4. bus_stops: Add neighbourhood_id
-- ============================================
ALTER TABLE bus_stops
ADD COLUMN IF NOT EXISTS neighbourhood_id TEXT REFERENCES neighbourhoods(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bus_neighbourhood ON bus_stops(neighbourhood_id);

-- ============================================
-- Function to populate neighbourhood_id from coordinates
-- ============================================
CREATE OR REPLACE FUNCTION populate_neighbourhood_ids()
RETURNS TABLE(
  table_name TEXT,
  updated_count BIGINT
) AS $$
DECLARE
  resale_count BIGINT;
  school_count BIGINT;
  mrt_count BIGINT;
  bus_count BIGINT;
BEGIN
  -- Update raw_resale_2017
  UPDATE raw_resale_2017 r
  SET neighbourhood_id = n.id
  FROM neighbourhoods n
  WHERE r.latitude IS NOT NULL
    AND r.longitude IS NOT NULL
    AND r.neighbourhood_id IS NULL
    AND ST_Contains(
      n.geom,
      ST_SetSRID(ST_Point(r.longitude, r.latitude), 4326)::GEOGRAPHY
    );
  
  GET DIAGNOSTICS resale_count = ROW_COUNT;
  
  -- Update primary_schools
  UPDATE primary_schools s
  SET neighbourhood_id = n.id
  FROM neighbourhoods n
  WHERE s.latitude IS NOT NULL
    AND s.longitude IS NOT NULL
    AND s.neighbourhood_id IS NULL
    AND ST_Contains(
      n.geom,
      ST_SetSRID(ST_Point(s.longitude, s.latitude), 4326)::GEOGRAPHY
    );
  
  GET DIAGNOSTICS school_count = ROW_COUNT;
  
  -- Update mrt_stations
  UPDATE mrt_stations m
  SET neighbourhood_id = n.id
  FROM neighbourhoods n
  WHERE m.latitude IS NOT NULL
    AND m.longitude IS NOT NULL
    AND m.neighbourhood_id IS NULL
    AND ST_Contains(
      n.geom,
      ST_SetSRID(ST_Point(m.longitude, m.latitude), 4326)::GEOGRAPHY
    );
  
  GET DIAGNOSTICS mrt_count = ROW_COUNT;
  
  -- Update bus_stops
  UPDATE bus_stops b
  SET neighbourhood_id = n.id
  FROM neighbourhoods n
  WHERE b.latitude IS NOT NULL
    AND b.longitude IS NOT NULL
    AND b.neighbourhood_id IS NULL
    AND ST_Contains(
      n.geom,
      ST_SetSRID(ST_Point(b.longitude, b.latitude), 4326)::GEOGRAPHY
    );
  
  GET DIAGNOSTICS bus_count = ROW_COUNT;
  
  RETURN QUERY SELECT 'raw_resale_2017'::TEXT, resale_count;
  RETURN QUERY SELECT 'primary_schools'::TEXT, school_count;
  RETURN QUERY SELECT 'mrt_stations'::TEXT, mrt_count;
  RETURN QUERY SELECT 'bus_stops'::TEXT, bus_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

