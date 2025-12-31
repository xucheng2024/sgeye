-- Helper function to find neighbourhood for a single point
-- This can be called individually to avoid timeout

CREATE OR REPLACE FUNCTION find_neighbourhood_for_point(
  p_latitude NUMERIC,
  p_longitude NUMERIC
)
RETURNS TABLE(id TEXT, name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT n.id, n.name
  FROM neighbourhoods n
  WHERE ST_Covers(
    n.geom,
    ST_SetSRID(ST_Point(p_longitude, p_latitude), 4326)::GEOGRAPHY
  )
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Batch update function that processes a limited number of records
CREATE OR REPLACE FUNCTION populate_neighbourhood_ids_batch(
  p_table_name TEXT,
  p_batch_size INTEGER DEFAULT 1000
)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  IF p_table_name = 'raw_resale_2017' THEN
    UPDATE raw_resale_2017 r
    SET neighbourhood_id = n.id
    FROM neighbourhoods n
    WHERE r.latitude IS NOT NULL
      AND r.longitude IS NOT NULL
      AND r.neighbourhood_id IS NULL
      AND ST_Covers(
        n.geom,
        ST_SetSRID(ST_Point(r.longitude, r.latitude), 4326)::GEOGRAPHY
      )
      AND r.id IN (
        SELECT id FROM raw_resale_2017
        WHERE latitude IS NOT NULL
          AND longitude IS NOT NULL
          AND neighbourhood_id IS NULL
        LIMIT p_batch_size
      );
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
  ELSIF p_table_name = 'primary_schools' THEN
    UPDATE primary_schools s
    SET neighbourhood_id = n.id
    FROM neighbourhoods n
    WHERE s.latitude IS NOT NULL
      AND s.longitude IS NOT NULL
      AND s.neighbourhood_id IS NULL
      AND ST_Covers(
        n.geom,
        ST_SetSRID(ST_Point(s.longitude, s.latitude), 4326)::GEOGRAPHY
      )
      AND s.id IN (
        SELECT id FROM primary_schools
        WHERE latitude IS NOT NULL
          AND longitude IS NOT NULL
          AND neighbourhood_id IS NULL
        LIMIT p_batch_size
      );
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
  ELSIF p_table_name = 'mrt_stations' THEN
    UPDATE mrt_stations m
    SET neighbourhood_id = n.id
    FROM neighbourhoods n
    WHERE m.latitude IS NOT NULL
      AND m.longitude IS NOT NULL
      AND m.neighbourhood_id IS NULL
      AND ST_Covers(
        n.geom,
        ST_SetSRID(ST_Point(m.longitude, m.latitude), 4326)::GEOGRAPHY
      )
      AND m.id IN (
        SELECT id FROM mrt_stations
        WHERE latitude IS NOT NULL
          AND longitude IS NOT NULL
          AND neighbourhood_id IS NULL
        LIMIT p_batch_size
      );
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
  ELSIF p_table_name = 'bus_stops' THEN
    UPDATE bus_stops b
    SET neighbourhood_id = n.id
    FROM neighbourhoods n
    WHERE b.latitude IS NOT NULL
      AND b.longitude IS NOT NULL
      AND b.neighbourhood_id IS NULL
      AND ST_Covers(
        n.geom,
        ST_SetSRID(ST_Point(b.longitude, b.latitude), 4326)::GEOGRAPHY
      )
      AND b.id IN (
        SELECT id FROM bus_stops
        WHERE latitude IS NOT NULL
          AND longitude IS NOT NULL
          AND neighbourhood_id IS NULL
        LIMIT p_batch_size
      );
    GET DIAGNOSTICS updated_count = ROW_COUNT;
  ELSE
    updated_count := 0;
  END IF;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

