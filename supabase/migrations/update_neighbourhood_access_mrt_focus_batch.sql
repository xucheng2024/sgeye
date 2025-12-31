-- Migration: Update Neighbourhood Access to Focus on MRT (Batch Processing)
-- Description: Batch processing version to avoid timeout
-- Processes neighbourhoods in batches

-- ============================================
-- Drop existing function first
-- ============================================
DROP FUNCTION IF EXISTS calculate_neighbourhood_access() CASCADE;
DROP FUNCTION IF EXISTS calculate_neighbourhood_access_batch(INTEGER) CASCADE;

-- ============================================
-- Batch processing function
-- ============================================
CREATE OR REPLACE FUNCTION calculate_neighbourhood_access_batch(
  p_batch_size INTEGER DEFAULT 50
)
RETURNS TABLE(
  processed_count INTEGER,
  remaining_count INTEGER
) AS $$
DECLARE
  processed INTEGER := 0;
  remaining INTEGER;
BEGIN
  -- First, update MRT station counts and access types for ALL neighbourhoods (fast)
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

  -- Set distance to 0 for neighbourhoods with stations
  UPDATE neighbourhood_access
  SET avg_distance_to_mrt = 0,
      updated_at = NOW()
  WHERE mrt_station_count > 0
    AND (avg_distance_to_mrt IS NULL OR avg_distance_to_mrt != 0);

  -- Process distances for neighbourhoods without stations (in batches)
  -- Update a batch of neighbourhoods
  WITH batch_neighbourhoods AS (
    SELECT na.neighbourhood_id, n.geom
    FROM neighbourhood_access na
    JOIN neighbourhoods n ON n.id = na.neighbourhood_id
    WHERE na.mrt_station_count = 0
      AND n.geom IS NOT NULL
      AND (na.avg_distance_to_mrt IS NULL OR na.avg_distance_to_mrt = 0)
    LIMIT p_batch_size
  )
  UPDATE neighbourhood_access na
  SET avg_distance_to_mrt = (
    SELECT MIN(
      ST_Distance(
        ST_Centroid(bn.geom)::GEOGRAPHY,
        ST_SetSRID(ST_Point(mrt.longitude, mrt.latitude), 4326)::GEOGRAPHY
      )
    )
    FROM mrt_stations mrt
    WHERE mrt.latitude IS NOT NULL
      AND mrt.longitude IS NOT NULL
  ),
  updated_at = NOW()
  FROM batch_neighbourhoods bn
  WHERE na.neighbourhood_id = bn.neighbourhood_id;

  GET DIAGNOSTICS processed = ROW_COUNT;

  -- Count remaining
  SELECT COUNT(*) INTO remaining
  FROM neighbourhood_access na
  JOIN neighbourhoods n ON n.id = na.neighbourhood_id
  WHERE na.mrt_station_count = 0
    AND n.geom IS NOT NULL
    AND (na.avg_distance_to_mrt IS NULL OR na.avg_distance_to_mrt = 0);

  RETURN QUERY SELECT processed, remaining;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Main function (calls batch function)
-- ============================================
CREATE OR REPLACE FUNCTION calculate_neighbourhood_access()
RETURNS TABLE(
  n_id TEXT,
  mrt_count BIGINT,
  avg_dist NUMERIC
) AS $$
BEGIN
  -- Just call the batch function once with default batch size
  -- The script will call it multiple times
  PERFORM calculate_neighbourhood_access_batch(50);
  
  -- Return summary
  RETURN QUERY
  SELECT 
    na.neighbourhood_id as n_id,
    na.mrt_station_count::BIGINT as mrt_count,
    na.avg_distance_to_mrt as avg_dist
  FROM neighbourhood_access na
  LIMIT 1;  -- Just return one row to indicate completion
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

