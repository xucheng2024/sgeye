-- Migration: Add Town Time & Access Table
-- Date: 2024
-- Description: Creates table for town-level time and accessibility attributes

-- ============================================
-- Town Time & Access Table
-- ============================================

CREATE TABLE IF NOT EXISTS town_time_access (
  town TEXT PRIMARY KEY,
  centrality TEXT NOT NULL CHECK (centrality IN ('central', 'non_central')),
  mrt_density TEXT NOT NULL CHECK (mrt_density IN ('high', 'medium', 'low')),
  transfer_complexity TEXT NOT NULL CHECK (transfer_complexity IN ('direct', '1_transfer', '2_plus')),
  regional_hub_access TEXT NOT NULL CHECK (regional_hub_access IN ('yes', 'partial', 'no')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_town_time_access_town ON town_time_access(town);

-- Enable Row Level Security (RLS)
ALTER TABLE town_time_access ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
DROP POLICY IF EXISTS "Allow public read access" ON town_time_access;
CREATE POLICY "Allow public read access" ON town_time_access FOR SELECT USING (true);

