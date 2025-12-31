-- Fix geometry type to support MultiPolygon
-- Some subzones have MultiPolygon geometry (islands, complex boundaries)
-- Change from GEOGRAPHY(POLYGON, 4326) to GEOGRAPHY to support all geometry types

-- ============================================
-- Fix subzones.geom to support MultiPolygon
-- ============================================
-- Note: We can't directly ALTER COLUMN type in PostGIS for GEOGRAPHY
-- So we need to recreate the column

-- Step 1: Add new column with correct type
ALTER TABLE subzones
ADD COLUMN IF NOT EXISTS geom_new GEOGRAPHY;

-- Step 2: Copy data from old column
UPDATE subzones
SET geom_new = geom
WHERE geom IS NOT NULL;

-- Step 3: Drop old column
ALTER TABLE subzones
DROP COLUMN IF EXISTS geom;

-- Step 4: Rename new column
ALTER TABLE subzones
RENAME COLUMN geom_new TO geom;

-- Step 5: Recreate index
DROP INDEX IF EXISTS idx_subzones_geom;
CREATE INDEX IF NOT EXISTS idx_subzones_geom ON subzones USING GIST(geom);

-- ============================================
-- Fix neighbourhoods.geom to support MultiPolygon
-- ============================================
ALTER TABLE neighbourhoods
ADD COLUMN IF NOT EXISTS geom_new GEOGRAPHY;

UPDATE neighbourhoods
SET geom_new = geom
WHERE geom IS NOT NULL;

ALTER TABLE neighbourhoods
DROP COLUMN IF EXISTS geom;

ALTER TABLE neighbourhoods
RENAME COLUMN geom_new TO geom;

DROP INDEX IF EXISTS idx_neighbourhoods_geom;
CREATE INDEX IF NOT EXISTS idx_neighbourhoods_geom ON neighbourhoods USING GIST(geom);

-- ============================================
-- Fix planning_areas.geom to support MultiPolygon
-- ============================================
ALTER TABLE planning_areas
ADD COLUMN IF NOT EXISTS geom_new GEOGRAPHY;

UPDATE planning_areas
SET geom_new = geom
WHERE geom IS NOT NULL;

ALTER TABLE planning_areas
DROP COLUMN IF EXISTS geom;

ALTER TABLE planning_areas
RENAME COLUMN geom_new TO geom;

DROP INDEX IF EXISTS idx_planning_areas_geom;
CREATE INDEX IF NOT EXISTS idx_planning_areas_geom ON planning_areas USING GIST(geom);

