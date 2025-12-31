-- Migration: Create Helper Functions for Importing GeoJSON
-- Description: Helper functions to import GeoJSON geometries into PostGIS

-- ============================================
-- Function to import planning area with geometry
-- ============================================
CREATE OR REPLACE FUNCTION import_planning_area(
  p_id TEXT,
  p_name TEXT,
  p_geom_json JSONB,
  p_bbox JSONB
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO planning_areas (id, name, geom, bbox, updated_at)
  VALUES (
    p_id,
    p_name,
    ST_SetSRID(ST_GeomFromGeoJSON(p_geom_json::text), 4326)::GEOGRAPHY,
    p_bbox,
    NOW()
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    name = EXCLUDED.name,
    geom = EXCLUDED.geom,
    bbox = EXCLUDED.bbox,
    updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function to import subzone with geometry
-- ============================================
CREATE OR REPLACE FUNCTION import_subzone(
  p_id TEXT,
  p_name TEXT,
  p_planning_area_id TEXT,
  p_geom_json JSONB,
  p_bbox JSONB
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO subzones (id, name, planning_area_id, geom, bbox, updated_at)
  VALUES (
    p_id,
    p_name,
    p_planning_area_id,
    ST_SetSRID(ST_GeomFromGeoJSON(p_geom_json::text), 4326)::GEOGRAPHY,
    p_bbox,
    NOW()
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    name = EXCLUDED.name,
    planning_area_id = EXCLUDED.planning_area_id,
    geom = EXCLUDED.geom,
    bbox = EXCLUDED.bbox,
    updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function to update planning area geometry
-- ============================================
CREATE OR REPLACE FUNCTION update_planning_area_geom(
  p_id TEXT,
  p_geom_json JSONB
)
RETURNS VOID AS $$
BEGIN
  UPDATE planning_areas
  SET 
    geom = ST_SetSRID(ST_GeomFromGeoJSON(p_geom_json::text), 4326)::GEOGRAPHY,
    updated_at = NOW()
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function to update subzone geometry
-- ============================================
CREATE OR REPLACE FUNCTION update_subzone_geom(
  p_id TEXT,
  p_geom_json JSONB
)
RETURNS VOID AS $$
BEGIN
  UPDATE subzones
  SET 
    -- Handle both Polygon and MultiPolygon types
    geom = ST_SetSRID(
      ST_GeomFromGeoJSON(p_geom_json::text),
      4326
    )::GEOGRAPHY,
    updated_at = NOW()
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

