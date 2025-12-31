-- Migration: Update Neighbourhood Access to Focus on MRT (Optimized)
-- Description: Enhances calculate_neighbourhood_access() to calculate avg_distance_to_mrt
-- Focuses on MRT-only metrics as bus is not considered
-- Optimized to avoid timeout by processing in batches

-- ============================================
-- Drop existing function first (to change return type)
-- ============================================
DROP FUNCTION IF EXISTS calculate_neighbourhood_access() CASCADE;

-- ============================================
-- Create optimized calculate_neighbourhood_access() function
-- ============================================
CREATE OR REPLACE FUNCTION calculate_neighbourhood_access()
RETURNS TABLE(
  n_id TEXT,
  mrt_count BIGINT,
  avg_dist NUMERIC
) AS $$
DECLARE
  neighbourhood_record RECORD;
  min_distance NUMERIC;
  centroid GEOGRAPHY;
BEGIN
  -- First, update MRT station counts and access types (fast operation)
  INSERT INTO neighbourhood_access (
    neighbourhood_id,
    mrt_station_count,
    mrt_access_type,
    updated_at
  )
  SELECT 
    n.id,
    COALESCE(mrt_counts.station_count, 0)::INTEGER as mrt_station_count,
    CASE
      WHEN COALESCE(mrt_counts.station_count, 0) >= 3 THEN 'high'
      WHEN COALESCE(mrt_counts.station_count, 0) >= 1 THEN 'medium'
      WHEN COALESCE(mrt_counts.station_count, 0) = 0 THEN 'none'
      ELSE 'low'
    END as mrt_access_type,
    NOW() as updated_at
  FROM neighbourhoods n
  LEFT JOIN (
    SELECT 
      neighbourhood_id, 
      COUNT(*) as station_count
    FROM mrt_stations
    WHERE neighbourhood_id IS NOT NULL
    GROUP BY neighbourhood_id
  ) mrt_counts ON n.id = mrt_counts.neighbourhood_id
  ON CONFLICT ON CONSTRAINT neighbourhood_access_pkey
  DO UPDATE SET
    mrt_station_count = EXCLUDED.mrt_station_count,
    mrt_access_type = EXCLUDED.mrt_access_type,
    updated_at = EXCLUDED.updated_at;

  -- Second, update distances only for neighbourhoods without MRT stations
  -- For performance: only calculate for neighbourhoods without stations
  -- Use a simpler approach: calculate minimum distance directly
  UPDATE neighbourhood_access na
  SET avg_distance_to_mrt = (
    SELECT MIN(
      ST_Distance(
        ST_Centroid(n.geom)::GEOGRAPHY,
        ST_SetSRID(ST_Point(mrt.longitude, mrt.latitude), 4326)::GEOGRAPHY
      )
    )
    FROM mrt_stations mrt
    WHERE mrt.latitude IS NOT NULL
      AND mrt.longitude IS NOT NULL
  ),
  updated_at = NOW()
  FROM neighbourhoods n
  WHERE na.neighbourhood_id = n.id
    AND na.mrt_station_count = 0
    AND n.geom IS NOT NULL;

  -- Set distance to 0 for neighbourhoods with stations
  UPDATE neighbourhood_access
  SET avg_distance_to_mrt = 0,
      updated_at = NOW()
  WHERE mrt_station_count > 0
    AND (avg_distance_to_mrt IS NULL OR avg_distance_to_mrt != 0);

  -- Return summary
  RETURN QUERY
  SELECT 
    na.neighbourhood_id as n_id,
    na.mrt_station_count::BIGINT as mrt_count,
    na.avg_distance_to_mrt as avg_dist
  FROM neighbourhood_access na;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the function to populate/update data
SELECT calculate_neighbourhood_access();

