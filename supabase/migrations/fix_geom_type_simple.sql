-- Simple fix: Change GEOGRAPHY(POLYGON) to GEOGRAPHY to support MultiPolygon
-- This allows storing Polygon, MultiPolygon, and other geometry types

-- Fix subzones.geom
ALTER TABLE subzones 
ALTER COLUMN geom TYPE GEOGRAPHY USING geom::GEOGRAPHY;

-- Fix neighbourhoods.geom  
ALTER TABLE neighbourhoods
ALTER COLUMN geom TYPE GEOGRAPHY USING geom::GEOGRAPHY;

-- Fix planning_areas.geom
ALTER TABLE planning_areas
ALTER COLUMN geom TYPE GEOGRAPHY USING geom::GEOGRAPHY;

