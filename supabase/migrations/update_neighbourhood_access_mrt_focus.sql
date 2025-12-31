-- Migration: Update Neighbourhood Access to Focus on MRT
-- Description: Enhances calculate_neighbourhood_access() to calculate avg_distance_to_mrt
-- Focuses on MRT-only metrics as bus is not considered

-- ============================================
-- Drop existing function first (to change return type)
-- ============================================
DROP FUNCTION IF EXISTS calculate_neighbourhood_access() CASCADE;

-- ============================================
-- Create updated calculate_neighbourhood_access() function
-- ============================================
CREATE OR REPLACE FUNCTION calculate_neighbourhood_access()
RETURNS TABLE(
  n_id TEXT,
  mrt_count BIGINT,
  avg_dist NUMERIC
) AS $$
BEGIN
  -- Calculate MRT station count and average distance per neighbourhood
  -- For avg_distance_to_mrt: Calculate distance from neighbourhood centroid to nearest MRT stations
  
  INSERT INTO neighbourhood_access (
    neighbourhood_id,
    mrt_station_count,
    mrt_access_type,
    avg_distance_to_mrt,
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
    COALESCE(mrt_distances.avg_distance, NULL) as avg_distance_to_mrt,
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
  LEFT JOIN (
    -- Calculate distance from neighbourhood centroid to nearest MRT station
    -- For neighbourhoods with stations inside, distance is 0
    -- For others, calculate distance to nearest station (optimized: only calculate for those without stations)
    SELECT 
      n_inner.id,
      CASE
        -- If there are stations in the neighbourhood, distance is 0
        WHEN EXISTS (
          SELECT 1 FROM mrt_stations mrt_inner 
          WHERE mrt_inner.neighbourhood_id = n_inner.id
        ) THEN 0
        -- Otherwise, calculate minimum distance from centroid to nearest station
        -- Use LATERAL JOIN for better performance (only calculates for neighbourhoods without stations)
        ELSE (
          SELECT MIN(
            ST_Distance(
              ST_Centroid(n_inner.geom)::GEOGRAPHY,
              ST_SetSRID(ST_Point(mrt.longitude, mrt.latitude), 4326)::GEOGRAPHY
            )
          )
          FROM mrt_stations mrt
          WHERE mrt.latitude IS NOT NULL
            AND mrt.longitude IS NOT NULL
          LIMIT 1000  -- Limit to avoid timeout, should be enough to find nearest
        )
      END as avg_distance
    FROM neighbourhoods n_inner
    WHERE n_inner.geom IS NOT NULL
  ) mrt_distances ON n.id = mrt_distances.id
  ON CONFLICT ON CONSTRAINT neighbourhood_access_pkey
  DO UPDATE SET
    mrt_station_count = EXCLUDED.mrt_station_count,
    mrt_access_type = EXCLUDED.mrt_access_type,
    avg_distance_to_mrt = EXCLUDED.avg_distance_to_mrt,
    updated_at = EXCLUDED.updated_at;

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

