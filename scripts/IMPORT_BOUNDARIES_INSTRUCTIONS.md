# Import Planning Areas and Subzones Boundaries

## Step 0: Import Official Boundary Data (CRITICAL - Do This First!)

Before geocoding coordinates, you MUST import the official boundary polygons for:
1. **Planning Areas** (polygon geometries)
2. **Subzones** (polygon geometries)
3. **Create Sealed Neighbourhoods** (neighbourhood.geom = subzone.geom)

## Data Sources

### Option 1: data.gov.sg (Recommended)
- **Planning Areas**: https://data.gov.sg/datasets
- Search for "Planning Area" or "Master Plan"
- Download GeoJSON or Shapefile format

### Option 2: URA (Urban Redevelopment Authority)
- **Master Plan 2019**: https://www.ura.gov.sg/Corporate/Planning/Master-Plan
- Contact URA for official boundary data

### Option 3: OneMap API
- OneMap provides some boundary data via API
- May need to aggregate from multiple endpoints

## Import Steps

### 1. Download Boundary Data

Download GeoJSON files:
- `planning-areas.geojson` - Planning area boundaries
- `subzones.geojson` - Subzone boundaries

### 2. Import Planning Areas

```bash
node scripts/import-planning-areas-subzones.js --file data/planning-areas.geojson
```

### 3. Import Subzones

```bash
node scripts/import-planning-areas-subzones.js --file data/subzones.geojson
```

### 4. Create Sealed Neighbourhoods

After importing subzones, create sealed neighbourhoods:

```sql
-- Run this migration
\i supabase/migrations/create_sealed_neighbourhoods_from_subzones.sql
```

Or use the script:

```bash
node scripts/import-planning-areas-subzones.js --create-neighbourhoods
```

## Verification

After import, verify data:

```sql
-- Check planning areas
SELECT COUNT(*) as planning_area_count FROM planning_areas WHERE geom IS NOT NULL;

-- Check subzones
SELECT COUNT(*) as subzone_count FROM subzones WHERE geom IS NOT NULL;

-- Check sealed neighbourhoods
SELECT COUNT(*) as neighbourhood_count FROM neighbourhoods WHERE type = 'sealed' AND geom IS NOT NULL;
```

## Expected Results

- **Planning Areas**: ~55 areas (Singapore has 55 planning areas)
- **Subzones**: ~300+ subzones
- **Sealed Neighbourhoods**: Should match subzone count

## Why This Order Matters

1. **Without boundaries**: Geocoded coordinates have nowhere to be assigned
2. **With boundaries**: `ST_Contains(neighbourhood.geom, point)` can work
3. **Sealed = Subzone**: Initial neighbourhoods use subzone boundaries (no split logic yet)

## Next Steps

After boundaries are imported:
1. ✅ Run geocoding script to get coordinates
2. ✅ Run `populate_neighbourhood_ids()` to assign coordinates to neighbourhoods
3. ✅ Run aggregations

