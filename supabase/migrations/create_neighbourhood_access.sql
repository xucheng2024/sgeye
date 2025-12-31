-- Migration: Create Neighbourhood Access Table
-- Description: Replaces town_time_access with neighbourhood-based access metrics
-- This calculates transport accessibility at the neighbourhood level

-- ============================================
-- Neighbourhood Access Table
-- ============================================
CREATE TABLE IF NOT EXISTS neighbourhood_access (
  neighbourhood_id TEXT PRIMARY KEY REFERENCES neighbourhoods(id) ON DELETE CASCADE,
  mrt_access_type TEXT CHECK (mrt_access_type IN ('high', 'medium', 'low', 'none')),
  bus_dependency TEXT CHECK (bus_dependency IN ('high', 'medium', 'low')),
  transfer_complexity TEXT CHECK (transfer_complexity IN ('direct', '1_transfer', '2_plus')),
  mrt_station_count INTEGER DEFAULT 0,
  bus_stop_count INTEGER DEFAULT 0,
  avg_distance_to_mrt NUMERIC, -- in meters
  avg_distance_to_bus NUMERIC, -- in meters
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_neighbourhood_access_neighbourhood ON neighbourhood_access(neighbourhood_id);
CREATE INDEX IF NOT EXISTS idx_neighbourhood_access_mrt_type ON neighbourhood_access(mrt_access_type);

-- Enable Row Level Security (RLS)
ALTER TABLE neighbourhood_access ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
DROP POLICY IF EXISTS "Allow public read access" ON neighbourhood_access;
CREATE POLICY "Allow public read access" ON neighbourhood_access FOR SELECT USING (true);

-- ============================================
-- Function to calculate neighbourhood access metrics
-- ============================================
CREATE OR REPLACE FUNCTION calculate_neighbourhood_access()
RETURNS TABLE(
  neighbourhood_id TEXT,
  mrt_station_count BIGINT,
  bus_stop_count BIGINT
) AS $$
BEGIN
  -- Calculate MRT station count per neighbourhood
  -- Calculate bus stop count per neighbourhood
  -- Calculate average distances
  -- Determine access types based on counts and distances
  
  -- Insert/Update neighbourhood access data
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
      WHEN COALESCE(bus_counts.stop_count, 0) >= 10 THEN 'low' -- High bus coverage = low dependency
      WHEN COALESCE(bus_counts.stop_count, 0) >= 5 THEN 'medium'
      ELSE 'high' -- Low bus coverage = high dependency
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

  -- Return summary
  RETURN QUERY
  SELECT 
    na.neighbourhood_id,
    na.mrt_station_count::BIGINT,
    na.bus_stop_count::BIGINT
  FROM neighbourhood_access na;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

