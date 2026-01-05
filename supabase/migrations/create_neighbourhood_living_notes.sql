-- Migration: Create Neighbourhood Living Notes Table
-- Description: Stores living quality notes for neighbourhoods (noise, convenience, green space, etc.)
-- This replaces the large static data file with a database-backed solution

-- ============================================
-- Neighbourhood Living Notes Table
-- ============================================
CREATE TABLE IF NOT EXISTS neighbourhood_living_notes (
  neighbourhood_name TEXT PRIMARY KEY,
  noise_density_rating TEXT CHECK (noise_density_rating IN ('good', 'mixed', 'bad')),
  noise_density_note TEXT NOT NULL,
  daily_convenience_rating TEXT CHECK (daily_convenience_rating IN ('good', 'mixed', 'bad')),
  daily_convenience_note TEXT NOT NULL,
  green_outdoor_rating TEXT CHECK (green_outdoor_rating IN ('good', 'mixed', 'bad')),
  green_outdoor_note TEXT NOT NULL,
  crowd_vibe_rating TEXT CHECK (crowd_vibe_rating IN ('good', 'mixed', 'bad')),
  crowd_vibe_note TEXT NOT NULL,
  long_term_comfort_rating TEXT CHECK (long_term_comfort_rating IN ('good', 'mixed', 'bad')),
  long_term_comfort_note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_neighbourhood_living_notes_name ON neighbourhood_living_notes(neighbourhood_name);

-- Enable Row Level Security (RLS)
ALTER TABLE neighbourhood_living_notes ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
DROP POLICY IF EXISTS "Allow public read access" ON neighbourhood_living_notes;
CREATE POLICY "Allow public read access" ON neighbourhood_living_notes FOR SELECT USING (true);

