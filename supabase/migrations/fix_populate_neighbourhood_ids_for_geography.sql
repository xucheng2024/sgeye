-- Fix populate_neighbourhood_ids() to use ST_Covers instead of ST_Contains
-- ST_Contains doesn't work with GEOGRAPHY type, ST_Covers does

CREATE OR REPLACE FUNCTION populate_neighbourhood_ids()
RETURNS TABLE(
  table_name TEXT,
  updated_count BIGINT
) AS $$
DECLARE
  resale_count BIGINT;
  school_count BIGINT;
  mrt_count BIGINT;
  bus_count BIGINT;
BEGIN
  -- Update raw_resale_2017
  -- Use ST_Covers for GEOGRAPHY type (more accurate for geography)
  UPDATE raw_resale_2017 r
  SET neighbourhood_id = n.id
  FROM neighbourhoods n
  WHERE r.latitude IS NOT NULL
    AND r.longitude IS NOT NULL
    AND r.neighbourhood_id IS NULL
    AND ST_Covers(
      n.geom,
      ST_SetSRID(ST_Point(r.longitude, r.latitude), 4326)::GEOGRAPHY
    );
  
  GET DIAGNOSTICS resale_count = ROW_COUNT;
  
  -- Update primary_schools
  UPDATE primary_schools s
  SET neighbourhood_id = n.id
  FROM neighbourhoods n
  WHERE s.latitude IS NOT NULL
    AND s.longitude IS NOT NULL
    AND s.neighbourhood_id IS NULL
    AND ST_Covers(
      n.geom,
      ST_SetSRID(ST_Point(s.longitude, s.latitude), 4326)::GEOGRAPHY
    );
  
  GET DIAGNOSTICS school_count = ROW_COUNT;
  
  -- Update mrt_stations
  UPDATE mrt_stations m
  SET neighbourhood_id = n.id
  FROM neighbourhoods n
  WHERE m.latitude IS NOT NULL
    AND m.longitude IS NOT NULL
    AND m.neighbourhood_id IS NULL
    AND ST_Covers(
      n.geom,
      ST_SetSRID(ST_Point(m.longitude, m.latitude), 4326)::GEOGRAPHY
    );
  
  GET DIAGNOSTICS mrt_count = ROW_COUNT;
  
  -- Update bus_stops
  UPDATE bus_stops b
  SET neighbourhood_id = n.id
  FROM neighbourhoods n
  WHERE b.latitude IS NOT NULL
    AND b.longitude IS NOT NULL
    AND b.neighbourhood_id IS NULL
    AND ST_Covers(
      n.geom,
      ST_SetSRID(ST_Point(b.longitude, b.latitude), 4326)::GEOGRAPHY
    );
  
  GET DIAGNOSTICS bus_count = ROW_COUNT;
  
  RETURN QUERY SELECT 'raw_resale_2017'::TEXT, resale_count;
  RETURN QUERY SELECT 'primary_schools'::TEXT, school_count;
  RETURN QUERY SELECT 'mrt_stations'::TEXT, mrt_count;
  RETURN QUERY SELECT 'bus_stops'::TEXT, bus_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

