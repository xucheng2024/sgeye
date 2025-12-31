-- Migration: Add Planning Areas, Subzones, and Neighbourhoods Tables
-- Description: Creates the spatial hierarchy foundation for neighbourhood-based analysis
-- This replaces town-based analysis with polygon-based neighbourhood units

-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- 1. Planning Areas (Container Level)
-- ============================================
CREATE TABLE IF NOT EXISTS planning_areas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  geom GEOGRAPHY(POLYGON, 4326),
  bbox JSONB, -- Bounding box for quick spatial queries
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_planning_areas_geom ON planning_areas USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_planning_areas_name ON planning_areas(name);

-- ============================================
-- 2. Subzones (Official Smallest Geographic Base)
-- ============================================
CREATE TABLE IF NOT EXISTS subzones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  planning_area_id TEXT REFERENCES planning_areas(id) ON DELETE SET NULL,
  geom GEOGRAPHY(POLYGON, 4326),
  bbox JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subzones_geom ON subzones USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_subzones_planning_area ON subzones(planning_area_id);
CREATE INDEX IF NOT EXISTS idx_subzones_name ON subzones(name);

-- ============================================
-- 3. Neighbourhoods (Primary Decision Unit)
-- ============================================
CREATE TABLE IF NOT EXISTS neighbourhoods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  planning_area_id TEXT REFERENCES planning_areas(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('sealed', 'split')),
  parent_subzone_id TEXT REFERENCES subzones(id) ON DELETE SET NULL,
  geom GEOGRAPHY(POLYGON, 4326),
  bbox JSONB,
  one_liner TEXT, -- Brief description for UI display
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_neighbourhoods_geom ON neighbourhoods USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_neighbourhoods_planning_area ON neighbourhoods(planning_area_id);
CREATE INDEX IF NOT EXISTS idx_neighbourhoods_subzone ON neighbourhoods(parent_subzone_id);
CREATE INDEX IF NOT EXISTS idx_neighbourhoods_name ON neighbourhoods(name);
CREATE INDEX IF NOT EXISTS idx_neighbourhoods_type ON neighbourhoods(type);

-- Enable Row Level Security (RLS)
ALTER TABLE planning_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE subzones ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighbourhoods ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
DROP POLICY IF EXISTS "Allow public read access" ON planning_areas;
CREATE POLICY "Allow public read access" ON planning_areas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON subzones;
CREATE POLICY "Allow public read access" ON subzones FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON neighbourhoods;
CREATE POLICY "Allow public read access" ON neighbourhoods FOR SELECT USING (true);

-- Helper function to find neighbourhood by point
CREATE OR REPLACE FUNCTION find_neighbourhood_by_point(
  lng NUMERIC,
  lat NUMERIC
)
RETURNS TEXT AS $$
DECLARE
  neighbourhood_id TEXT;
BEGIN
  SELECT id INTO neighbourhood_id
  FROM neighbourhoods
  WHERE ST_Contains(
    geom,
    ST_SetSRID(ST_Point(lng, lat), 4326)::GEOGRAPHY
  )
  LIMIT 1;
  
  RETURN neighbourhood_id;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Helper function to find planning area by point
CREATE OR REPLACE FUNCTION find_planning_area_by_point(
  lng NUMERIC,
  lat NUMERIC
)
RETURNS TEXT AS $$
DECLARE
  planning_area_id TEXT;
BEGIN
  SELECT id INTO planning_area_id
  FROM planning_areas
  WHERE ST_Contains(
    geom,
    ST_SetSRID(ST_Point(lng, lat), 4326)::GEOGRAPHY
  )
  LIMIT 1;
  
  RETURN planning_area_id;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

