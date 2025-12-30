-- Migration: Add PSLE & School Location Tables
-- Date: 2024
-- Description: Creates tables for primary schools and PSLE cut-off data

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
  UNIQUE(school_name, postal_code)
);

-- PSLE Cut-off Points (aggregated from community sources)
-- Note: MOE does not publish official cut-off data
CREATE TABLE IF NOT EXISTS psle_cutoff (
  id SERIAL PRIMARY KEY,
  school_id INTEGER REFERENCES primary_schools(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  cutoff_range VARCHAR(20), -- e.g., "≤230", "231-250", "≥251"
  cutoff_min INTEGER, -- approximate lower bound
  cutoff_max INTEGER, -- approximate upper bound
  source_note TEXT, -- e.g., "Community aggregated"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(school_id, year)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_schools_planning_area ON primary_schools(planning_area);
CREATE INDEX IF NOT EXISTS idx_schools_town ON primary_schools(town);
CREATE INDEX IF NOT EXISTS idx_cutoff_school_id ON psle_cutoff(school_id);
CREATE INDEX IF NOT EXISTS idx_cutoff_year ON psle_cutoff(year);

-- Enable Row Level Security (RLS)
ALTER TABLE primary_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE psle_cutoff ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access
DROP POLICY IF EXISTS "Allow public read access" ON primary_schools;
CREATE POLICY "Allow public read access" ON primary_schools FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON psle_cutoff;
CREATE POLICY "Allow public read access" ON psle_cutoff FOR SELECT USING (true);

