-- Migration: Add PostGIS function for finding subzone by point
-- Description: Creates a function to find subzone containing a given lat/lng point using PostGIS ST_Contains

-- Function to find subzone by point coordinates
CREATE OR REPLACE FUNCTION find_subzone_by_point(p_lat float, p_lng float)
RETURNS TABLE(id text, name text, planning_area_id text, region text) AS $$
  SELECT s.id, s.name, s.planning_area_id, s.region
  FROM subzones s
  WHERE ST_Contains(
    s.geom::geometry, 
    ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geometry
  )
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Function to check if a point is in a specific subzone
CREATE OR REPLACE FUNCTION check_point_in_subzone(subzone_id text, p_lat float, p_lng float)
RETURNS TABLE(contains boolean) AS $$
  SELECT ST_Contains(
    s.geom::geometry,
    ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geometry
  ) as contains
  FROM subzones s
  WHERE s.id = subzone_id;
$$ LANGUAGE sql STABLE;

-- Add comments
COMMENT ON FUNCTION find_subzone_by_point IS 'Finds the subzone containing a given lat/lng point using PostGIS ST_Contains';
COMMENT ON FUNCTION check_point_in_subzone IS 'Checks if a point is contained within a specific subzone';
