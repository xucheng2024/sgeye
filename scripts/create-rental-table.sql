-- Create HDB Rental Statistics table
-- Run this in Supabase SQL Editor before importing rental data

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
CREATE INDEX IF NOT EXISTS idx_rental_month ON hdb_rental_stats(month);
CREATE INDEX IF NOT EXISTS idx_rental_town ON hdb_rental_stats(town);
CREATE INDEX IF NOT EXISTS idx_rental_flat_type ON hdb_rental_stats(flat_type);

-- Enable RLS
ALTER TABLE hdb_rental_stats ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
DROP POLICY IF EXISTS "Allow public read access" ON hdb_rental_stats;
CREATE POLICY "Allow public read access" ON hdb_rental_stats FOR SELECT USING (true);

-- Verify table creation
SELECT 
  'Table created successfully' as status,
  COUNT(*) as existing_records
FROM hdb_rental_stats;

