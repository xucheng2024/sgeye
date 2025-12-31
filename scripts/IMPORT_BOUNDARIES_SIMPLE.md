# Simple Import Instructions

## Quick Start: Import Boundaries via SQL

The easiest way is to use `shp2pgsql` or `ogr2ogr` tools to import Shapefiles directly.

### Option 1: Using shp2pgsql (Recommended)

```bash
# Install PostGIS tools (if not already installed)
# macOS: brew install postgis
# Ubuntu: sudo apt-get install postgis

# Import Planning Areas
shp2pgsql -I -s 4326 -g geom planning-areas.shp planning_areas_temp | \
  psql "your_supabase_connection_string"

# Import Subzones  
shp2pgsql -I -s 4326 -g geom subzones.shp subzones_temp | \
  psql "your_supabase_connection_string"

# Then copy to final tables
psql "your_connection" -c "
  INSERT INTO planning_areas (id, name, geom, bbox)
  SELECT id, name, geom::GEOGRAPHY, 
         jsonb_build_object('minLng', ST_XMin(geom::geometry), 'maxLng', ST_XMax(geom::geometry), 
                           'minLat', ST_YMin(geom::geometry), 'maxLat', ST_YMax(geom::geometry))
  FROM planning_areas_temp
  ON CONFLICT (id) DO UPDATE SET geom = EXCLUDED.geom;
"
```

### Option 2: Using Supabase Dashboard

1. Download GeoJSON files
2. Use Supabase SQL Editor to run:

```sql
-- Create a temporary function to import GeoJSON
-- Then call it for each feature
```

### Option 3: Manual SQL Import

If you have GeoJSON, you can manually import via SQL:

```sql
-- Example for one planning area
INSERT INTO planning_areas (id, name, geom, bbox)
VALUES (
  'ANG_MO_KIO',
  'Ang Mo Kio',
  ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[...]}'), 4326)::GEOGRAPHY,
  '{"minLng":103.8,"maxLng":103.9,"minLat":1.36,"maxLat":1.38}'::jsonb
);
```

## After Import: Create Sealed Neighbourhoods

```sql
-- Run this migration
\i supabase/migrations/create_sealed_neighbourhoods_from_subzones.sql
```

## Verify

```sql
SELECT 
  (SELECT COUNT(*) FROM planning_areas WHERE geom IS NOT NULL) as planning_areas,
  (SELECT COUNT(*) FROM subzones WHERE geom IS NOT NULL) as subzones,
  (SELECT COUNT(*) FROM neighbourhoods WHERE type = 'sealed' AND geom IS NOT NULL) as sealed_neighbourhoods;
```

Expected: ~55 planning areas, ~300+ subzones, ~300+ sealed neighbourhoods

